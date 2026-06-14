# DESIGN.md

> 以全球龙头货代公司的视觉语言，重塑一家中型国际物流企业的数字门面——专业、可信、现代、有温度。

## 1. Visual Theme & Atmosphere

**Style**: Enterprise Professional (企业级专业风)
**Keywords**: 深蓝权威、全球视野、精准可靠、克制现代、信任感
**Tone**: 国际化 B2B 企业官网 — NOT 科技初创、NOT 活泼消费品
**Feel**: 像走进一栋落地玻璃幕墙的港口指挥中心，有力量感但不冷漠

**Interaction Tier**: L2 流畅交互
**Dependencies**: CSS + IntersectionObserver + 原生 JS（无第三方库）

---

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #FFFFFF;
  --surface: #F8FAFC;
  --surface-alt: #EEF3F9;
  --surface-hover: #E8F0F9;

  /* Borders */
  --border: #D1DCF0;
  --border-hover: #0066CC;

  /* Text */
  --text: #0F1F3D;
  --text-secondary: #4A5568;
  --text-tertiary: #8A9AB8;

  /* Brand Blues */
  --accent: #0066CC;
  --accent-hover: #0052A3;
  --accent-dark: #003366;
  --accent-light: #E8F0FB;

  /* RGB variants */
  --bg-rgb: 255, 255, 255;
  --accent-rgb: 0, 102, 204;
  --accent-dark-rgb: 0, 51, 102;

  /* Semantic */
  --success: #16A34A;
  --error: #DC2626;
  --warning: #D97706;
}
```

**Color Rules:**
- 所有颜色通过 CSS 变量引用，禁止硬编码 hex
- Hero section 使用 `--accent-dark` 深蓝背景叠加，建立权威感
- 强调色 `--accent` 仅用于 CTA、链接、active 态，不滥用
- 交替 section 用 `--surface` 和 `--bg` 轻微区隔，不用强对比

---

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero H1 | Plus Jakarta Sans | clamp(2.8rem, 5vw, 4.5rem) | 800 | 1.1 | -0.02em |
| Section H2 | Plus Jakarta Sans | clamp(1.8rem, 3vw, 2.5rem) | 700 | 1.2 | -0.01em |
| H3 | Plus Jakarta Sans | 1.25rem | 700 | 1.3 | — |
| Body | Inter | 1rem | 400 | 1.7 | — |
| Body Strong | Inter | 1rem | 600 | 1.7 | — |
| Label / Eyebrow | Plus Jakarta Sans | 0.75rem | 700 | 1.4 | 0.08em |
| Nav Link | Plus Jakarta Sans | 0.875rem | 600 | — | 0.01em |
| Stat Number | Plus Jakarta Sans | clamp(2rem, 4vw, 3rem) | 800 | 1 | -0.02em |

**Typography Rules:**
- Hero H1 字重必须 800，配合深色背景产生强冲击感
- Eyebrow label 全大写 + 字距 0.08em，用于 section 标题前的分类标签
- 正文行高 1.7，确保可读性
- **NEVER use**: Comic Sans, Roboto Slab, 任何手写体，系统默认衬线字体

**Text Decoration:**
- Hero H1: 白色，无渐变（深蓝背景上白字本身已足够震撼）
- Section H2: 深蓝 `--text`，无渐变（企业风克制）
- Stat numbers: 白色或深蓝，超大字号即是装饰

---

## 4. Component Stylings

### Buttons

```css
/* Primary CTA */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--accent);
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  border: 2px solid var(--accent);
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}
.btn-primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.3);
}
.btn-primary:active {
  transform: translateY(0) scale(0.98);
  box-shadow: none;
}
.btn-primary:focus-visible {
  outline: 3px solid rgba(var(--accent-rgb), 0.4);
  outline-offset: 3px;
}
.btn-primary:disabled {
  background: var(--text-tertiary);
  border-color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Ghost CTA (on dark bg) */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 27px;
  background: transparent;
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}
.btn-ghost:hover {
  background: rgba(255,255,255,0.1);
  border-color: #ffffff;
  transform: translateY(-2px);
}
.btn-ghost:active { transform: translateY(0) scale(0.98); }
.btn-ghost:focus-visible {
  outline: 3px solid rgba(255,255,255,0.4);
  outline-offset: 3px;
}
```

### Cards

```css
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.card:hover {
  border-color: var(--border-hover);
  box-shadow: 0 12px 40px rgba(var(--accent-rgb), 0.1);
  transform: translateY(-4px);
}
.card:hover::before { transform: scaleX(1); }
.card:focus-within {
  border-color: var(--accent);
  outline: 2px solid rgba(var(--accent-rgb), 0.2);
  outline-offset: 2px;
}
```

### Navigation

```css
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  height: 72px;
  display: flex;
  align-items: center;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
.nav.scrolled {
  background: rgba(var(--bg-rgb), 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--border);
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}
.nav-link {
  color: rgba(255,255,255,0.88);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 0;
  position: relative;
  transition: color 0.2s ease;
  letter-spacing: 0.01em;
}
.nav.scrolled .nav-link { color: var(--text-secondary); }
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 2px;
  background: var(--accent);
  transition: width 0.3s ease;
}
.nav-link:hover::after,
.nav-link.active::after { width: 100%; }
.nav-link:hover { color: #ffffff; }
.nav.scrolled .nav-link:hover { color: var(--accent); }
```

### Service Icon Box

```css
.service-icon {
  width: 56px;
  height: 56px;
  background: var(--accent-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  transition: background 0.3s ease, transform 0.3s ease;
}
.card:hover .service-icon {
  background: var(--accent);
  color: #ffffff;
  transform: translateY(-4px);
}
```

### Tags / Eyebrow Labels

```css
.eyebrow {
  display: inline-block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: var(--accent-light);
  color: var(--accent);
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 100px;
}
```

---

## 5. Layout Principles

**Container:**
- Max width: 1240px
- Padding: 0 40px (desktop) → 0 20px (mobile)
- Narrow variant (about text): 800px

**Spacing Scale:**
- Section padding: 96px 0 (desktop) → 64px 0 (mobile)
- Component gap: 24px (cards) → 16px (mobile)
- Card internal padding: 32px (desktop) → 24px (mobile)

**Grid:**
```css
.grid-services {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
/* 5个卡片：前两个各占半宽，后三个各占三分之一 */
.grid-services .card:nth-child(1),
.grid-services .card:nth-child(2) {
  grid-column: span 1;
}

.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.grid-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}
```

---

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | no shadow | 默认文字区、边框分隔 |
| Subtle | `0 2px 8px rgba(0,0,0,0.06)` | 默认卡片静止态 |
| Elevated | `0 12px 40px rgba(0,102,204,0.1)` | 卡片 hover、导航弹出 |
| Modal | `0 24px 64px rgba(0,0,0,0.18)` | 弹窗、浮层 |
| Hero glow | `0 0 120px rgba(0,102,204,0.25)` | Hero 背景光晕装饰 |

---

## 7. Animation & Interaction

**Motion Philosophy**: 克制服务于内容，动效只在信息传达时出现，不炫技

### Entrance Animation

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.in-view { opacity: 1; transform: translateY(0); }
```

### Stagger

```css
.stagger-reveal > *:nth-child(1) { transition-delay: 0s; }
.stagger-reveal > *:nth-child(2) { transition-delay: 0.08s; }
.stagger-reveal > *:nth-child(3) { transition-delay: 0.16s; }
.stagger-reveal > *:nth-child(4) { transition-delay: 0.24s; }
.stagger-reveal > *:nth-child(5) { transition-delay: 0.32s; }
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .reveal { opacity: 1; transform: none; }
}
```

---

## 8. Do's and Don'ts

### Do
- 用 `--accent-dark` (#003366) 做 Hero 背景叠层，传达权威感
- 每个 section 有独立 eyebrow label（SERVICES / ABOUT US 等），用于信息定向
- 服务卡片 hover 时顶部描边从左展开（`scaleX`），精致且克制
- 数字统计区用 count-up，只触发一次，进入视口后不重复
- 保持留白：section 间距 ≥ 80px，卡片内 padding ≥ 24px
- 图标用内联 SVG，颜色跟随 CSS 变量而非硬编码

### Don't
- ❌ 禁止在正文区使用渐变字体色（仅 Hero 可酌情使用）
- ❌ 禁止超过 2 种强调色同时出现在同一 section
- ❌ 禁止卡片堆叠超过 3 层 box-shadow
- ❌ 禁止在移动端保持桌面端 3 列网格（必须折叠为 1 列）
- ❌ 禁止 `filter: blur()` 作用于运动元素（改用 opacity+scale）
- ❌ 禁止导航栏 backdrop-blur > 14px（性能和视觉均有问题）
- ❌ 禁止 CTA 按钮超过 2 个同时出现在同一视口区域
- ❌ 禁止纯色块占位图片，必须使用真实 Unsplash/参考图 URL

---

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1024px | 3列服务网格、2列关于区 |
| Tablet | 768–1024px | 2列服务网格、导航折叠 |
| Mobile | < 768px | 1列、汉堡菜单、Hero 字号缩小 |

**Touch Targets:** minimum 44×44px
**Collapsing Strategy:** 导航超过 768px 显示完整链接；以下显示汉堡菜单（drawer）

```css
@media (max-width: 1024px) {
  .grid-services { grid-template-columns: repeat(2, 1fr); }
  .grid-2col { grid-template-columns: 1fr; gap: 40px; }
  .grid-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .grid-services { grid-template-columns: 1fr; }
  .grid-stats { grid-template-columns: repeat(2, 1fr); }
  .nav-links { display: none; }
  .nav-links.open { display: flex; flex-direction: column; }
  section { padding: 64px 0; }
  .container { padding: 0 20px; }
}
@media (max-width: 480px) {
  .grid-stats { grid-template-columns: 1fr 1fr; }
}
```
