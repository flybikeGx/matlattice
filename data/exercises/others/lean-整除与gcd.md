---
id: exercise.tooling.lean.number-theory
title: 用 Lean 形式化整除与 gcd
course: course.tooling
status: draft
version: v0.1
difficulty: 3
tests: ["elementary.number-theory.divisibility", "elementary.number-theory.gcd"]
requires: ["elementary.number-theory.divisibility", "elementary.number-theory.gcd"]
---

# 用 Lean 形式化整除与 gcd

## 题目

在 Lean 4（mathlib）中完成：

1. 整除的传递性：

```lean
example {a b c : ℕ} (hab : a ∣ b) (hbc : b ∣ c) : a ∣ c := by
  rcases hab with ⟨k, hk⟩
  rcases hbc with ⟨l, hl⟩
  use k * l
  rw [hk, hl]
  ring
```

读懂后自己重写，并说明每一步对应"整除定义中的哪个等号"。

2. 证明 $3\mid 21$ 且 $3\nmid 10$：

```lean
example : 3 ∣ 21 := by norm_num
example : ¬ 3 ∣ 10 := by norm_num
```

3. 用 mathlib 现成定理：

```lean
example {a b : ℕ} : Nat.gcd a b = Nat.gcd b a := by exact Nat.gcd_comm a b
```

再查一下 `#check Nat.gcd_dvd_left`、`#check Nat.dvd_gcd`，说明这两个定理分别对应 gcd 定义中的哪条性质（公共约数 / 最大性）。

## 教师观察点

学习者能否：用 `rcases` 拆开存在量词（"$a\mid b$ 即存在 $k$ 使 $b=ak$"）；用 `use` 提供见证；把"整除、gcd"的数学定义与 mathlib 定理对应起来；体会形式化证明与纸面证明的对应关系。
