import { test, expect } from '@playwright/test';

test.describe('Buyer Flows', () => {
  test('should see products on the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check for product grid or list
    const productCards = page.locator('.product-card');
    await expect(productCards.first()).toBeVisible();
  });

  test('should be able to search for a product', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Phone');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*q=Phone/);
  });
});
