---
id: proof.analysis.important-limit-sinx-over-x
title: 重要极限：sin x / x 的几何证明
course: course.university.analysis
status: draft
version: v0.1
proves: concept.important-limits
method: 单位圆面积比较 + 夹逼
requires: ["concept.important-limits", "concept.squeeze-theorem", "elementary.geometry.trigonometry"]
---

# 重要极限：$\lim_{x\to0}\frac{\sin x}{x}=1$

设 $0<x<\frac\pi2$，在单位圆中取圆心角 $x$。比较三块面积：

- 小三角形 $OAB$（$A$ 在 $x$ 轴上，$B=(\cos x,\sin x)$）：面积 $\frac12\sin x$；
- 扇形 $OAB$：面积 $\frac x2$；
- 大三角形 $OAC$（$C=(1,\tan x)$）：面积 $\frac12\tan x$。

由包含关系：

$$
\frac12\sin x<\frac x2<\frac12\tan x.
$$

变形得

$$
\sin x<x<\tan x\ \Rightarrow\ \cos x<\frac{\sin x}{x}<1.
$$

$x\to0^+$ 时 $\cos x\to1$，由夹逼 $\frac{\sin x}{x}\to1$。$x\to0^-$ 由奇偶性同理（或令 $t=-x$）。$\blacksquare$

**注意**：不能用洛必达证明此极限（依赖 $(\sin x)'$，而后者又依赖本极限——循环论证）。
