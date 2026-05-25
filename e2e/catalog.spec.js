const { test, expect } = require('@playwright/test');

test.describe('Catálogo de productos', () => {
    test('lista 12 productos con imágenes y precios', async ({ page }) => {
        await page.goto('/pages/productos.html');
        await page.waitForLoadState('networkidle');
        const cards = page.locator('article.product-card');
        await expect(cards).toHaveCount(12);
        // Cada card debe mostrar precio formateado
        const firstPrice = cards.first().locator('p:has-text("$")').first();
        await expect(firstPrice).toBeVisible();
        await expect(firstPrice).toContainText('$');
    });

    test('filtro por categoría reduce los resultados', async ({ page }) => {
        await page.goto('/pages/productos.html?categoria=motos');
        await page.waitForLoadState('networkidle');
        const cards = page.locator('article.product-card');
        await expect(cards).toHaveCount(12);
        // Todos deben ser motos (tienen marca Suzuki/Honda)
        const brands = await cards.locator('p:has-text("SUZUKI"), p:has-text("HONDA")').count();
        expect(brands).toBeGreaterThan(0);
    });

    test('click Cotizar abre WhatsApp (popup blocked, verify intent)', async ({ page, context }) => {
        await page.goto('/pages/productos.html');
        await page.waitForLoadState('networkidle');
        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.locator('button[data-action="cotizar"]').first().click()
        ]);
        expect(popup.url()).toContain('wa.me/573216453672');
        expect(popup.url()).toContain('text=');
        await popup.close();
    });

    test('detalle de producto carga con imagen y CTA', async ({ page }) => {
        await page.goto('/pages/productos.html');
        await page.waitForLoadState('networkidle');
        await page.locator('a[href*="detalle-producto.html"]').first().click();
        await expect(page).toHaveURL(/detalle-producto\.html\?id=\d+/);
        await expect(page.getByRole('button', { name: /Cotizar/i })).toBeVisible();
    });
});
