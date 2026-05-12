# Jumia Clone — UI Design Guide for Agents

> **Purpose:** This document tells you exactly what to build, what to fix, and how to make decisions when writing or editing any frontend component. Read this before touching a `.tsx` file. The frontend is Next.js 14 + Tailwind CSS. The design token system is already in `tailwind.config.ts` — use it, don't override it with raw hex values.

---

## 1. The One Rule That Overrides Everything

**Every page must make the user feel confident enough to buy.**

Confidence comes from three things: clarity (I know exactly where I am and what to do), trust (this looks legitimate and professional), and speed (it loads fast and responds immediately). Every design decision in this guide maps back to one of those three.

---

## 2. Design Token System — Use These, Not Hex

The Tailwind config defines a full token system. Agents must use these class names. Never write `text-[#F68B1E]` or `bg-[#264996]` — that's what's creating the inconsistency currently.

### Color Tokens

| Token | Class | Use For |
|---|---|---|
| Brand orange | `text-primary-container` / `bg-primary-container` | CTAs, prices, active states, badges |
| Dark orange text | `text-primary` | Section headings, hover states on links |
| Page background | `bg-background` or `bg-surface` | Page-level backgrounds |
| Card background | `bg-surface-container-lowest` | White card surfaces |
| Subtle surface | `bg-surface-container-low` | Input fields, inactive tabs |
| Body text | `text-on-surface` | All primary readable text |
| Muted text | `text-on-surface-variant` | Labels, captions, helper text |
| Border default | `border-outline-variant` | Card borders, dividers |
| Border emphasis | `border-outline` | Focused inputs, hover borders |
| Error/delete | `text-error` / `bg-error` | Destructive actions only |
| Info/links | `text-tertiary` | Secondary links (seller name, rating count) |

### What To Stop Doing Right Now

```tsx
// ❌ These are scattered everywhere in the codebase — stop adding more
className="text-[#F68B1E]"
className="bg-[#F68B1E]"
className="text-[#264996]"
className="text-gray-800"
className="border-gray-100"

// ✅ Use the token system
className="text-primary-container"
className="bg-primary-container"
className="text-tertiary"
className="text-on-surface"
className="border-outline-variant"
```

The mobile drawer in `Navbar.tsx` is the worst offender — it uses raw hex throughout while the desktop nav uses tokens. Any edit to the Navbar must unify both halves to use tokens.

---

## 3. Typography Rules

The type scale is defined in `tailwind.config.ts`. Use it.

| Size class | Use |
|---|---|
| `text-display-lg` (4rem/900) | Hero banner headline only |
| `text-display-md` (3rem/800) | Major section headers (Flash Sales banner) |
| `text-title-lg` (1.5rem/700) | Page titles (Cart, Checkout, Account) |
| `text-body-md` (1rem/400) | Body copy, descriptions, paragraph text |
| `text-label-sm` (0.75rem/700) | Labels, tags, nav items, captions |

**Font weight discipline — this is critical.** The current code uses `font-black` (900) for almost everything. This destroys typographic hierarchy. Use these weights only:

- `font-black` (900): Brand logo, hero headline, primary CTA buttons
- `font-extrabold` (800): Page titles, price display
- `font-bold` (700): Card titles, section headers, nav items
- `font-semibold` (600): Supporting info (brand names, spec keys)
- `font-medium` (500): Body text emphasis
- `font-normal` (400): Descriptions, paragraph text

**Product card title is currently `font-bold text-[11px]`.** It should be `font-semibold text-sm` — 11px is too small to read comfortably, especially on mobile.

---

## 4. Spacing System

Always use the spacing tokens from `tailwind.config.ts`. Never use arbitrary pixel values like `py-[14px]`.

| Token | Value | Use |
|---|---|---|
| `gap-base` / `p-base` | 8px | Tight internal padding (badges, chips) |
| `gap-stack-sm` | 12px | Between related items in a list |
| `gap-stack-md` / `p-stack-md` | 24px | Section internal padding, card padding |
| `gap-stack-lg` | 48px | Between page sections |
| `px-gutter` | 24px | Horizontal page gutter |

The container should always be `max-w-[1280px] mx-auto px-gutter`.

---

## 5. Component Patterns — Build These Consistently

### 5.1 The Product Card

The product card is the most-seen component. It must be pixel-perfect.

**Current problems:**
- Product title at `text-[11px]` is unreadable
- `font-black` on brand name and title creates no contrast between them
- The "SAVE ₦X" badge is good — keep it
- The flash sale progress bar is good — keep it
- Hover effect (`hover:-translate-y-1 hover:shadow-xl`) is good — keep it

**Correct structure:**

```tsx
<Link href={...} className="flex flex-col h-full group bg-surface-container-lowest p-3 rounded-xl border border-outline-variant hover:border-primary-container/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

  {/* Image area */}
  <div className="relative aspect-square mb-3 bg-surface-container-low rounded-lg overflow-hidden">
    <img className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110" />
    {/* Discount badge: top-right, red, always visible */}
    {/* Express/Official badge: top-left */}
  </div>

  {/* Brand — muted, small, uppercase */}
  <span className="text-label-sm text-primary-container uppercase tracking-widest truncate">
    {brand}
  </span>

  {/* Title — readable, not black */}
  <h3 className="text-sm font-semibold text-on-surface line-clamp-2 mb-2 leading-snug group-hover:text-primary-container transition-colors">
    {title}
  </h3>

  {/* Stars — keep existing renderStars() logic */}
  
  {/* Price block */}
  <div className="mt-auto">
    <span className="text-base font-extrabold text-on-surface">₦{price}</span>
    {/* Strikethrough compare price if exists */}
    {/* SAVE badge if discount > 0 */}
  </div>

</Link>
```

### 5.2 Buttons — Three Variants Only

Every button in the app must be one of these three. Do not invent new button styles.

```tsx
// PRIMARY — one per page, main action
<button className="bg-primary-container text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-wide text-sm shadow-md">
  Add to Cart
</button>

// SECONDARY — supporting action
<button className="border border-outline text-on-surface font-bold px-6 py-3 rounded-xl hover:border-primary-container hover:text-primary-container transition-all text-sm">
  Save for Later
</button>

// GHOST — low-emphasis, destructive, or tertiary actions
<button className="text-error font-bold text-sm hover:bg-error/5 px-3 py-2 rounded-lg transition-colors">
  Remove
</button>
```

### 5.3 Form Inputs — One Style

```tsx
<input
  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all"
/>
```

All inputs use `rounded-xl` (not `rounded-lg`). Focus ring uses `ring-primary-container/10`. Never use `focus:ring-[#F68B1E]`.

### 5.4 Section Headers (Homepage Sections)

Flash Sales, Trending, Best Sellers all share this header pattern:

```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-3">
    {/* Optional colored icon container */}
    <div className="bg-primary-container text-white p-2 rounded-lg">
      <Zap size={18} />
    </div>
    <div>
      <h2 className="text-title-lg text-on-surface">Flash Sales</h2>
      <p className="text-label-sm text-on-surface-variant">Ends in: <CountdownTimer /></p>
    </div>
  </div>
  <Link href="/flash-sales" className="text-label-sm text-tertiary font-bold hover:underline flex items-center gap-1">
    See all <ChevronRight size={14} />
  </Link>
</div>
```

---

## 6. Page-by-Page Critical Fixes

### 6.1 Homepage

**Hero Carousel** — currently good structure. Two fixes:
1. The `hero-gradient` inline `<style jsx>` works but is fragile. Move it to a Tailwind arbitrary value: `bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.2)_50%,transparent_100%)]`
2. The banner nav buttons (prev/next) should only be visible on hover: add `opacity-0 group-hover:opacity-100` to the button wrapper

**Category Grid** — currently a hardcoded placeholder. When the real `catalog.getCategoryTree()` call is wired, render each category as:
```tsx
<Link href={`/category/${cat.slug}`} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-container-low transition-colors group">
  <div className="w-16 h-16 rounded-full bg-surface-container overflow-hidden border-2 border-outline-variant group-hover:border-primary-container transition-colors">
    <img src={cat.imageUrl} className="w-full h-full object-cover" />
  </div>
  <span className="text-label-sm text-on-surface text-center leading-tight">{cat.name}</span>
</Link>
```

**Product grids** — always `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3`. Never `gap-4` in product grids — it makes the grid feel airy and products harder to compare.

### 6.2 Product Detail Page

The three-column layout (gallery / info / sidebar) is correct. Four fixes:

1. **Price display is missing.** `ProductActions` has the add-to-cart button but the price is rendered nowhere visible above the fold on mobile. Move the price to the info column, above the variant selector, in large type:
```tsx
<div className="flex items-baseline gap-3">
  <span className="text-2xl font-extrabold text-on-surface">₦{price.toLocaleString()}</span>
  {comparePrice && <span className="text-sm text-on-surface-variant line-through">₦{comparePrice.toLocaleString()}</span>}
  {discount > 0 && <span className="text-label-sm bg-error/10 text-error px-2 py-0.5 rounded font-bold">-{discount}%</span>}
</div>
```

2. **The "Follow" button on the seller card** toggles to `bg-primary-container text-white` on click. Currently it has no active state management.

3. **Specifications table** — replace the `.map(Object.entries(...))` inline rendering with alternating row colors for readability:
```tsx
<div className={`flex py-2.5 text-sm ${index % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container-lowest'} px-3 rounded`}>
```

4. **Breadcrumb** — the current breadcrumb truncates at 200px on mobile. Use `overflow-hidden` on the container with a fade-out mask instead of hard truncation.

### 6.3 Cart Page

The cart layout is solid. Two fixes:

1. **The shipping estimate is hardcoded at ₦1,200.** Wrap it in a muted label so users know it's an estimate:
```tsx
<div className="flex justify-between text-sm py-2 text-on-surface-variant">
  <span>Shipping (estimate)</span>
  <span className="font-bold">₦1,200</span>
</div>
```

2. **Empty cart state** — the current empty cart uses `ShoppingBag` icon in an orange circle. Add a second CTA below the "START SHOPPING" button for users who might have items saved:
```tsx
<Link href="/wishlist" className="mt-3 text-label-sm text-tertiary font-bold hover:underline">
  View your saved items
</Link>
```

### 6.4 Checkout Page

The checkout page is the most important page for conversion. Current issues:

1. **Payment method selection has no visual differentiation.** When a user selects CARD vs WALLET vs POD, the selected option should have a visible active border:
```tsx
<div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
  paymentMethod === 'CARD' 
    ? 'border-primary-container bg-surface-container-low' 
    : 'border-outline-variant hover:border-outline'
}`}>
```

2. **The address cards need a selected state.** Same pattern — `border-primary-container` when selected, `border-outline-variant` when not.

3. **The "Place Order" button must communicate loading state clearly.** Currently uses `Loader2` spinner — keep that, but also disable the button and reduce opacity:
```tsx
<button 
  disabled={isPlacingOrder}
  className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide transition-all text-sm
    ${isPlacingOrder 
      ? 'bg-primary-container/50 text-white cursor-not-allowed' 
      : 'bg-primary-container text-white hover:opacity-90 active:scale-95 shadow-md'
    }`}
>
  {isPlacingOrder ? <Loader2 className="animate-spin mx-auto" /> : 'Place Order'}
</button>
```

4. **Order summary should always be sticky on desktop.** The summary column should have `lg:sticky lg:top-24` so it stays visible as the user scrolls through the address section.

### 6.5 Search / Category Pages

The filter sidebar is solid. Two fixes:

1. **Active filter chips** — when a filter is applied, show it as a dismissible chip above the results grid:
```tsx
{brandId && (
  <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-full text-label-sm text-on-surface">
    Brand: {brandName}
    <button onClick={() => updateFilters({ brandId: '' })}>
      <X size={12} className="text-on-surface-variant hover:text-error" />
    </button>
  </div>
)}
```

2. **No-results state** — currently just renders an empty grid. Add a proper empty state:
```tsx
<div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
  <SearchIcon size={48} className="text-on-surface-variant opacity-20" />
  <h3 className="text-title-lg text-on-surface">No results for "{query}"</h3>
  <p className="text-body-md text-on-surface-variant max-w-sm">Try different keywords or remove filters</p>
  <button onClick={clearFilters} className="...secondary button...">Clear all filters</button>
</div>
```

### 6.6 Navbar

The navbar has a split personality — desktop uses the token system, the mobile drawer uses raw hex throughout. When editing the Navbar:

- Replace all `text-[#F68B1E]` in the mobile drawer with `text-primary-container`
- Replace `bg-[#F68B1E]` in the mobile drawer with `bg-primary-container`
- The mobile avatar initials circle: `bg-primary-container text-white` (already correct in mobile header, inconsistent elsewhere)
- Add `aria-label` to icon-only buttons: `<button aria-label="Open cart">`, `<button aria-label="Open menu">`

---

## 7. Loading States — Be Consistent

Every data-fetching component needs a skeleton, not a spinner. Spinners make users watch a clock. Skeletons show the shape of what's coming.

### Product Grid Skeleton

```tsx
// Use this pattern for any product grid loading state
{isLoading && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 animate-pulse">
        <div className="aspect-square bg-surface-container rounded-lg mb-3" />
        <div className="h-2 bg-surface-container rounded w-1/2 mb-2" />
        <div className="h-3 bg-surface-container rounded w-full mb-1" />
        <div className="h-3 bg-surface-container rounded w-3/4 mb-3" />
        <div className="h-4 bg-surface-container rounded w-1/3" />
      </div>
    ))}
  </div>
)}
```

### Content Block Skeleton

```tsx
// For cards, detail sections, or any block of content
<div className="animate-pulse space-y-3">
  <div className="h-5 bg-surface-container rounded w-2/3" />
  <div className="h-4 bg-surface-container rounded w-full" />
  <div className="h-4 bg-surface-container rounded w-5/6" />
</div>
```

**Rules:**
- `animate-pulse` only — never `animate-spin` for content loading
- Skeleton shapes should match the real content's aspect ratio
- Never show a loading spinner inside a button that has `disabled` — the disabled state itself is the feedback

---

## 8. Toast / Feedback Messages

The `Toast` component in `checkout/page.tsx` is good — replicate it everywhere. The rules:

- Success: `bg-green-50 border-green-100 text-green-800` with `CheckCircle2` icon
- Error: `bg-red-50 border-red-100 text-red-800` with `AlertCircle` icon
- Info: `bg-surface-container-low border-outline-variant text-on-surface` with `Info` icon
- Duration: always `setTimeout(() => setToast(null), 4000)` — 4 seconds, not 5
- Position: `fixed top-4 right-4 z-[100]` on desktop, `fixed bottom-4 left-4 right-4 z-[100]` on mobile (use `sm:left-auto sm:right-4 sm:w-auto`)
- Animation: `animate-in fade-in slide-in-from-top-4 duration-300` (already in checkout)

Extract the `Toast` component to `components/ui/Toast.tsx` so it's importable everywhere.

---

## 9. Mobile-First Rules

The site is a Nigerian e-commerce platform. A significant portion of your users are on mobile, often on mid-range Android devices. Every component must be designed mobile-first.

**Tap target minimum: 44×44px.** Every interactive element — buttons, links, icons — must meet this minimum. The current cart item delete button (`p-1.5` with `Trash2 size={18}`) is approximately 32×32px. It should be `p-2.5` with a `touch-manipulation` class.

**Price and CTA must be visible without scrolling on mobile product pages.** The current product detail layout puts the price inside `ProductActions` which is below the gallery on mobile. Add a sticky bottom bar on mobile:

```tsx
{/* Mobile sticky bottom bar — only shown on small screens */}
<div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant p-4 flex items-center gap-3 lg:hidden z-40">
  <div className="flex-1">
    <span className="text-xl font-extrabold text-on-surface">₦{price.toLocaleString()}</span>
  </div>
  <button className="flex-1 bg-primary-container text-white font-bold py-3 rounded-xl text-sm uppercase tracking-wide">
    Add to Cart
  </button>
</div>
```

**Touch interactions:**
- Add `touch-manipulation` to all buttons to remove the 300ms tap delay
- Use `active:scale-95` on all interactive cards and buttons for tactile feedback
- Swipeable carousels (HeroCarousel) should support touch drag — the current implementation only supports click-based prev/next

---

## 10. Performance Patterns

**Images:**
- Always use `next/image` for product images instead of `<img>`. The current `ProductCard` and `ProductGallery` use raw `<img>` tags, which skip Next.js automatic optimization. Replace with `<Image from 'next/image'>` with `fill` prop inside a `relative` container.
- Set `priority={true}` on the first product card in any above-the-fold grid (the first visible product)
- Use `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"` on product card images

**Suspense boundaries:**
- Every `use client` page that fetches data should have a `<Suspense fallback={<SkeletonComponent />}>` wrapper around the data-dependent section
- The search page wraps `SearchResults` in `Suspense` — this is the correct pattern, replicate it for category and account pages

**Font loading:**
- Add `font-display: swap` to any custom font declarations to prevent invisible text during load

---

## 11. Accessibility Minimum Requirements

These are not optional — they affect SEO and usability for all users:

1. **Every `<img>` must have a meaningful `alt` attribute.** Product images: `alt={product.title}`. Decorative images: `alt=""`.

2. **Icon-only buttons need `aria-label`:**
```tsx
<button aria-label="Remove item from cart"><Trash2 /></button>
<button aria-label="Add to wishlist"><Heart /></button>
<button aria-label="Open cart"><ShoppingCart /></button>
```

3. **Form labels must be associated with inputs.** Don't use `placeholder` as a substitute for a `<label>`. In checkout, all address form fields need visible labels above the input, not just placeholder text inside.

4. **Color contrast.** The `text-on-surface-variant` on `bg-surface-container-low` combination is currently `#897363` on `#fff1e9`. This is approximately 3.2:1 contrast ratio — below the 4.5:1 minimum for body text. Any caption or label text on a tinted surface must use `text-on-surface` instead.

5. **Focus indicators.** The current `focus:ring-2 focus:ring-primary-container/10` on inputs is nearly invisible. Use `focus:ring-primary-container/30` minimum.

---

## 12. What Not to Build

These are deliberate decisions — do not add them:

- **No dark mode toggle.** The current color system (`bg-surface`, `bg-background`) has warm off-white tones that don't cleanly invert. Dark mode would require a full second token set. Ship light mode well.
- **No page transition animations.** Next.js App Router doesn't support View Transitions cleanly yet. Stick to component-level transitions (`transition-all duration-300`).
- **No custom scrollbar styles.** The `hide-scrollbar` class on the subnav is fine for the specific horizontal scroll case. Don't extend it to vertical scrollbars.
- **No toast stacking.** One toast at a time. If a second toast fires while one is showing, replace the existing one.
- **No modal inside modal.** The checkout page has an address modal. The address modal must not open another modal inside it.

---

## 13. Quick Reference — Do / Don't

| Situation | Do | Don't |
|---|---|---|
| Brand color | `text-primary-container` | `text-[#F68B1E]` |
| Info/link color | `text-tertiary` | `text-[#264996]` |
| Card border | `border-outline-variant` | `border-gray-100` |
| Body text | `text-on-surface` | `text-gray-800` or `text-gray-900` |
| Muted text | `text-on-surface-variant` | `text-gray-500` |
| Page bg | `bg-background` | `bg-[#F9F9FA]` |
| Button weight | `font-bold` | `font-black` |
| Product title size | `text-sm` | `text-[11px]` |
| Input focus | `focus:ring-primary-container/30` | `focus:ring-[#F68B1E]` |
| Loading state | `animate-pulse` skeleton | Raw `<Loader2 animate-spin>` in content area |
| Image tags | `<Image>` from next/image | Raw `<img>` |
| Empty state | Full illustrated state with CTA | Just nothing / empty grid |
| Error feedback | `Toast` component | `console.error` only or browser `alert()` |

---

## 14. The Five-Second Test

Before shipping any page or component, ask: if a new user landed on this in five seconds, would they know:

1. What this platform sells?
2. What they can do on this page?
3. What the next action is?
4. Is this trustworthy?

If the answer to any of these is "maybe," find the element causing the confusion and fix it before merging.
