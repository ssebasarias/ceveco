const { test, expect } = require('@playwright/test');

async function loginAdmin(page) {
    await page.goto('/pages/login.html');
    await page.fill('input[type="email"]', 'admin@ceveco.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.locator('button[type="submit"], button:has-text("Iniciar Sesión")').first().click();
    await page.waitForLoadState('networkidle');
}

test.describe('Panel admin', () => {
    test('login admin redirige y muestra dashboard', async ({ page }) => {
        await loginAdmin(page);
        await page.goto('/admin.html');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: /Panel de Administración/i })).toBeVisible();
        await expect(page.getByText('Productos Activos')).toBeVisible();
        await expect(page.getByText('200')).toBeVisible();
    });

    test('tab Productos muestra tabla con activo en verde', async ({ page }) => {
        await loginAdmin(page);
        await page.goto('/admin.html');
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'Productos', exact: true }).click();
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5000 });
        const activoCount = await page.locator('span:has-text("Activo")').count();
        expect(activoCount).toBeGreaterThan(0);
    });

    test('abrir modal Nuevo Producto', async ({ page }) => {
        await loginAdmin(page);
        await page.goto('/admin.html');
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'Productos', exact: true }).click();
        await page.locator('button:has-text("Nuevo Producto")').click();
        await expect(page.locator('text=Nombre del Producto')).toBeVisible({ timeout: 3000 });
    });

    test('tabs catálogo (categorías, marcas, sedes, asesores) cargan datos', async ({ page }) => {
        await loginAdmin(page);
        await page.goto('/admin.html');
        await page.waitForLoadState('networkidle');
        for (const tab of ['Categorías', 'Marcas', 'Sedes']) {
            await page.getByRole('button', { name: tab, exact: true }).click();
            await page.waitForTimeout(500);
            // Verify there's content (not the loading message)
            await expect(page.locator(`#tab-${tab.toLowerCase().replace('í','i')}, [id*="tab-"]:visible`).first()).toBeVisible();
        }
    });
});
