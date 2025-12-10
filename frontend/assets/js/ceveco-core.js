console.log("CRITICAL: APP-CORE.JS STARTING EXECUTION");
/**
 * Main Application Script
 * Shared functionality and UI components
 */

console.log('App.js: Initializing...');

// Cache para templates
let productCardTemplateCache = null;

// GLOBAL HELPERS EXPORTADOS INMEDIATAMENTE
// Esto asegura que estén disponibles aunque falle algo más abajo
window.renderProductCard = renderProductCard;

// Helper para evitar conflictos con helpers.js
const coreFormatPrice = function (price) {
    if (typeof Utils !== 'undefined' && Utils.formatPrice) return Utils.formatPrice(price);
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price);
};

// Exponer en window de forma segura
if (typeof window.formatPrice === 'undefined') {
    // Si ya existe formatPrice en el scope (de helpers.js), úsalo
    if (typeof formatPrice !== 'undefined') {
        window.formatPrice = formatPrice;
    } else {
        window.formatPrice = coreFormatPrice;
    }
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
    const formatter = window.formatPrice || coreFormatPrice;

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
        ? `<span class="text-sm text-gray-400 line-through">${formatter(precioAnterior)}</span>`
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
        .replace(/{{price}}/g, formatter(precio))
        .replace(/{{price_raw}}/g, precio)
        .replace(/{{image_escaped}}/g, imagenEscaped)
        .replace(/{{badge_block}}/g, badgeBlock)
        .replace(/{{old_price_block}}/g, oldPriceBlock);
}

/**
 * Load Shared Components (Navbar, Footer, Cart)
 */
async function loadSharedComponents() {
    // Check protocol
    if (window.location.protocol === 'file:') {
        console.error('CRITICAL: Running via file:// protocol. Dynamic imports will fail.');
        return;
    }

    console.log('Loading shared components...');
    const navbarRoot = document.getElementById('navbar-root');
    const footerRoot = document.getElementById('footer-root');

    // Helper to fetch text content
    const fetchText = async (url) => {
        try {
            const response = await fetch(url);
            // Fallback strategy for paths
            if (!response.ok) {
                const responseRel = await fetch('.' + url);
                if (responseRel.ok) return await responseRel.text();
            }
            return response.ok ? await response.text() : null;
        } catch (e) {
            console.error(`Error loading ${url}:`, e);
            return null;
        }
    };

    try {
        // 1. Fetch all components in parallel
        console.log('Fetching shared components...');

        // Robust fetch function with multiple path strategies
        const robustFetch = async (path) => {
            // Ensure extension
            if (!path.endsWith('.html')) path += '.html';

            console.log(`Fetching: ${path}`);

            // Strategy 1: Absolute path (good for server root)
            let resp = await fetchText(path);
            if (resp) return resp;

            // Strategy 2: Relative parent path (good for /pages/ directory)
            if (path.startsWith('/')) {
                const relPath = '..' + path;
                console.log(`Retrying ${path} with ${relPath}`);
                resp = await fetchText(relPath);
                if (resp) return resp;
            }

            // Strategy 3: Hard fallback for specific known structures
            if (path.includes('components')) {
                const retryPath = `../frontend${path}`;
                console.log(`Retrying ${path} with ${retryPath}`);
                resp = await fetchText(retryPath);
                if (resp) return resp;
            }

            return null;
        };

        const [navbarHtml, footerHtml, cartHtml] = await Promise.all([
            robustFetch('/components/navbar.html'),
            robustFetch('/components/footer.html'),
            robustFetch('/components/cart.html'),
            getProductCardTemplate() // Preload card template
        ]);

        if (!navbarHtml) console.error('FAILED TO LOAD NAVBAR HTML');
        if (!navbarRoot) console.error('NAVBAR ROOT ELEMENT NOT FOUND');

        // 2. Inject Components
        if (navbarRoot && navbarHtml) {
            navbarRoot.innerHTML = navbarHtml;

            // --- FIX: Teleport Mobile Menu to Body ---
            const backdrop = document.getElementById('mobile-menu-backdrop');
            const drawer = document.getElementById('mobile-menu-drawer');

            if (backdrop) document.body.appendChild(backdrop);
            if (drawer) document.body.appendChild(drawer);
        }

        if (footerRoot && footerHtml) {
            footerRoot.innerHTML = footerHtml;
        }

        // Inject Cart Sidebar
        if (cartHtml && !document.getElementById('cart-sidebar')) {
            const div = document.createElement('div');
            div.innerHTML = cartHtml;
            while (div.firstChild) {
                document.body.appendChild(div.firstChild);
            }
        }

        // 3. Initialize Shared Logic

        // Lucide Icons
        if (window.lucide) window.lucide.createIcons();

        // Dispatch event that components are ready
        document.dispatchEvent(new CustomEvent('components:loaded'));

        // Authentication UI: Try to update immediately if function exists
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        } else if (typeof window.setupUserMenu === 'function') {
            window.setupUserMenu();
        }

        // Cart Logic Initialization
        if (typeof loadCart === 'function') {
            loadCart();
        }
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }

        // --- Explicitly Attach Mobile Menu Listener ---
        const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
        if (mobileToggleBtn) {
            mobileToggleBtn.onclick = function (e) {
                e.preventDefault();
                window.toggleMobileMenu();
            };
        }

        // --- Explicitly Attach Mobile Menu CLOSE Listener ---
        const mobileCloseBtn = document.getElementById('mobile-menu-close');
        if (mobileCloseBtn) {
            mobileCloseBtn.onclick = function (e) {
                e.preventDefault();
                window.toggleMobileMenu();
            };
        }

        // Final icon refresh
        if (window.lucide) window.lucide.createIcons();

        console.log('Shared components loaded successfully');

    } catch (error) {
        console.error('CRITICAL: Error initializing application', error);
    }
}

/**
 * Toggle Mobile Menu Drawer
 */
window.toggleMobileMenu = function () {
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const drawer = document.getElementById('mobile-menu-drawer');

    if (backdrop && drawer) {
        if (backdrop.classList.contains('hidden')) {
            // Open
            backdrop.classList.remove('hidden');
            void backdrop.offsetWidth; // Force reflow
            setTimeout(() => {
                backdrop.classList.remove('opacity-0');
                drawer.classList.remove('-translate-x-full');
            }, 10);
            document.body.style.overflow = 'hidden';
        } else {
            // Close
            backdrop.classList.add('opacity-0');
            drawer.classList.add('-translate-x-full');
            document.body.style.overflow = '';
            setTimeout(() => {
                backdrop.classList.add('hidden');
            }, 300);
        }
    } else {
        console.warn('Mobile menu elements not found');
    }
    if (window.lucide) window.lucide.createIcons();
};

/**
 * Handle search from navbar - GLOBAL FUNCTION
 */
window.handleSearch = function (inputId = 'search-input') {
    const input = document.getElementById(inputId);
    if (input && input.value.trim()) {
        const query = input.value.trim();
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        // Fix: always ensure we go to the correct product page location
        const targetPage = 'productos.html';
        const targetPath = isInPagesDir ? targetPage : `pages/${targetPage}`;

        window.location.href = `${targetPath}?q=${encodeURIComponent(query)}`;
    }
};

/**
 * Navigate to product details
 */
window.goToProduct = function (id) {
    if (!id) return;
    const currentPath = window.location.pathname;
    const isInPagesDir = currentPath.includes('/pages/');
    const targetPath = isInPagesDir ? `detalle-producto.html?id=${id}` : `pages/detalle-producto.html?id=${id}`;
    window.location.href = targetPath;
};

// Initialize Global Listeners
function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
        // Buy Now Button
        const buyBtn = e.target.closest('.js-buy-now');
        if (buyBtn) {
            e.preventDefault();
            e.stopPropagation();
            const d = buyBtn.dataset;
            const price = d.price ? parseFloat(d.price) : 0;

            if (window.buyNow) {
                window.buyNow(d.id, d.name, price, d.image);
            }
            return;
        }

        // Product Card Navigation
        const card = e.target.closest('.js-product-card');
        if (card && !e.target.closest('button') && !e.target.closest('a')) {
            const id = card.dataset.productId;
            if (window.goToProduct) {
                window.goToProduct(id);
            }
        }
    });
}

// Initialize loading when DOM is ready
function initSearchListeners(retryCount = 0) {
    const ids = ['search-input', 'mobile-search-input'];
    let anyMissing = false;

    ids.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.handleSearch(id);
                }
            };
        } else {
            anyMissing = true;
        }
    });

    if (anyMissing && retryCount < 5) {
        setTimeout(() => initSearchListeners(retryCount + 1), 200);
    }
}

// Main execution
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Ready, starting App init...');
    setupGlobalListeners();
    try {
        await loadSharedComponents();
        initSearchListeners();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

console.log('App.js: Loaded and functions exposed.');
