const { test, expect } = require('@playwright/test');

test.describe('Pruebas Completas de Interacción en Index', () => {
    // Force desktop viewport
    test.use({ viewport: { width: 1280, height: 720 } });

    test.beforeEach(async ({ page }) => {
        // Navegar al inicio antes de cada test
        // Usamos /pages/index.html ya que es donde reside el archivo físico según exploración
        // O si el servidor lo mapea a la raíz, podríamos intentar '/'
        // Dado el setup de express static, '/pages/index.html' es seguro.
        await page.goto('/pages/index.html');
        // Esperar a que la página cargue completamente
        await page.waitForLoadState('networkidle');
        console.log('Page loaded:', page.url());

        // Check if Core JS loaded
        const coreLoaded = await page.evaluate(() => !!window.renderProductCard);
        expect(coreLoaded, 'ceveco-core.js should be loaded').toBeTruthy();
    });

    test('Header y Navbar: Elementos Críticos Visibles y Funcionales', async ({ page }) => {
        // 1. Verificar Inyección del Navbar
        const navbarRoot = page.locator('#navbar-root');
        await expect(navbarRoot).toBeVisible();

        // Esperar inyección (Soft assertion)
        const injected = await expect(async () => {
            const html = await navbarRoot.innerHTML();
            expect(html.length).toBeGreaterThan(100);
        }).toPass({ timeout: 5000 }).then(() => true).catch(() => false);

        expect.soft(injected, 'Navbar Content Injected').toBeTruthy();

        if (injected) {
            // 2. Verificar Menú de Navegación (Responsive)
            const nav = page.locator('nav').first();
            const mobileToggle = page.locator('#mobile-menu-toggle');

            if (await nav.isVisible()) {
                await expect.soft(nav).toBeVisible();
                const link = nav.locator('a[href*="productos.html"]').first();
                await expect.soft(link).toBeVisible();
            } else {
                await expect.soft(mobileToggle).toBeVisible();
            }

            // 3. Iconos
            const cartButton = page.locator('.js-toggle-cart');
            await expect.soft(cartButton).toBeVisible();
        }
    });

    test('Hero Section: Visualización y Call to Action', async ({ page }) => {
        // 1. Sección Hero General
        const heroSection = page.locator('section').filter({ hasText: 'Renueva tu hogar' });
        await expect.soft(heroSection).toBeVisible();

        // 2. Imagen (puede tardar por la animación/loading)
        const heroImage = page.locator('#hero-image');
        await expect.soft(heroImage).toBeVisible(); // Soft check

        // 3. Botones de Acción
        const btnOfertas = page.locator('a[href="productos.html"]').filter({ hasText: 'Ver Ofertas' });
        await expect.soft(btnOfertas).toBeVisible();
    });

    test('Categorías: Visualización y Enlaces Correctos', async ({ page }) => {
        const categories = [
            { name: 'Electro Hogar', href: 'electro-hogar' },
            { name: 'Muebles', href: 'muebles' },
            { name: 'Motos', href: 'motos' },
            { name: 'Herramientas', href: 'herramientas' }
        ];

        for (const cat of categories) {
            const catLink = page.locator(`a[href*="categoria=${cat.href}"]`);
            // Scroll para asegurar visibilidad
            await catLink.scrollIntoViewIfNeeded();

            // Soft assertions para reportar qué categorías fallan sin detener el test
            await expect.soft(catLink, `Categoría ${cat.name} visible`).toBeVisible();
            await expect.soft(catLink, `Categoría ${cat.name} texto correcto`).toContainText(new RegExp(cat.name, 'i'));
        }
    });

    test('Carrusel de Marcas: Carga Dinámica', async ({ page }) => {
        const brandsCarousel = page.locator('#brands-carousel');
        await expect(brandsCarousel).toBeVisible();

        // Esperar a que cambie el texto de carga
        await expect.soft(page.locator('#brands-carousel span').first()).not.toContainText('Cargando marcas...', { timeout: 10000 });
    });

    test('Productos Destacados: Carrusel y Navegación', async ({ page }) => {
        const featuredSection = page.locator('#featured-products');
        await expect(featuredSection).toBeVisible();

        // Verificar carga de al menos un producto
        const productCard = featuredSection.locator('a[href*="detalle-producto.html"], article, .bg-white.rounded-xl');
        await expect.soft(productCard.first()).toBeVisible({ timeout: 10000 });

        // Navegación
        await expect.soft(page.locator('#scroll-left')).toBeVisible();
        await expect.soft(page.locator('#scroll-right')).toBeVisible();
    });

    test('Footer: Visualización', async ({ page }) => {
        const footer = page.locator('#footer-root');
        await expect(footer).toBeVisible();
        // Verificar inyección
        await expect.soft(footer).not.toBeEmpty();
    });

});
