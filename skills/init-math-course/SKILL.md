---
name: init-math-course
description: Initialize or recalibrate a MatLattice learner account before formal teaching. Use when creating a learner, assessing mathematical background and proof readiness, choosing participation and lesson pacing preferences, testing chat formula rendering, trying a sample explanation, updating an existing learner profile, or preparing a handoff to teach-math-course. Store the confirmed profile only through the repository scripts.
---

# Initialize Math Course

Create a low-pressure, persistent learning profile before formal teaching begins. Treat initialization as a conversation about fit, not an entrance examination.

## Locate the project and learner

Use the current working directory or its nearest ancestor containing `README.md`, `data/`, `src/`, and `learners/` as the repository root. Do not infer the repository from the installed skill path.

Ask for a learner name or ID if none is known. Inspect `learners/ID.json`:

- If it does not exist, run `node src/progress.mjs init --learner ID`.
- If it exists, run `node src/progress.mjs show --learner ID` and preserve all progress.
- Run `node src/profile.mjs show --learner ID` to resume an incomplete profile or update an existing one.

Never edit learner JSON directly.

## Establish the learning contract

Explain briefly that MatLattice is for systematic, rigorous mathematics: intuition and examples motivate ideas, but precise definitions, proofs, and independent use remain the eventual standard. A learner may listen without doing exercises in a particular session; that changes participation, not the course's mathematical standard.

If this goal is clearly a poor fit, say so before continuing. Do not pressure the learner to accept the course.

## Run the initialization conversation

Cover the phases below over a few short exchanges. Do not send one intimidating questionnaire. Reuse answers already given, allow natural-language responses, and say explicitly that preferences are adjustable settings rather than judgments about ability.

### 1. Goal and mathematical background

Learn:

- what the learner ultimately wants to understand or be able to prove;
- their school stage, relevant courses, and time since they studied them;
- their comfort by domain, especially algebra and functions, geometry, calculus or analysis, logic and proof, and any domain relevant to their goal;
- their experience reading and writing proofs;
- known strengths, recurring difficulties, and any accessibility or language needs.

Do not compress this into a single global "math level." Produce a short domain-aware assessment summary with explicit uncertainty.

### 2. Participation and pacing preferences

Ask separately about the learner's usual preference and what they want today. Present ordinary language choices rather than enum names:

- **Participation:** `listen` means explanation without required calculations or graded questions; `guided` means optional conceptual prompts and occasional short work; `active` means regular problems with the teacher waiting for an answer.
- **Lesson size:** `small` means one idea per chunk; `medium` means one coherent section; `large` means a longer connected explanation.
- **Check-ins:** `brief` asks whether the last part is clear and whether to continue; `reflective` invites the learner to describe what feels clear or unclear; `practice` uses a question or calculation as the main checkpoint.
- **Exposition:** `intuition_first`, `balanced`, or `formal_first` controls the order of motivation and formalism, never whether rigor is eventually included.
- **Correction:** `gentle` or `direct` controls phrasing, never whether errors are identified.

Listening mode must still have breathing points. End each configured chunk with a genuine opening such as "到这里清楚吗？要继续，还是换一种说法？" Do not disguise an exercise as a comprehension check. If the learner says "continue," continue without demanding a calculation.

A statement such as "今天只想听" is a session override. Do not overwrite the persistent default unless the learner asks to change it.

### 3. Formula rendering

Use explicit platform guidance when available. Otherwise show short candidate inline and display formulas and ask which ones are typeset. Record:

- inline: `dollar`, `paren`, `plain`, or `unknown`;
- display: `double_dollar`, `bracket`, `plain`, or `unknown`.

This profile controls chat output only. Repository Markdown must continue using `$...$` and `$$...$$`.

### 4. Placement evidence

Choose at most two to four high-information prompts near the boundaries relevant to the learner's goal. Before presenting them, ask whether the learner wants to calculate, discuss concepts without calculation, or rely on course history for now.

- In `active` or `guided` mode, combine a small representative task with explanation or proof-reading when useful.
- In `listen` mode, do not force calculations. Use course history and a conversational discussion; record the assessment basis as `self_report` or `conversation` and preserve uncertainty.
- Treat "I do not know" as ambiguous. Distinguish notation, forgotten technique, conceptual understanding, and proof readiness before choosing remediation.

Only use `src/progress.mjs set` when the evidence supports a specific knowledge node. Self-report may support routine prerequisites at `know` depth, but never mark proof or mastery from confidence alone. The profile assessment is not itself course progress.

### 5. Trial explanation

Offer a short sample explanation in the provisional style. Choose a familiar or low-stakes mathematical idea, keep it to one configured chunk, and do not turn it into a test. If the sample comes from course data, render it first; do not record a course visit because this sample evaluates presentation style.

Ask for concrete reactions:

- Was the chunk too long or too fragmented?
- Was it too formal, too intuitive, or well balanced?
- Were there enough examples and signposts?
- Did the pause feel natural, and did the learner feel pressured to answer?

Revise the provisional preferences from this feedback. If the learner declines the trial, record that choice rather than blocking initialization.

## Save and hand off

Summarize the proposed profile in the learner's language and invite corrections. Then save it with `src/profile.mjs`; use `in_progress` while onboarding is interrupted and `completed` after every required field has a value. Use an explicit "unknown" or a note that the learner declined a step when appropriate rather than inventing an answer.

The command accepts these options:

    node src/profile.mjs set --learner ID \
      --goal TEXT --stage TEXT --background TEXT \
      --proof-experience new|some|comfortable \
      --participation listen|guided|active \
      --lesson-size small|medium|large \
      --check-ins brief|reflective|practice \
      --exposition intuition_first|balanced|formal_first \
      --correction gentle|direct \
      --inline-math dollar|paren|plain|unknown \
      --display-math double_dollar|bracket|plain|unknown \
      --assessment TEXT --assessment-basis self_report|conversation|diagnostic \
      --sample-feedback TEXT --status completed

Run `node src/profile.mjs show --learner ID` after writing and report the saved defaults in friendly prose. End by suggesting `$teach-math-course` with a concrete course or target. Do not begin the full lesson inside this skill unless the learner explicitly asks to continue immediately.

## Guardrails

- Keep the emotional stakes low; do not call the process a test, score, or gate.
- Do not make calculations mandatory merely to finish initialization.
- Do not claim precise placement from self-report alone.
- Do not mark a knowledge node completed because it appeared in the trial explanation.
- Do not interpret a preference for listening as laziness or lack of ability.
- Do not overwrite an existing profile or its progress without first showing what will change.
- Keep mutable state in `learners/` and write it only through `src/profile.mjs` or `src/progress.mjs`.
