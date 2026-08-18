#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  assertOutsideData,
  parseArgs,
  parseFrontmatter,
  readLearner,
  splitRequirementList,
  unmetRequirements
} from "./lib.mjs";

const { options } = parseArgs(process.argv.slice(2));

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function filterRequiredDivs(body, learner, file) {
  const token = /<div\s+require="([^"]+)"\s*>|<\/div>/g;
  const stack = [];
  let output = "";
  let cursor = 0;
  let match;
  const visible = () => stack.every(Boolean);

  while ((match = token.exec(body)) !== null) {
    if (visible()) output += body.slice(cursor, match.index);
    if (match[1] !== undefined) {
      const requirements = splitRequirementList(match[1]);
      stack.push(unmetRequirements(requirements, learner).length === 0);
    } else {
      if (stack.length === 0) throw new Error(file + ": unmatched closing div");
      stack.pop();
    }
    cursor = token.lastIndex;
  }
  if (stack.length !== 0) throw new Error(file + ": unclosed require div");
  if (visible()) output += body.slice(cursor);
  return output.replace(/\n{3,}/g, "\n\n");
}

if (!options.learner || !options.input) {
  fail("Usage: node src/render.mjs --learner ID --input FILE [--output FILE]");
}

try {
  const learner = readLearner(options.learner).data;
  const input = path.resolve(options.input);
  const source = fs.readFileSync(input, "utf8");
  const parsed = parseFrontmatter(source, input);
  const missing = unmetRequirements(parsed.meta.requires || [], learner);
  if (missing.length > 0) {
    fail("locked: " + missing.join(", "), 2);
  }
  const renderedBody = filterRequiredDivs(parsed.body, learner, input);
  const frontmatterEnd = source.indexOf("\n---\n", 4);
  const frontmatter = source.startsWith("---\n") ? source.slice(0, frontmatterEnd + 5) : "";
  const rendered = frontmatter + renderedBody;
  if (options.output) {
    const output = assertOutsideData(options.output);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, rendered);
    console.log(output);
  } else {
    process.stdout.write(rendered);
  }
} catch (error) {
  fail(error.message);
}
