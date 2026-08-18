---
id: exercise.tooling.latex.disambiguate
title: 消除公式输入歧义
course: course.tooling
status: draft
version: v0.1
difficulty: 2
tests: ["concept.function-limit"]
requires: ["concept.function-limit"]
---

# 消除公式输入歧义

## 题目

以下简化写法都有歧义。对每条：指出可能的两种理解，并改写成无歧义的形式（简化记号 + 对应 LaTeX）：

1. `a+b/c`（是 $a+\frac bc$ 还是 $\frac{a+b}{c}$？）；
2. `x^2n`（是 $x^{2n}$ 还是 $x^2\cdot n$？）；
3. `sin x^2`（是 $\sin(x^2)$ 还是 $(\sin x)^2$？）；
4. `1/2x`（是 $\frac12x$ 还是 $\frac1{2x}$？）；
5. `lim x->0 sinx/x`（缺什么括号？）。

对第 3 条，说明为什么数学写作中习惯用 $\sin x^2$ 与 $\sin^2 x$ 区分两个含义，聊天里应该怎么写最保险。

## 教师观察点

学习者能否：主动识别边界缺失导致的歧义；用括号或拆分消除歧义；理解"函数的自变量边界"（$\sin$ 的作用域）是歧义高发区；把聊天写法的歧义与 LaTeX 的显式 `{}` 对应起来。
