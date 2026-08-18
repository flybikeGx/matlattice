---
id: exercise.tooling.lean.proposition-logic
title: 用 Lean 证明命题逻辑
course: course.tooling
status: draft
version: v0.1
difficulty: 1
tests: ["elementary.number-theory.well-ordering-and-strong-induction"]
requires: ["elementary.number-theory.well-ordering-and-strong-induction"]
---

# 用 Lean 证明命题逻辑

## 题目

在 Lean 4 中完成以下命题的证明（每题一个 `example`）：

```lean
example (A B : Prop) : A ∧ B → B ∧ A := by
  -- 你的证明

example (A B C : Prop) (hAB : A → B) (hBC : B → C) : A → C := by
  -- 你的证明

example (A B : Prop) : (A → B) → (¬ B → ¬ A) := by
  -- 你的证明（提示：intro h hnb hA；用 hnb 驳倒 h hA）
```

每个证明用 `by` 策略块完成，并说出每一步用了哪个策略（`intro`、`constructor`、`exact`、`rcases` 等）。

## 教师观察点

学习者能否：理解"命题即类型、证明即程序"的对应；正确使用 `intro` 引入假设、`constructor` 分解合取、`exact` 结束证明；在反证类命题（第三个）中正确组合假设与否定。
