import { chromium, expect } from '@playwright/test';

async function runUITest() {
    console.log("Starting UI Test: Treasury Bank Account Connectivity...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        console.log("Logging in via UI...");
        await page.goto('http://localhost:5002/login');
        await page.locator('button', { hasText: 'Quick Admin Demo' }).click();
        await page.waitForURL('**/dashboard*');
        await page.waitForLoadState('networkidle');
        console.log("Login successful.");

        console.log("Navigating to Treasury via SPA injection...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/finance/treasury/bank-accounts');
            window.dispatchEvent(new Event('popstate'));
        });

        console.log("Waiting for Treasury Bank Accounts module to render...");
        await page.waitForSelector('h1:text("Treasury Bank Accounts")', { timeout: 15000 });
        console.log("Module rendered successfully. Proceeding with form...");

        await page.locator('button', { hasText: 'Create Account' }).click();
        await page.waitForSelector('h2:text("Add Treasury Bank Account")');

        const uniqueId = Date.now().toString().slice(-6);
        const bankName = `CHASE UI TEST ${uniqueId}`;
        const accountNum = `US${uniqueId}CHAS123456`;
        const swift = `CHAS${uniqueId}`;

        await page.locator('input[placeholder="JPMorgan Chase, Citibank, etc."]').fill(bankName);
        await page.locator('input[placeholder="USXX CHAS... / GB82..."]').fill(accountNum);
        await page.locator('input[placeholder="CHASUS33"]').fill(swift);
        await page.locator('input[placeholder="0.00"]').fill("5000000"); // 5 million initial balance

        await page.locator('button', { hasText: 'Save Account' }).click();

        await expect(page.locator('h2:text("Add Treasury Bank Account")')).toBeHidden({ timeout: 5000 });
        await page.waitForSelector(`td:has-text("${bankName}")`);

        console.log(`✅ Success: Bank Account ${bankName} created and verified in UI table.`);
        await page.screenshot({ path: '/Users/mbjunaid/.gemini/antigravity/brain/c8e3d84d-8e7d-4793-8054-fdb9ec3b86e0/ui_treasury_bank_test.png' });

    } catch (err) {
        console.error("❌ UI Test Failed:", err);
        await page.screenshot({ path: '/Users/mbjunaid/.gemini/antigravity/brain/c8e3d84d-8e7d-4793-8054-fdb9ec3b86e0/debug_treasury_ui.png' });
        process.exit(1);
    } finally {
        await browser.close();
    }
}

runUITest();
