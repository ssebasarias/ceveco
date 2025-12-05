/**
 * Main Application Script
 * Shared functionality and UI components
 */

// Cache para templates
let productCardTemplateCache = null;

/**
 * Obtiene el template HTML de la tarjeta de producto
 */
async function getProductCardTemplate() {
    if (productCardTemplateCache) return productCardTemplateCache;
    try {
        // Asumiendo que estamos en una página dentro de /pages/
        const response = await fetch('../components/card-producto.html');
        if (response.ok) {
            productCardTemplateCache = await response.text();
            return productCardTemplateCache;
        }
        console.error('Failed to load product card template');
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

    // Helper para precio
    const formatPrice = (price) => {
        if (typeof Utils !== 'undefined' && Utils.formatPrice) return Utils.formatPrice(price);
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
    };

    // Normalizar datos
    const id = product.id_producto || product.id;
    const precio = product.precio_actual || product.price;
    const precioAnterior = product.precio_anterior || product.oldPrice;
    const imagen = product.imagen_principal || product.image || 'https://via.placeholder.com/400x400?text=Sin+Imagen';
    const nombre = product.nombre || 'Producto sin nombre';
    const categoria = product.categoria || product.marca || '';

    // Preparar bloques HTML
    const badgeBlock = product.badge
        ? `<span class="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">${product.badge}</span>`
        : '';

    const oldPriceBlock = precioAnterior
        ? `<span class="text-sm text-gray-400 line-through">${formatPrice(precioAnterior)}</span>`
        : '';

    // Preparar valores escapados para onclick
    const nombreEscaped = nombre.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const imagenEscaped = imagen.replace(/'/g, "\\'");

    // Reemplazar placeholders en el template
    return template
        .replace(/{{id}}/g, id)
        .replace(/{{image}}/g, imagen)
        .replace(/{{name}}/g, nombre)
        .replace(/{{name_escaped}}/g, nombreEscaped)
        .replace(/{{category}}/g, categoria)
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
    const navbarRoot = document.getElementById('navbar-root');
    const footerRoot = document.getElementById('footer-root');

    // Helper to fetch text content
    const fetchText = async (url) => {
        try {
            const response = await fetch(url);
            return response.ok ? await response.text() : null;
        } catch (e) {
            console.error(`Error loading ${url}:`, e);
            return null;
        }
    };

    // 1. Fetch all components in parallel
    const [navbarHtml, footerHtml, cartHtml, cardTemplate] = await Promise.all([
        fetchText('navbar.html'),
        fetchText('footer.html'),
        fetchText('../components/cart-sidebar.html'),
        getProductCardTemplate() // Preload card template
    ]);

    // 2. Inject Components
    if (navbarRoot && navbarHtml) navbarRoot.innerHTML = navbarHtml;
    if (footerRoot && footerHtml) footerRoot.innerHTML = footerHtml;

    // Inject Cart Sidebar if it doesn't exist and we have the HTML
    if (cartHtml && !document.getElementById('cart-sidebar')) {
        const div = document.createElement('div');
        div.innerHTML = cartHtml;
        // Append children to body to avoid wrapping in an extra div if possible, or just append the wrapper
        // cartHtml contains two root elements (overlay and sidebar), so appending 'div' content is safer
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
    // We call loadCart() again to ensure it binds to the newly injected DOM elements
    if (typeof loadCart === 'function') {
        loadCart();
    }
    // Also trigger updateCartCount to refresh header badge
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }

    // Final icon refresh ensures everything dynamic has icons
    if (window.lucide) window.lucide.createIcons();
}

// Initialize loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadSharedComponents();

    // Fallback init
    if (window.lucide) window.lucide.createIcons();
});
