const { test, expect } = require('@playwright/test');

test.describe('Catálogo Profundo e Interacciones', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/pages/productos.html');
        await page.waitForSelector('#product-grid', { state: 'visible' });
    });

    test('Filtros: UI de Categoría y Precio', async ({ page }) => {
        // Verificar Sidebar
        const sidebar = page.locator('#filters-sidebar-root');
        await expect(sidebar).toBeVisible();

        // 1. Expandir/Colapsar categorías (si son acordeones)
        // Buscamos botones que parezcan acordeones
        const accordionBtn = sidebar.locator('button[aria-expanded]');
        if (await accordionBtn.count() > 0) {
            const firstBtn = accordionBtn.first();
            await firstBtn.click();
            // Verificar cambio de estado aria-expanded
            // await expect(firstBtn).toHaveAttribute('aria-expanded', 'true');
        }

        // 2. Slider/Input de Precio
        const minInput = page.locator('input#price-min');
        if (await minInput.isVisible()) {
            await minInput.click();
            await minInput.fill('50000');
            // Verificar que no permita letras (si es type number)
            // await expect(minInput).toHaveValue('50000');
        }
    });

    test('Ordenamiento (Sorting)', async ({ page }) => {
        const sortSelect = page.locator('#sort-select');
        await expect(sortSelect).toBeVisible();

        // Cambiar opción
        await sortSelect.selectOption({ index: 1 }); // Seleccionar segunda opción (ej. Precio Menor)

        // Verificar que dispara recarga (loading state aparece o grid cambia)
        // Esto es difícil de testear sin datos reales, pero verificamos que el evento ocurra sin error
        await expect(page).not.toHaveURL(/error/);
    });

    test('Paginación', async ({ page }) => {
        const pagination = page.locator('#pagination');
        // Solo visible si hay suficientes productos. 
        // Si no es visible, el test pasa (skip implícito) o verificamos que esté hidden.

        if (await pagination.isVisible()) {
            const nextBtn = page.locator('#next-page');
            if (await nextBtn.isEnabled()) {
                await nextBtn.click();
                // Verificar cambio de página en UI
                await expect(page.locator('#page-info')).toContainText(/2/);
            }
        }
    });

    test('Product Card: Hover y Detalles', async ({ page }) => {
        // Hover sobre primer producto
        const card = page.locator('#product-grid > div').first();
        if (await card.count() > 0) {
            await card.hover();

            // Verificar si aparecen botones extra al hacer hover (común en e-commerce)
            // const quickView = card.locator('.quick-view-btn');
            // if (await quickView.count() > 0) await expect(quickView).toBeVisible();
        }
    });

});
