---
title: CSS 变量与设计令牌：构建可维护的设计系统
date: 2026-03-15
tag: 技术
readtime: 9 分钟
---

设计系统的核心是一致性。CSS 自定义属性（变量）让我们能够将颜色、间距、圆角、阴影等设计决策集中管理，一处修改全局生效。

## 什么是设计令牌

设计令牌（Design Tokens）是设计系统中最小的原子单位。它们代表一个视觉决策：

- 颜色：主色、辅色、背景色、文字色
- 间距：内边距、外边距、元素间距
- 排版：字号、字重、行高
- 效果：圆角、阴影、模糊

## CSS 变量基础

```css
:root {
  --accent-blue: #0071e3;
  --text-primary: #1d1d1f;
  --radius-lg: 18px;
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.button {
  background: var(--accent-blue);
  color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
}
```

## 主题切换

CSS 变量的真正威力在于动态切换：

```css
:root {
  --bg: #f5f5f7;
  --text: #1d1d1f;
}

[data-theme="dark"] {
  --bg: #1c1c1e;
  --text: #e5e5ea;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

JS 只需要一行就能切换主题：

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

## 分层管理

推荐将设计令牌分为三层：

1. **全局层**（:root）：基础色板、间距系统
2. **组件层**（.btn, .card）：组件特定变量
3. **实例层**（.btn-primary）：具体实例覆盖

## 总结

CSS 变量是构建设计系统最轻量的方案。它不需要额外的构建工具，不需要预处理器，浏览器原生支持。对于中小型项目来说，这是投入产出比最高的设计系统方案。
