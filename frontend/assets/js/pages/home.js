/**
 * Home Page Script
 * Maneja la lógica específica de la página de inicio (Carruseles, Productos Destacados)
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Home Page Logic Initializing...');

    // Ensure core services are ready
    if (window.ProductService) {
        await loadFeaturedProducts();
        loadBrands();
        initHeroCarousel();
    } else {
        console.warn('ProductService not found. Waiting...');
        setTimeout(async () => {
            await loadFeaturedProducts();
            loadBrands();
            initHeroCarousel();
        }, 500);
    }

    initCarouselNavigation();

    // Inicializar iconos Lucide nuevamente por si acaso
    if (window.lucide) lucide.createIcons();
});

// Helper para esperar variables globales
async function waitForGlobal(name, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (typeof window[name] !== 'undefined') return window[name];
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
}

// Cargar productos destacados
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    try {
        // Reducir a 6 productos para no saturar
        const response = await window.ProductService.getFeatured(6);

        if (response.success && response.data.length > 0) {

            // Wait for renderProductCard reliably from ceveco-core.js
            const renderFn = await waitForGlobal('renderProductCard');

            if (typeof renderFn === 'function') {
                const cardsHtml = (await Promise.all(response.data.map(producto => renderFn(producto)))).join('');
                container.innerHTML = cardsHtml;
                if (window.lucide) lucide.createIcons();
            } else {
                console.error('renderProductCard missing after timeout.');
                container.innerHTML = `<p class="text-center text-red-500">Error cargando componente de producto.</p>`;
            }

        } else {
            container.innerHTML = `<p class="text-center text-gray-500 py-8 w-full">No hay productos destacados disponibles.</p>`;
        }

        // Update Favorites State
        // Notificar al sistema de favoritos
        document.dispatchEvent(new CustomEvent('productsRendered'));
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<p class="text-center text-red-500 py-8 w-full">Error al cargar productos.</p>`;
    }
}

// Carousel navigation
function initCarouselNavigation() {
    const container = document.getElementById('featured-products');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');

    if (!container || !leftBtn || !rightBtn) return;

    leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -340, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: 340, behavior: 'smooth' });
    });
}

// Cargar marcas
async function loadBrands() {
    const container = document.getElementById('brands-carousel');
    if (!container) return;

    try {
        const response = await window.ProductService.getBrands();

        if (response.success && response.data.length > 0) {
            const brands = response.data;
            const brandElements = brands.map(marca =>
                `<span class="text-base md:text-2xl font-bold text-gray-400 uppercase whitespace-nowrap px-4 md:px-8">${marca.nombre}</span>`
            ).join('');
            container.innerHTML = brandElements + brandElements;
        } else {
            container.innerHTML = '<span class="text-xl font-bold text-gray-400">No hay marcas disponibles</span>';
        }
    } catch (error) {
        console.error('Error loading brands:', error);
        container.innerHTML = '<span class="text-xl font-bold text-gray-400">Error al cargar marcas</span>';
    }
}

// Hero Carousel Logic
async function initHeroCarousel() {
    const heroImageEl = document.getElementById('hero-image');
    if (!heroImageEl) return;

    let currentHeroIndex = 0;
    let heroImages = [];

    try {
        const response = await fetch('/api/v1/hero-banners');
        // Handle fetch errors gracefully
        if (!response.ok) return;

        const result = await response.json();

        if (result.success && result.data.length > 0) {
            heroImages = result.data;
            startCarousel(heroImageEl, heroImages, currentHeroIndex);
        }
    } catch (error) {
        console.error('Error loading banners:', error);
    }
}

function startCarousel(heroImageEl, heroImages, currentHeroIndex) {
    if (heroImages.length <= 1) return;

    setInterval(() => {
        heroImageEl.style.opacity = '0';
        setTimeout(() => {
            currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
            heroImageEl.src = heroImages[currentHeroIndex];
            heroImageEl.onload = () => { heroImageEl.style.opacity = '0.9'; };
            if (heroImageEl.complete) { heroImageEl.style.opacity = '0.9'; }
        }, 1000);
    }, 5000);
}
