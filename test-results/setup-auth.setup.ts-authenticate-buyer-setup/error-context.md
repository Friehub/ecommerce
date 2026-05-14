# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup/auth.setup.ts >> authenticate buyer
- Location: tests/setup/auth.setup.ts:8:6

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test';
  2  | 
  3  | export class LoginPage {
  4  |   readonly page: Page;
  5  |   readonly emailInput: Locator;
  6  |   readonly passwordInput: Locator;
  7  |   readonly loginButton: Locator;
  8  |   readonly errorMessage: Locator;
  9  | 
  10 |   constructor(page: Page) {
  11 |     this.page = page;
  12 |     this.emailInput = page.getByTestId('login-email');
  13 |     this.passwordInput = page.getByTestId('login-password');
  14 |     this.loginButton = page.getByTestId('login-submit');
  15 |     this.errorMessage = page.locator('[role="alert"]');
  16 |   }
  17 | 
  18 |   async goto() {
> 19 |     await this.page.goto('/login');
     |                     ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  20 |   }
  21 | 
  22 |   async login(email: string, pass: string) {
  23 |     await this.emailInput.fill(email);
  24 |     await this.passwordInput.fill(pass);
  25 |     await this.loginButton.click();
  26 |   }
  27 | 
  28 |   async expectLoggedIn() {
  29 |     // Wait for redirection to dashboard or home
  30 |     await expect(this.page).not.toHaveURL(/.*login/);
  31 |   }
  32 | }
  33 | 
```