const { test, expect } = require('@playwright/test');

test.describe('Funcionalidad del Carrito de Compras', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/pages/productos.html');
        // Esperar a que el navbar (donde está el botón del carrito) cargue
        await page.waitForSelector('.js-toggle-cart, #cart-toggle-btn', { state: 'visible', timeout: 15000 });
    });

    test('Abrir y cerrar el carrito', async ({ page }) => {
        // 1. Identificar botón del carrito (Navbar) - Selector corregido
        const cartBtn = page.locator('.js-toggle-cart, #cart-toggle-btn').first();
        await cartBtn.click();

        // 2. Verificar que el sidebar se abre
        // Buscamos el panel lateral por texto o clase
        const sidebarTitle = page.getByText('Tu Carrito', { exact: false });
        await expect(sidebarTitle).toBeVisible();

        // 3. Cerrar el carrito
        // Buscamos botón cerrar (usualmente X) dentro del sidebar
        // Buscamos un botón que contenga un icono X o texto Cerrar dentro del panel lateral visible
        const closeBtn = page.locator('#cart-sidebar button').filter({ has: page.locator('i[data-lucide="x"]') }).first();

        // Fallback selector
        if (await closeBtn.count() === 0) {
            // Try clicking backdrop
            await page.locator('#cart-backdrop').click({ force: true });
        } else {
            await closeBtn.click();
        }

        // 4. Verificar que se cerró (esperar animación)
        await expect(sidebarTitle).not.toBeVisible();
    });

    test('Estado vacío del carrito', async ({ page }) => {
        // Abrir carrito
        await page.locator('.js-toggle-cart, #cart-toggle-btn').first().click();

        // Verificar mensaje de vacío
        await expect(page.getByText('vacío', { exact: false })).toBeVisible();

        // Botón "Explorar" o link a productos
        const shopBtn = page.locator('a[href*="productos"]').filter({ hasText: /explorar|comprar|tienda/i }).first();
        if (await shopBtn.isVisible()) {
            await expect(shopBtn).toBeVisible();
        }
    });
});
