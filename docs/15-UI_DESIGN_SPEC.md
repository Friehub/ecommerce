# UI Design Specification

This document defines the visual language of the platform.
Every developer building a UI page follows this spec.
Do not invent colors, fonts, or spacing values. Use what is defined here.

---

## Brand Identity

| Token | Value | Usage |
|---|---|---|
| Primary | `#F68B1E` | CTAs, active states, highlights, badges |
| Primary Dark | `#D4730F` | Hover on primary buttons |
| Primary Light | `#FFF3E0` | Primary tints, alert backgrounds |
| Success | `#2E7D32` | Confirmed order, payment success, in-stock |
| Warning | `#F57C00` | Pending states, SLA warning |
| Danger | `#C62828` | Errors, out-of-stock, cancelled |
| Info | `#1565C0` | Informational, tracking updates |

---

## Neutrals

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-bg-subtle` | `#F7F8FA` | Cards, sidebar, input backgrounds |
| `--color-border` | `#E5E7EB` | Dividers, card borders, input borders |
| `--color-text-primary` | `#111827` | Main body text, headings |
| `--color-text-secondary` | `#6B7280` | Labels, captions, metadata |
| `--color-text-disabled` | `#D1D5DB` | Disabled inputs |
| `--color-overlay` | `rgba(0,0,0,0.4)` | Modal backdrops |

---

## CSS Variables (Global)

Define in `apps/web/src/app/globals.css`:

```css
:root {
  /* Brand */
  --color-primary:        #F68B1E;
  --color-primary-dark:   #D4730F;
  --color-primary-light:  #FFF3E0;
  --color-success:        #2E7D32;
  --color-warning:        #F57C00;
  --color-danger:         #C62828;
  --color-info:           #1565C0;

  /* Neutrals */
  --color-bg:             #FFFFFF;
  --color-bg-subtle:      #F7F8FA;
  --color-border:         #E5E7EB;
  --color-text-primary:   #111827;
  --color-text-secondary: #6B7280;
  --color-text-disabled:  #D1D5DB;
  --color-overlay:        rgba(0, 0, 0, 0.4);

  /* Typography */
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  1.875rem;  /* 30px */

  /* Font Weights */
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  /* Spacing (4px base) */
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */

  /* Border Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05);

  /* Layout */
  --container-max: 1280px;
  --nav-height:    60px;
  --sidebar-width: 240px;
}
```

---

## Typography

**Font:** Inter — import in `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}
```

| Element | Size | Weight |
|---|---|---|
| Page title (h1) | `--text-3xl` | `--font-bold` |
| Section heading (h2) | `--text-2xl` | `--font-semibold` |
| Card title (h3) | `--text-xl` | `--font-semibold` |
| Body text | `--text-base` | `--font-normal` |
| Label / caption | `--text-sm` | `--font-medium` |
| Metadata / timestamps | `--text-xs` | `--font-normal` |
| Price (large) | `--text-2xl` | `--font-bold` |
| Price (inline) | `--text-base` | `--font-semibold` |

---

## Core Components

### Button

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-primary:active { transform: scale(0.98); }

.btn-outline {
  background: transparent;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-primary);
}
.btn-outline:hover { border-color: var(--color-primary); color: var(--color-primary); }

.btn-ghost {
  background: transparent;
  color: var(--color-primary);
}
.btn-ghost:hover { background: var(--color-primary-light); }

.btn-danger {
  background: var(--color-danger);
  color: #fff;
}

.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-xs); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-base); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

---

### Card

```css
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.2s;
}
```

---

### Product Card

```css
.product-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.product-card__image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: var(--color-bg-subtle);
}

.product-card__body { padding: var(--space-4); }

.product-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__price {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-top: var(--space-2);
}

.product-card__original-price {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

.product-card__discount-badge {
  background: var(--color-danger);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}
```

---

### Badge / Status Pill

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.badge-success  { background: #E8F5E9; color: var(--color-success); }
.badge-warning  { background: #FFF3E0; color: var(--color-warning); }
.badge-danger   { background: #FFEBEE; color: var(--color-danger); }
.badge-info     { background: #E3F2FD; color: var(--color-info); }
.badge-neutral  { background: var(--color-bg-subtle); color: var(--color-text-secondary); }
.badge-primary  { background: var(--color-primary-light); color: var(--color-primary-dark); }
```

---

### Input

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background: var(--color-bg);
  outline: none;
  transition: border-color 0.15s;
}

.input:focus  { border-color: var(--color-primary); }
.input::placeholder { color: var(--color-text-secondary); }
.input.error  { border-color: var(--color-danger); }
```

---

## Layout

### Page Layout
```
┌──────────────────────────────────────────────────┐
│                  NAVBAR (60px)                    │
├──────────────────────────────────────────────────┤
│                                                  │
│              PAGE CONTENT                        │
│         (max-width: 1280px, centered)            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Seller Hub / Admin Layout (with sidebar)
```
┌──────────────────────────────────────────────────┐
│                  NAVBAR (60px)                    │
├───────────────┬──────────────────────────────────┤
│               │                                  │
│  SIDEBAR      │         MAIN CONTENT             │
│  (240px)      │                                  │
│               │                                  │
└───────────────┴──────────────────────────────────┘
```

---

## Product Grid

Standard product grid used on category and search pages:

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
}
```

---

## Order Status Colors

| Status | Badge Class |
|---|---|
| PENDING_PAYMENT | `badge-warning` |
| PAID | `badge-info` |
| PROCESSING | `badge-info` |
| SHIPPED | `badge-primary` |
| OUT_FOR_DELIVERY | `badge-primary` |
| DELIVERED | `badge-success` |
| COMPLETED | `badge-success` |
| CANCELLED | `badge-danger` |
| RETURN_REQUESTED | `badge-warning` |
| RETURNED | `badge-neutral` |

---

## Rules

- Never hardcode a hex value in a component. Always use a CSS variable.
- Never use `px` for spacing. Always use a `--space-*` variable.
- All interactive elements must have a visible `:hover` and `:focus` state.
- Images that are loading show the `--color-bg-subtle` background as a skeleton.
- Every page must have a single `<h1>` element.
- Mobile breakpoint: `768px`. Tablet: `1024px`. Desktop: `1280px+`.
