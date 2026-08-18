---
id: exercise.tooling.python.fit-overfit
title: 多项式拟合与过拟合
course: course.tooling
status: draft
version: v0.1
difficulty: 3
tests: ["elementary.algebra.quadratic-function"]
requires: ["elementary.algebra.quadratic-function"]
---

# 多项式拟合与过拟合

## 题目

1. 生成数据：$x=\mathrm{linspace}(0,10,50)$，$y=x^2-3x+2+\text{高斯噪声}$（`np.random.default_rng(0)` 保证可复现）；
2. 分别用次数 $2$、$5$、$15$ 的多项式做 `np.polyfit` 拟合，在同一图上画出数据点与三条拟合曲线；
3. 解释：低次拟合的"欠拟合"与高次拟合的"过拟合"各指什么？从图像上如何识别？为什么 15 次多项式虽然穿过更多点却未必更好？

## 教师观察点

学习者能否：用 `linspace`/`polyfit`/`polyval` 完成拟合流程；理解拟合不是"穿过点越多越好"；把过拟合与"系数膨胀"、测试区间外发散联系起来；用固定随机种子保证可复现。
