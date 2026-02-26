import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';
import { db } from "./server/db";
import { purchaseOrders } from "@shared/schema/scm";
import { desc } from "drizzle-orm";

async function runUITest() {
    console.log("Starting AP Invoice 2-Way Matching UI Automation Test...");

    console.log("1. Fetching Seeded SCM Purchase Order ID...");
    const [po] = await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt)).limit(1);
    const poId = po.id;
    console.log(`   - Retrieved PO ID: ${poId}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let invNum = `INV-PO-${Date.now()}`;

    try {
        console.log("2. Starting Login Flow...");
        await page.goto('http://localhost:5002/login');
        await page.waitForSelector('button:has-text("Quick Admin Demo")', { timeout: 10000 });
        await page.getByRole('button', { name: "Quick Admin Demo" }).click();
        await page.waitForURL('http://localhost:5002/dashboard', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log("   - Logged in successfully.");

        // ================= CREATING INVOICE =================
        console.log("3. Navigating to Create Invoice...");
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

        console.log(`   - Entering Invoice Number: ${invNum}`);
        await page.fill('input[placeholder="INV-001"]', invNum);

        console.log("   - Entering Total Amount (Over PO amount 1000 to trigger variance)...");
        let amountInputs = await page.$$('input[placeholder="0.00"]');
        await amountInputs[0].fill('1200.00'); // Header Amount

        await page.fill('input[placeholder="Invoice description..."]', 'Software License Overage');
        await page.fill('input[placeholder="Line description..."]', 'Licenses');
        await amountInputs[1].fill('1200.00'); // Line Amount

        console.log(`   - Injecting PO ID: ${poId}`);
        await page.fill('input[placeholder="PO ID..."]', poId);

        console.log("   - Submitting Invoice Form...");
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const saveBtn = buttons.find(b => b.textContent && b.textContent.includes('Save Invoice'));
            if (saveBtn) saveBtn.click();
        });

        await page.waitForSelector('text="Invoice created successfully"', { timeout: 10000 });

        // ================= VALIDATING INVOICE =================
        console.log("4. Navigating to Invoices Workbench...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/finance/ap/invoices');
            window.dispatchEvent(new Event('popstate'));
        });
        await page.waitForTimeout(3000);

        console.log(`   - Searching for row with ${invNum}...`);
        await page.waitForSelector(`text="${invNum}"`, { timeout: 10000 });

        console.log("   - Initiating SLA Validation engine on the row...");
        await page.evaluate((num) => {
            const cells = Array.from(document.querySelectorAll('td'));
            const cell = cells.find(c => c.textContent === num);
            if (cell && cell.parentElement) {
                const btn = cell.parentElement.querySelector('button[title="Validate Invoice"]') as HTMLButtonElement | null;
                if (btn) btn.click();
            }
        }, invNum);

        console.log("   - Waiting for native validation response toast...");
        await page.waitForSelector('text="Invoice validated successfully"', { timeout: 10000 });
        await page.waitForTimeout(2000); // Give the UI time to refresh the table and render the View Holds button

        console.log("   - Opening Variance Holds dialog...");
        const clickedHold = await page.evaluate((num) => {
            const cells = Array.from(document.querySelectorAll('td'));
            const cell = cells.find(c => c.textContent === num);
            if (cell && cell.parentElement) {
                const btn = cell.parentElement.querySelector('button[title="View Holds"]') as HTMLButtonElement | null;
                if (btn) {
                    btn.click();
                    return true;
                }
            }
            return false;
        }, invNum);

        if (!clickedHold) throw new Error("Could not find the 'View Holds' button on the invoice row. This means validation did not flag a variance hold as expected!");

        console.log("   - Waiting for PO_MATCH_VARIANCE constraint tag in standard UI...");
        await page.waitForSelector('text="PO_MATCH_VARIANCE"', { timeout: 10000 });

        console.log("✅ AP 2-Way PO Matching & Variance Hold Test PASSED!");
        await page.screenshot({ path: 'matching_variance_ui_test.png' });
        console.log("   Screenshot saved to matching_variance_ui_test.png");

    } catch (e: any) {
        console.error("❌ UI TEST FAILED:");
        console.error(e.message || e);
        await page.screenshot({ path: 'matching_variance_ui_fail.png' });
        const html = await page.content();
        fs.writeFileSync('matching_variance_ui_fail_dom.html', html);
        console.log("   DOM saved to matching_variance_ui_fail_dom.html");
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

runUITest();
