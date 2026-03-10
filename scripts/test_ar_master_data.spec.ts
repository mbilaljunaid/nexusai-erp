import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test('AR Customer Master (TCA) - End-to-End Creation Workflow', async ({ page }) => {
    const uniqueId = randomUUID().substring(0, 8);
    const customerName = `Demo Enterprise ${uniqueId}`;
    const accountName = `US Operations ${uniqueId}`;
    const siteName = `HQ Site ${uniqueId}`;

    // 1. Authentication
    await page.goto('http://localhost:5002/login');
    await page.click('button:has-text("Quick Admin Demo")');
    await expect(page).toHaveURL('http://localhost:5002/dashboard');
    // Network inspector for API failure tracing
    page.on('response', async (response) => {
        if (response.status() >= 400) {
            console.error(`[API ERROR ${response.status()}] ${response.url()}:`, await response.text());
        }
    });

    // 2. Navigation to AR Customers via Sidebar Module Mapping
    await page.waitForTimeout(1000);
    // Diagnostic screenshot
    await page.screenshot({ path: 'dashboard_capture.png', fullPage: true });

    // Expand Finance group
    await page.getByText('Finance', { exact: true }).first().click();
    await page.waitForTimeout(500);
    // Click Customer Master
    await page.locator('a[href="/finance/ar/customers"]').first().click();
    await page.waitForTimeout(1000); // Allow react router to resolve

    await expect(page.getByRole('heading', { name: 'Customer Master (TCA)' })).toBeVisible();

    // 3. Create Customer Party
    await page.click('button:has-text("New Customer")');
    await page.fill('input[name="name"]', customerName);
    await page.click('button:has-text("Save")');
    await expect(page.getByText('Customer Created').first()).toBeVisible();
    await page.mouse.click(10, 10); // Click the Dialog overlay mask to close securely bypassing toast focus
    await page.waitForTimeout(500); // Wait for Dialog animate-out
    await expect(page.locator('td', { hasText: customerName }).first()).toBeVisible({ timeout: 10000 });

    // 4. Select Customer Party & Create Account
    await page.locator('td', { hasText: customerName }).first().click();
    await page.click('button:has-text("New Account")');
    await page.fill('input[name="accountName"]', accountName);
    await page.fill('input[name="accountNumber"]', `ACCT-${uniqueId}`);
    await page.click('button:has-text("Save")');
    await expect(page.getByText('Account Created').first()).toBeVisible();
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);
    await expect(page.locator('td', { hasText: accountName }).first()).toBeVisible({ timeout: 10000 });

    // 5. Select Customer Account & Create Site
    await page.locator('td', { hasText: accountName }).first().click();
    await page.click('button:has-text("New Site")');
    await page.fill('input[name="siteName"]', siteName); // Use siteName as defined
    await page.fill('input[name="address"]', `123 Demo Blvd ${uniqueId}`); // Updated address
    await page.click('button:has-text("Save")');
    await expect(page.getByText('Site Created').first()).toBeVisible(); // Added success toast expectation
    await page.mouse.click(10, 10); // Explicit overlay tap
    await page.waitForTimeout(500);
    await expect(page.locator('td', { hasText: siteName }).first()).toBeVisible({ timeout: 10000 }); // Updated to wait for cell data

    // Terminal log validation mark
    console.log(`✅ AR TCA Master Data Creation successful. Cascade: Party -> Account -> Site for ID: ${uniqueId}`);
});
