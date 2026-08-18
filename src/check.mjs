#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  CONTENT_KINDS,
  PROJECT_ROOT,
  loadKnowledgeCatalog,
  parseFrontmatter,
  splitRequirementList,
  walkFiles
} from "./lib.mjs";

const errors = [];

function error(message) {
  errors.push(message);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (cause) {
    error(file + ": invalid JSON: " + cause.message);
    return null;
  }
}

const PROFILE_ENUMS = {
  "status": ["in_progress", "completed"],
  "background.proofExperience": ["new", "some", "comfortable"],
  "preferences.participation": ["listen", "guided", "active"],
  "preferences.lessonSize": ["small", "medium", "large"],
  "preferences.checkIns": ["brief", "reflective", "practice"],
  "preferences.exposition": ["intuition_first", "balanced", "formal_first"],
  "preferences.correction": ["gentle", "direct"],
  "rendering.inlineMath": ["dollar", "paren", "plain", "unknown"],
  "rendering.displayMath": ["double_dollar", "bracket", "plain", "unknown"],
  "assessment.basis": ["self_report", "conversation", "diagnostic"]
};

const PROFILE_KEYS = {
  root: ["status", "updatedAt", "goal", "background", "preferences", "rendering", "assessment", "sampleFeedback"],
  background: ["stage", "summary", "proofExperience"],
  preferences: ["participation", "lessonSize", "checkIns", "exposition", "correction"],
  rendering: ["inlineMath", "displayMath"],
  assessment: ["summary", "basis"]
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function valueAt(value, dottedPath) {
  return dottedPath.split(".").reduce((current, key) => current?.[key], value);
}

function validateLearnerProfile(profile, file) {
  if (profile === undefined) return;
  if (!isObject(profile)) {
    error(file + ": profile must be an object");
    return;
  }

  const checkKeys = (value, allowed, label) => {
    if (value === undefined) return;
    if (!isObject(value)) {
      error(file + ": " + label + " must be an object");
      return;
    }
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) error(file + ": unknown " + label + " field " + key);
    }
  };
  checkKeys(profile, PROFILE_KEYS.root, "profile");
  checkKeys(profile.background, PROFILE_KEYS.background, "profile.background");
  checkKeys(profile.preferences, PROFILE_KEYS.preferences, "profile.preferences");
  checkKeys(profile.rendering, PROFILE_KEYS.rendering, "profile.rendering");
  checkKeys(profile.assessment, PROFILE_KEYS.assessment, "profile.assessment");

  for (const field of ["updatedAt", "goal", "background.stage", "background.summary", "assessment.summary", "sampleFeedback"]) {
    const value = valueAt(profile, field);
    if (value !== undefined && (typeof value !== "string" || value.trim() === "")) {
      error(file + ": profile field " + field + " must be non-empty text");
    }
  }
  for (const [field, allowed] of Object.entries(PROFILE_ENUMS)) {
    const value = valueAt(profile, field);
    if (value !== undefined && !allowed.includes(value)) {
      error(file + ": invalid profile field " + field + ": " + value);
    }
  }
  if (!profile.status) error(file + ": profile is missing status");
  if (!profile.updatedAt) error(file + ": profile is missing updatedAt");

  if (profile.status === "completed") {
    const required = [
      "goal",
      "background.stage",
      "background.summary",
      "background.proofExperience",
      "preferences.participation",
      "preferences.lessonSize",
      "preferences.checkIns",
      "preferences.exposition",
      "preferences.correction",
      "rendering.inlineMath",
      "rendering.displayMath",
      "assessment.summary",
      "assessment.basis",
      "sampleFeedback"
    ];
    for (const field of required) {
      if (valueAt(profile, field) === undefined) {
        error(file + ": completed profile is missing " + field);
      }
    }
  }
}

let catalog;
try {
  catalog = loadKnowledgeCatalog();
} catch (cause) {
  error(cause.message);
  catalog = new Map();
}

const visiting = new Set();
const visited = new Set();

function visitDependency(id, trail = []) {
  if (visited.has(id)) return;
  if (visiting.has(id)) {
    error("document requirement cycle: " + [...trail, id].join(" -> "));
    return;
  }
  visiting.add(id);
  const item = catalog.get(id);
  for (const requirement of item?.requires || []) {
    if (catalog.has(requirement)) visitDependency(requirement, [...trail, id]);
  }
  visiting.delete(id);
  visited.add(id);
}

for (const id of catalog.keys()) visitDependency(id);

for (const item of catalog.values()) {
  const parsed = parseFrontmatter(item.source, item.file);
  const required = ["id", "title", "course", "status", "requires"];
  for (const field of required) {
    if (parsed.meta[field] === undefined || parsed.meta[field] === "") {
      error(item.file + ": missing frontmatter field " + field);
    }
  }
  if (!Array.isArray(parsed.meta.requires)) {
    error(item.file + ": requires must be an array");
  }
  for (const requirement of parsed.meta.requires || []) {
    if (!catalog.has(requirement)) error(item.file + ": unknown document require " + requirement);
  }

  if (item.kind === "proof") {
    if (!item.proves) error(item.file + ": proof is missing proves");
    else if (!catalog.has(item.proves)) error(item.file + ": unknown proved item " + item.proves);
    else if (catalog.get(item.proves).kind !== "concept") {
      error(item.file + ": proves must point to a concept " + item.proves);
    }
    if (!parsed.meta.method) error(item.file + ": proof is missing method");
  }
  if (item.kind === "exercise") {
    if (!Array.isArray(item.tests) || item.tests.length === 0) {
      error(item.file + ": exercise tests must be a non-empty array");
    }
    for (const tested of item.tests || []) {
      if (!catalog.has(tested)) error(item.file + ": unknown tested item " + tested);
    }
    const difficulty = Number(parsed.meta.difficulty);
    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
      error(item.file + ": difficulty must be an integer from 1 to 5");
    }
  }

  if (/\\\[|\\\]|\\\(|\\\)/.test(item.source)) {
    error(item.file + ": use $ or $$ for LaTeX delimiters");
  }
  const blockDelimiters = item.source.match(/\$\$/g) || [];
  if (blockDelimiters.length % 2 !== 0) {
    error(item.file + ": unbalanced $$ delimiters");
  }
  const withoutBlocks = item.source.replace(/\$\$/g, "");
  const inlineDelimiters = withoutBlocks.match(/(?<!\\)\$/g) || [];
  if (inlineDelimiters.length % 2 !== 0) {
    error(item.file + ": unbalanced inline $ delimiters");
  }

  const opens = [...parsed.body.matchAll(/<div\s+require="([^"]+)"\s*>/g)];
  let depth = 0;
  for (const token of parsed.body.matchAll(/<div\s+require="([^"]+)"\s*>|<\/div>/g)) {
    if (token[1] !== undefined) depth += 1;
    else depth -= 1;
    if (depth < 0) {
      error(item.file + ": closing require div appears before an opening tag");
      depth = 0;
    }
  }
  if (depth !== 0) error(item.file + ": unbalanced require divs");
  for (const open of opens) {
    for (const requirement of splitRequirementList(open[1])) {
      if (!catalog.has(requirement)) error(item.file + ": unknown paragraph require " + requirement);
    }
  }
}

const outlinedFiles = new Set();
for (const rootName of ["concepts", "proofs", "exercises"]) {
  const root = path.join(PROJECT_ROOT, "data", rootName);
  for (const file of walkFiles(root, (item) => item.endsWith("package.json"))) {
    const course = readJson(file);
    if (!course) continue;
    const expectedKind = rootName === "concepts" ? "concept" : rootName.slice(0, -1);
    const seen = new Set();
    for (const node of course.nodes || []) {
      const item = catalog.get(node.id);
      const expectedFile = path.resolve(path.dirname(file), node.file);
      if (seen.has(node.id)) error(file + ": duplicate course node " + node.id);
      seen.add(node.id);
      if (!item) error(file + ": unknown course item " + node.id);
      else if (item.kind !== expectedKind) error(file + ": wrong kind for " + node.id);
      else if (path.resolve(item.file) !== expectedFile) error(file + ": file mismatch for " + node.id);
      else outlinedFiles.add(path.resolve(item.file));
    }
  }
}

for (const item of catalog.values()) {
  if (!outlinedFiles.has(path.resolve(item.file))) error(item.file + ": not listed in a course outline");
}

for (const file of walkFiles(path.join(PROJECT_ROOT, "data", "courses"), (item) => item.endsWith(".md"))) {
  const source = fs.readFileSync(file, "utf8");
  const parsed = parseFrontmatter(source, file);
  for (const field of ["id", "title", "goal", "packages", "nodes"]) {
    if (parsed.meta[field] === undefined || parsed.meta[field] === "") {
      error(file + ": course outline missing frontmatter field " + field);
    }
  }
  const nodes = parsed.meta.nodes || [];
  if (!Array.isArray(nodes)) {
    error(file + ": course outline nodes must be an array");
    continue;
  }
  const levels = new Set(["master", "proof", "know"]);
  const roles = new Set(["core", "optional", "revisit"]);
  const ids = new Set();
  for (const step of nodes) {
    if (!step || typeof step.item !== "string") {
      error(file + ": course outline node missing item");
      continue;
    }
    ids.add(step.item);
    if (!catalog.has(step.item)) error(file + ": unknown course outline item " + step.item);
    if (step.level !== undefined && !levels.has(step.level)) {
      error(file + ": invalid level " + step.level + " for " + step.item);
    }
    if (step.role !== undefined && !roles.has(step.role)) {
      error(file + ": invalid role " + step.role + " for " + step.item);
    }
  }
  for (const step of nodes) {
    for (const after of step.after || []) {
      if (!catalog.has(after)) error(file + ": unknown after item " + after);
      if (!ids.has(after)) error(file + ": after item is not in this course outline " + after);
    }
  }
}

for (const file of walkFiles(path.join(PROJECT_ROOT, "learners"), (item) => item.endsWith(".json") && !item.endsWith("schema.json"))) {
  const learner = readJson(file);
  if (!learner) continue;
  validateLearnerProfile(learner.profile, file);
  for (const id of Object.keys(learner.progress || {})) {
    if (!catalog.has(id)) error(file + ": unknown progress item " + id);
  }
  for (const id of Object.keys(learner.visits || {})) {
    if (!catalog.has(id)) error(file + ": unknown visit item " + id);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const counts = Object.fromEntries(CONTENT_KINDS.map((kind) => [kind, 0]));
for (const item of catalog.values()) counts[item.kind] += 1;
console.log(
  `OK: ${counts.concept} concepts, ${counts.proof} proofs, ${counts.exercise} exercises; ` +
  "package outlines, course outlines, learner profiles and progress, LaTeX, and require tags"
);
