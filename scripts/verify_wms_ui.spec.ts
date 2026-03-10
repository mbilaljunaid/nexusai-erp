
import { test, expect } from '@playwright/test';

test.describe('WMS UI Verification', () => {
    test.beforeEach(async ({ context, page }) => {
        // Mock the auth check to prevent redirect (even if public, good for state)
        await page.route('/api/auth/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 'test-user', role: 'admin', email: 'test@example.com' }),
            });
        });

        await context.addInitScript(() => {
            window.localStorage.setItem('authToken', 'true');
            window.localStorage.setItem('userId', 'test-user');
            window.localStorage.setItem('userRole', 'admin');
            window.localStorage.setItem('enterpriseRole', 'super_admin');
        });
    });

    test('should load WMS Dashboard', async ({ page }) => {
        await page.goto('/scm/wms/dashboard');
        // Accept either the specific WMS Dashboard title or the generic app title if it hasn't updated yet
        await expect(page.locator('h1')).toContainText(/WMS Executive Insight|WMS Dashboard/);
    });

    test('should load Wave Planning', async ({ page }) => {
        await page.goto('/scm/wms/waves');
        await expect(page.getByText(/Ready Orders|Wave Planning/i)).toBeVisible();
    });

    test('should load Task Console', async ({ page }) => {
        await page.goto('/scm/wms/tasks');
        await expect(page.locator('h1')).toContainText(/Task Console|WMS Tasks/i);
    });

    test('should load Mobile UI', async ({ page }) => {
        await page.goto('/scm/wms/mobile');
        await expect(page.getByText('Warehouse Mobile')).toBeVisible();
        await expect(page.getByText(/Pick Tasks|Picking/i)).toBeVisible();
    });

    test('should load Yard Management', async ({ page }) => {
        await page.goto('/scm/wms/yard');
        await expect(page.locator('h1')).toContainText(/Yard & Dock Management|Yard Management/i);
    });

    test('should load Shipping Hub', async ({ page }) => {
        await page.goto('/scm/wms/shipping');
        await expect(page.locator('h1')).toContainText(/Shipping Workbench|Shipping Hub/i);
    });

    test('should load Labor Performance', async ({ page }) => {
        await page.goto('/scm/wms/labor');
        await expect(page.locator('h1')).toContainText(/Labor Performance/i);
    });

    test('should load Slotting Workbench', async ({ page }) => {
        await page.goto('/scm/wms/slotting');
        await expect(page.locator('h1')).toContainText(/Slotting Workbench/i);
    });
});
