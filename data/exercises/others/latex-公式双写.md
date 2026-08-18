---
id: exercise.tooling.latex.transcribe-formula
title: 公式双写：LaTeX 与简化记号
course: course.tooling
status: draft
version: v0.1
difficulty: 1
tests: ["elementary.algebra.quadratic-equation"]
requires: ["elementary.algebra.quadratic-equation"]
---

# 公式双写：LaTeX 与简化记号

## 题目

把以下三个公式分别写成标准 LaTeX（`$...$` 行内）与纯文本简化记号（聊天输入版）：

1. 求根公式 $x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$；
2. 求和 $\sum_{i=1}^{n}i^2=\frac{n(n+1)(2n+1)}{6}$；
3. 矩阵 $\begin{pmatrix}1&2\\3&4\end{pmatrix}$ 与它的行列式。

例如第 1 题：LaTeX 写 `$x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$`，简化记号写 `x = (-b ± sqrt(b^2 - 4ac)) / (2a)`。

## 教师观察点

学习者能否：熟练写出常用 LaTeX 命令（`\frac`、`\sqrt`、`\pm`、`\sum_{}^{}`、`\begin{pmatrix}`）；理解简化记号的边界规则（分母/根号内加括号）；两种写法互相转换时不丢失信息。
