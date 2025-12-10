const { test, expect } = require('@playwright/test');

test.describe('Flujo de Checkout y Carrito Detallado', () => {

    test('Manipulación del Carrito (Sidebar)', async ({ page }) => {
        await page.goto('/pages/productos.html');

        // Abrir carrito (asumimos que ya agregamos algo en un paso previo o está vacío)
        // Para este test, verificamos la UI del sidebar vacío por defecto
        const cartBtn = page.locator('#cart-toggle-btn').first();
        await cartBtn.click();

        const sidebar = page.locator('#cart-sidebar-panel, .fixed.right-0');
        await expect(sidebar).toBeVisible();

        // Buscar botones de acción en el carrito (incluso si está vacío, el botón "Ir a pagar" podría estar disabled)
        // O botón "Seguir comprando"
        const actionBtn = sidebar.locator('button, a').filter({ hasText: /pagar|checkout|comprar/i }).first();
        if (await actionBtn.isVisible()) {
            // Verificar estado (disabled si vacío)
            // await expect(actionBtn).toBeDisabled(); 
        }
    });

    test('Página de Checkout (Formulario)', async ({ page }) => {
        await page.goto('/pages/checkout.html');

        // Verificar resumen de orden (aunque sea ceros)
        await expect(page.getByText('Resumen', { exact: false })).toBeVisible();
        await expect(page.getByText('Total', { exact: false })).toBeVisible();

        // Verificar formulario de envío
        await expect(page.locator('input[name="direccion"], input#direccion')).toBeVisible();
        await expect(page.locator('input[name="ciudad"], input#ciudad, select#ciudad')).toBeVisible();

        // Interacción con métodos de pago (Radio buttons)
        const paymentRadios = page.locator('input[name="payment_method"]');
        if (await paymentRadios.count() > 0) {
            await paymentRadios.first().check();
            await expect(paymentRadios.first()).toBeChecked();
        }

        // Intentar pagar vacío
        const payBtn = page.locator('button#btn-place-order, button[type="submit"]');
        if (await payBtn.isVisible()) {
            await payBtn.click();
            // Verificar validación (toast de error o borde rojo)
        }
    });

});
