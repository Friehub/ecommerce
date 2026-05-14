# Complete Jumia UI Transformation

The previous guide covered the surface layer. This covers everything.

---

## Honest scope assessment

| Area | Files affected | Effort |
|---|---|---|
| Design tokens (config + globals) | 2 | 15 min |
| Navbar | 1 | 30 min |
| ProductCard | 1 | 20 min |
| Footer | 1 | 20 min |
| **Auth pages (login + register)** | 2 | 30 min |
| **Product detail page** | 1 large | 45 min |
| **Cart page** | 1 | 30 min |
| **Checkout page** | 1 large | 45 min |
| **Search / category pages** | 2 | 30 min |
| **Seller sidebar + dashboard** | 2 | 30 min |
| **Admin dashboard** | 1 | 20 min |
| Language copy (global grep-replace) | all files | 20 min |
| border-radius + font-weight (global) | all files | 20 min |

**Total honest estimate: ~6 hours of focused work.**

The design tokens and Navbar give you 50% of the visual impact. The remaining pages take the same amount of time again.

---

## What the previous guide missed

### 1. Auth pages — still sci-fi
- Title: **"Access Granted"** / **"Secure Identity Gateway"** → Should be **"Welcome Back"** / **"Sign in to Jumia"**
- Labels: **"Credential Identifier"** → **"Email Address"**
- `rounded-[32px]` card with `border-4` → plain white `border border-j-border rounded shadow-sm`
- The icon-in-circle above the form → remove entirely (Jumia has logo + simple heading)
- `font-black uppercase tracking-[0.4em]` on all labels → `text-sm font-medium text-j-text-muted`

### 2. Product detail page — very off
- Title in `font-black uppercase tracking-tighter` → `font-semibold normal-case`
- Badge: **"Official Repository"** → **"Official Store"** or remove
- **"[47 LOGGED REVIEWS]"** → **(47 reviews)**
- `rounded-[48px] border-4` wrapper card → remove the card entirely; Jumia's product page is flat sections on a white background
- Breadcrumb: **"Hub"** → **"Home"**
- Price section needs the Jumia layout: big price on left, discount % badge on right, strikethrough compare price below

### 3. Cart page — wrong structure
- Jumia's cart is a **2-column layout**: items list on left (white card), order summary on right (white card with gray header)
- Current uses `rounded-[32px]` cards — should be flat `rounded border border-j-border`
- Item title in `font-black uppercase` → normal `text-sm text-j-text`
- Quantity stepper should be `border border-j-border` boxes, not a pill
- Variant attribute badge: remove the sci-fi `bg-primary-container/5 border italic` style → plain `text-xs text-j-text-muted`
- "Continue to checkout" button must be **full-width orange** at bottom of order summary, exactly like Jumia

### 4. Checkout page — "Initializing Geospatial Engine"
- The lazy-load spinner text says **"Initializing Geospatial Engine"** — fix the `loading:` prop in the dynamic import
- Toast titles: **"Operation Success"** / **"System Alert"** → **"Success"** / **"Error"**
- Jumia checkout is a clean **step indicator** at top (1. Cart → 2. Address → 3. Payment → 4. Confirmation) — the current page has no step indicator
- Section headers use `font-black uppercase tracking-widest` → `text-sm font-semibold text-j-text`

### 5. Search + category result pages
- Filter panel labels in `font-black uppercase tracking-[0.3em]` → `text-sm font-medium`
- Price inputs with `font-black` body text → normal `text-sm`
- "No results" state language check
- Sort dropdown should be a plain `<select>` styled like Jumia's

### 6. Seller sidebar — worst offender
- Nav labels: **"Console"**, **"Logistics"**, **"Compliance"**, **"Intelligence"** → **"Dashboard"**, **"Orders"**, **"KYC"**, **"Analytics"**
- Sub-label: **"System Node v1.0"** → remove entirely
- Section header: **"Operations Hub"** → remove
- Active state: `bg-on-surface text-white translate-x-2` → `bg-jumia-orange text-white` (Jumia orange, no translate)
- **"Revenue Pulse / LIVE FEED"** widget at bottom → remove; replace with simple "Visit Store" link
- Sidebar background: `bg-surface-container-low` → `bg-white border-r border-j-border`

### 7. Admin dashboard — icon imports
- Imports `Binary`, `Cpu`, `Fingerprint` — purely decorative sci-fi icons → swap for functional ones (`BarChart3`, `Users`, `ShieldCheck`)
- Toast: **"ENTITY AUTHORIZED"** → **"Seller approved"**
- Toast: **"AUTHORIZATION FAILED"** → **"Approval failed"**
- All stat card labels in `font-black uppercase` pattern → normal weight

### 8. HeroCarousel — banner titles
- Default banners titled **"Digital Horizon"**, **"Vogue Essentials"** → replace with real Jumia-style CTAs like **"Up to 60% off Electronics"**, **"New Season Fashion"**
- The banner overlay text style (`font-black uppercase tracking-tighter`) → `font-bold normal-case text-xl`

---

## The 3 global find-replace commands that fix the most

Run these from `apps/web/src/`:

### Fix 1 — All letter-spacing overrides (791 instances)
```bash
# These create the "sci-fi" text feel more than anything else
# tracking-[0.4em], tracking-[0.3em], tracking-[0.2em], tracking-widest on small text
# Replace with nothing (remove tracking overrides from body/label text)
grep -rn "tracking-\[" . --include="*.tsx" -l
```
Go through each file and remove `tracking-[0.Xem]` from any element that is body text, labels, or nav items. Keep it only on the Jumia logo wordmark.

### Fix 2 — All heavy border-radius (582 instances)
```bash
grep -rn "rounded-\[" . --include="*.tsx" -l | xargs sed -i \
  -e 's/rounded-\[48px\]/rounded/g' \
  -e 's/rounded-\[40px\]/rounded/g' \
  -e 's/rounded-\[32px\]/rounded/g' \
  -e 's/rounded-\[28px\]/rounded/g' \
  -e 's/rounded-\[24px\]/rounded/g' \
  -e 's/rounded-\[20px\]/rounded-sm/g'
```

### Fix 3 — font-black → font-semibold on body/label text (1371 instances)
```bash
# This is too blunt to do globally (keep font-black on the logo and primary CTAs)
# But you can fix the worst offenders: all labels and nav items
grep -rn 'text-\[10px\].*font-black\|text-\[9px\].*font-black\|text-\[11px\].*font-black' . --include="*.tsx" -l
```
In each matching file, change `font-black` → `font-medium` wherever it's on text smaller than 14px.

---

## Page-by-page replacement code

### Auth pages (LoginForm + RegisterForm)

Both forms follow the same pattern. Replace the outer wrapper and headings:

```tsx
// BEFORE (both forms)
<div className="bg-surface-container-lowest p-10 rounded-[40px] border-4 ...">
  <div className="w-16 h-16 bg-primary-container/10 rounded-2xl ...">
    <User size={32} className="text-primary-container group-hover:rotate-12" />
  </div>
  <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">Access Granted</h1>
  <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.4em]">Secure Identity Gateway</p>

// AFTER
<div className="bg-white p-8 rounded border border-j-border shadow-sm w-full max-w-md">
  <div className="text-center mb-6">
    <h1 className="text-2xl font-bold text-j-text">Welcome back</h1>
    <p className="text-sm text-j-text-muted mt-1">Sign in to your Jumia account</p>
  </div>
```

```tsx
// BEFORE (field labels, both forms)
<label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">
  Credential Identifier
</label>
<input className="... text-[11px] font-black uppercase tracking-widest ..." placeholder="IDENTITY@NODE.COM" />

// AFTER
<label className="block text-sm font-medium text-j-text mb-1">Email address</label>
<input className="w-full h-11 px-3 border border-j-border rounded text-sm text-j-text focus:outline-none focus:border-jumia-orange" placeholder="Enter your email" />
```

```tsx
// BEFORE (submit button)
<button className="h-20 bg-on-surface text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[24px]">
  Authenticate Node
</button>

// AFTER
<button className="w-full h-11 bg-jumia-orange hover:bg-jumia-orange-dark text-white text-sm font-semibold rounded transition-colors">
  Sign In
</button>
```

---

### Product detail page — key sections

```tsx
// BEFORE: wrapper
<div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden">

// AFTER: no card, flat white bg
<div className="bg-white">
```

```tsx
// BEFORE: breadcrumbs
<Link className="text-[10px] font-black uppercase tracking-[0.2em]">Hub</Link>

// AFTER
<Link className="text-xs text-j-text-muted hover:text-jumia-orange">Home</Link>
```

```tsx
// BEFORE: product title
<h1 className="text-3xl md:text-5xl font-black text-on-surface leading-[1.1] tracking-tighter uppercase">
  {product.title}
</h1>

// AFTER
<h1 className="text-xl font-semibold text-j-text leading-snug">
  {product.title}
</h1>
```

```tsx
// BEFORE: reviews line
<span className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em]">
  [{product.reviewCount || 0} LOGGED REVIEWS]
</span>

// AFTER
<span className="text-sm text-jumia-blue hover:underline cursor-pointer">
  ({product.reviewCount || 0} verified ratings)
</span>
```

```tsx
// BEFORE: price section
<span className="text-5xl font-black text-on-surface tracking-tighter">₦ {price.toLocaleString()}</span>

// AFTER
<span className="text-2xl font-bold text-j-text">₦{price.toLocaleString()}</span>
{comparePrice && comparePrice > price && (
  <div className="flex items-center gap-2 mt-1">
    <span className="text-sm text-j-text-muted line-through">₦{comparePrice.toLocaleString()}</span>
    <span className="text-sm text-j-red font-medium">{discount}% off</span>
  </div>
)}
```

---

### Cart page — order summary card

```tsx
// The order summary right panel (replace the whole right column):
<div className="w-full lg:w-80 flex-shrink-0">
  <div className="bg-white border border-j-border rounded overflow-hidden">
    {/* Header */}
    <div className="bg-j-bg px-4 py-3 border-b border-j-border">
      <h2 className="text-sm font-semibold text-j-text uppercase">Order Summary</h2>
    </div>
    {/* Body */}
    <div className="p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-j-text-muted">Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
        <span className="text-j-text font-medium">₦{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-j-text-muted">Delivery</span>
        <span className="text-j-green font-medium">₦{shipping.toLocaleString()}</span>
      </div>
      <div className="border-t border-j-border pt-3 flex justify-between">
        <span className="text-sm font-semibold text-j-text">Total</span>
        <span className="text-lg font-bold text-j-text">₦{total.toLocaleString()}</span>
      </div>
    </div>
    {/* CTA */}
    <div className="p-4 pt-0">
      <Link
        href="/checkout"
        className="block w-full py-3 bg-jumia-orange hover:bg-jumia-orange-dark text-white text-sm font-semibold text-center rounded transition-colors"
      >
        PROCEED TO CHECKOUT ({totalItems})
      </Link>
    </div>
  </div>
</div>
```

---

### Checkout — fix the loading spinner copy

```tsx
// BEFORE (in the dynamic import)
loading: () => <div className="...">
  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Initializing Geospatial Engine</span>
</div>

// AFTER
loading: () => <div className="h-[300px] w-full bg-j-bg rounded border border-j-border flex items-center justify-center">
  <div className="text-sm text-j-text-muted">Loading map...</div>
</div>
```

```tsx
// BEFORE: Toast titles
<p className="text-[11px] font-black uppercase tracking-widest">Operation Success</p>
<p className="text-[11px] font-black uppercase tracking-widest">System Alert</p>

// AFTER — just remove those label lines entirely, the message is enough
```

---

### Seller sidebar — full replacement

```tsx
// apps/web/src/components/seller/SellerSidebar.tsx
const navItems = [
  { name: 'Dashboard',  href: '/seller/dashboard',   icon: LayoutDashboard },
  { name: 'Orders',     href: '/seller/orders',       icon: ShoppingCart },
  { name: 'Products',   href: '/seller/products',     icon: Package },
  { name: 'Inventory',  href: '/seller/inventory',    icon: Box },
  { name: 'Analytics',  href: '/seller/insights',     icon: BarChart3 },
  { name: 'Advertising',href: '/seller/advertising',  icon: TrendingUp },
  { name: 'Finance',    href: '/seller/finance',      icon: Wallet },
  { name: 'KYC',        href: '/seller/kyc',          icon: ShieldCheck },
  { name: 'Settings',   href: '/seller/settings',     icon: Settings },
];

// Sidebar wrapper — replace bg-surface-container-low with:
<div className="flex flex-col h-full bg-white border-r border-j-border w-56">
  {/* Logo area */}
  <div className="p-4 border-b border-j-border">
    <Link href="/" className="text-lg font-bold text-jumia-orange">Jumia</Link>
    <p className="text-xs text-j-text-muted mt-0.5">Seller Centre</p>
  </div>

  {/* Nav */}
  <nav className="flex-1 py-2 overflow-y-auto">
    {navItems.map(item => {
      const isActive = pathname.startsWith(item.href);
      return (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            isActive
              ? 'bg-orange-50 text-jumia-orange border-r-2 border-jumia-orange font-medium'
              : 'text-j-text hover:bg-j-bg'
          }`}
        >
          <item.icon size={18} className={isActive ? 'text-jumia-orange' : 'text-j-text-muted'} />
          {item.name}
        </Link>
      );
    })}
  </nav>

  {/* Bottom */}
  <div className="p-4 border-t border-j-border">
    <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-j-text-muted hover:text-j-red transition-colors">
      <LogOut size={16} />
      Sign Out
    </button>
  </div>
</div>
```

---

### Admin dashboard — tone fix

```tsx
// In the useMutation onSuccess:
// BEFORE
toast({ title: 'ENTITY AUTHORIZED', description: 'Seller credentials verified...' })
// AFTER
toast({ title: 'Seller approved', description: 'The seller account is now active.' })

// BEFORE
toast({ title: 'AUTHORIZATION FAILED', description: 'System failed to finalize...' })
// AFTER
toast({ title: 'Failed to approve', description: err.message || 'Please try again.' })
```

---

## Complete language replacement table (additions to previous guide)

| Wrong | Correct |
|---|---|
| `Access Granted` | `Welcome back` |
| `Secure Identity Gateway` | `Sign in to Jumia` |
| `Credential Identifier` | `Email address` |
| `Authenticate Node` | `Sign In` |
| `Initialize Consumer Node` | `Create your account` |
| `Hub` (breadcrumb) | `Home` |
| `Official Repository` | `Official Store` |
| `LOGGED REVIEWS` | `verified ratings` |
| `Console` (seller nav) | `Dashboard` |
| `Logistics` (seller nav) | `Orders` |
| `Compliance` (seller nav) | `KYC` |
| `Intelligence` (seller nav) | `Analytics` |
| `System Node v1.0` | (remove) |
| `Operations Hub` | (remove) |
| `Revenue Pulse / LIVE FEED` | (remove widget entirely) |
| `ENTITY AUTHORIZED` | `Seller approved` |
| `AUTHORIZATION FAILED` | `Failed to approve` |
| `Operation Success` (toast) | (remove — message is enough) |
| `System Alert` (toast) | (remove — message is enough) |
| `Initializing Geospatial Engine` | `Loading map...` |
| `Digital Horizon` (banner) | `Up to 60% off Electronics` |
| `Vogue Essentials` (banner) | `New Season Fashion — Shop Now` |
| `AFTER COMMISSION` (seller stat) | `After commission` |
| `TOTAL VOLUME` (seller stat) | (remove sub-label) |
| `PROCESSING RATE` (seller stat) | (remove sub-label) |

---

## Summary: what the previous guide actually covered

| Item | Previous guide | This guide adds |
|---|---|---|
| Tailwind config | ✅ | — |
| Navbar | ✅ | — |
| ProductCard | ✅ | — |
| Footer | ✅ | — |
| CategorySidebar | ✅ | — |
| Buttons | ✅ | — |
| Language (partial) | ✅ | ~20 more strings |
| Border radius (command) | ✅ | — |
| Auth pages | ❌ | ✅ full code |
| Product detail page | ❌ | ✅ key sections |
| Cart page | ❌ | ✅ order summary |
| Checkout page | ❌ | ✅ spinner + toasts |
| Search / category pages | ❌ | noted |
| Seller sidebar | ❌ | ✅ full replacement |
| Admin dashboard | ❌ | ✅ tone fix |
| HeroCarousel banners | ❌ | ✅ noted |
| letter-spacing overrides | ❌ | ✅ grep command |
| font-black on small text | ❌ | ✅ grep command |
