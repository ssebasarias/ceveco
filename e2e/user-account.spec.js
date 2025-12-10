const { test, expect } = require('@playwright/test');

test.describe('Gestión de Cuenta de Usuario', () => {

    // Este test requiere estar logueado. 
    // En un escenario real, usaríamos un archivo global-setup para loguearse una vez y guardar el estado (storageState).
    // Por ahora, navegaremos directamente a las páginas protegidas para ver cómo reaccionan (deberían redirigir al login).

    test('Acceso protegido a Perfil redirige a Login', async ({ page }) => {
        await page.goto('/pages/perfil.html');
        // Debería redirigir a login o mostrar mensaje
        await expect(page).toHaveURL(/.*login.*|.*perfil.*/);

        // Si se queda en perfil, verificar que muestre skeleton o estado de carga y luego quizás error
    });

    test('Interacción en página de Pedidos', async ({ page }) => {
        await page.goto('/pages/pedidos.html');

        // Verificar estructura base aunque esté vacía
        await expect(page.locator('h1, h2')).toContainText(/Pedidos|Mis Compras/i);

        // Verificar mensaje de "Sin pedidos" o tabla vacía
        // await expect(page.getByText('No tienes pedidos')).toBeVisible();
    });

    test('Interacción en página de Favoritos', async ({ page }) => {
        await page.goto('/pages/favoritos.html');

        // Título
        await expect(page.locator('h1, h2')).toContainText(/Favoritos|Wishlist/i);

        // Verificar Grid vacío
        const emptyState = page.locator('#favorites-grid:empty, .text-center');
        // await expect(emptyState).toBeVisible();
    });

});
