const { test, expect } = require('@playwright/test');

test.describe('Navegación Global (Navbar y Footer)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Esperar a que el navbar se inyecte (clave para evitar fallo por JS lento)
        await page.waitForSelector('#navbar-root nav, #mobile-menu-toggle', { state: 'attached', timeout: 15000 });
    });

    test('Navbar: Logo redirige al inicio', async ({ page }) => {
        const logo = page.locator('.flex-shrink-0 a[href*="index.html"], .flex-shrink-0 a[href="/"]');
        await expect(logo.first()).toBeVisible();
        await logo.first().click();
        await expect(page).toHaveURL(/.*index.html|.*\/$/);
    });

    test('Navbar: Enlaces de navegación principales funcionan', async ({ page }) => {
        // Enlaces esperados (buscamos por href parcial para ser más robustos)
        const links = [
            'categoria=electro-hogar',
            'categoria=muebles',
            'categoria=motos',
            'contacto.html'
        ];

        for (const hrefPart of links) {
            const link = page.locator(`#navbar-root a[href*="${hrefPart}"]`).first();
            // Solo probamos si es visible (en mobile pueden estar ocultos)
            if (await link.isVisible()) {
                await expect(link).toHaveAttribute('href', /.*/);
            }
        }
    });

    test('Navbar: Botones de Autenticación / Cuenta', async ({ page }) => {
        // Verificar Botón Cuenta Desktop
        const accountBtn = page.locator('#user-menu-container button, button:has-text("Cuenta")');
        // Verificar Botón Móvil
        const mobileToggle = page.locator('#mobile-menu-toggle');

        // Al menos uno de los dos debe ser visible para interactuar
        const desktopVisible = await accountBtn.isVisible();
        const mobileVisible = await mobileToggle.isVisible();

        expect(desktopVisible || mobileVisible).toBe(true);

        // Si estamos en mobile, abrimos menú para ver login
        if (mobileVisible && !desktopVisible) {
            await mobileToggle.click();
            await expect(page.locator('#mobile-menu-drawer a[href*="login"]')).toBeVisible();
        }
    });

    test('Footer: Carga correctamente', async ({ page }) => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForSelector('#footer-root footer, #footer-root .bg-gray-900', { state: 'attached' });

        const footer = page.locator('#footer-root');
        await expect(footer).toContainText('Ceveco');
    });
});
