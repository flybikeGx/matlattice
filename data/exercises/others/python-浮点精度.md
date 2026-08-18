---
id: exercise.tooling.python.float-precision
title: 浮点精度与灾难性抵消
course: course.tooling
status: draft
version: v0.1
difficulty: 2
tests: ["concept.sequence-limit"]
requires: ["concept.sequence-limit"]
---

# 浮点精度与灾难性抵消

## 题目

1. 用 NumPy 计算 $S_n=\sum_{k=1}^{n}\frac{(-1)^{k+1}}{k}$，取 $n=10^3,10^6,10^9$，并与 $\ln2$ 比较，记录绝对误差随 $n$ 的变化并解释原因。
2. 分别用求根公式的两种等价形式计算 $x^2+10^8x+1=0$ 的两个根：

$$
x=\frac{-b+\sqrt{b^2-4ac}}{2a}\quad\text{与}\quad x=\frac{-2c}{b+\sqrt{b^2-4ac}},
$$

比较两种算法在"小根"上的差异，说明哪种更稳定、为什么。

## 教师观察点

学习者能否：用 `np.isclose` 而非 `==` 比较浮点结果；意识到交错级数求和存在抵消误差；识别灾难性抵消并给出稳定算法。
