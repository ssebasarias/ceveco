/**
 * Main Application Script
 * Shared functionality and UI components
 */

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
    if (!template) return '';

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

/**
 * Load Shared Components (Navbar, Footer, Cart)
 */
async function loadSharedComponents() {
    // Check protocol
    if (window.location.protocol === 'file:') {
        console.error('CRITICAL: Running via file:// protocol. Dynamic imports will fail.');
        alert('Por favor ejecuta este proyecto usando un servidor local (ej: npm run dev) para ver todas las funcionalidades.');
        return;
    }

    console.log('Loading shared components...');
    const navbarRoot = document.getElementById('navbar-root');
    const footerRoot = document.getElementById('footer-root');

    // Helper to fetch text content
    const fetchText = async (url) => {
        try {
            const response = await fetch(url);
            return response.ok ? await response.text() : null;
        } catch (e) {
            console.error(`Error loading ${url}:`, e);
            document.body.innerHTML += `<div style="color:red; padding:20px;">Error loading resources. Check console.</div>`;
            return null;
        }
    };

    try {
        // 1. Fetch all components in parallel
        const [navbarHtml, footerHtml, cartHtml] = await Promise.all([
            fetchText('/components/navbar.html'),
            fetchText('/components/footer.html'),
            fetchText('/components/cart-sidebar.html'),
            getProductCardTemplate() // Preload card template
        ]);

        // 2. Inject Components
        if (navbarRoot) {
            if (navbarHtml) {
                navbarRoot.innerHTML = navbarHtml;

                // --- FIX: Teleport Mobile Menu to Body ---
                // This prevents stacking context issues (e.g. valid z-index but stuck inside header/nav)
                const backdrop = document.getElementById('mobile-menu-backdrop');
                const drawer = document.getElementById('mobile-menu-drawer');

                if (backdrop) document.body.appendChild(backdrop);
                if (drawer) document.body.appendChild(drawer);

            } else {
                console.error('Navbar HTML not loaded');
            }
        }

        if (footerRoot) {
            if (footerHtml) footerRoot.innerHTML = footerHtml;
            else console.error('Footer HTML not loaded');
        }

        // Inject Cart Sidebar if it doesn't exist and we have the HTML
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

        // Authentication UI
        if (typeof setupUserMenu === 'function') {
            setupUserMenu();
        } else if (typeof updateAuthUI === 'function') {
            updateAuthUI();
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
            console.log('Mobile menu (ID: mobile-menu-toggle) listener attached via JS');
        } else {
            console.warn('Mobile menu toggle button (ID: mobile-menu-toggle) NOT found in navbar');
        }

        // --- Explicitly Attach Mobile Menu CLOSE Listener ---
        const mobileCloseBtn = document.getElementById('mobile-menu-close');
        if (mobileCloseBtn) {
            mobileCloseBtn.onclick = function (e) {
                e.preventDefault();
                window.toggleMobileMenu();
            };
            console.log('Mobile menu CLOSE button listener attached');
        }

        // Final icon refresh ensures everything dynamic has icons
        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        console.error('CRITICAL: Error initializing application', error);
    }
}

// Expose global functions
window.formatPrice = formatPrice;
window.renderProductCard = renderProductCard;

/**
 * Toggle Mobile Menu Drawer
 */
/**
 * Toggle Mobile Menu Drawer
 */
window.toggleMobileMenu = function () {
    console.log('Mobile Menu Toggle Clicked');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const drawer = document.getElementById('mobile-menu-drawer');

    if (backdrop && drawer) {
        if (backdrop.classList.contains('hidden')) {
            console.log('Opening Menu');
            // Open
            backdrop.classList.remove('hidden');
            // Force reflow
            void backdrop.offsetWidth;
            setTimeout(() => {
                backdrop.classList.remove('opacity-0');
                drawer.classList.remove('-translate-x-full');
            }, 10);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            console.log('Closing Menu');
            // Close
            backdrop.classList.add('opacity-0');
            drawer.classList.add('-translate-x-full');
            document.body.style.overflow = ''; // Restore scrolling

            setTimeout(() => {
                backdrop.classList.add('hidden');
            }, 300);
        }
    } else {
        console.error('Mobile menu elements not found in DOM');
        // Fallback: If elements are missing, maybe dynamic load failed or ID mismatch.
        // Try to find by class if needed, or querySelector.
        const drawerFallback = document.querySelector('aside.fixed.top-0.left-0');
        if (drawerFallback) console.warn('Found drawer by class but ID mismatch?');
    }
    // Re-init icons to be safe
    if (window.lucide) window.lucide.createIcons();
};

/**
 * Handle search from navbar - GLOBAL FUNCTION
 */
// Header Search Logic
window.handleSearch = function (inputId = 'search-input') {
    const input = document.getElementById(inputId);
    if (input && input.value.trim()) {
        const query = input.value.trim();
        // Determine correct path
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        const targetPath = isInPagesDir ? 'productos.html' : 'pages/productos.html';

        window.location.href = `${targetPath}?q=${encodeURIComponent(query)}`;
    }
};

/**
 * Navigate to product details
 * Handles path resolution from root or pages directory
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
        // 1. Buy Now Button
        const buyBtn = e.target.closest('.js-buy-now');
        if (buyBtn) {
            e.preventDefault();
            e.stopPropagation();
            const d = buyBtn.dataset;
            // Ensure data-price exists and is valid
            const price = d.price ? parseFloat(d.price) : 0;

            if (window.buyNow) {
                window.buyNow(d.id, d.name, price, d.image);
            } else {
                console.error('buyNow function not available');
            }
            return;
        }

        // 2. Product Card Navigation
        // Only if we didn't click a button/link inside
        const card = e.target.closest('.js-product-card');
        // Extra safety check: Ensure we didn't click on "add to cart" or "fav" which might have missed their own listeners 
        // (though they should use stopPropagation, it's safer to check here)
        if (card && !e.target.closest('button') && !e.target.closest('a')) {
            const id = card.dataset.productId;
            if (window.goToProduct) {
                window.goToProduct(id);
            }
        }
    });
}

// Initialize loading when DOM is ready
// Initialize Search Listeners (Desktop & Mobile) with Retry Logic
function initSearchListeners(retryCount = 0) {
    const ids = ['search-input', 'mobile-search-input'];
    let anyMissing = false;

    ids.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // Use onkeypress to avoid duplicate listeners on retries
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.handleSearch(id);
                }
            };
            console.log(`✓ Search listener attached to ${id}`);
        } else {
            anyMissing = true;
            console.warn(`Search input ${id} not found (attempt ${retryCount + 1})`);
        }
    });

    // Retry if any input is missing, up to 5 times (1 second total)
    if (anyMissing && retryCount < 5) {
        setTimeout(() => initSearchListeners(retryCount + 1), 200);
    }
}

// Initialize loading when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    setupGlobalListeners();
    try {
        await loadSharedComponents();
        // Initialize search listeners
        initSearchListeners();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
