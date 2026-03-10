import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';

async function runUITest() {
    console.log("Starting AP Prepayments UI Automation Test...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let prepayNum = `PRE-${Date.now()}`;
    let stdNum = `STD-${Date.now()}`;

    try {
        console.log("1. Starting Login Flow...");
        await page.goto('http://localhost:5002/login');
        await page.waitForSelector('button:has-text("Quick Admin Demo")', { timeout: 10000 });
        await page.getByRole('button', { name: "Quick Admin Demo" }).click();
        await page.waitForURL('http://localhost:5002/dashboard', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Give React state time to persist
        console.log("   - Logged in successfully.");

        // ================= CREATING PREPAYMENT =================
        console.log("2. Navigating to Create Invoice for Prepayment...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/finance/ap/invoices/new');
            window.dispatchEvent(new Event('popstate'));
        });
        await page.waitForTimeout(2000);
        await page.waitForSelector('text="Invoice Header"');

        console.log("   - Selecting Supplier...");
        await page.click('text="Select Supplier"');
        await page.waitForSelector('[role="option"]');
        let options = await page.$$('[role="option"]');
        if (options.length > 0) {
            await options[0].click();
        } else {
            throw new Error("No suppliers found!");
        }

        console.log(`   - Entering Prepayment Number: ${prepayNum}`);
        await page.fill('input[placeholder="INV-001"]', prepayNum);

        console.log("   - Selecting PREPAYMENT type...");
        // Click the trigger that has 'Standard' as current value
        await page.click('text="Standard"');
        await page.waitForSelector('[role="option"]');
        await page.click('text="Prepayment"');

        console.log("   - Entering Total Amount...");
        let amountInputs = await page.$$('input[placeholder="0.00"]');
        await amountInputs[0].fill('2000.00');

        await page.fill('input[placeholder="Invoice description..."]', 'Deposit for custom order');
        await page.fill('input[placeholder="Line description..."]', 'Initial deposit');
        await amountInputs[1].fill('2000.00');

        console.log("   - Submitting Prepayment Form...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const saveBtn = buttons.find(b => b.textContent && b.textContent.includes('Save Invoice'));
            if (saveBtn) saveBtn.click();
        });

        await page.waitForSelector('text="Invoice created successfully"', { timeout: 10000 });

        // ================= CREATING STANDARD INVOICE =================
        console.log("3. Navigating to Create Invoice for Standard Invoice...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/finance/ap/invoices/new');
            window.dispatchEvent(new Event('popstate'));
        });
        await page.waitForTimeout(2000);
        await page.waitForSelector('text="Invoice Header"');

        console.log("   - Selecting Supplier...");
        await page.click('text="Select Supplier"');
        await page.waitForSelector('[role="option"]');
        options = await page.$$('[role="option"]');
        await options[0].click();

        console.log(`   - Entering Standard Invoice Number: ${stdNum}`);
        await page.fill('input[placeholder="INV-001"]', stdNum);

        // Type is already Standard. Keep it.
        console.log("   - Entering Total Amount...");
        amountInputs = await page.$$('input[placeholder="0.00"]');
        await amountInputs[0].fill('5000.00');

        await page.fill('input[placeholder="Invoice description..."]', 'Final delivery');
        await page.fill('input[placeholder="Line description..."]', 'Final items');
        await amountInputs[1].fill('5000.00');

        console.log("   - Submitting Standard Invoice Form...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const saveBtn = buttons.find(b => b.textContent && b.textContent.includes('Save Invoice'));
            if (saveBtn) saveBtn.click();
        });

        await page.waitForSelector('text="Invoice created successfully"', { timeout: 10000 });

        // ================= FETCH DB ID =================
        console.log("4. Fetching Database ID for Standard Invoice...");
        await page.waitForTimeout(2000);
        const stdInvoiceId = await page.evaluate(async (num) => {
            const r = await fetch('/api/ap/invoices?limit=100');
            const d = await r.json();
            const inv = d.data.find((i: any) => i.invoiceNumber === num);
            return inv ? inv.id : null;
        }, stdNum);
        if (!stdInvoiceId) throw new Error("Could not retrieve Standard Invoice ID via API");
        console.log(`   - Found Standard Invoice ID: ${stdInvoiceId}`);

        // ================= APPLY PREPAYMENT =================
        console.log("5. Navigating to Prepayments dashboard to apply prepayments...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/finance/ap/prepayments');
            window.dispatchEvent(new Event('popstate'));
        });
        await page.waitForTimeout(3000);

        console.log("   - Searching table for prepayment row...");
        await page.waitForSelector(`text="${prepayNum}"`, { timeout: 10000 });

        console.log("   - Clicking 'Apply to Invoice'...");
        await page.evaluate((num) => {
            const cells = Array.from(document.querySelectorAll('td'));
            const cell = cells.find(c => c.textContent === num);
            if (cell && cell.parentElement) {
                const btn = cell.parentElement.querySelector('button');
                if (btn) btn.click();
            }
        }, prepayNum);

        console.log("   - Filling application modalities...");
        await page.waitForSelector('text="Apply Prepayment"'); // Dialog title
        await page.fill('input[placeholder="Enter invoice ID"]', stdInvoiceId.toString());
        await page.fill('input[placeholder="0.00"]', '1000.00'); // Applying partial

        console.log("   - Submitting application...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const applyBtn = buttons.find(b => b.textContent === 'Apply');
            if (applyBtn) applyBtn.click();
        });

        await page.waitForSelector('text="Prepayment applied successfully"', { timeout: 10000 });

        console.log("✅ AP Prepayment UI Data Entry Test PASSED!");
        await page.screenshot({ path: 'prepayment_ui_test.png' });
        console.log("   Screenshot saved to prepayment_ui_test.png");

    } catch (e: any) {
        console.error("❌ UI TEST FAILED:");
        console.error(e.message || e);
        await page.screenshot({ path: 'prepayment_ui_fail.png' });
        const html = await page.content();
        fs.writeFileSync('prepayment_ui_fail_dom.html', html);
        console.log("   DOM saved to prepayment_ui_fail_dom.html");
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

runUITest();
