import { test, expect } from '@playwright/test';

test('create invoice with advanced line fields and supplier site', async ({ page }) => {
  await page.goto('http://localhost:5002/login');
  await page.click('button:has-text("Quick Admin Demo")');
  await page.waitForTimeout(1000);
  
  await page.goto('http://localhost:5002/finance/ap/invoices/new');
  await expect(page.locator('h1:has-text("Create Invoice")')).toBeVisible();

  // Wait for suppliers to load
  await page.waitForTimeout(2000);

  // Fill Header
  await page.click('button[role="combobox"]:has-text("Select Supplier")');
  // Just click the very first available supplier
  await page.locator('div[role="option"]').first().click();

  await page.waitForTimeout(1500); // Give sites time to load
  
  await page.click('button[role="combobox"]:has-text("Select Site")');
  await page.waitForTimeout(500);
  
  // Pick the first site dynamically
  await page.locator('div[role="option"]').first().click();

  await page.fill('input[placeholder="INV-001"]', `INV-ADV-${Date.now()}`);
  await page.fill('input[type="date"]:first-of-type', new Date().toISOString().split('T')[0]);
  const invoiceAmountStr = '150';
  await page.fill('input[placeholder="0.00"]:first-of-type', invoiceAmountStr);

  await page.waitForTimeout(500);

  // Fill Line 1 Advanced Fields
  await page.fill('input[placeholder="Invoice description..."]', 'Test Advanced Header');
  await page.fill('tbody tr:first-child td input[placeholder="Description..."]', 'Test Advanced Line');
  
  const qtyInput = page.locator('tbody tr:first-child td input[placeholder="0"]');
  await qtyInput.fill('5');
  
  await page.waitForTimeout(500);

  const priceInput = page.locator('tbody tr:first-child td input[placeholder="0.00"]').nth(0);
  await priceInput.fill('30');
  
  await page.waitForTimeout(500);

  // Check Track as Asset
  await page.click('tbody tr:first-child input[type="checkbox"]');

  // Submit
  await page.click('button:has-text("Save Invoice")');

  // Wait for request and redirect
  const response = await page.waitForResponse(r => r.url().includes('/api/finance/ap/invoices') && r.request().method() === 'POST');
  expect(response.status()).toBe(201); // Created

  await page.waitForURL('**/finance/ap/invoices**');
  await expect(page.locator('h1:has-text("AP Invoices")')).toBeVisible();
});
