---
title: 📐 Unit Circle Resolver
sector: edu
category: MATH & CANVAS
scope: [edu]
file-size: 6.8 KB
tags: [SVG Arc, Math Engine, Zero-Backend]
overview: Interactive trigonometric unit circle calculator. Drag dynamic angle point to solve real-time sin, cos, and tan with exact radical fractions.
badge: v2.4
img: "[[img-lightmode.webp]], [[img-darkmode.webp]]"
---

# 📐 Interactive Unit Circle & Trigonometry Resolver

A standalone client-side mathematical workbench designed for intuitive visualization of angular functions, coordinates on the Cartesian plane, and exact radical expressions.

---

## 🎯 Key Features

- **Dynamic Interactive Pivot**: Drag the coordinate pointer $\theta$ along the circumference of the unit circle to calculate live values.
- **Exact Radical Conversion**: Automatic symbolic simplification ($\frac{\sqrt{2}}{2}$, $\frac{\sqrt{3}}{2}$, $\frac{1}{2}$, $\pi$ multiples).
- **Cartesian Projection**: Real-time projection vectors for $\cos(\theta)$ (abscissa) and $\sin(\theta)$ (ordinate).
- **Tangent Projection Line**: Tangent secant line calculation with asymptotic boundary protections at $\pm\frac{\pi}{2}$.
- **Zero-Backend Architecture**: 100% client-side HTML5 Canvas & SVG engine running with zero network dependencies.

---

## 🔬 Mathematical Formulas

### Coordinate Mapping
Given an angle $\theta$ measured counterclockwise from the positive $x$-axis:

$$x = \cos(\theta)$$
$$y = \sin(\theta)$$

### Fundamental Trigonometric Identities
$$\sin^2(\theta) + \cos^2(\theta) = 1$$

$$\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)} \quad (\cos(\theta) \neq 0)$$

$$\sec(\theta) = \frac{1}{\cos(\theta)}, \quad \csc(\theta) = \frac{1}{\sin(\theta)}, \quad \cot(\theta) = \frac{1}{\tan(\theta)}$$

---

## 🎛️ Quadrant Behavior & Signs

| Quadrant | Angle Range | $\sin(\theta)$ | $\cos(\theta)$ | $\tan(\theta)$ |
|:---:|:---:|:---:|:---:|:---:|
| **I** | $0^\circ < \theta < 90^\circ$ | $+$ | $+$ | $+$ |
| **II** | $90^\circ < \theta < 180^\circ$ | $+$ | $-$ | $-$ |
| **III** | $180^\circ < \theta < 270^\circ$ | $-$ | $-$ | $+$ |
| **IV** | $270^\circ < \theta < 360^\circ$ | $-$ | $+$ | $-$ |

---

## 💡 Usage Guide

1. **Mouse / Touch Interaction**: Grab the red target indicator on the circumference to adjust angle $\theta$.
2. **Step Snapping**: Toggle snap mode to lock automatically onto standard angles ($0^\circ, 30^\circ, 45^\circ, 60^\circ, 90^\circ, \dots$).
3. **Copy Values**: Click on any trigonometric readout card to copy exact radical notation or floating-point approximations directly to your clipboard.
