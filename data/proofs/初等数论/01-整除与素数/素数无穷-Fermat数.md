---
id: proof.elementary.number-theory.infinitely-many-primes.fermat-numbers
title: 素数无穷：Fermat 数证明
course: course.elementary.number-theory
status: draft
proves: elementary.number-theory.infinitely-many-primes
method: 两两互素构造
requires: ["elementary.number-theory.infinitely-many-primes", "elementary.number-theory.coprimality", "elementary.number-theory.fundamental-theorem-arithmetic"]
---

# 素数无穷：Fermat 数证明

定义 $F_n=2^{2^n}+1$。反复使用平方差公式可得

$$
F_0F_1\cdots F_{n-1}=F_n-2.
$$

若某个整数 $d$ 同时整除 $F_m,F_n$（$m<n$），它也整除 $F_0\cdots F_{n-1}$，从而整除 $F_n-(F_n-2)=2$。但每个 $F_i$ 都是奇数，所以 $d=1$。因此这些数两两互素。

每个 $F_n>1$ 至少有一个素因子，而两两互素保证不同 $F_n$ 的素因子不重复，于是得到无穷多个不同素数。
