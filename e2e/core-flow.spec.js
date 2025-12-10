const { test, expect } = require('@playwright/test');

test.describe('Flujo Principal de Usuario', () => {

    test('La página de inicio carga correctamente', async ({ page }) => {
        // 1. Ir al Home
        await page.goto('/pages/index.html');

        // 2. Verificar título
        await expect(page).toHaveTitle(/Ceveco/);

        // 3. Verificar que el Hero Banner es visible
        const heroImage = page.locator('#hero-image');
        await expect(heroImage).toBeVisible();

        // 4. Verificar enlaces a categorías
        const electroLink = page.locator('a[href*="electro-hogar"]');
        await expect(electroLink).toBeVisible();
    });

    test('Navegación al catálogo y carga de productos', async ({ page }) => {
        // 1. Ir a productos
        await page.goto('/pages/productos.html');

        // 2. Esperar a que desaparezca el loader
        await expect(page.locator('#loading-state')).not.toBeVisible();

        // 3. Verificar que el grid de productos tenga elementos
        // Esperamos a que al menos un producto se renderice
        // Nota: Depende de que el backend tenga datos.
        // Si falla aquí es porque no hay productos o falló el fetch.
        const productGrid = page.locator('#product-grid');
        await expect(productGrid).toBeVisible();

        // Opcional: Verificar si hay tarjetas de producto
        // const products = page.locator('.product-card, [data-product-id]'); 
        // await expect(products.first()).toBeVisible();
    });

    test('Funcionalidad de Búsqueda', async ({ page }) => {
        await page.goto('/pages/productos.html');

        // 1. Escribir en el buscador (si existe en el navbar)
        // Asumimos que el navbar cargó y tiene un input id="search-input"
        const searchInput = page.locator('#search-input');

        // Verifica si el input está visible (el navbar carga dinámicamente)
        await expect(searchInput).toBeVisible({ timeout: 5000 });

        // 2. Buscar algo genérico
        await searchInput.fill('Samsung');
        await searchInput.press('Enter');

        // 3. Verificar que la URL cambió
        await expect(page).toHaveURL(/.*q=Samsung/);

        // 4. Verificar título de resultados
        // "Resultados para..."
        await expect(page.locator('#catalog-title')).toContainText('Resultados para');
    });

});
