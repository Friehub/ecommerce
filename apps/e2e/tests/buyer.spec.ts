import { test, expect } from '@playwright/test';

test.describe('Buyer Critical Path', () => {
  test('homepage rendering and navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for product cards using stable test-id
    const productCard = page.getByTestId('product-card').first();
    await expect(productCard).toBeVisible();
    await expect(productCard.getByTestId('product-card-title')).toBeVisible();
    await expect(productCard.getByTestId('product-card-price')).toBeVisible();
  });

  test('search and product discovery', async ({ page }) => {
    await page.goto('/');
    
    // Search for a product
    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill('phone');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*q=phone/i);
    await expect(page.getByTestId('product-card').first()).toBeVisible();
  });

  test('product detail and add to cart', async ({ page }) => {
    await page.goto('/');
    
    // Click on the first product
    await page.getByTestId('product-card').first().click();
    await expect(page).toHaveURL(/\/products\//);
    
    // Verify product actions are visible
    await expect(page.getByTestId('add-to-cart-btn')).toBeVisible();
    await expect(page.getByTestId('quantity-value')).toHaveText('1');
    
    // Add to cart
    await page.getByTestId('add-to-cart-btn').click();
    
    // Success toast should be visible (guessing selector for now, or just check URL)
    // Most likely it stays on page but adds to cart context
    await expect(page.getByText(/added to cart|acquisition/i)).toBeVisible();
  });

  test('complete checkout flow (simulated)', async ({ page }) => {
    // 1. Add item to cart
    await page.goto('/');
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-btn').click();
    
    // 2. Go to checkout
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/checkout/);
    
    // 3. Fill address if needed (simulated for now, usually pre-filled for seed buyer)
    // If the "Place Order" button is visible, we click it
    const placeOrderBtn = page.getByTestId('place-order-btn');
    await expect(placeOrderBtn).toBeVisible();
    
    // 4. Execute order
    await placeOrderBtn.click();
    
    // 5. Success redirection
    await expect(page).toHaveURL(/.*success.*/, { timeout: 15000 });
  });
});
