/**
 * Home Page Script
 * Maneja la lógica específica de la página de inicio (Carruseles, Productos Destacados)
 */

// --- INJECTED DEPENDENCIES FOR IMMEDIATE FIX ---
// These are temporarily here because ceveco-core.js is failing to load in the current environment.

// Cache para templates
let productCardTemplateCache = null;

// Helper global para precio
function formatPrice(price) {
    if (typeof Utils !== 'undefined' && Utils.formatPrice) return Utils.formatPrice(price);
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Obtiene el template HTML de la tarjeta de producto
 */
async function getProductCardTemplate() {
    if (productCardTemplateCache) return productCardTemplateCache;
    try {
        const response = await fetch('/components/card-producto.html');
        // Fallback for pages folder structure if needed, but root path /components is usually best if server is set up right.
        // If 404, try relative.
        if (!response.ok) {
            const responseRelative = await fetch('../components/card-producto.html');
            if (responseRelative.ok) {
                productCardTemplateCache = await responseRelative.text();
                return productCardTemplateCache;
            }
        }

        if (response.ok) {
            productCardTemplateCache = await response.text();
            return productCardTemplateCache;
        }
        console.error('Failed to load product card template: ' + response.status);
        return null;
    } catch (error) {
        console.error('Error loading template:', error);
        return null;
    }
}

/**
 * Renderiza una tarjeta de producto estándar usando el template HTML externo
 * @param {Object} product - Objeto de producto
 * @returns {Promise<string>} HTML string de la tarjeta
 */
async function renderProductCard(product) {
    const template = await getProductCardTemplate();
    // Si falla el template, usar un fallback simple en código
    if (!template) {
        console.warn('Using fallback card render due to missing template');
        return `<div class="p-4 border">Error template: ${product.nombre}</div>`;
    }

    // Normalizar datos (Ensure fallbacks are safe)
    const id = product.id_producto || product.id || '';
    const precio = product.precio_actual || product.price || 0;
    const precioAnterior = product.precio_anterior || product.oldPrice || 0;

    // Fallback image (SVG Data URI to avoid external dependency)
    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ESin Imagen%3C/text%3E%3C/svg%3E";

    // Obtener imagen
    let imagenUrl = product.imagen_principal || product.image;
    if (!imagenUrl || imagenUrl.includes('via.placeholder.com')) imagenUrl = fallbackImage;

    const nombre = product.nombre || 'Producto sin nombre';
    const categoria = product.categoria || product.marca || '';

    // Preparar bloques HTML
    const badgeBlock = product.badge
        ? `<span class="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">${product.badge}</span>`
        : '';

    const oldPriceBlock = precioAnterior && precioAnterior > precio
        ? `<span class="text-sm text-gray-400 line-through">${formatPrice(precioAnterior)}</span>`
        : '';

    // Ensure strings for manipulation
    const safeNombre = String(nombre);
    const safeImagen = String(imagenUrl);
    const safeCategoria = String(categoria);

    // Escape Helpers
    const escapeJs = (str) => str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const escapeHtml = (str) => str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // Attribute ready values
    const nombreAttr = escapeHtml(safeNombre);
    const imageAttr = escapeHtml(safeImagen);
    const categoryAttr = escapeHtml(safeCategoria);

    // Legacy escaped values (function calls)
    const nombreEscaped = escapeJs(safeNombre);
    const imagenEscaped = escapeJs(safeImagen);

    // Reemplazar placeholders en el template
    return template
        .replace(/{{id}}/g, id)
        .replace(/{{image}}/g, safeImagen)
        .replace(/{{image_attr}}/g, imageAttr)
        .replace(/{{name}}/g, safeNombre)
        .replace(/{{name_escaped}}/g, nombreEscaped)
        .replace(/{{name_attr}}/g, nombreAttr)
        .replace(/{{category}}/g, safeCategoria)
        .replace(/{{category_attr}}/g, categoryAttr)
        .replace(/{{price}}/g, formatPrice(precio))
        .replace(/{{price_raw}}/g, precio)
        .replace(/{{image_escaped}}/g, imagenEscaped)
        .replace(/{{badge_block}}/g, badgeBlock)
        .replace(/{{old_price_block}}/g, oldPriceBlock);
}

// Expose globally
window.renderProductCard = renderProductCard;
window.formatPrice = formatPrice;
// --- END INJECTED DEPENDENCIES ---

// --- SHARED COMPONENTS LOADER (Injected) ---
async function loadSharedComponents() {
    const navbarRoot = document.getElementById('navbar-root');
    const footerRoot = document.getElementById('footer-root');

    if (!navbarRoot && !footerRoot) return;

    const fetchText = async (url) => {
        try {
            let response = await fetch(url);
            if (!response.ok) response = await fetch('../' + url); // Try relative parent
            if (!response.ok) response = await fetch('../../' + url); // Try relative grandparent
            return response.ok ? await response.text() : null;
        } catch (e) { return null; }
    };

    try {
        const [navbarHtml, footerHtml, cartHtml] = await Promise.all([
            fetchText('components/navbar.html'),
            fetchText('components/footer.html'),
            fetchText('components/cart-sidebar.html')
        ]);

        if (navbarRoot && navbarHtml) {
            navbarRoot.innerHTML = navbarHtml;
            // Mobile Menu Logic inside Navbar
            const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
            if (mobileToggleBtn) {
                mobileToggleBtn.onclick = (e) => {
                    e.preventDefault();
                    window.toggleMobileMenu();
                };
            }
            const mobileCloseBtn = document.getElementById('mobile-menu-close');
            if (mobileCloseBtn) {
                mobileCloseBtn.onclick = (e) => {
                    e.preventDefault();
                    window.toggleMobileMenu();
                };
            }
            // Fix Mobile Menu Teleport/Structure if needed (simplified here)
        }

        if (footerRoot && footerHtml) footerRoot.innerHTML = footerHtml;

        if (cartHtml && !document.getElementById('cart-sidebar')) {
            const div = document.createElement('div');
            div.innerHTML = cartHtml;
            while (div.firstChild) document.body.appendChild(div.firstChild);
        }

        // Init icons again for new content
        if (window.lucide) {
            setTimeout(() => lucide.createIcons(), 100);
        }

        // Auth & Cart Init (Placeholder if functions exist)
        if (typeof setupUserMenu === 'function') setupUserMenu();
        if (typeof updateAuthUI === 'function') updateAuthUI();
        if (typeof loadCart === 'function') loadCart();

    } catch (e) { console.error('Error loading shared components', e); }
}

window.toggleMobileMenu = function () {
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const drawer = document.getElementById('mobile-menu-drawer');
    if (backdrop && drawer) {
        const isHidden = backdrop.classList.contains('hidden');
        if (isHidden) {
            backdrop.classList.remove('hidden');
            setTimeout(() => {
                backdrop.classList.remove('opacity-0');
                drawer.classList.remove('-translate-x-full');
            }, 10);
            document.body.style.overflow = 'hidden';
        } else {
            backdrop.classList.add('opacity-0');
            drawer.classList.add('-translate-x-full');
            document.body.style.overflow = '';
            setTimeout(() => backdrop.classList.add('hidden'), 300);
        }
    }
};
// --- END SHARED COMPONENTS ---

document.addEventListener('DOMContentLoaded', async () => {
    // Initial Load
    await loadSharedComponents();

    // Inicializar iconos Lucide
    if (window.lucide) lucide.createIcons();

    // Iniciar componentes
    await loadFeaturedProducts();
    initCarouselNavigation();
    loadBrands();
    initHeroCarousel();
});

// Función de búsqueda global para el input
window.handleSearch = function () {
    const query = document.getElementById('search-input').value;
    if (query) {
        window.location.href = `productos.html?q=${encodeURIComponent(query)}`;
    }
}

// Helper para esperar variables globales
async function waitForGlobal(name, timeout = 5000) {
    // Since we injected the code, we might not need to wait as much, but safety first
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

            // Wait for renderProductCard reliably
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
        if (typeof window.updateFavoritesUI === 'function') {
            setTimeout(window.updateFavoritesUI, 100);
        }
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
                `<span class="text-2xl font-bold text-gray-400 uppercase whitespace-nowrap px-8">${marca.nombre}</span>`
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
        // Handle fetch errors gracefully (e.g. backend offline)
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
