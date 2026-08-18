#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  loadKnowledgeCatalog,
  parseArgs,
  parseFrontmatter,
  readLearner,
  isCompleted,
  unmetRequirements
} from "./lib.mjs";

const { positional, options } = parseArgs(process.argv.slice(2));
const command = positional[0];

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (command !== "next" || !options.learner || !options.course) {
  fail("Usage: node src/path.mjs next --learner ID --course COURSE.md");
}

try {
  const learner = readLearner(options.learner).data;
  const catalog = loadKnowledgeCatalog();
  const courseFile = path.resolve(options.course);
  const source = fs.readFileSync(courseFile, "utf8");
  const parsed = parseFrontmatter(source, courseFile);
  const courseId = parsed.meta.id;
  const outlined = parsed.meta.nodes || [];

  // 依赖闭包：沿 requires 收集不在课程大纲中的前置节点（自动补全）。
  const autoSteps = [];
  const autoSeen = new Set();
  const visiting = new Set();
  const collect = (id) => {
    if (autoSeen.has(id) || visiting.has(id)) return;
    const item = catalog.get(id);
    if (!item) return;
    visiting.add(id);
    for (const req of item.requires || []) collect(req);
    visiting.delete(id);
    autoSeen.add(id);
    autoSteps.push({ item: id, level: "know", role: "core", after: [], auto: true });
  };
  for (const step of outlined) {
    const item = catalog.get(step.item);
    for (const req of item?.requires || []) {
      if (!outlined.some((s) => s.item === req)) collect(req);
    }
  }

  const learningPath = {
    id: courseId,
    nodes: [...autoSteps, ...outlined.map((step) => ({ ...step, auto: false }))]
  };
  let choice = null;

  for (const step of learningPath.nodes) {
    const itemId = step.item || step.concept;
    const item = catalog.get(itemId);
    if (!item) throw new Error("unknown path item: " + itemId);
    const afterReady = (step.after || []).every((id) => isCompleted(learner, id));
    const documentReady = unmetRequirements(item.requires, learner).length === 0;
    if (!afterReady || !documentReady) continue;

    if (step.role === "revisit") {
      const visits = learner.visits?.[itemId]?.count || 0;
      if (isCompleted(learner, itemId) && visits < 2) {
        choice = { ...step, item: itemId, kind: item.kind, revisit: true, file: item.file, title: item.title };
        break;
      }
    } else if (!isCompleted(learner, itemId)) {
      choice = { ...step, item: itemId, kind: item.kind, revisit: false, file: item.file, title: item.title };
      break;
    }
  }

  console.log(JSON.stringify({
    course: learningPath.id,
    autoPrerequisites: autoSteps.length,
    next: choice
  }, null, 2));
} catch (error) {
  fail(error.message);
}
