# UI Design Guide — Addendum

> This document extends `UI_DESIGN_GUIDE.md`. Read that first. Everything here is based on a second pass through components not covered in the original: `ProductActions`, `ProductGallery`, `CartDrawer`, `LoginForm`, `WalletPage`, `OrderDetailPage`, `SuccessPage`, `AdBanners`, `ProductSection`, `TrendingNow`, and `globals.css`. These sections fill the gaps.

---

## A. Font Crisis — Urbanist Is Loaded, Inter Is Used

`globals.css` imports **Urbanist** from Google Fonts. The `body` font-family is set to `font-family: 'Inter'`. Urbanist never actually renders. This is a silent waste of a network request and means the actual typeface choice was never implemented.

**Decision — pick one and commit:**

**Option 1 (Recommended): Use Urbanist.** It's a geometric sans with personality — confident and modern, appropriate for African e-commerce. Fix `globals.css`:
```css
body {
  font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```
Then add to `tailwind.config.ts`:
```ts
fontFamily: {
  sans: ['Urbanist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
}
```

**Option 2: Drop Urbanist, use system stack.** Remove the Google Fonts import from `globals.css` entirely. This removes a render-blocking network request and makes pages load measurably faster on slow Nigerian connections:
```css
/* Remove this line from globals.css: */
@import url('https://fonts.googleapis.com/css2?family=Urbanist...');

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

Do not leave it as-is. Importing a font and never using it is the worst outcome.

---

## B. The Checkout Success Page Has Inline CSS Overriding Tailwind

`checkout/success/page.tsx` contains a `<style jsx>` block that redefines every Tailwind class being used in the same component:

```tsx
// This exists in the file and must be deleted entirely:
<style jsx>{`
  .bg-white { background-color: #ffffff; }
  .bg-gray-50 { background-color: #f9fafb; }
  .p-8 { padding: 2rem; }
  .rounded-lg { border-radius: 8px; }
  /* ...30+ more lines of Tailwind redefinitions... */
`}</style>
```

This is cargo-cult CSS — copying Tailwind's own values into a `<style>` tag, solving a problem that doesn't exist. Delete the entire `<style jsx>` block. The Tailwind classes on the elements already work.

Additionally, the success page has a critical UX flaw: the "Track Order" button navigates to `/` (the homepage) instead of `/account/orders`. Fix:
```tsx
// ❌ Wrong
<button onClick={() => router.push('/')}>Track Order</button>

// ✅ Correct
<button onClick={() => router.push(`/account/orders/${orderId}`)}>Track Order</button>
```

The success page also needs a much stronger emotional moment. A completed order is the highest-trust moment in the entire app. The current design (plain card, green circle, two buttons) is too flat for that. The correct treatment:

```tsx
// Full success page structure
<div className="bg-background min-h-screen flex items-center justify-center p-4">
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-soft w-full max-w-md p-8 text-center">
    
    {/* Animated checkmark — CSS only, no library */}
    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-100">
      <CheckCircle size={40} className="text-green-500" />
    </div>

    <h1 className="text-title-lg text-on-surface mb-2">Order Confirmed!</h1>
    <p className="text-body-md text-on-surface-variant mb-1">
      Order <span className="font-bold text-on-surface">#{orderId?.substring(0, 8).toUpperCase()}</span>
    </p>
    <p className="text-label-sm text-on-surface-variant mb-8">
      A confirmation has been sent to your email.
    </p>

    {/* What happens next — sets expectations, reduces anxiety */}
    <div className="bg-surface-container-low rounded-xl p-4 mb-8 text-left space-y-3">
      <p className="text-label-sm text-on-surface font-bold mb-3 uppercase tracking-wide">What happens next</p>
      <div className="flex items-start gap-3 text-sm">
        <span className="w-5 h-5 rounded-full bg-primary-container text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
        <span className="text-on-surface-variant">Seller confirms and packages your items</span>
      </div>
      <div className="flex items-start gap-3 text-sm">
        <span className="w-5 h-5 rounded-full bg-primary-container text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
        <span className="text-on-surface-variant">Our agent picks up and ships to your address</span>
      </div>
      <div className="flex items-start gap-3 text-sm">
        <span className="w-5 h-5 rounded-full bg-primary-container text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
        <span className="text-on-surface-variant">You receive delivery within 2–4 business days</span>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
      <Link href={`/account/orders/${orderId}`} className="flex-1 ...secondary button...">
        Track Order
      </Link>
      <Link href="/" className="flex-1 ...primary button...">
        Continue Shopping
      </Link>
    </div>
  </div>
</div>
```

---

## C. ProductActions — Three Problems

### C.1 Variant selector uses raw hex

```tsx
// ❌ Current
className={`border-[#F68B1E] text-[#F68B1E] bg-[#F68B1E]/5`}

// ✅ Fix
className={`border-primary-container text-primary-container bg-primary-container/5`}
```

### C.2 "In stock" / shipping text is static and too small

```tsx
// ❌ Current — hardcoded, 10px, untrustworthy
<p className="text-[10px] text-gray-500 mt-2">In stock</p>
<p className="text-[10px] text-gray-400">+ shipping from ₦ 600 to Lagos</p>
```

The text is `text-[10px]` — below the 12px minimum for readable body text. Stock status should come from the variant data and be color-coded:
```tsx
// ✅ Dynamic, readable, trustworthy
<div className="flex items-center gap-2 mt-2">
  <span className={`w-2 h-2 rounded-full ${selectedVariant.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
  <span className="text-label-sm text-on-surface-variant">
    {selectedVariant.stock > 10 ? 'In Stock' : selectedVariant.stock > 0 ? `Only ${selectedVariant.stock} left` : 'Out of Stock'}
  </span>
</div>
```

### C.3 Service trust icons are placeholder-styled

The Truck / RotateCcw / ShieldCheck cards at the bottom of ProductActions use `bg-gray-50` icon containers with `text-gray-600` — they disappear into the background. These three trust signals (delivery, returns, warranty) are what differentiate a legitimate platform from a dodgy one. They need to be legible and branded:

```tsx
// ✅ Use token colors, not gray
<div className="w-10 h-10 bg-surface-container text-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
  <Truck size={20} />
</div>
```

---

## D. ProductGallery — Two Issues

### D.1 Thumbnail selected border uses raw hex

```tsx
// ❌
className={`border-[#F68B1E] shadow-lg shadow-orange-500/10`}

// ✅
className={`border-primary-container shadow-sm`}
```

### D.2 Lightbox hover states on nav buttons use raw hex

```tsx
// ❌ In lightbox nav buttons
className="hover:bg-[#F68B1E] hover:text-white"

// ✅
className="hover:bg-primary-container hover:text-white"
```

The gallery itself is well-structured. The lightbox pattern (full-screen white, bottom thumbnail strip) is correct. Keep the structure, only fix the color inconsistencies.

---

## E. CartDrawer — Five Issues

The cart drawer is the second-most important conversion surface after checkout. It must be fast, clear, and trustworthy.

### E.1 Drawer uses raw hex everywhere

```tsx
// ❌ Throughout CartDrawer
<ShoppingBag className="text-[#F68B1E]" />
<div className="text-sm font-semibold text-[#F68B1E]">₦ {total}</div>

// ✅
<ShoppingBag className="text-primary-container" />
<div className="text-sm font-semibold text-primary-container">₦ {total}</div>
```

### E.2 Empty cart in drawer has no call to action

When the cart is empty, the drawer just shows an empty state with no prompt to shop. Add a button:
```tsx
<Link 
  href="/" 
  onClick={() => setIsOpen(false)}
  className="mt-4 block w-full text-center py-3 bg-primary-container text-white rounded-xl font-bold text-sm uppercase tracking-wide"
>
  Browse Products
</Link>
```

### E.3 No order total in drawer footer

The drawer currently has no summary total visible before the user clicks "Checkout". Add a subtotal row above the checkout button:
```tsx
<div className="flex justify-between text-sm font-bold text-on-surface py-3 border-t border-outline-variant">
  <span>Subtotal ({totalItems} items)</span>
  <span className="text-primary-container">₦{cartTotal.toLocaleString()}</span>
</div>
```

### E.4 Missing `touch-manipulation` on quantity buttons

Inside the drawer on mobile, the `+` / `-` quantity buttons are `px-2 py-1` — approximately 28×28px. They need `touch-manipulation` and slightly larger tap targets:
```tsx
<button className="px-3 py-2 hover:bg-surface-container transition-colors touch-manipulation">
  <Minus size={14} />
</button>
```

### E.5 `animate-slide-in` is not defined anywhere

The drawer uses `animate-slide-in` but this class doesn't exist in the Tailwind config or globals.css. The drawer will render but without an entrance animation. Either define it or replace with `animate-in slide-in-from-right duration-300` (which uses the built-in Tailwind animate-in plugin):
```tsx
// ✅ Uses built-in animate-in
className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-container-lowest z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
```

---

## F. LoginForm — Three Issues

### F.1 Uses `#FF7A00` instead of the brand color

The login form focus states use `focus:border-[#FF7A00]` — a slightly different orange than the brand `#F68B1E`. Unify:
```tsx
// ❌
className="focus:border-[#FF7A00] focus:ring-1 focus:ring-orange-200/50"

// ✅
className="focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
```

### F.2 Error state uses `animate-pulse` inappropriately

```tsx
// ❌ Pulsing error text is jarring and looks broken
<div className="bg-red-50 ... animate-pulse">{error}</div>

// ✅ Fade in instead — errors should arrive calmly
<div className="bg-red-50 ... animate-in fade-in duration-200">{error}</div>
```

### F.3 No "Register" link visible on the form

The login form has a link to forgot-password but the path to registration is not immediately visible. Under the submit button, add:
```tsx
<p className="text-center text-label-sm text-on-surface-variant mt-4">
  Don't have an account?{' '}
  <Link href="/register" className="text-primary-container font-bold hover:underline">
    Create account
  </Link>
</p>
```

---

## G. WalletPage — Critical Issue: `alert()` for User Feedback

The wallet page uses native `alert()` for both success and error feedback:
```tsx
// ❌ This exists in the codebase
onError: (err) => { alert(err.message); }
onSuccess: () => { alert('Withdrawal request submitted successfully.'); }
```

`alert()` blocks the browser thread, looks completely unprofessional, and cannot be styled. Replace every `alert()` call in the codebase with the `Toast` component (see original guide Section 8). The wallet page needs its own `toast` state and the same `showToast` pattern from checkout:

```tsx
const [toast, setToast] = React.useState<{ message: string, type: 'success' | 'error' } | null>(null);
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 4000);
};

// Then replace all alert() calls:
onSuccess: () => { showToast('Withdrawal request submitted successfully.'); }
onError: (err) => { showToast(err.message, 'error'); }
```

**Full audit of `alert()` usage — replace all of these:**
- `wallet/page.tsx` — fund wallet success/error, withdraw success/error
- `account/orders/[id]/page.tsx` — cancel order success/error, return initiation success
- Any other pages using browser `confirm()` for destructive actions (the order cancellation `confirm()` should be replaced with a proper confirmation modal)

---

## H. OrderDetail Page — `confirm()` for Cancellation

The order detail page uses:
```tsx
if (confirm('Are you sure you want to cancel this order?')) {
  cancelOrder.mutate({ orderId: order.id });
}
```

`confirm()` is a browser primitive that blocks the thread and cannot be styled. Replace with an inline confirmation state:

```tsx
const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

// Instead of confirm(), render:
{showCancelConfirm ? (
  <div className="flex items-center gap-2">
    <span className="text-label-sm text-on-surface-variant">Cancel this order?</span>
    <button 
      onClick={() => { cancelOrder.mutate({ orderId: order.id }); setShowCancelConfirm(false); }}
      className="text-label-sm font-bold text-error hover:underline"
    >
      Yes, cancel
    </button>
    <button 
      onClick={() => setShowCancelConfirm(false)}
      className="text-label-sm font-bold text-on-surface-variant hover:underline"
    >
      Keep order
    </button>
  </div>
) : (
  <button onClick={() => setShowCancelConfirm(true)} className="...ghost button...">
    Cancel Order
  </button>
)}
```

---

## I. AdBanners — Good Structure, One Missing Detail

`AdBanners` is well-built. The image + gradient overlay + text pattern is correct and the hover animations work. One gap:

The `bgColor` property is defined on each banner object (`bg-orange-500`, `bg-blue-600`, etc.) but is never applied. It was intended as a fallback when the image fails to load, but it's never used. Either apply it as a fallback background or remove the property from the data objects to reduce confusion:

```tsx
// Apply as image load fallback
<div className={`absolute inset-0 ${banner.bgColor}`} />  {/* Under the img */}
<img ... className="absolute inset-0 w-full h-full object-cover" />
```

The banners are also hardcoded. When a CMS connection is available, these should be fetched from `content.getAdBanners`. The component structure already makes that easy — just swap the `banners` constant for a data query.

---

## J. ProductSection — `colorMap` Is Defined but Never Used

```tsx
// In ProductSection — this object is dead code
const colorMap = {
  orange: 'from-[#F68B1E] to-[#FF7A00]',
  blue: 'from-[#264996] to-[#3b82f6]',
  red: 'from-[#DF3131] to-[#ef4444]',
  green: 'from-[#28A745] to-[#10b981]',
};
```

`colorMap` and the `color` prop are defined in the component but `colorMap` is never referenced in the JSX. The section header has a plain `bg-surface-container` bar regardless of the `color` prop. Either:

1. Wire it up — use the color prop to tint the section header bar:
```tsx
// Map to token classes instead of raw hex
const headerBg = {
  orange: 'bg-primary-container',
  blue: 'bg-tertiary-container',
  red: 'bg-error',
  green: 'bg-green-600',
};

<div className={`${headerBg[color || 'orange']} h-14 flex items-center ...`}>
```

2. Or delete both `colorMap` and the `color` prop and keep the neutral header.

---

## K. TrendingNow and CategorySidebar — Duplication

`TrendingNow` and `CategorySidebar` both:
- Import the same `categoryIcons` map
- Call `api.catalog.getCategories.useQuery()`
- Render category links with icons

This means the same API call fires twice on the homepage — once for the sidebar, once for the trending row. Extract a shared `useCategoryData()` hook or lift the query to the parent layout and pass data as props. The `categoryIcons` map should live in a shared `constants/categoryIcons.ts` file rather than being copied in two components.

```ts
// constants/categoryIcons.ts
import { Smartphone, Home, ChefHat, ... } from 'lucide-react';

export const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Phones & Tablets': Smartphone,
  'Home & Office': Home,
  // ...
};
```

---

## L. Account Page Loading State

The account page loading state is a full-screen spinner:
```tsx
// ❌ Current
<div className="min-h-screen flex items-center justify-center bg-[#F9F9FA]">
  <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
</div>
```

The Loader2 at 40px centered on screen feels like the app hung. Use the skeleton pattern instead — it shows the shape of what's loading rather than a waiting indicator:

```tsx
// ✅ Skeleton for account page
<div className="bg-background min-h-screen py-8">
  <div className="container mx-auto px-4">
    <div className="h-7 w-36 bg-surface-container rounded animate-pulse mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="h-48 bg-surface-container rounded-xl animate-pulse" />
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-surface-container rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  </div>
</div>
```

Same for the orders page — it uses a skeleton pattern already (good), but the individual skeleton items are `rounded-3xl` which doesn't match the `rounded-[28px]` used on actual order cards. Pick one and be consistent: use `rounded-2xl` for both.

---

## M. Global CSS — Two Conflicts with Tailwind Config

`globals.css` defines CSS custom properties (e.g. `--primary: #914d00`) that match the Tailwind token names. This creates a situation where the same name resolves differently depending on whether a class or a CSS variable is used:

```css
/* globals.css */
--primary: #914d00;        /* Used when: var(--primary) in raw CSS */
```
```ts
/* tailwind.config.ts */
"primary": "#914d00",      /* Used when: text-primary in className */
```

These happen to be the same value right now, but if one is updated and the other isn't, they'll silently diverge. The fix: **delete the duplicate variable declarations from `globals.css`** and let Tailwind's config be the single source of truth. Only keep in `globals.css` what Tailwind can't provide (custom animations, scrollbar hiding, the `hide-scrollbar` utility).

---

## N. Priority Order for All Fixes

Based on impact on first impressions and conversion:

### Do first (user sees these in 5 seconds)
1. Fix font — either use Urbanist or remove the import. Don't load a font and not use it.
2. Delete the `<style jsx>` block from `checkout/success/page.tsx`
3. Fix "Track Order" button routing to the actual order page
4. Replace all `alert()` and `confirm()` calls with Toast / inline confirmation
5. Fix the `animate-slide-in` undefined class on CartDrawer

### Do next (affects every shopping session)
6. Fix variant selector token inconsistency in ProductActions
7. Fix CartDrawer — add subtotal, fix empty state CTA, fix tap targets
8. Fix LoginForm error animation (`animate-pulse` → `fade-in`)
9. Add the "Register" link to LoginForm
10. Fix the stock level display in ProductActions

### Do when cleaning up
11. Extract `categoryIcons` constant and deduplicate TrendingNow/CategorySidebar queries
12. Wire or delete the unused `colorMap` in ProductSection
13. Wire or delete the unused `bgColor` in AdBanners
14. Fix all remaining raw hex in ProductGallery, CartDrawer thumbnails, OrderDetail breadcrumb
15. Unify `rounded-3xl` vs `rounded-[28px]` inconsistency in orders list
16. Delete duplicate CSS variable declarations from `globals.css`
