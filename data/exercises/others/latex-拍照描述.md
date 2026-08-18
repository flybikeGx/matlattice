---
id: exercise.tooling.latex.photo-description
title: 手写拍照与口头描述转写
course: course.tooling
status: draft
version: v0.1
difficulty: 2
tests: ["concept.discontinuity"]
requires: ["concept.discontinuity"]
---

# 手写拍照与口头描述转写

## 题目

1. **口头描述转写**：下面是一段纯文字描述，请把它转写为 LaTeX：<br>
"函数 f 在 0 处等于 1，在其他地方等于 sin x 除以 x；用分段函数表示。"

（答案应为 $f(x)=\begin{cases}\frac{\sin x}{x}&x\ne0\\1&x=0\end{cases}$——这正是可去间断点修补的经典例子。）

2. **拍照转写流程**：假设你拍了一张手写公式照片发给 AI。列出你应该口头补充的三条信息（提示：矩阵维度、上下标归属、符号约定），并模拟一段"AI 复述确认、你指正"的对话。

3. **文字兜底**：用纯文字描述矩阵 $A=\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}$ 的结构（不写任何记号），让别人/模型能重建它。

## 教师观察点

学习者能否：把自然语言描述准确转写为分段函数 LaTeX；理解"拍照 + 口头补充 + AI 复述确认"的协作流程；在纯文本场景下用"维度 + 逐元素规则"描述结构化对象（矩阵）。
