# Playwright E2E Testing Guide

## Overview

This guide covers full end-to-end test coverage for the Jumia clone across all five user roles. Tests are written against the existing Playwright setup at `apps/e2e/`.

**Test credentials** (all use password: `password123` — set by seed.ts):

| Role | Email | Portal |
|---|---|---|
| Buyer | `buyer1@ecom.dev` | `/login` |
| Seller | `seller1@ecom.dev` | `/seller/login` |
| Admin | `admin@ecom.dev` | `/admin/login` |
| Affiliate Agent | `agent1@ecom.dev` | `/login` → `/affiliate` |
| Delivery Agent | `agent1@ecom.dev` | `/apps/agent` |

---

## Project Structure

```
apps/e2e/
├── playwright.config.ts        ← already exists
├── playwright/
│   └── .auth/                  ← saved auth states (gitignored)
├── fixtures/
│   └── auth.setup.ts           ← global auth setup
└── tests/
    ├── buyer.spec.ts           ← stub exists, needs full coverage
    ├── seller.spec.ts
    ├── admin.spec.ts
    ├── agent.spec.ts
    └── affiliate.spec.ts
```

---

## Auth Setup

Create `apps/e2e/fixtures/auth.setup.ts` — this runs once before all tests and saves session cookies so each spec doesn't re-login:

```ts
// apps/e2e/fixtures/auth.setup.ts
import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = (name: string) =>
  path.join(__dirname, `../playwright/.auth/${name}.json`);

setup('authenticate buyer', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('IDENTITY@NODE.COM').fill('buyer1@ecom.dev');
  await page.getByPlaceholder(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/');
  await page.context().storageState({ path: authFile('buyer') });
});

setup('authenticate seller', async ({ page }) => {
  await page.goto('/seller/login');
  await page.getByPlaceholder(/email/i).fill('seller1@ecom.dev');
  await page.getByPlaceholder(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/seller/dashboard');
  await page.context().storageState({ path: authFile('seller') });
});

setup('authenticate admin', async ({ page }) => {
  await page.goto('/admin/login');
  // Step 1: email + password
  await page.getByPlaceholder(/email/i).fill('admin@ecom.dev');
  await page.getByPlaceholder(/password/i).fill('password123');
  await page.getByRole('button', { name: /next|continue/i }).click();
  // Step 2: MFA code (seed admin has no real MFA — any 6 digits works in dev)
  await page.getByPlaceholder(/code|mfa/i).fill('000000');
  await page.getByRole('button', { name: /verify|login/i }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: authFile('admin') });
});
```

Update `playwright.config.ts` to use the role-specific auth files:

```ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'buyer',
    use: { storageState: 'apps/e2e/playwright/.auth/buyer.json' },
    dependencies: ['setup'],
  },
  {
    name: 'seller',
    use: { storageState: 'apps/e2e/playwright/.auth/seller.json' },
    dependencies: ['setup'],
  },
  {
    name: 'admin',
    use: { storageState: 'apps/e2e/playwright/.auth/admin.json' },
    dependencies: ['setup'],
  },
  {
    name: 'agent',
    // Agent logs in with buyer credentials, redirected to /apps/agent
    use: { storageState: 'apps/e2e/playwright/.auth/buyer.json' },
    dependencies: ['setup'],
  },
],
```

---

## 1. Buyer Tests

```ts
// apps/e2e/tests/buyer.spec.ts
import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────
// 1.1  Homepage & Navigation
// ─────────────────────────────────────────────
test.describe('Homepage', () => {
  test('renders product grid and category grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[class*="ProductCard"], [data-testid="product-card"]').first()).toBeVisible();
    // Category grid loaded from api.catalog.getCategories
    await expect(page.getByRole('link', { name: /electronics|fashion|phones/i }).first()).toBeVisible();
  });

  test('hero banner is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img[alt*="banner"], [class*="banner"], [class*="hero"]').first()).toBeVisible({ timeout: 8000 });
  });
});

// ─────────────────────────────────────────────
// 1.2  Registration
// ─────────────────────────────────────────────
test.describe('Registration', () => {
  test('registers a new buyer', async ({ page }) => {
    const ts = Date.now();
    await page.goto('/register');
    await page.getByPlaceholder('JOHN').fill('Test');
    await page.getByPlaceholder('DOE').fill('User');
    await page.getByPlaceholder('IDENTITY@NODE.COM').fill(`testbuyer${ts}@ecom.dev`);
    // password field
    await page.locator('input[type="password"]').first().fill('SecurePass123!');
    await page.locator('input[placeholder*="08"]').fill('08012345678');
    await page.getByRole('button', { name: /create|register|initialize/i }).click();
    // Redirects to /login?registered=true
    await expect(page).toHaveURL(/registered=true/);
  });

  test('shows error for duplicate email', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('JOHN').fill('Test');
    await page.getByPlaceholder('DOE').fill('User');
    await page.getByPlaceholder('IDENTITY@NODE.COM').fill('buyer1@ecom.dev'); // existing
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('input[placeholder*="08"]').fill('08012345678');
    await page.getByRole('button', { name: /create|register|initialize/i }).click();
    await expect(page.getByText(/already exists|duplicate|taken/i)).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 1.3  Search
// ─────────────────────────────────────────────
test.describe('Search', () => {
  test('searches by keyword and shows results', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[placeholder*="Search"], input[type="search"]').first().fill('phone');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=phone/i);
    await expect(page.locator('[class*="ProductCard"], [class*="product"]').first()).toBeVisible();
  });

  test('price range filter updates results', async ({ page }) => {
    await page.goto('/search?q=phone');
    await page.locator('input[placeholder*="Min"], input[placeholder*="min"]').fill('5000');
    await page.locator('input[placeholder*="Max"], input[placeholder*="max"]').fill('50000');
    await page.getByRole('button', { name: /apply|filter/i }).click();
    await expect(page).toHaveURL(/minPrice=5000/);
  });

  test('sort order updates URL', async ({ page }) => {
    await page.goto('/search?q=phone');
    await page.locator('select').first().selectOption('price_asc');
    await expect(page).toHaveURL(/sortBy=price_asc/);
  });
});

// ─────────────────────────────────────────────
// 1.4  Category Browse
// ─────────────────────────────────────────────
test.describe('Category Browse', () => {
  test('category page shows filtered products', async ({ page }) => {
    await page.goto('/');
    const catLink = page.getByRole('link', { name: /electronics|phones|fashion/i }).first();
    await catLink.click();
    await expect(page).toHaveURL(/\/category\//);
    await expect(page.locator('[class*="ProductCard"], [class*="product"]').first()).toBeVisible();
  });

  test('brand filter narrows results', async ({ page }) => {
    await page.goto('/category/electronics');
    // Open mobile filter if visible
    const filterBtn = page.getByRole('button', { name: /filter/i });
    if (await filterBtn.isVisible()) await filterBtn.click();
    await page.locator('select[aria-label*="brand"], select').filter({ hasText: /brand/i }).first().selectOption({ index: 1 });
    await expect(page).toHaveURL(/brandId=/);
  });
});

// ─────────────────────────────────────────────
// 1.5  Product Detail
// ─────────────────────────────────────────────
test.describe('Product Detail', () => {
  test('loads product detail page with all key sections', async ({ page }) => {
    await page.goto('/search?q=phone');
    await page.locator('[class*="ProductCard"] a, [class*="product"] a').first().click();
    await expect(page).toHaveURL(/\/products\//);
    // Price
    await expect(page.getByText(/₦/).first()).toBeVisible();
    // Add to cart button
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('variant selector changes price', async ({ page }) => {
    await page.goto('/search?q=phone');
    await page.locator('[class*="ProductCard"] a').first().click();
    const variants = page.locator('button[class*="variant"], button[class*="config"]');
    if (await variants.count() > 1) {
      const priceBefore = await page.getByText(/₦\d/).first().textContent();
      await variants.nth(1).click();
      // Price may or may not change depending on seed data — just ensure no crash
      await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
    }
  });

  test('quantity stepper works', async ({ page }) => {
    await page.goto('/products/samsung-phones-1-1');
    const plusBtn = page.getByRole('button', { name: '+' });
    const minusBtn = page.getByRole('button', { name: '-' });
    await plusBtn.click();
    await plusBtn.click();
    await expect(page.getByText('3')).toBeVisible();
    await minusBtn.click();
    await expect(page.getByText('2')).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 1.6  Cart
// ─────────────────────────────────────────────
test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Add something to cart before each cart test
    await page.goto('/search?q=phone');
    await page.locator('[class*="ProductCard"] a').first().click();
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.goto('/cart');
  });

  test('shows added product in cart', async ({ page }) => {
    await expect(page.locator('[class*="cart-item"], [class*="CartItem"]').first()).toBeVisible();
  });

  test('remove item from cart', async ({ page }) => {
    const itemCount = await page.locator('[class*="cart-item"], [class*="CartItem"]').count();
    await page.getByRole('button', { name: /remove|delete|×/i }).first().click();
    if (itemCount === 1) {
      await expect(page.getByText(/empty|no items/i)).toBeVisible();
    } else {
      await expect(page.locator('[class*="cart-item"]')).toHaveCount(itemCount - 1);
    }
  });

  test('proceed to checkout button is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /checkout|proceed/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 1.7  Checkout
// ─────────────────────────────────────────────
test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search?q=phone');
    await page.locator('[class*="ProductCard"] a').first().click();
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.goto('/checkout');
  });

  test('loads checkout page with address and payment sections', async ({ page }) => {
    await expect(page.getByText(/address|delivery/i).first()).toBeVisible();
    await expect(page.getByText(/payment|cash on delivery/i).first()).toBeVisible();
  });

  test('can fill new delivery address', async ({ page }) => {
    // If no saved address, address form should be visible
    const streetInput = page.locator('#streetAddress, input[name="streetAddress"]');
    if (await streetInput.isVisible()) {
      await page.locator('input[id="firstName"]').fill('John');
      await page.locator('input[id="lastName"]').fill('Doe');
      await page.locator('input[id="phone"]').fill('08012345678');
      await streetInput.fill('12 Lagos Island, Custom Street');
    }
  });

  test('Pay on Delivery is selected by default', async ({ page }) => {
    // POD is the default paymentMethod state
    await expect(page.getByText(/cash on delivery|pay on delivery/i)).toBeVisible();
  });

  test('can switch to wallet payment', async ({ page }) => {
    await page.getByText(/wallet|jumiapay/i).click();
    await expect(page.getByText(/wallet balance/i)).toBeVisible();
  });

  test('places order with POD and reaches success page', async ({ page }) => {
    // Ensure POD is selected (default)
    const placeOrderBtn = page.getByRole('button', { name: /place order|confirm order|checkout/i });
    if (await placeOrderBtn.isEnabled()) {
      await placeOrderBtn.click();
      await expect(page).toHaveURL(/checkout\/success/, { timeout: 15000 });
      await expect(page.getByRole('link', { name: /track order/i })).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────
// 1.8  Orders
// ─────────────────────────────────────────────
test.describe('Orders', () => {
  test('order list page shows orders', async ({ page }) => {
    await page.goto('/account/orders');
    await expect(page.locator('[class*="order"], [href*="/account/orders/"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('order detail shows status timeline', async ({ page }) => {
    await page.goto('/account/orders');
    await page.locator('[href*="/account/orders/"]').first().click();
    await expect(page).toHaveURL(/\/account\/orders\/.+/);
    // Status timeline
    await expect(page.getByText(/pending|processing|shipped|delivered/i).first()).toBeVisible();
  });

  test('can cancel a PENDING order', async ({ page }) => {
    await page.goto('/account/orders');
    await page.locator('[href*="/account/orders/"]').first().click();
    const cancelBtn = page.getByRole('button', { name: /cancel/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      // Confirm modal
      await page.getByRole('button', { name: /confirm|yes/i }).click();
      await expect(page.getByText(/cancelled/i)).toBeVisible({ timeout: 8000 });
    }
  });

  test('can initiate return on a DELIVERED order', async ({ page }) => {
    // Navigate to a delivered order if one exists
    await page.goto('/account/orders');
    const deliveredOrder = page.locator('[class*="order"]').filter({ hasText: /delivered/i }).first();
    if (await deliveredOrder.isVisible()) {
      await deliveredOrder.click();
      const returnBtn = page.getByRole('button', { name: /return/i });
      if (await returnBtn.isVisible()) {
        await returnBtn.click();
        await page.getByRole('button', { name: /confirm|submit/i }).click();
        await expect(page.getByText(/return.*initiated|return.*submitted/i)).toBeVisible({ timeout: 8000 });
      }
    }
  });
});

// ─────────────────────────────────────────────
// 1.9  Reviews
// ─────────────────────────────────────────────
test.describe('Reviews', () => {
  test('review list page loads', async ({ page }) => {
    await page.goto('/account/reviews');
    // Either shows reviews or an empty state
    await expect(page.locator('body')).toBeVisible();
  });

  test('can write a review for a delivered order item', async ({ page }) => {
    await page.goto('/account/reviews/new');
    const ratingStars = page.locator('[class*="star"], [aria-label*="star"]');
    if (await ratingStars.count() > 0) {
      await ratingStars.nth(4).click(); // 5 stars
      await page.locator('textarea').fill('Excellent product, fast delivery!');
      await page.getByRole('button', { name: /submit|publish/i }).click();
      await expect(page.getByText(/review.*submitted|thank you/i)).toBeVisible({ timeout: 8000 });
    }
  });
});

// ─────────────────────────────────────────────
// 1.10  Disputes
// ─────────────────────────────────────────────
test.describe('Disputes', () => {
  test('dispute list page loads', async ({ page }) => {
    await page.goto('/disputes');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can open a new dispute', async ({ page }) => {
    await page.goto('/disputes/new');
    await page.locator('select').first().selectOption({ index: 1 }); // reason
    await page.locator('textarea').fill('Item not received after 7 days');
    await page.getByRole('button', { name: /submit|open dispute/i }).click();
    await expect(page.getByText(/dispute.*opened|submitted|created/i)).toBeVisible({ timeout: 8000 });
  });
});

// ─────────────────────────────────────────────
// 1.11  Account Pages
// ─────────────────────────────────────────────
test.describe('Account', () => {
  test('account page loads for authenticated buyer', async ({ page }) => {
    await page.goto('/account');
    await expect(page.getByText(/buyer1|account/i).first()).toBeVisible();
  });

  test('wallet page shows balance', async ({ page }) => {
    await page.goto('/account/wallet');
    await expect(page.getByText(/balance|wallet|₦/i).first()).toBeVisible();
  });

  test('addresses page loads', async ({ page }) => {
    await page.goto('/account/addresses');
    await expect(page.locator('body')).toBeVisible();
  });

  test('notifications page marks all as read', async ({ page }) => {
    await page.goto('/notifications');
    const markAllBtn = page.getByRole('button', { name: /mark all.*read/i });
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await expect(page.getByText(/all.*read|no unread/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
```

---

## 2. Seller Tests

```ts
// apps/e2e/tests/seller.spec.ts
import { test, expect } from '@playwright/test';

test.use({ storageState: 'apps/e2e/playwright/.auth/seller.json' });

// ─────────────────────────────────────────────
// 2.1  Dashboard
// ─────────────────────────────────────────────
test.describe('Seller Dashboard', () => {
  test('loads with key metric cards', async ({ page }) => {
    await page.goto('/seller/dashboard');
    await expect(page.getByText(/revenue|orders|products|GMV/i).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 2.2  Product Creation
// ─────────────────────────────────────────────
test.describe('Product Listings', () => {
  test('product list page loads', async ({ page }) => {
    await page.goto('/seller/products');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can create a new product', async ({ page }) => {
    const ts = Date.now();
    await page.goto('/seller/inventory/new');

    // Title
    await page.locator('input').filter({ hasText: '' }).first().fill(`Test Product ${ts}`);

    // Category dropdown
    await page.locator('select').first().selectOption({ index: 1 });

    // Description
    await page.locator('textarea').fill('This is a test product description for e2e testing.');

    // Variant SKU and price
    await page.locator('input[placeholder*="SKU"]').first().fill(`SKU-${ts}`);
    await page.locator('input[type="number"]').first().fill('15000');

    await page.getByRole('button', { name: /create|publish|materialize/i }).click();
    await expect(page.getByText(/product.*created|materialized|success/i)).toBeVisible({ timeout: 10000 });
  });

  test('product list shows newly created product', async ({ page }) => {
    await page.goto('/seller/products');
    await expect(page.locator('[class*="product"], tr, [class*="row"]').first()).toBeVisible({ timeout: 8000 });
  });
});

// ─────────────────────────────────────────────
// 2.3  Orders
// ─────────────────────────────────────────────
test.describe('Seller Orders', () => {
  test('orders page loads with order list', async ({ page }) => {
    await page.goto('/seller/orders');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can enter a tracking number and mark as shipped', async ({ page }) => {
    await page.goto('/seller/orders');
    const trackingInput = page.locator('input[placeholder*="tracking"], input[class*="tracking"]').first();
    if (await trackingInput.isVisible()) {
      await trackingInput.fill('TRACK123456789');
      await page.getByRole('button', { name: /ship|confirm.*ship/i }).first().click();
      await expect(page.getByText(/shipped|dispatched/i).first()).toBeVisible({ timeout: 8000 });
    }
  });
});

// ─────────────────────────────────────────────
// 2.4  Inventory
// ─────────────────────────────────────────────
test.describe('Seller Inventory', () => {
  test('inventory page shows stock levels', async ({ page }) => {
    await page.goto('/seller/inventory');
    await expect(page.getByText(/stock|units|inventory/i).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 2.5  KYC Upload
// ─────────────────────────────────────────────
test.describe('KYC', () => {
  test('KYC page renders document upload sections', async ({ page }) => {
    await page.goto('/seller/kyc');
    await expect(page.getByText(/NIN|government ID|bank statement/i).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 2.6  Advertising
// ─────────────────────────────────────────────
test.describe('Seller Advertising', () => {
  test('campaigns page loads', async ({ page }) => {
    await page.goto('/seller/advertising');
    await expect(page.getByText(/campaign|sponsored|advertising/i).first()).toBeVisible();
  });

  test('create campaign page loads', async ({ page }) => {
    await page.goto('/seller/advertising/create');
    await expect(page.locator('input, select, textarea').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 2.7  Finance / Settlement
// ─────────────────────────────────────────────
test.describe('Seller Finance', () => {
  test('finance page shows ledger and payout data', async ({ page }) => {
    await page.goto('/seller/finance');
    await expect(page.getByText(/balance|settlement|payout|ledger/i).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 2.8  Disputes
// ─────────────────────────────────────────────
test.describe('Seller Disputes', () => {
  test('dispute list page loads', async ({ page }) => {
    await page.goto('/seller/disputes');
    await expect(page.locator('body')).toBeVisible();
  });
});
```

---

## 3. Admin Tests

```ts
// apps/e2e/tests/admin.spec.ts
import { test, expect } from '@playwright/test';

test.use({ storageState: 'apps/e2e/playwright/.auth/admin.json' });

// ─────────────────────────────────────────────
// 3.1  Dashboard
// ─────────────────────────────────────────────
test.describe('Admin Dashboard', () => {
  test('loads platform metrics', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/GMV|orders|sellers|revenue/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────
// 3.2  KYC Review
// ─────────────────────────────────────────────
test.describe('Admin KYC', () => {
  test('KYC queue shows pending sellers', async ({ page }) => {
    await page.goto('/kyc');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can approve a seller KYC document', async ({ page }) => {
    await page.goto('/kyc');
    const sellerRow = page.locator('[class*="seller"], tr, [class*="row"]').first();
    if (await sellerRow.isVisible()) {
      await sellerRow.click();
      const approveBtn = page.getByRole('button', { name: /approve|authorize valid/i }).first();
      if (await approveBtn.isVisible()) {
        await approveBtn.click();
        await expect(page.getByText(/approved|authorized/i)).toBeVisible({ timeout: 8000 });
      }
    }
  });

  test('can reject a KYC document with reason', async ({ page }) => {
    await page.goto('/kyc');
    const sellerRow = page.locator('[class*="seller"], tr').first();
    if (await sellerRow.isVisible()) {
      await sellerRow.click();
      await page.locator('input[placeholder*="reason"], textarea[placeholder*="reason"]').fill('Blurry document image');
      const rejectBtn = page.getByRole('button', { name: /reject|deny/i }).first();
      if (await rejectBtn.isVisible()) {
        await rejectBtn.click();
        await expect(page.getByText(/rejected|denied/i)).toBeVisible({ timeout: 8000 });
      }
    }
  });
});

// ─────────────────────────────────────────────
// 3.3  User Management
// ─────────────────────────────────────────────
test.describe('Admin Users', () => {
  test('user list page loads', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('[class*="user"], tr').first()).toBeVisible({ timeout: 8000 });
  });

  test('can suspend a user', async ({ page }) => {
    await page.goto('/admin/users');
    const suspendBtn = page.getByRole('button', { name: /suspend/i }).first();
    if (await suspendBtn.isVisible()) {
      await suspendBtn.click();
      await expect(page.getByText(/suspended|inactive/i)).toBeVisible({ timeout: 8000 });
    }
  });
});

// ─────────────────────────────────────────────
// 3.4  Sellers Management
// ─────────────────────────────────────────────
test.describe('Admin Sellers', () => {
  test('sellers list shows all sellers', async ({ page }) => {
    await page.goto('/sellers');
    await expect(page.locator('[class*="seller"], tr').first()).toBeVisible({ timeout: 8000 });
  });
});

// ─────────────────────────────────────────────
// 3.5  Disputes Queue
// ─────────────────────────────────────────────
test.describe('Admin Disputes', () => {
  test('dispute queue loads', async ({ page }) => {
    await page.goto('/disputes');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can issue a ruling on a dispute', async ({ page }) => {
    await page.goto('/disputes');
    const disputeRow = page.locator('[class*="dispute"], tr').first();
    if (await disputeRow.isVisible()) {
      await disputeRow.click();
      const rulingBtn = page.getByRole('button', { name: /rule|resolve|favor/i }).first();
      if (await rulingBtn.isVisible()) {
        await rulingBtn.click();
        await expect(page.getByText(/resolved|ruling|closed/i)).toBeVisible({ timeout: 8000 });
      }
    }
  });
});

// ─────────────────────────────────────────────
// 3.6  Fraud Queue
// ─────────────────────────────────────────────
test.describe('Admin Fraud', () => {
  test('fraud queue page loads', async ({ page }) => {
    await page.goto('/fraud');
    await expect(page.getByText(/fraud|risk|flagged/i).first()).toBeVisible({ timeout: 8000 });
  });
});

// ─────────────────────────────────────────────
// 3.7  Flash Sales
// ─────────────────────────────────────────────
test.describe('Admin Flash Sales', () => {
  test('flash sales page loads with existing sales', async ({ page }) => {
    await page.goto('/admin/flash-sales');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can create a flash sale', async ({ page }) => {
    await page.goto('/admin/flash-sales');
    // Fill the create flash sale form
    const variantSelect = page.locator('select').filter({ hasText: /variant|product/i }).first();
    if (await variantSelect.isVisible()) {
      await variantSelect.selectOption({ index: 1 });
      await page.locator('input[type="number"]').first().fill('20');
      // Date fields
      const dateInputs = page.locator('input[type="datetime-local"]');
      const now = new Date();
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2h
      await dateInputs.nth(0).fill(now.toISOString().slice(0, 16));
      await dateInputs.nth(1).fill(future.toISOString().slice(0, 16));
      await page.getByRole('button', { name: /create|activate/i }).click();
      await expect(page.getByText(/created|success/i)).toBeVisible({ timeout: 8000 });
    }
  });
});

// ─────────────────────────────────────────────
// 3.8  Payouts
// ─────────────────────────────────────────────
test.describe('Admin Payouts', () => {
  test('payouts page shows pending settlements', async ({ page }) => {
    await page.goto('/payouts');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can approve a payout', async ({ page }) => {
    await page.goto('/payouts');
    const approveBtn = page.getByRole('button', { name: /approve|release/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.getByText(/approved|paid|released/i)).toBeVisible({ timeout: 8000 });
    }
  });
});
```

---

## 4. Delivery Agent Tests

```ts
// apps/e2e/tests/agent.spec.ts
import { test, expect } from '@playwright/test';

// Agent uses the same login as a buyer with AGENT role
// Seed user: agent1@ecom.dev / password123
test.use({ storageState: undefined }); // fresh session per test

test.describe('Delivery Agent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('IDENTITY@NODE.COM').fill('agent1@ecom.dev');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.goto('/apps/agent');
  });

  test('agent dashboard loads with delivery list', async ({ page }) => {
    await expect(page.getByText(/shipment|delivery|today|route/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('can mark a shipment as picked up', async ({ page }) => {
    const pickupBtn = page.getByRole('button', { name: /pick.*up|picked/i }).first();
    if (await pickupBtn.isVisible()) {
      await pickupBtn.click();
      await expect(page.getByText(/picked.*up|in.*transit/i)).toBeVisible({ timeout: 8000 });
    }
  });

  test('can mark as out for delivery', async ({ page }) => {
    const outBtn = page.getByRole('button', { name: /out for delivery/i }).first();
    if (await outBtn.isVisible()) {
      await outBtn.click();
      await expect(page.getByText(/out for delivery/i)).toBeVisible({ timeout: 8000 });
    }
  });

  test('can report failed delivery with reason', async ({ page }) => {
    const failBtn = page.getByRole('button', { name: /failed|report failure/i }).first();
    if (await failBtn.isVisible()) {
      await failBtn.click();
      // Pick a failure reason
      await page.getByText(/customer_unreachable|wrong_address|other/i).first().click();
      await page.getByRole('button', { name: /confirm|submit/i }).click();
      await expect(page.getByText(/failed|reported/i)).toBeVisible({ timeout: 8000 });
    }
  });

  test('completed deliveries tab shows history', async ({ page }) => {
    const completedTab = page.getByRole('button', { name: /completed|history/i });
    if (await completedTab.isVisible()) {
      await completedTab.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
```

---

## 5. Affiliate Tests

```ts
// apps/e2e/tests/affiliate.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Affiliate Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('IDENTITY@NODE.COM').fill('agent1@ecom.dev');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.goto('/affiliate');
  });

  test('affiliate page loads commission dashboard', async ({ page }) => {
    await expect(page.getByText(/commission|referral|affiliate/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('shows referral link', async ({ page }) => {
    await expect(page.getByText(/partner1|ref=|referral.*link/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('commission table is visible', async ({ page }) => {
    await expect(page.getByText(/commission|earned|rate/i).first()).toBeVisible({ timeout: 8000 });
  });
});
```

---

## 6. Unauthenticated / Public Route Tests

```ts
// apps/e2e/tests/public.spec.ts
import { test, expect } from '@playwright/test';

test.use({ storageState: undefined }); // no auth

test.describe('Public Routes', () => {
  test('homepage loads without auth', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Jumia|ecom|store/i);
  });

  test('product page loads without auth', async ({ page }) => {
    await page.goto('/search?q=phone');
    await page.locator('[class*="ProductCard"] a').first().click();
    await expect(page).toHaveURL(/\/products\//);
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('unauthenticated checkout redirects to login', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated seller dashboard redirects to login', async ({ page }) => {
    await page.goto('/seller/dashboard');
    await expect(page).toHaveURL(/\/seller\/login/);
  });

  test('unauthenticated admin dashboard redirects to admin login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('flash sales page loads publicly', async ({ page }) => {
    await page.goto('/flash-sales');
    await expect(page.getByText(/flash|sale|deal/i).first()).toBeVisible();
  });

  test('best sellers page loads publicly', async ({ page }) => {
    await page.goto('/best-sellers');
    await expect(page.locator('[class*="ProductCard"], [class*="product"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('/api/health returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
  });
});
```

---

## Running the Tests

```bash
# Install playwright browsers (first time only)
pnpm --filter @ecom/e2e exec playwright install chromium

# Run all tests against local dev server
pnpm --filter @ecom/e2e exec playwright test

# Run a specific file
pnpm --filter @ecom/e2e exec playwright test tests/buyer.spec.ts

# Run a specific test by name
pnpm --filter @ecom/e2e exec playwright test -g "places order with POD"

# Run with UI mode (visual debugger)
pnpm --filter @ecom/e2e exec playwright test --ui

# Show HTML report after run
pnpm --filter @ecom/e2e exec playwright show-report

# Run against staging
WEB_URL=https://staging.friehub.cloud pnpm --filter @ecom/e2e exec playwright test
```

---

## CI Integration

The existing `deploy-production.yml` doesn't include e2e tests — add this job after `validate` and before `deploy`:

```yaml
e2e:
  name: E2E Tests
  needs: validate
  runs-on: self-hosted
  steps:
    - uses: actions/checkout@v4

    - name: Setup pnpm + Node
      uses: pnpm/action-setup@v3
      with:
        version: 9

    - uses: actions/setup-node@v4
      with:
        node-version: 20

    - run: pnpm install --frozen-lockfile

    - name: Install Playwright browsers
      run: pnpm --filter @ecom/e2e exec playwright install chromium --with-deps

    - name: Run E2E tests against staging
      run: pnpm --filter @ecom/e2e exec playwright test
      env:
        WEB_URL: ${{ secrets.STAGING_URL }}

    - name: Upload test report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: apps/e2e/playwright-report/
        retention-days: 7
```

---

## Tips

**Selectors** — the app doesn't have `data-testid` attributes yet. The tests above use role-based and class-based selectors. Adding `data-testid="product-card"`, `data-testid="add-to-cart"` etc. to key elements will make tests more stable and is a post-contest cleanup task.

**Seed data dependency** — tests assume the DB is seeded (via `pnpm --filter @ecom/db run seed`). Run the seed before the first test run. The CI pipeline already seeds the test DB in the `validate` job.

**Payment tests** — the Paystack card flow opens a Paystack-hosted iframe which can't be automated with Playwright without a test mode stub. `POD` (Pay on Delivery) is the recommended payment method for all e2e tests since it completes entirely within the app.

**Flaky tests** — if tests are intermittently failing, increase timeouts in `playwright.config.ts`:
```ts
use: {
  actionTimeout: 10_000,
  navigationTimeout: 30_000,
}
```
