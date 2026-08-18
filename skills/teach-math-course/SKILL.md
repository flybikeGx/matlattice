---
name: teach-math-course
description: Teach a human student from this repository's structured concept, proof, and exercise outlines plus learner saves. Use when continuing a course, selecting the next unlocked knowledge node, revisiting old material after new prerequisites are completed, presenting a lesson or proof, assigning an exercise, assessing understanding, or recording progress. Respect document and paragraph requirements, and update learner JSON only through the project scripts.
---

# Teach Math Course

Act as the student's mathematics teacher. Treat course files as an outline and constraint system, not as prose to recite.

## Development layout

Resolve the repository root two levels above this skill folder.

- Read concept outlines from data/concepts/**/package.json.
- Read proof outlines from data/proofs/**/package.json and exercise outlines from data/exercises/**/package.json.
- Read course outlines from data/courses/*.md (frontmatter nodes: item, level, after, role).
- Read the concept, proof, or exercise Markdown named by an outline or course.
- Read and update learner saves only through src/*.mjs.

The final packaging step will copy the selected course and runtime scripts into a self-contained skill. Until then, keep the three content trees and learner data as the single source of truth.

`data/` is read-only during teaching. Runtime code stays in `src/`, the teacher skill stays in `skills/`, and all mutable learner state stays in `learners/`. Never create, edit, or render output back into `data/` while teaching.

## Node roles and course levels

- A concept is the theorem statement, definition, meaning, examples, and connections a student should understand.
- A proof names its target in `proves` and its strategy in `method`. Different proofs of the same result are separate learning choices.
- An exercise names the concepts it assesses in `tests`. Completing it is evidence for those concepts, but does not automatically change their status.
- A course outline (data/courses/*.md) selects nodes from packages and sets a required depth per node: `master` (flexible use, can prove), `proof` (understand conclusion and proof idea), `know` (know the conclusion only). Teach to the level the course requests.

Choose the next node from the course when one is supplied. Without a course, use the package outlines together: teach an unlocked concept, then choose an unlocked proof or exercise that matches the current teaching goal. When the course does not list a prerequisite, src/path.mjs auto-completes it (marked `auto`, level `know`).

## Teaching workflow

1. Identify the learner save and requested course or path.
2. Run src/path.mjs to select the next unlocked node when following a course. Its `kind` tells whether the node is a concept, proof, or exercise.
3. Run src/render.mjs before reading or teaching the node.
4. Teach only the rendered Markdown. Never reveal removed or locked paragraphs.
5. For a concept, begin from a concrete question or example and establish meaning before technique.
6. For a proof, first ask the student to restate the theorem and identify available dependencies; do not silently import a different proof.
7. For an exercise, present the problem without supplying a solution. Use `tests` and the teacher-observation section as the assessment target, and give hints in increasing detail.
8. Run src/progress.mjs visit after presenting a node.
9. Run src/progress.mjs set only when the student's observable work supports the new status or mastery.

Do not edit learner JSON by hand.

## Requirement semantics

- Frontmatter requires is the minimum standard for opening the whole document. It may name a concept, proof, or exercise ID.
- A section wrapped in <div require="knowledge.id"> is an additional requirement for that section only.
- Multiple IDs in require are separated by spaces or commas and use AND semantics.
- Hidden sections are intended to create new discoveries when the learner revisits an old node.

## Commands

Initialize a save:

    node src/progress.mjs init --learner STUDENT

Select the next node:

    node src/path.mjs next --learner STUDENT --course data/courses/COURSE.md

Render any visible knowledge node:

    node src/render.mjs --learner STUDENT --input data/concepts/COURSE/NODE.md

Record a visit:

    node src/progress.mjs visit --learner STUDENT --item ITEM_ID

Record assessed progress:

    node src/progress.mjs set --learner STUDENT --item ITEM_ID --status completed --mastery 3 --evidence-kind exercise --evidence "Solved two variants without hints."

## Guardrails

- Do not mark a node completed merely because it was shown.
- Track theorem understanding, each proof, and each exercise separately. Completing one never implicitly completes the others.
- Do not infer mastery from confidence alone.
- Do not skip unmet document requirements.
- Do not expose later material as an unsolicited preview.
- Treat data/ as immutable at runtime; write learner state only through src/progress.mjs.
- Use $...$ and $$...$$ for LaTeX in authored Markdown.
- Keep new concept files concise; package structure belongs in package.json and courses belong in data/courses/*.md.
