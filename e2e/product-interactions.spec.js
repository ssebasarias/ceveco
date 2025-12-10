const { test, expect } = require('@playwright/test');

test.describe('Interacciones con Productos', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/pages/productos.html');
        // Esperamos a que el grid tenga al menos un hijo directo (div)
        // Esto confirma que el fetch de productos terminó y renderizó algo.
        await page.waitForSelector('#product-grid > div', { state: 'visible', timeout: 20000 });
    });

    test('Cards de producto tienen elementos interactivos', async ({ page }) => {
        const firstCard = page.locator('#product-grid > div').first();

        await expect(firstCard.locator('h3')).toBeVisible(); // Título
        await expect(firstCard.locator('button, .js-add-to-cart')).toBeVisible(); // Botón agregar
    });

    test('Agregar producto al carrito actualiza el contador', async ({ page }) => {
        // Obtenemos contador inicial
        // Usamos selector JS exacto si posible, o genérico robusto
        const badge = page.locator('#cart-count');
        const countBefore = await badge.isVisible() ? await badge.innerText() : '0';

        // Clic en agregar (primer producto)
        // Buscamos botón que tenga texto "Agregar" o icono de carrito
        const addBtn = page.locator('#product-grid button').first();
        await addBtn.click();

        // Esperar cambio
        // Puede tardar un poco la animación o actualización del DOM
        await expect(async () => {
            const countAfter = await badge.innerText();
            expect(Number(countAfter)).toBeGreaterThan(Number(countBefore));
        }).toPass({ timeout: 5000 });
    });

});
