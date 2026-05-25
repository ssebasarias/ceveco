const { test, expect } = require('@playwright/test');

test.describe('Home page', () => {
    test('loads with hero, categories, and brand carousel', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Ceveco/i);
        await expect(page.getByRole('heading', { name: /Renueva tu hogar/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Ver catálogo/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Explora Nuestras Categorías/i })).toBeVisible();
        // 4 categorías visible
        await expect(page.locator('a[href*="categoria=electro-hogar"]').first()).toBeVisible();
        await expect(page.locator('a[href*="categoria=motos"]').first()).toBeVisible();
    });

    test('no console errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        expect(errors).toEqual([]);
    });

    test('clicking Ver catálogo navigates to productos', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Ver catálogo/i }).click();
        await expect(page).toHaveURL(/productos\.html/);
    });
});
