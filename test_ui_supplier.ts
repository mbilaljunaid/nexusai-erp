import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';

async function runUITest() {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log("1. Starting Login Flow...");
        // Go explicitly to the login page first
        await page.goto('http://localhost:5002/login');

        console.log("   - Waiting for Quick Admin Demo button...");
        await page.waitForSelector('button:has-text("Quick Admin Demo")', { timeout: 10000 });

        console.log("   - Clicking Quick Admin Demo...");
        await page.getByRole('button', { name: "Quick Admin Demo" }).click();

        // Wait for redirect to dashboard
        console.log("   - Waiting for dashboard redirect...");
        await page.waitForURL('http://localhost:5002/dashboard', { timeout: 10000 });

        // Ensure the full dashboard is loaded and state is persisted
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Give React state time to persist
        console.log("   - Logged in successfully.");

        console.log("2. Navigating to Suppliers page via SPA routing...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/finance/ap/suppliers');
            window.dispatchEvent(new Event('popstate'));
        });
        await page.waitForTimeout(2000);
        await page.waitForTimeout(1000);

        console.log("3. Opening 'Create Supplier' dialog...");
        await page.waitForSelector('button:has-text("Create Supplier")', { timeout: 15000 });
        await page.getByRole('button', { name: "Create Supplier" }).click();

        console.log("4. Filling UI Form fields (Header & Site with Banking)...");
        await page.waitForSelector('text="Create Supplier"');

        await page.fill('input#supplierNumber', `VND-UI-${Date.now()}`);
        await page.fill('input#name', 'Meridian Supply Co');
        await page.fill('input#taxId', '98-7654321');

        // Wait for site details section rendered
        await page.waitForSelector('input#siteName');
        await page.fill('input#siteName', 'HEADQUARTERS');
        await page.fill('input#address', '456 Commerce Ave, Chicago IL 60601');
        await page.fill('input#iban', 'GB29NWBK60161331926819');
        await page.fill('input#swiftCode', 'NWBKGB2L');

        console.log("5. Submitting Form...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const createBtn = buttons.find(b => b.textContent === 'Create');
            if (createBtn) createBtn.click();
        });

        console.log("6. Waiting for Success Toast...");
        await page.waitForSelector('text="Supplier created successfully"', { timeout: 10000 });

        console.log("7. Verifying Supplier in UI Table...");
        // Close dialog if needed or wait for it to disappear
        await page.waitForSelector('text="Meridian Supply Co"', { timeout: 10000 });

        console.log("✅ UI Data Entry Test PASSED!");
        await page.screenshot({ path: 'supplier_ui_master_test.png' });
        console.log("   Screenshot saved to supplier_ui_master_test.png");

    } catch (e: any) {
        console.error("❌ UI TEST FAILED:");
        console.error(e.message || e);
        await page.screenshot({ path: 'supplier_ui_fail.png' });
        const html = await page.content();
        fs.writeFileSync('supplier_ui_fail_dom.html', html);
        console.log("   DOM saved to supplier_ui_fail_dom.html");
    } finally {
        await browser.close();
    }
}

runUITest();
