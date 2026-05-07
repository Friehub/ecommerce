import { test as setup } from '@playwright/test';
import { LoginPage } from '../poms/LoginPage';

const authFile = 'apps/e2e/playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  
  // Use test credentials from env
  const email = process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'Password123!';
  
  await loginPage.login(email, password);
  await loginPage.expectLoggedIn();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
