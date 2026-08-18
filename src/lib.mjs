import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_ROOT = path.join(PROJECT_ROOT, "data");

export function assertOutsideData(file) {
  const resolved = path.resolve(file);
  const relative = path.relative(DATA_ROOT, resolved);
  const insideData = relative === "" || (!relative.startsWith(".." + path.sep) && !path.isAbsolute(relative));
  if (insideData) throw new Error("data is read-only at runtime: " + resolved);
  return resolved;
}

export function parseArgs(argv) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) {
      positional.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      options[key] = true;
    } else {
      options[key] = next;
      i += 1;
    }
  }
  return { positional, options };
}

export function walkFiles(root, predicate = () => true) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full)) result.push(full);
    }
  }
  return result.sort();
}

export function parseFrontmatter(source, file = "Markdown") {
  if (!source.startsWith("---\n")) return { meta: {}, body: source };
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) throw new Error(file + ": frontmatter is not closed");
  const raw = source.slice(4, end);
  const meta = {};
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) throw new Error(file + ": unsupported frontmatter line: " + line);
    const key = match[1];
    const value = match[2].trim();
    if (value.startsWith("[")) meta[key] = JSON.parse(value);
    else if (value === "true" || value === "false") meta[key] = value === "true";
    else meta[key] = value.replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: source.slice(end + 5) };
}

export const CONTENT_KINDS = ["concept", "proof", "exercise"];

const CONTENT_ROOTS = {
  concept: path.join("data", "concepts"),
  proof: path.join("data", "proofs"),
  exercise: path.join("data", "exercises")
};

export function loadKnowledgeCatalog(root = PROJECT_ROOT) {
  const catalog = new Map();
  for (const kind of CONTENT_KINDS) {
    const contentRoot = path.join(root, CONTENT_ROOTS[kind]);
    for (const file of walkFiles(contentRoot, (item) => item.endsWith(".md"))) {
      const source = fs.readFileSync(file, "utf8");
      const parsed = parseFrontmatter(source, file);
      if (!parsed.meta.id) throw new Error(file + ": missing id");
      if (catalog.has(parsed.meta.id)) {
        throw new Error("duplicate knowledge id: " + parsed.meta.id);
      }
      catalog.set(parsed.meta.id, {
        id: parsed.meta.id,
        kind,
        title: parsed.meta.title || path.basename(file, ".md"),
        course: parsed.meta.course,
        requires: parsed.meta.requires || [],
        proves: parsed.meta.proves,
        tests: parsed.meta.tests || [],
        file,
        source
      });
    }
  }
  return catalog;
}

// Kept as a compatibility alias for callers outside this repository.
export const loadConceptCatalog = loadKnowledgeCatalog;

export function learnerFile(id, root = PROJECT_ROOT) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id || "")) {
    throw new Error("learner id must use letters, digits, underscore, or hyphen");
  }
  return path.join(root, "learners", id + ".json");
}

export function readLearner(id, root = PROJECT_ROOT) {
  const file = learnerFile(id, root);
  if (!fs.existsSync(file)) throw new Error("learner save does not exist: " + id);
  return { file, data: JSON.parse(fs.readFileSync(file, "utf8")) };
}

export function isCompleted(learner, conceptId) {
  return learner.progress?.[conceptId]?.status === "completed";
}

export function splitRequirementList(value) {
  return String(value)
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function unmetRequirements(requirements, learner) {
  return (requirements || []).filter((id) => !isCompleted(learner, id));
}

export function writeJson(file, value) {
  assertOutsideData(file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}
