const { test, expect } = require('@playwright/test');

test.describe('Auth flow', () => {
    test('login con credenciales válidas', async ({ page }) => {
        await page.goto('/pages/login.html');
        await page.fill('input[type="email"]', 'admin@ceveco.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.locator('button:has-text("Iniciar Sesión")').first().click();
        // After successful login, cookie should be set
        await page.waitForTimeout(1000);
        const cookies = await page.context().cookies();
        const jwt = cookies.find(c => c.name === 'jwt_token');
        expect(jwt).toBeDefined();
        expect(jwt.httpOnly).toBe(true);
    });

    test('login con password incorrecto muestra error', async ({ page }) => {
        await page.goto('/pages/login.html');
        await page.fill('input[type="email"]', 'admin@ceveco.com');
        await page.fill('input[type="password"]', 'WRONG_PASSWORD');
        await page.locator('button:has-text("Iniciar Sesión")').first().click();
        await expect(page.locator('text=/inválid|incorrect|error/i').first()).toBeVisible({ timeout: 3000 });
    });

    test('página de registro carga', async ({ page }) => {
        await page.goto('/pages/registro.html');
        await expect(page.getByRole('heading', { name: /Crear Cuenta/i })).toBeVisible();
    });
});
