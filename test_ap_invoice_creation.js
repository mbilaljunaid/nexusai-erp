import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        console.log("Navigating to app...");
        await page.goto('http://localhost:5002');
        
        console.log("Logging in via Quick Admin Demo...");
        await page.click('button:has-text("Quick Admin Demo")');
        await page.waitForTimeout(2000);
        
        console.log("Navigating to AP Invoices...");
        await page.goto('http://localhost:5002/finance/ap/invoices');
        await page.waitForLoadState('networkidle');
        
        console.log("Clicking Create Invoice...");
        await page.click('button:has-text("Create Invoice")');
        await page.waitForTimeout(1000);
        
        console.log("Filling Invoice Form...");
        // Supplier Dropdown
        await page.click('button[role="combobox"]');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        
        // Form Fields
        await page.fill('input[placeholder="INV-2024-001"]', 'INV-TEST-MANUAL');
        await page.fill('input[type="number"]:first-of-type', '5000'); // Total Amount
        
        // Add Line
        await page.fill('input[placeholder="Line description"]', 'Test Execution Line Item');
        await page.fill('input[placeholder="Amount"]', '5000');
        
        console.log("Saving Invoice...");
        await page.click('button:has-text("Save Invoice")');
        
        // Wait for potential redirect or toast
        await page.waitForTimeout(3000);
        
        console.log("Testing complete. Checking URL...");
        console.log("Current URL after save:", page.url());
        
        const screenshotPath = '/Users/mbjunaid/.gemini/antigravity/brain/c8e3d84d-8e7d-4793-8054-fdb9ec3b86e0/manual_invoice_test.png';
        await page.screenshot({ path: screenshotPath });
        console.log(`Saved screenshot to ${screenshotPath}`);
        
    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        await browser.close();
    }
})();
