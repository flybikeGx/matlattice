---
id: exercise.tooling.python.integral-quad
title: 用 SciPy 计算反常积分
course: course.tooling
status: draft
version: v0.1
difficulty: 2
tests: ["concept.improper-integral"]
requires: ["concept.improper-integral"]
---

# 用 SciPy 计算反常积分

## 题目

用 `scipy.integrate.quad` 计算下列积分并与解析结果比较：

1. $\int_0^\infty e^{-x^2}dx$（应接近 $\frac{\sqrt\pi}{2}$）；
2. $\int_0^1\frac{dx}{\sqrt x}$（无界函数反常积分，应等于 $2$）；
3. $\int_0^\infty\frac{\sin x}{x}dx$（振荡慢衰减，观察 `quad` 是否需要参数调整）。

对每个积分，报告 `quad` 返回的数值与误差估计，并解释：为何第 3 个积分需要分段或增大精度参数？

## 教师观察点

学习者能否：区分"无穷限"与"无界函数"两类反常积分；阅读并解释 `quad` 的误差输出；在振荡被积函数上调整 `epsabs/epsrel` 或分段；把数值结果与解析值/已知常数联系。
