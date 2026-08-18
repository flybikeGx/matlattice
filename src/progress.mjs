#!/usr/bin/env node

import fs from "node:fs";
import {
  PROJECT_ROOT,
  learnerFile,
  loadKnowledgeCatalog,
  parseArgs,
  readLearner,
  unmetRequirements,
  writeJson
} from "./lib.mjs";

const { positional, options } = parseArgs(process.argv.slice(2));
const command = positional[0];
const learnerId = options.learner;

function usage() {
  console.log("Usage:");
  console.log("  node src/progress.mjs init --learner ID");
  console.log("  node src/progress.mjs set --learner ID --item ID --status STATUS [--mastery 0-6]");
  console.log("      [--evidence-kind KIND --evidence NOTE]");
  console.log("      [--allow-prerequisite-gap]");
  console.log("  node src/progress.mjs visit --learner ID --item ID");
  console.log("  node src/progress.mjs show --learner ID");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!command || !learnerId) {
  usage();
  process.exit(1);
}

try {
  if (command === "init") {
    const file = learnerFile(learnerId, PROJECT_ROOT);
    if (fs.existsSync(file)) fail("learner save already exists: " + learnerId);
    const now = new Date().toISOString();
    writeJson(file, {
      version: 1,
      id: learnerId,
      createdAt: now,
      updatedAt: now,
      progress: {},
      visits: {}
    });
    console.log(file);
  } else if (command === "show") {
    console.log(JSON.stringify(readLearner(learnerId).data, null, 2));
  } else if (command === "set") {
    const itemId = options.item || options.concept;
    const status = options.status;
    const allowed = new Set(["not_started", "learning", "completed"]);
    if (!itemId || !allowed.has(status)) {
      fail("set requires --item and --status not_started|learning|completed");
    }
    const catalog = loadKnowledgeCatalog();
    if (!catalog.has(itemId)) fail("unknown knowledge item: " + itemId);
    const save = readLearner(learnerId);
    const missing = unmetRequirements(catalog.get(itemId).requires, save.data);
    if (status === "completed" && missing.length > 0 && !options["allow-prerequisite-gap"]) {
      fail("cannot complete before document requirements: " + missing.join(", "));
    }
    const previous = save.data.progress[itemId] || { evidence: [] };
    const fallback = status === "completed" ? 2 : status === "learning" ? 1 : 0;
    const mastery = options.mastery === undefined ? previous.mastery ?? fallback : Number(options.mastery);
    if (!Number.isInteger(mastery) || mastery < 0 || mastery > 6) {
      fail("mastery must be an integer from 0 to 6");
    }
    const now = new Date().toISOString();
    const evidence = Array.isArray(previous.evidence) ? [...previous.evidence] : [];
    if (options.evidence) {
      const kind = options["evidence-kind"] || "teacher_observation";
      const kinds = new Set(["explanation", "exercise", "proof", "transfer", "teacher_observation"]);
      if (!kinds.has(kind)) fail("invalid evidence kind: " + kind);
      evidence.push({ at: now, kind, note: options.evidence });
    }
    save.data.progress[itemId] = {
      status,
      mastery,
      updatedAt: now,
      completedAt: status === "completed" ? previous.completedAt || now : null,
      evidence
    };
    save.data.updatedAt = now;
    writeJson(save.file, save.data);
    console.log(JSON.stringify(save.data.progress[itemId], null, 2));
  } else if (command === "visit") {
    const itemId = options.item || options.concept;
    if (!itemId) fail("visit requires --item");
    const catalog = loadKnowledgeCatalog();
    if (!catalog.has(itemId)) fail("unknown knowledge item: " + itemId);
    const save = readLearner(learnerId);
    const previous = save.data.visits[itemId];
    const now = new Date().toISOString();
    save.data.visits[itemId] = {
      count: (previous?.count || 0) + 1,
      lastAt: now
    };
    save.data.updatedAt = now;
    writeJson(save.file, save.data);
    console.log(JSON.stringify(save.data.visits[itemId], null, 2));
  } else {
    usage();
    process.exit(1);
  }
} catch (error) {
  fail(error.message);
}
