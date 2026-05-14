import { test as setup } from '@playwright/test';
import { LoginPage } from '../../poms/LoginPage';
import path from 'path';

const authFile = (name: string) =>
  path.join(__dirname, `../playwright/.auth/${name}.json`);

setup('authenticate buyer', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('buyer1@ecom.dev', 'password123');
  await loginPage.expectLoggedIn();
  await page.context().storageState({ path: authFile('buyer') });
});

setup('authenticate seller', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/seller/login');
  // Seller login might be different, but for now let's assume it works with the same POM if selectors match
  // Actually, seller login has its own page, let's just use raw locator for now if POM doesn't fit
  await page.getByTestId('login-email').fill('seller1@ecom.dev');
  await page.getByTestId('login-password').fill('password123');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('/seller/dashboard');
  await page.context().storageState({ path: authFile('seller') });
});
