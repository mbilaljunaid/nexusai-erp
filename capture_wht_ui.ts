import { chromium } from 'playwright';

async function captureWHT() {
    console.log("Launching browser to capture WHT UI...");
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        // Navigate to Login
        await page.goto('http://localhost:5002/login');
        await page.waitForLoadState('networkidle');

        // Use Quick Admin Demo login
        await page.locator('button', { hasText: 'Quick Admin Demo' }).click();

        // Wait for the dashboard to settle
        await page.waitForURL('**/dashboard*');
        await page.waitForLoadState('networkidle');

        console.log("Logged in successfully. Navigating to WHT Configuration...");

        // Navigate directly to the WHT page to bypass sidebar toggling complexity
        await page.goto('http://localhost:5002/finance/ap/withholding-tax');
        await page.waitForLoadState('networkidle');

        // Explicitly wait for the WHT component header to be visible
        await page.waitForSelector('h2:text("Withholding Tax (WHT) Groups")');

        // Take a screenshot of the initialized state
        const screenshotPath = '/Users/mbjunaid/.gemini/antigravity/brain/c8e3d84d-8e7d-4793-8054-fdb9ec3b86e0/wht_groups_ui.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log("✅ WHT Configuration UI Screenshot saved successfully to:", screenshotPath);
    } catch (error) {
        console.error("Screenshot capture failed:", error);
    } finally {
        await browser.close();
    }
}

captureWHT().catch(console.error);
