#!/usr/bin/env node

import {
  parseArgs,
  readLearner,
  writeJson
} from "./lib.mjs";

const { positional, options } = parseArgs(process.argv.slice(2));
const command = positional[0];
const learnerId = options.learner;

const ENUM_OPTIONS = {
  "proof-experience": ["new", "some", "comfortable"],
  participation: ["listen", "guided", "active"],
  "lesson-size": ["small", "medium", "large"],
  "check-ins": ["brief", "reflective", "practice"],
  exposition: ["intuition_first", "balanced", "formal_first"],
  correction: ["gentle", "direct"],
  "inline-math": ["dollar", "paren", "plain", "unknown"],
  "display-math": ["double_dollar", "bracket", "plain", "unknown"],
  "assessment-basis": ["self_report", "conversation", "diagnostic"],
  status: ["in_progress", "completed"]
};

const TEXT_OPTIONS = [
  "goal",
  "stage",
  "background",
  "assessment",
  "sample-feedback"
];

function usage() {
  console.log("Usage:");
  console.log("  node src/profile.mjs show --learner ID");
  console.log("  node src/profile.mjs set --learner ID [profile options]");
  console.log("Profile options:");
  console.log("  --goal TEXT --stage TEXT --background TEXT");
  console.log("  --proof-experience new|some|comfortable");
  console.log("  --participation listen|guided|active");
  console.log("  --lesson-size small|medium|large");
  console.log("  --check-ins brief|reflective|practice");
  console.log("  --exposition intuition_first|balanced|formal_first");
  console.log("  --correction gentle|direct");
  console.log("  --inline-math dollar|paren|plain|unknown");
  console.log("  --display-math double_dollar|bracket|plain|unknown");
  console.log("  --assessment TEXT --assessment-basis self_report|conversation|diagnostic");
  console.log("  --sample-feedback TEXT --status in_progress|completed");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function textOption(name) {
  const value = options[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    fail("--" + name + " requires non-empty text");
  }
  return value.trim();
}

function enumOption(name) {
  const value = options[name];
  if (value === undefined) return undefined;
  if (!ENUM_OPTIONS[name].includes(value)) {
    fail("--" + name + " must be one of: " + ENUM_OPTIONS[name].join(", "));
  }
  return value;
}

function missingCompletionFields(profile) {
  const fields = [
    ["goal", profile.goal],
    ["background.stage", profile.background?.stage],
    ["background.summary", profile.background?.summary],
    ["background.proofExperience", profile.background?.proofExperience],
    ["preferences.participation", profile.preferences?.participation],
    ["preferences.lessonSize", profile.preferences?.lessonSize],
    ["preferences.checkIns", profile.preferences?.checkIns],
    ["preferences.exposition", profile.preferences?.exposition],
    ["preferences.correction", profile.preferences?.correction],
    ["rendering.inlineMath", profile.rendering?.inlineMath],
    ["rendering.displayMath", profile.rendering?.displayMath],
    ["assessment.summary", profile.assessment?.summary],
    ["assessment.basis", profile.assessment?.basis],
    ["sampleFeedback", profile.sampleFeedback]
  ];
  return fields.filter(([, value]) => value === undefined || value === "").map(([name]) => name);
}

if (!command || !learnerId) {
  usage();
  process.exit(1);
}

try {
  const save = readLearner(learnerId);

  if (command === "show") {
    console.log(JSON.stringify(save.data.profile || null, null, 2));
  } else if (command === "set") {
    const recognized = new Set(["learner", ...TEXT_OPTIONS, ...Object.keys(ENUM_OPTIONS)]);
    const unknown = Object.keys(options).filter((name) => !recognized.has(name));
    if (unknown.length > 0) fail("unknown profile option(s): " + unknown.join(", "));

    const values = Object.fromEntries(TEXT_OPTIONS.map((name) => [name, textOption(name)]));
    for (const name of Object.keys(ENUM_OPTIONS)) values[name] = enumOption(name);
    const hasUpdate = Object.entries(values).some(([name, value]) => name !== "status" && value !== undefined) || values.status !== undefined;
    if (!hasUpdate) fail("profile set requires at least one profile option");

    const previous = save.data.profile || {};
    const profile = {
      ...previous,
      background: { ...(previous.background || {}) },
      preferences: { ...(previous.preferences || {}) },
      rendering: { ...(previous.rendering || {}) },
      assessment: { ...(previous.assessment || {}) }
    };

    if (values.goal !== undefined) profile.goal = values.goal;
    if (values.stage !== undefined) profile.background.stage = values.stage;
    if (values.background !== undefined) profile.background.summary = values.background;
    if (values["proof-experience"] !== undefined) profile.background.proofExperience = values["proof-experience"];
    if (values.participation !== undefined) profile.preferences.participation = values.participation;
    if (values["lesson-size"] !== undefined) profile.preferences.lessonSize = values["lesson-size"];
    if (values["check-ins"] !== undefined) profile.preferences.checkIns = values["check-ins"];
    if (values.exposition !== undefined) profile.preferences.exposition = values.exposition;
    if (values.correction !== undefined) profile.preferences.correction = values.correction;
    if (values["inline-math"] !== undefined) profile.rendering.inlineMath = values["inline-math"];
    if (values["display-math"] !== undefined) profile.rendering.displayMath = values["display-math"];
    if (values.assessment !== undefined) profile.assessment.summary = values.assessment;
    if (values["assessment-basis"] !== undefined) profile.assessment.basis = values["assessment-basis"];
    if (values["sample-feedback"] !== undefined) profile.sampleFeedback = values["sample-feedback"];

    profile.status = values.status || previous.status || "in_progress";
    const missing = profile.status === "completed" ? missingCompletionFields(profile) : [];
    if (missing.length > 0) {
      fail("cannot complete profile; missing: " + missing.join(", "));
    }

    const now = new Date().toISOString();
    profile.updatedAt = now;
    save.data.profile = profile;
    save.data.updatedAt = now;
    writeJson(save.file, save.data);
    console.log(JSON.stringify(profile, null, 2));
  } else {
    usage();
    process.exit(1);
  }
} catch (error) {
  fail(error.message);
}
