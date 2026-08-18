---
name: math-input
description: Handle math formula input from users in plain-text chat, including LaTeX, simplified ASCII notation (like mat((1 2) (3 4)), a^2, x_i, x-bar), and photo input of handwritten formulas. Use when a user asks how to type a formula, sends formulas in chat, or sends a photo of handwritten math. Includes the plain-text convention table and ambiguity-resolution guidance.
---

# Math Input: Reading Formulas from the User

The chat input box has no WYSIWYG formula editor. Users will type formulas in several dialects. Your job is to understand them all, restate them in standard LaTeX when useful, and give the user good options when they ask "how do I type this?".

The full user-facing course is `data/others/latex-数学公式.md`; the convention table below is the operative summary.

## Accepted input dialects

1. **Standard LaTeX**: `\frac{a}{b}`, `\sum_{i=1}^n`, `\sqrt{x}`, `a \equiv b \pmod m`. Always prefer this in your own output. Use `$...$` for inline and `$$...$$` for display math (the repository renderer rejects `\(...\)` and `\[...\]`).
2. **Simplified ASCII notation** (most common in chat):

| Notation | Meaning |
|----------|---------|
| `a^2`, `a^(n+1)` | superscript |
| `x_i`, `x_(i,j)` | subscript |
| `a/b`, `(a+b)/(c+d)` | fraction (watch parentheses) |
| `sqrt(2)`, `cbrt(8)`, `根号2` | roots |
| `mat((1 2) (3 4))` | matrix; rows separated by spaces or commas |
| `vec(v)`, `det(...)` | vector, determinant |
| `sum_(i=1)^n a_i` | summation: `_` lower, `^` upper |
| `int_a^b f(x) dx` | integral |
| `lim_(x->0) f(x)` | limit; `->` means tends to |
| `a ≡ b (mod m)`, `a = b mod m` | congruence |
| `C(n,k)`, `binom(n,k)` | binomial coefficient |
| `x-bar`, `x-hat`, `conj(z)`, `A^T` | overline, hat, conjugate, transpose |
| `{x in R : x^2<2}`, `forall x`, `exists x`, `A subset B` | sets, quantifiers |
| `a \| b` or `a divides b` | divisibility (context vs absolute value) |
| `f ~ g`, `O(n^2)`, `sup S`, `inf S` | asymptotics, bounds |

3. **Natural-language math**: users may describe formulas in Chinese prose ("3 行 3 列矩阵，第 i 行第 j 列是 1/(i+j)"). Translate this to LaTeX faithfully, including index conventions.

4. **Photos of handwritten formulas** (multimodal models only): transcribe the photo into LaTeX and confirm the transcription before solving. Ask for clarification on anything ambiguous (e.g., "第二个矩阵是 2 行 3 列吗？").

## Behavior rules

- **Restate before solving** when a formula is long or central: "我理解公式是 $\det\begin{pmatrix}1&2\\3&4\end{pmatrix}$，对吗？" One-line formulas can go straight to the answer.
- **Ask about ambiguity** instead of guessing. Ambiguity triggers: unbalanced parentheses, `a+b/c` (is it $\frac{a+b}{c}$ or $a+\frac bc$?), same symbol for divisibility and absolute value, subscript vs superscript confusion.
- **When a user asks how to type something**: give the shortest working option. Simple expressions → `^`, `_`, `a/b`, `sqrt(...)`. Matrices → `mat((1 2) (3 4))`. Complicated structures → suggest writing it on paper and photographing it (if multimodal), or describing it in words.
- **When the user says "我说不清公式"**: walk them through describing structure (dimensions, index patterns, operations) rather than symbols.
- **Never guess an index range silently**: `sum a_i` with no bounds — ask "求和范围是 i=1 到 n 吗？"

## Also available

- `data/others/python-数值研究.md` — Python/NumPy/SciPy/Matplotlib quickstart for numerical experiments.
- `data/others/lean-入门.md` — Lean theorem prover quickstart for machine-checked proofs.

Both are single-file courses for users who want to verify their math computationally or formally.
