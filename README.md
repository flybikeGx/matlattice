# MatLattice

<div align="center">

> *数学是我国人民所擅长的学科*
>
> *—— 华罗庚*

</div>

MatLattice 是一个由结构化课程大纲驱动的 AI 数学教师项目。

知识贡献者用 Markdown 编写概念、证明和练习，用 JSON 组织课程与学习路径；AI 教师结合学习者存档，只展示已经解锁的内容，在教学和评估后通过脚本记录进度。

这份 README 同时面向两类读者：

- 学习者和课程使用者：克隆仓库、启动 AI 教师并开始学习；
- 知识贡献者：增加或修改课程节点、证明、练习和依赖关系。

## 快速开始（学习者）

### 第 1 步：克隆项目

```bash
git clone <仓库地址> matlattice
cd matlattice
```

### 第 2 步：安装 AI 教师 skill

把项目自带的 AI 教师安装到编辑器可识别的全局 skill 目录：

```bash
mkdir -p ~/.agents/skills
cp -r skills/teach-math-course ~/.agents/skills/
cp -r skills/math-input ~/.agents/skills/
```

- `teach-math-course`：主教师——读课程大纲、选下一节点、教学、评估、记录进度；
- `math-input`：公式输入助手——理解聊天里的简化公式写法（如 `mat((1 2) (3 4))`）、手写公式照片，教你怎么打公式。

> 后续更新仓库后，重新执行复制即可覆盖为最新版本。

### 第 3 步：在项目目录中启动 agent

在 `matlattice` 目录中打开支持 agent skills 的编辑器（如 Zed），新建会话并调用 `teach-math-course` skill。

### 第 4 步：让 AI 开始教学

直接告诉它你想学什么，例如：

- "使用 teach-math-course，我想学初等数论"
- "我想学微积分"（对应 `data/courses/微积分.md`）
- "讲一讲欧几里得算法"

AI 教师会自动：

1. 读取课程大纲（`data/courses/*.md`）与你的学习存档；
2. 选择下一个已解锁的知识节点（概念、证明或练习）；
3. 只展示你已经满足前置要求的内容，教学、提问并评估；
4. 通过脚本记录访问与有证据的进度——你随时可以继续上次的进度。

### 可用的课程

| 课程 | 大纲文件 | 内容 |
|---|---|---|
| 初等数论 | `data/courses/初等数论.md` | 整除、素数、gcd、不定方程、同余、剩余系、算术函数、模指数定理 |
| 欧几里得算法 | `data/courses/欧几里得算法.md` | 从整除到 gcd 的短课 |
| 微积分 | `data/courses/微积分.md` | 极限与连续基础 + 一元微分学与积分学 |
| 数学分析 | `data/courses/数学分析.md` | 微积分的严格基础：实数、极限、连续、微分、积分、级数 |
| 高等数学 | `data/courses/高等数学.md` | 工科主线：极限连续、微分积分、无穷级数 |

课程未列出的前置节点会被自动补全（以 `know` 等级先行学习），不需要手动安排顺序。想学其他主题时，直接告诉 AI 即可。

### 公式怎么输入

聊天框不支持公式编辑器。简单写法：上标 `a^2`、下标 `x_i`、分数 `a/b`、根号 `sqrt(2)`、矩阵 `mat((1 2) (3 4))`、求和 `sum_(i=1)^n a_i`。复杂公式可以写在纸上拍照发给 AI，或直接用中文描述。完整约定见 `data/others/latex-数学公式.md`，遇到问题也可以直接问 AI（`math-input` skill 会帮你）。

## 工作方式

```text
课程大纲 + 学习者存档
          ↓
  选择下一个可学习节点
          ↓
过滤尚未满足 require 的内容
          ↓
  AI 教学、提问与评估
          ↓
     脚本更新存档
```

概念、证明和练习是三个独立的学习节点。理解一个定理，不等于已经掌握它的某种证明；完成一道练习，也不会自动把相关概念标记为完成。

## 项目目录

```text
data/
  concepts/    知识包：概念、定义和定理陈述（每包一个 package.json）
  proofs/      知识包：独立的证明节点；一种证明方法对应一个文件
  exercises/   知识包：带难度和考查目标的练习节点
  courses/     课程大纲（md + frontmatter 结构化数据）：组合/分解各知识包，设计节点等级
  others/      工具课等单文件课程（Python 数值研究、Lean 入门、LaTeX 公式输入）
learners/      学习者 JSON 存档和 schema
src/           校验、渲染、课程选择和进度管理脚本
skills/        面向 AI 教师的最终交付入口
docs/          项目设计与知识模型说明
```

教学内容全部位于 `data/`，并在教学运行时视为不可写。运行时代码位于 `src/`，AI 教师位于 `skills/`；唯一的持久化写入区是 `learners/`。

```text
data/       只读输入
src/        data 外的运行时
skills/     data 外的 AI 教师
learners/   可写的用户状态
```

## 运行时脚本（开发者参考）

正常情况下由 AI 教师调用这些脚本，不需要手动执行。需要调试或直接操作时可参考。

项目脚本使用 Node.js，无第三方运行时依赖。在项目根目录先检查数据是否一致：

```bash
npm run check
```

### 创建学习者存档

```bash
node src/progress.mjs init --learner alice
```

这会创建 `learners/alice.json`。不要手工编辑该文件，后续访问和进度都应通过脚本写入。

### 选择下一项学习内容

选择一个课程大纲（`data/courses/*.md`）：

```bash
node src/path.mjs next \
  --learner alice \
  --course data/courses/初等数论.md
```

也可以使用较短的欧几里得算法课程，或组合数学分析包的微积分课程：

```bash
node src/path.mjs next --learner alice --course data/courses/欧几里得算法.md
node src/path.mjs next --learner alice --course data/courses/微积分.md
```

返回结果包含节点 ID、类型、标题和实际文件路径。节点类型可能是 `concept`、`proof` 或 `exercise`。课程大纲未列出的前置节点（`requires` 链）会被自动补全为 `auto` 项，并以 `know` 等级先行学习。

### 渲染当前可见内容

```bash
node src/render.mjs \
  --learner alice \
  --input data/concepts/初等数论/01-整除与素数/整除.md
```

渲染器会执行两层依赖检查：

- 文档级 `requires` 未满足时，整篇文档保持锁定；
- 段落级 `<div require="...">` 未满足时，只隐藏对应段落。

直接打开源 Markdown 可以用于编辑，但不能代表学习者此刻应该看到的内容。正式教学前应始终先运行渲染器。

### 记录访问与学习进度

记录一次访问：

```bash
node src/progress.mjs visit \
  --learner alice \
  --item elementary.number-theory.divisibility
```

在有可观察证据后记录完成状态：

```bash
node src/progress.mjs set \
  --learner alice \
  --item elementary.number-theory.divisibility \
  --status completed \
  --mastery 3 \
  --evidence-kind explanation \
  --evidence "能够用整数线性组合解释整除的封闭性。"
```

可用状态为 `not_started`、`learning`、`completed`。`mastery` 是 `0–6` 的整数；更新完成状态时，脚本默认拒绝跳过文档级前置依赖。

查看完整存档：

```bash
node src/progress.mjs show --learner alice
```

## 知识贡献指南

以下操作属于课程创作阶段：贡献者在源码仓库中修改 `data/`，运行检查后再发布新的只读课程包。教学运行中的 AI 教师和进度脚本不得修改 `data/`。

### 1. 选择节点类型

- `concept`：定义、定理陈述、意义、例子、联系和常见误区；
- `proof`：针对某个 concept 的一种具体证明方法；
- `exercise`：用于练习或评估一个或多个知识点的问题。

同一定理有多种有意义的证明时，应建立多个 proof 文件，不要合并成一个长文件。

### 2. 选择知识包目录

内容按**知识包**组织：`data/concepts/` 下的每个一级文件夹就是一个包（如 `初等数论`、`初等代数`、`初等几何`、`抽象代数`、`代数数论`、`数学分析`）。一个包内部可按单元继续分层。例如：

```text
data/concepts/初等数论/03-同余与剩余系/
data/proofs/初等数论/03-同余与剩余系/
data/exercises/初等数论/03-同余与剩余系/
```

三棵目录应尽量保持对应关系，同名的包在 `concepts/`、`proofs/`、`exercises/` 下各自存在（各自带自己的 `package.json`）。扩展知识时，把一组相关文件放进一个新的包文件夹并在其 `package.json` 中注册即可，不需要改任何全局大纲。**包不是课程**——课程的取舍（讲哪些节点、要求到什么深度）在 `data/courses/` 中设计。

### 3. 编写概念节点

```markdown
---
id: elementary.number-theory.example
title: 示例概念
course: course.elementary.number-theory
status: draft
requires: ["elementary.number-theory.prerequisite"]
---

# 示例概念

正文……
```

`id` 必须在整个项目中唯一，并且一旦被课程大纲或用户存档引用，就应保持稳定。`requires` 是打开整篇文档所需的最低标准。

### 4. 编写证明节点

```markdown
---
id: proof.elementary.number-theory.example.method
title: 示例定理：某种证明
course: course.elementary.number-theory
status: draft
proves: elementary.number-theory.example
method: 反证法
requires: ["elementary.number-theory.example"]
---

# 示例定理：某种证明

证明正文……
```

`proves` 必须指向 concept。证明的 `requires` 可以不同于定理陈述的依赖，也可以引用其他 proof。

### 5. 编写练习节点

```markdown
---
id: exercise.elementary.number-theory.example
title: 示例练习
course: course.elementary.number-theory
status: draft
difficulty: 2
tests: ["elementary.number-theory.example"]
requires: ["elementary.number-theory.example"]
---

# 示例练习

## 题目

题目正文……

## 教师观察点

描述完成本题时应观察到的推理或能力，不直接给出完整答案。
```

`difficulty` 必须是 `1–5` 的整数。`tests` 声明练习评估哪些节点；它和"打开练习需要什么"的 `requires` 含义不同。

当前 frontmatter 解析器要求数组写成单行 JSON 数组，例如 `requires: ["a", "b"]`，不要使用多行 YAML 列表。

### 6. 添加段落级增补依赖

```html
<div require="elementary.number-theory.later-topic">
完成 later-topic 后，学习者回到这里才会看到这一段新联系。
</div>
```

多个 ID 使用空格或逗号分隔，并采用 AND 语义：

```html
<div require="concept.a, proof.b">
只有 a 和 b 都完成后才显示。
</div>
```

文档级 `requires` 是最低准入条件；段落级 `require` 只能增加条件。段落依赖适合用于回访时出现的新解释、新联系或更高层视角。

### 7. 编写 LaTeX

只使用 Obsidian 和当前渲染器稳定支持的分隔符：

```markdown
行内公式：$a\mid b$

块级公式：

$$
a^{p-1}\equiv1\pmod p
$$
```

不要使用 `\(...\)` 或 `\[...\]`。提交前的校验会检查旧式分隔符以及不配对的 `$`、`$$`。

### 8. 更新包大纲

新增文件后，把节点加入对应的 `package.json`：

```json
{
  "id": "elementary.number-theory.example",
  "file": "03-同余与剩余系/示例概念.md"
}
```

概念、证明和练习各有自己的包：

- `data/concepts/**/package.json`
- `data/proofs/**/package.json`
- `data/exercises/**/package.json`

校验器会拒绝未列入包大纲的孤立文件、重复 ID、文件路径不匹配和类型错误。

### 9. 设计课程大纲

课程不是包：同一包可以被不同课程按不同深度使用。在 `data/courses/*.md` 中用 frontmatter 的结构化 `nodes` 数组声明课程（md 正文写传统大纲与教学说明）：

```markdown
---
id: course.example
status: draft
version: v0.1
goal: 课程目标
packages: ["数学分析"]
nodes: [{"item":"concept.derivative","level":"master","after":["concept.function-limit"]},{"item":"concept.mean-value-theorem","level":"proof","after":["concept.derivative"]}]
---

# 示例课程

正文大纲……
```

- `level` 表示要求深度：`master`（灵活运用，能证能解）、`proof`（理解结论与证明思路）、`know`（仅知道结论）；
- `after` 只负责课程内的顺序；frontmatter 的 `requires` 才是全局知识图中的最低依赖；
- 课程未列出的前置节点会被 `src/path.mjs` 自动补全（标记 `auto`，按 `know` 等级先行学习）；
- `role` 可保留 `optional`/`revisit` 语义（可选节点 / 回访节点）。

### 10. 运行检查

每次贡献完成后运行：

```bash
npm run check
```

检查范围包括：

- 全局 ID、文档依赖和段落依赖；
- 文档依赖环；
- proof 的 `proves` 与 `method`；
- exercise 的 `tests` 与 `difficulty`；
- 包大纲、课程大纲（含 `level` 合法性）和学习者存档中的引用；
- 孤立内容文件；
- LaTeX 分隔符与 `<div require>` 标签配对。

只有检查通过的内容才应交给 AI 教师使用。

## 内容原则

- 一个节点聚焦一个可学习、可评估的目标；
- 当定理的证明需要额外知识或比较复杂, 比较重要时, 定理的理解与证明分开建模；
- 不同证明保留各自的方法和依赖；
- 练习描述观察目标，不在题目文件中直接泄露完整答案；
- 包大纲保持稳定，课程组合与个性化顺序放入 `data/courses/`；
- 学习者存档只能由脚本更新；
- 引用资料可记录在包的 `package.json` 的 `references` 中，不另建松散资料目录。

更完整的数据约定见 [`docs/知识模型-v0.1.md`](docs/知识模型-v0.1.md)。
