const { test, expect } = require('@playwright/test');

test.describe('Pruebas Completas de Interacción en Index', () => {

    test.beforeEach(async ({ page }) => {
        // Navegar al inicio antes de cada test
        // Usamos /pages/index.html ya que es donde reside el archivo físico según exploración
        // O si el servidor lo mapea a la raíz, podríamos intentar '/'
        // Dado el setup de express static, '/pages/index.html' es seguro.
        await page.goto('/pages/index.html');
        // Esperar a que la página cargue completamente
        await page.waitForLoadState('networkidle');
    });

    test('Header y Navbar: Elementos Críticos Visibles y Funcionales', async ({ page }) => {
        // 1. Verificar Logo
        const logo = page.locator('a[href="index.html"] img, a[href="index.html"] span, .font-bold.text-2xl.text-primary').first();
        // El logo puede variar según la implementación del Navbar dinámico.
        // Asumiendo que hay un link al index
        await expect(page.locator('#navbar-root')).toBeVisible();

        // 2. Verificar Menú de Navegación (Desktop)
        // Buscamos enlaces comunes
        const linkProductos = page.locator('nav a[href*="productos.html"]').first();
        await expect(linkProductos).toBeVisible();

        // 3. Verificar Buscador
        const searchInput = page.locator('input[type="text"][placeholder*="Buscar"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('Test Search');
            await expect(searchInput).toHaveValue('Test Search');
        }

        // 4. Iconos de Usuario y Carrito
        await expect(page.locator('button#cart-toggle, button[aria-label="Carrito"]')).toBeVisible();
        // El login puede ser un link o botón
        const userIconOrLink = page.locator('a[href*="login.html"], button#user-menu-button');
        await expect(userIconOrLink).toBeVisible();
    });

    test('Hero Section: Visualización y Call to Action', async ({ page }) => {
        // 1. Imagen del Hero
        const heroImage = page.locator('#hero-image');
        await expect(heroImage).toBeVisible();
        // Verificar que tiene un src
        await expect(heroImage).toHaveAttribute('src', /.+/);

        // 2. Textos principales
        await expect(page.getByText('Renueva tu hogar')).toBeVisible();

        // 3. Botones de Acción
        const btnOfertas = page.locator('a[href="productos.html"]', { hasText: 'Ver Ofertas' });
        await expect(btnOfertas).toBeVisible();
        await expect(btnOfertas).toHaveAttribute('href', 'productos.html');

        const btnMasVendidos = page.locator('a[href="productos.html?destacado=true"]');
        await expect(btnMasVendidos).toBeVisible();
    });

    test('Categorías: Visualización y Enlaces Correctos', async ({ page }) => {
        // Verificar las 4 categorías principales
        const categories = [
            { name: 'Electro Hogar', href: 'electro-hogar' },
            { name: 'Muebles', href: 'muebles' },
            { name: 'Motos', href: 'motos' },
            { name: 'Herramientas', href: 'herramientas' } // Basado en el HTML visto
        ];

        for (const cat of categories) {
            const catLink = page.locator(`a[href*="categoria=${cat.href}"]`);
            await expect(catLink).toBeVisible();

            // Verificar que contiene la imagen o el texto
            // El texto suele estar en un h3 dentro.
            await expect(catLink).toContainText(cat.name, { ignoreCase: true });
        }
    });

    test('Carrusel de Marcas: Carga Dinámica', async ({ page }) => {
        const brandsCarousel = page.locator('#brands-carousel');
        await expect(brandsCarousel).toBeVisible();

        // Esperar a que desaparezca el texto de carga o aparezcan marcas
        // El texto de "Cargando marcas..." debería desaparecer o ser reemplazado
        // O verificar que hay elementos hijos después de un tiempo
        await expect(page.locator('#brands-carousel span').first()).not.toContainText('Cargando marcas...', { timeout: 10000 });
    });

    test('Productos Destacados: Carrusel y Navegación', async ({ page }) => {
        const featuredSection = page.locator('#featured-products');
        await expect(featuredSection).toBeVisible();

        // Esperar a que se carguen los productos (el spinner desaparece o aparecen cards)
        // Buscamos tarjetas de producto. Usualmente tienen una clase 'group' o data-id
        // En home.js vimos renderProductCard.
        const productCard = featuredSection.locator('a[href*="detalle-producto.html"], article, .bg-white.rounded-xl');
        // Esperamos al menos uno
        await expect(productCard.first()).toBeVisible({ timeout: 10000 });

        // Verificar botones de navegación del carrusel
        const btnLeft = page.locator('#scroll-left');
        const btnRight = page.locator('#scroll-right');
        await expect(btnLeft).toBeVisible();
        await expect(btnRight).toBeVisible();

        // Probar clic (solo verifica que no lance error, visualmente mueve el scroll)
        await btnRight.click();
    });

    test('Footer: Visualización', async ({ page }) => {
        const footer = page.locator('#footer-root');
        await expect(footer).toBeVisible();
        // Verificar contenido básico que se inyecta, por ejemplo Copyright o Links
        // Como es dinámico, esperamos a que tenga contenido
        await expect(footer).not.toBeEmpty();
    });

});
