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
        const response = await fetch('../components/card-producto.html');
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
            fetchText('../components/navbar.html'),
            fetchText('../components/footer.html'),
            fetchText('../components/cart-sidebar.html'),
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
window.handleSearch = function () {
    const input = document.getElementById('search-input');
    console.log('handleSearch called, input:', input);
    if (input && input.value.trim()) {
        const query = input.value.trim();
        console.log('Searching for:', query);
        // Determine correct path
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        const targetPath = isInPagesDir ? 'productos.html' : 'pages/productos.html';

        window.location.href = `${targetPath}?q=${encodeURIComponent(query)}`;
    }
};

// Initialize loading when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadSharedComponents();

    // Initialize search AFTER components are loaded
    setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.handleSearch();
                }
            });
            console.log('✓ Search initialized');
        } else {
            console.warn('✗ Search input not found');
        }
    }, 200);
});
