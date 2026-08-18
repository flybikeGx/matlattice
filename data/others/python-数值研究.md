---
id: tooling.python-numerical
title: Python 数值研究入门
course: course.tooling
status: draft
version: v0.1
requires: []
---

# Python 数值研究入门

## 这门课是什么

用 Python 做数学实验：验证猜想、画函数图像、求根、积分、拟合。学完后你会拿到一套"数值工具箱"，能独立完成 `pip install numpy scipy matplotlib` 之后的所有常见数值任务。

## 环境准备

```bash
python -m venv .venv          # 隔离环境
source .venv/bin/activate     # mac/Linux；Windows 用 .venv\Scripts\activate
pip install numpy scipy matplotlib jupyter
jupyter notebook              # 交互式笔记本（强烈推荐用于探索）
```

在 Jupyter 中绘图需加一行魔法：`%matplotlib inline`。

## Python 基础（数值导向）

```python
a = 3          # int
b = 3.14       # float
c = 2 + 3j     # complex
x = a / b      # 真除法，总是 float
y = a // b     # 整除
z = a ** 2     # 幂
```

- 数字在 Python 里就是对象，`type(x)` 随时可查；
- 列表 `[1,2,3]`、元组 `(1,2)`、字典 `{"a":1}`；
- 列表推导 `[x**2 for x in range(10)]`；
- 函数：

```python
def f(x):
    return x**2 - 2
```

## NumPy：向量化数组

NumPy 的核心是 `ndarray`——"同构数值数组"。**向量化**意味着对整个数组一次运算，而不是 Python 循环。

```python
import numpy as np

a = np.array([1, 2, 3])          # 一维
b = np.array([[1, 2], [3, 4]])   # 二维（矩阵）
x = np.linspace(0, 1, 101)       # 0 到 1 共 101 个等距点
y = np.arange(10)                # 0..9
z = np.zeros((2, 3)); o = np.ones(5)

a + 1        # 广播：标量加到每个元素
a * a        # 逐元素乘法（不是矩阵乘法！）
b @ b        # 矩阵乘法（@ 或 np.matmul）
b.T          # 转置
a.reshape(3, 1)
a.sum(), a.mean(), a.max(), a.argmax()
np.sqrt(a), np.sin(x), np.exp(x)
```

**关键习惯**：
- 用 `np.linspace` 生成网格点，`np.vectorize` 处理标量函数；
- 聚合函数 `sum/mean/argmax` 沿轴：`b.sum(axis=0)` 按列求和；
- 随机数：`np.random.seed(0)` 保证可复现，`np.random.randn(1000)` 标准正态样本。

## 向量化 vs 循环

需求：计算 $\sum_{k=1}^{10000}\frac{1}{k^2}$（$\to\frac{\pi^2}{6}$）。

```python
k = np.arange(1, 10001)
s = (1 / k**2).sum()          # 向量化，快
import math
s2 = sum(1 / k2**2 for k2 in range(1, 10001))   # 循环，慢但可读
print(s, math.pi**2/6)
```

向量化比 Python 循环快一两个数量级，是数值研究的第一原则。

## SciPy：算法库

```python
from scipy import optimize, integrate, linalg, interpolate, stats

# 求根
root = optimize.root(lambda x: x**3 - 2, [1.0])      # 数值 √2
r = optimize.brentq(lambda x: x**2 - 2, 1, 2)        # 有界求根，推荐

# 数值积分
I, err = integrate.quad(lambda x: np.sin(x)/x, 1e-9, 10)

# 线性代数
A = np.array([[2., 1.], [1., 3.]])
sol = linalg.solve(A, np.array([1., 2.]))             # 解线性方程组
w, V = linalg.eig(A)                                  # 特征值、特征向量
invA = linalg.inv(A)

# 插值与拟合
xs = np.linspace(0, 10, 11); ys = np.sin(xs)
poly = np.polyfit(xs, ys, 3)                          # 3 次多项式最小二乘拟合
f = interpolate.interp1d(xs, ys, kind="cubic")

# 统计
stats.norm.rvs(size=1000)                             # 正态随机数
```

## Matplotlib：可视化

```python
import matplotlib.pyplot as plt

x = np.linspace(-3, 3, 200)
plt.plot(x, x**2, label="x²")          # 折线
plt.plot(x, np.exp(-x**2), "--")
plt.scatter([1, 2, 3], [4, 5, 6])      # 散点
plt.xlabel("x"); plt.ylabel("y")
plt.title("例子"); plt.legend()
plt.grid(True)
plt.show()                             # Jupyter 内联显示
plt.savefig("fig.png")                 # 保存（或保存前必须 show 前调用）
```

- 多图：`fig, axes = plt.subplots(1, 2)`，然后 `axes[0].plot(...)`；
- 对数坐标：`plt.xscale("log")`；
- 中文标题需要配置字体，纯英文标签最省事。

## 数值误差：必须知道的坑

1. **浮点不是实数**：`0.1 + 0.2 != 0.3`。用 `np.isclose(a, b)` 比较；
2. **灾难性抵消**：$x^2+10^8x+1$ 用求根公式的 $-b+\sqrt{b^2-4ac}$ 分支会损失精度，改用 $-2c/(b+\sqrt{b^2-4ac})$ 之类等价形式；
3. **条件数**：$\kappa(A)$ 大时线性方程组对舍入误差敏感，`linalg.cond(A)` 可查；
4. **积分端点奇异性**：$\int_0^1\frac{dx}{\sqrt x}$ 用 `quad` 需提供点或变换。

## 一个完整例子：验证中心极限定理

```python
import numpy as np, matplotlib.pyplot as plt

rng = np.random.default_rng(0)
means = [rng.exponential(1, 100).mean() for _ in range(5000)]  # 5000 次抽样均值
plt.hist(means, bins=50, density=True)
plt.show()   # 分布近似钟形（正态），即使来自指数分布
```

## 检查理解

1. 用 NumPy 计算 $\sum_{k=1}^{10^6}\frac{(-1)^{k+1}}{k}$，并与 $\ln 2$ 比较，解释误差来源；
2. 用 `scipy.integrate.quad` 计算 $\int_0^\infty e^{-x^2}dx$，与 $\sqrt\pi/2$ 比较；
3. 生成 $y=x^2+\text{噪声}$ 的数据并用 `np.polyfit` 拟合，观察次数选择对拟合的影响。
