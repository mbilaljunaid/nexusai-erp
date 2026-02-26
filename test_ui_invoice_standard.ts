import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';

async function runUITest() {
    console.log("Starting AP Standard Invoice UI Test...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log("1. Starting Login Flow...");
        await page.goto('http://localhost:5002/login');

        await page.waitForSelector('button:has-text("Quick Admin Demo")', { timeout: 10000 });
        await page.getByRole('button', { name: "Quick Admin Demo" }).click();

        console.log("   - Waiting for dashboard redirect...");
        await page.waitForURL('http://localhost:5002/dashboard', { timeout: 10000 });

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Give React state time to persist
        console.log("   - Logged in successfully.");

        console.log("2. Navigating to AP Invoices page via SPA routing...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/finance/ap/invoices');
            window.dispatchEvent(new Event('popstate'));
        });
        await page.waitForTimeout(2000);

        console.log("3. Opening 'Create Invoice' page...");
        await page.waitForSelector('button:has-text("Create Invoice")', { timeout: 15000 });
        await page.getByRole('button', { name: "Create Invoice" }).click();

        await page.waitForTimeout(1000); // Wait for route change to /finance/ap/invoices/new

        console.log("4. Filling UI Form fields (Header)...");
        await page.waitForSelector('text="Invoice Header"');

        // Supplier Select
        console.log("   - Selecting Supplier...");
        await page.click('text="Select Supplier"');
        await page.waitForSelector('[role="option"]');

        // Pick the first option that isn't empty/disabled
        const options = await page.$$('[role="option"]');
        if (options.length > 0) {
            await options[0].click();
        } else {
            throw new Error("No suppliers found in dropdown. A supplier must exist first.");
        }

        const invNumber = `INV-UI-${Date.now()}`;
        console.log(`   - Entering Invoice Number: ${invNumber}`);
        await page.fill('input[placeholder="INV-001"]', invNumber);

        console.log("   - Entering Total Amount...");
        // Use nth(0) because there are multiple inputs with placeholder="0.00" (header amount and line amount)
        const amountInputs = await page.$$('input[placeholder="0.00"]');
        await amountInputs[0].fill('1500.00');

        await page.fill('input[placeholder="Invoice description..."]', 'Standard Consulting Services');

        console.log("5. Filling UI Form fields (Lines)...");
        await page.fill('input[placeholder="Line description..."]', 'Consulting mapping phase 1');
        await amountInputs[1].fill('1500.00');

        console.log("6. Submitting Form...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const saveBtn = buttons.find(b => b.textContent && b.textContent.includes('Save Invoice'));
            if (saveBtn) saveBtn.click();
        });

        console.log("7. Waiting for Success Toast...");
        await page.waitForSelector('text="Invoice created successfully"', { timeout: 10000 });

        console.log("8. Verifying Invoice in UI Table...");
        // Should redirect back to /finance/ap/invoices
        await page.waitForURL('http://localhost:5002/finance/ap/invoices');
        await page.waitForSelector(`text="${invNumber}"`, { timeout: 10000 });

        console.log("✅ AP Standard Invoice UI Data Entry Test PASSED!");
        await page.screenshot({ path: 'invoice_ui_standard_test.png' });
        console.log("   Screenshot saved to invoice_ui_standard_test.png");

    } catch (e: any) {
        console.error("❌ UI TEST FAILED:");
        console.error(e.message || e);
        await page.screenshot({ path: 'invoice_ui_standard_fail.png' });
        const html = await page.content();
        fs.writeFileSync('invoice_ui_standard_fail_dom.html', html);
        console.log("   DOM saved to invoice_ui_standard_fail_dom.html");
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

runUITest();
