---
id: tooling.lean-intro
title: Lean 入门：用机器检查证明
course: course.tooling
status: draft
version: v0.1
requires: []
---

# Lean 入门：用机器检查证明

## 这门课是什么

Lean 是交互式定理证明器：你写数学命题，Lean 逐条检查证明是否严格成立。学完你会：读懂并写出简单的 Lean 证明，把本仓库中的概念（整除、gcd、同余等）形式化一小部分，理解"严格证明"在机器层面的含义。

## 环境准备

- 安装 Lean 4 + mathlib：<https://leanprover-community.github.io/install/>（`elan` 工具链）
- 编辑器：VS Code + Lean 插件（推荐），或 neovim + lean.nvim
- 项目管理：`lake new myproj` 创建工程；在 `lakefile.toml` 中 `require mathlib from git` 后 `lake update`、`lake exe cache get` 下载预编译库
- 交互：把光标放在 `#check`、`#eval` 上，Lean 会在"消息面板"显示结果——这是最重要的反馈回路

## 基本语法：声明、检查、求值

```lean
#check 2 + 2          -- Nat（自然数）
#check Nat.add_comm   -- 定理：加法交换律
#eval 2 + 2           -- 4
#eval [1, 2, 3].map (fun x => x * x)   -- [1, 4, 9]
```

- `#check` 看类型（命题也是类型：`Prop`）；
- `#eval` 真正计算；
- 定义用 `def`，命题用 `theorem`/`lemma`/`example`。

## 命题逻辑

Lean 中"命题"是类型，"证明"是该类型的值。构造性对应：

| 数学 | Lean |
|------|------|
| $A\wedge B$（且） | `A ∧ B` |
| $A\vee B$（或） | `A ∨ B` |
| $A\to B$（蕴含） | `A → B` |
| $\neg A$ | `¬ A` |
| $A\iff B$ | `A ↔ B` |
| $\forall x, P(x)$ | `∀ x, P x` |
| $\exists x, P(x)$ | `∃ x, P x` |

### 策略（tactic）入门

```lean
example : 1 + 1 = 2 := by
  norm_num          -- 计算平凡等式

example (A B : Prop) : A → A := by
  intro h           -- 蕴含的证明：假设 A 得证 A
  exact h

example (A B : Prop) (h : A ∧ B) : B := by
  exact h.2         -- 或 h.right

example (A B : Prop) : A → A ∨ B := by
  intro hA
  left              -- 选左边
  exact hA
```

核心策略表：

| 目标 | 策略 |
|------|------|
| 证 `A → B` | `intro` |
| 用 `h : A → B` | `exact h ...` 或 `apply h` |
| 证 `A ∧ B` | `constructor`（或 `exact ⟨hA, hB⟩`） |
| 用 `h : A ∧ B` | `h.1`、`h.2` |
| 证 `A ∨ B` | `left` / `right` |
| 用 `h : A ∨ B` | `rcases h with hA \| hB` |
| 化简等式 | `ring`、`linarith`、`norm_num`、`omega` |

## 自然数与归纳法

自然数由 `0` 和后继 `Nat.succ` 构成，归纳法对应：

```lean
example (n : ℕ) : n + 0 = n := by
  induction n with
  | zero => simp          -- 基础情形：0 + 0 = 0
  | succ n ih =>          -- 归纳步：假设 n + 0 = n
      simp [ih]           -- 证 (n+1) + 0 = n+1
```

经典例子：平方和公式

```lean
example (n : ℕ) : (∑ k in Finset.range (n+1), k^2) = n*(n+1)*(2*n+1)/6 := by
  induction n with
  | zero => norm_num
  | succ n ih =>
      rw [Finset.sum_range_succ, ih]
      ring
```

（`ring` 处理整数/有理数恒等式；`linarith` 处理线性不等式。）

## 数论形式化：把本仓库概念搬进 Lean

以"整除"为例（mathlib 已定义 `a ∣ b`）：

```lean
-- 整除的传递性：a | b ∧ b | c → a | c
example {a b c : ℕ} (hab : a ∣ b) (hbc : b ∣ c) : a ∣ c := by
  rcases hab with ⟨k, hk⟩
  rcases hbc with ⟨l, hl⟩
  use k * l
  rw [hk, hl]
  ring

-- gcd 对称性（mathlib 已证，这里只是演示如何使用）
example {a b : ℕ} : Nat.gcd a b = Nat.gcd b a := by
  exact Nat.gcd_comm a b

-- 模运算
example : 2^10 ≡ 1 [MOD 11] := by
  norm_num
```

- `rcases ... with ⟨...⟩` 拆开存在量词；
- `use ...` 提供存在量词的见证；
- `ring` 验证多项式恒等式——它常常是证明的最后一击。

## 常见陷阱

1. **Nat 与 Int**：`n : ℕ` 里减法不是普通减法（`2 - 3 = 0`）。要负数需用 `ℤ`；
2. **除法的"地板"语义**：`n / 2` 在 Nat 中是整除；讨论余数用 `n % 2`；
3. **重写方向**：`rw [h]` 从左到右替换，`rw [← h]` 反向；
4. **先写纸面证明再形式化**：策略无法代替数学思路——先想清楚"为什么成立"，再让 Lean 验证每一步。

## 一个完整例子：欧几里得算法终止（想法示范）

```lean
-- 欧几里得算法每步余数严格下降：a % b < b（当 b > 0）
example {a b : ℕ} (hb : 0 < b) : a % b < b := by
  exact Nat.mod_lt a hb
```

真正的形式化需要定义递归函数并证明终止，这超出入门范围——入门的目标是：**能读懂上面的每一行，并模仿策略模式证明简单的整除、同余命题**。

## 检查理解

1. 证明 `A ∧ B → B ∧ A`（用 `constructor` + `h.2`、`h.1`）；
2. 用归纳法证明 $1+2+\cdots+n=\frac{n(n+1)}2$（提示：`Finset.sum_range_id` 或自己归纳）；
3. 证明 `3 ∣ 21`（`use 7; norm_num`）与 `3 ∤ 10`（`omega` 或 `norm_num` 尝试，再思考为什么）。
