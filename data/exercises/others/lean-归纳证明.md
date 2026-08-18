---
id: exercise.tooling.lean.induction
title: 用 Lean 做归纳证明
course: course.tooling
status: draft
version: v0.1
difficulty: 3
tests: ["elementary.number-theory.well-ordering-and-strong-induction"]
requires: ["elementary.number-theory.well-ordering-and-strong-induction"]
---

# 用 Lean 做归纳证明

## 题目

1. 证明 $n+0=n$ 对一切 $n:\mathbb N$ 成立：

```lean
example (n : ℕ) : n + 0 = n := by
  induction n with
  | zero => simp
  | succ n ih => simp [ih]
```

先理解这段代码，然后**不看答案**重写一遍，并解释 `zero` 与 `succ n ih` 两个分支各对应归纳法的哪一部分。

2. 用归纳法证明 $\sum_{k=0}^{n} k=\frac{n(n+1)}2$：

```lean
example (n : ℕ) : (∑ k in Finset.range (n+1), k) = n*(n+1)/2 := by
  induction n with
  | zero => norm_num
  | succ n ih =>
      rw [Finset.sum_range_succ, ih]
      ring
```

3. 自己证明 $\sum_{k=0}^{n} k^2=\frac{n(n+1)(2n+1)}6$（可仿照第 2 题结构，最后用 `ring` 化简）。

## 教师观察点

学习者能否：识别归纳法在 Lean 中的两个分支；理解 `ih`（归纳假设）的作用与使用时机；用 `Finset.sum_range_succ` 展开求和；把"数学归纳思路"翻译为策略序列。
