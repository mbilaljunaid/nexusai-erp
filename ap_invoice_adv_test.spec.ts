import { test, expect } from '@playwright/test';

test('create invoice with advanced line fields', async ({ page }) => {
  await page.goto('http://localhost:5002/login');
  await page.click('button:has-text("Quick Login")');
  await page.waitForTimeout(1000);
  
  await page.goto('http://localhost:5002/finance/ap/invoices/new');
  await expect(page.locator('h1:has-text("Create Invoice")')).toBeVisible();

  // Fill Header
  await page.fill('input[placeholder="INV-001"]', `INV-ADV-${Date.now()}`);
  await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
  await page.fill('input[type="number"]', '150'); // Amount

  // Fill Line 1 Advanced Fields
  await page.fill('input[placeholder="Description..."]', 'Test Advanced Line');
  
  // Qty is the first input[placeholder="0"] in the row
  const qtyInput = page.locator('tbody tr:first-child td input[placeholder="0"]');
  await qtyInput.fill('5');
  
  // Wait for React to process
  await page.waitForTimeout(500);

  // Unit Price is the input[placeholder="0.00"] before the readOnly Amount
  const priceInput = page.locator('tbody tr:first-child td input[placeholder="0.00"]').nth(0);
  await priceInput.fill('30');
  
  await page.waitForTimeout(500);

  // Check Track as Asset
  await page.click('tbody tr:first-child input[type="checkbox"]');

  // Submit
  await page.click('button:has-text("Save Invoice")');

  // Should redirect to table
  await expect(page).toHaveURL('http://localhost:5002/finance/ap/invoices');
});
