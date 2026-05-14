# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup/auth.setup.ts >> authenticate seller
- Location: tests/setup/auth.setup.ts:16:6

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/seller/login
Call log:
  - navigating to "http://localhost:3000/seller/login", waiting until "load"

```

# Test source

```ts
  1  | import { test as setup } from '@playwright/test';
  2  | import { LoginPage } from '../../poms/LoginPage';
  3  | import path from 'path';
  4  | 
  5  | const authFile = (name: string) =>
  6  |   path.join(__dirname, `../playwright/.auth/${name}.json`);
  7  | 
  8  | setup('authenticate buyer', async ({ page }) => {
  9  |   const loginPage = new LoginPage(page);
  10 |   await loginPage.goto();
  11 |   await loginPage.login('buyer1@ecom.dev', 'password123');
  12 |   await loginPage.expectLoggedIn();
  13 |   await page.context().storageState({ path: authFile('buyer') });
  14 | });
  15 | 
  16 | setup('authenticate seller', async ({ page }) => {
  17 |   const loginPage = new LoginPage(page);
> 18 |   await page.goto('/seller/login');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/seller/login
  19 |   // Seller login might be different, but for now let's assume it works with the same POM if selectors match
  20 |   // Actually, seller login has its own page, let's just use raw locator for now if POM doesn't fit
  21 |   await page.getByTestId('login-email').fill('seller1@ecom.dev');
  22 |   await page.getByTestId('login-password').fill('password123');
  23 |   await page.getByTestId('login-submit').click();
  24 |   await page.waitForURL('/seller/dashboard');
  25 |   await page.context().storageState({ path: authFile('seller') });
  26 | });
  27 | 
```