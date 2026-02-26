import { chromium, expect } from '@playwright/test';
import { db } from './server/db.ts';
import { apInvoices, apPaymentBatches } from './shared/schema.ts';
import { sql, eq } from 'drizzle-orm';

async function runUITest() {
    console.log("Seeding mock invoices...");
    await db.execute(sql`UPDATE ap_invoices SET payment_status = 'UNPAID', validation_status = 'VALIDATED' WHERE id IN (SELECT id FROM ap_invoices LIMIT 2)`);
    console.log("Starting UI Test: PPR Payment Batches with ISO20022...");

    const browser = await chromium.launch({ headless: true });
    // IMPORTANT: To catch downloads, we must use acceptDownloads: true
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
    const page = await context.newPage();

    try {
        console.log("Logging in via UI...");
        await page.goto('http://localhost:5002/login');
        await page.locator('button', { hasText: 'Quick Admin Demo' }).click();
        await page.waitForURL('**/dashboard*');
        console.log("Login successful.");

        console.log("Navigating to AP Payment Batches...");
        // Fast JS programmatic routing into the active Wouter session
        await page.evaluate(() => { window.history.pushState({}, '', '/finance/ap/payments'); window.dispatchEvent(new Event('popstate')); });

        console.log("Waiting for AP Payment Batches module to render...");
        await page.waitForSelector('h1:text("Payment Batches")', { timeout: 15000 });

        await page.locator('button', { hasText: 'Create Batch' }).click();
        await page.waitForSelector('h2:text("Create Payment Batch")');

        const uniqueId = Date.now().toString().slice(-6);
        const batchName = `ISO20022 TEST BATCH ${uniqueId}`;

        await page.locator('input[id="batchName"]').fill(batchName);
        await page.locator('input[id="bankAccountId"]').fill("Operating Account HQ");

        await page.locator('button', { hasText: 'Create Batch' }).last().click();

        // Wait for the dialog to close
        await expect(page.locator('h2:text("Create Payment Batch")')).toBeHidden({ timeout: 5000 });

        console.log(`Waiting for row with Batch Name: ${batchName}...`);

        // Wait dynamically on the backend until it's inserted
        let insertedBatch = null;
        for (let i = 0; i < 30; i++) {
            const res = await db.select().from(apPaymentBatches).where(eq(apPaymentBatches.batchName, batchName)).limit(1);
            if (res.length > 0) {
                insertedBatch = res[0];
                break;
            }
            await new Promise(r => setTimeout(r, 500));
        }

        if (!insertedBatch) throw new Error("Batch was not created in the database.");

        const row = page.locator(`tr:has(td:text-is("${batchName}"))`);
        await row.waitFor({ state: 'visible', timeout: 10000 });

        console.log("Triggering UI actions...");
        await row.locator('button', { hasText: 'Select Invoices' }).click({ force: true });
        await row.locator('button', { hasText: 'Confirm' }).waitFor({ state: 'visible', timeout: 10000 });
        await row.locator('button', { hasText: 'Confirm' }).click({ force: true });

        console.log("Waiting for backend SLA Worker via Drizzle polling...");
        let isConfirmed = false;
        for (let i = 0; i < 40; i++) {
            const res = await db.select().from(apPaymentBatches).where(eq(apPaymentBatches.batchName, batchName)).limit(1);
            if (res.length > 0 && res[0].status === 'CONFIRMED') {
                isConfirmed = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!isConfirmed) throw new Error("Backend SLA Worker failed to CONFIRM the batch within 40 seconds.");
        console.log("Backend confirmed. Hopping UI modules to guarantee fresh React State...");

        // Unmount component 1 to discard React Query visual cache
        await page.evaluate(() => { window.history.pushState({}, '', '/finance/ap'); window.dispatchEvent(new Event('popstate')); });
        await page.waitForTimeout(1000);

        // Remount component 2 to forcefully trigger fetch()
        await page.evaluate(() => { window.history.pushState({}, '', '/finance/ap/payments'); window.dispatchEvent(new Event('popstate')); });
        await page.waitForSelector('h1:text("Payment Batches")', { timeout: 15000 });

        const newRow = page.locator(`tr:has(td:text-is("${batchName}"))`);

        console.log("Asserting ISO20022 Button Visibility...");
        await newRow.locator('button', { hasText: 'ISO20022' }).waitFor({ state: 'visible', timeout: 10000 });

        console.log("Triggering ISO20022 XML Download...");
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            newRow.locator('button', { hasText: 'ISO20022' }).click({ force: true })
        ]);

        const fileName = download.suggestedFilename();
        console.log(`✅ Success: Downloaded file - ${fileName}`);
        await page.screenshot({ path: '/Users/mbjunaid/.gemini/antigravity/brain/c8e3d84d-8e7d-4793-8054-fdb9ec3b86e0/ui_payment_batch_iso20022.png' });

    } catch (err) {
        console.error("❌ UI Test Failed:", err);
        await page.screenshot({ path: '/Users/mbjunaid/.gemini/antigravity/brain/c8e3d84d-8e7d-4793-8054-fdb9ec3b86e0/debug_payment_batches.png' });
        process.exit(1);
    } finally {
        await browser.close();
    }
}

runUITest();
