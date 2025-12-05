/**
 * Main Application Script
 * Shared functionality and UI components
 */

/**
 * Renderiza una tarjeta de producto estándar
 * Usa el diseño de index.html para consistencia en toda la app
 * @param {Object} product - Objeto de producto (de API o local)
 * @returns {string} HTML string de la tarjeta
 */
function renderProductCard(product) {
    // Helper para precio, usando Utils si existe o fallback local
    const formatPrice = (price) => {
        if (typeof Utils !== 'undefined' && Utils.formatPrice) return Utils.formatPrice(price);
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
    };

    // Normalizar datos (manejar tanto estructura de API como datos legacy si existen)
    const id = product.id_producto || product.id;
    const precio = product.precio_actual || product.price;
    const precioAnterior = product.precio_anterior || product.oldPrice;
    const imagen = product.imagen_principal || product.image || 'https://via.placeholder.com/400x400?text=Sin+Imagen';

    // Escapar comillas para atributos HTML
    const nombreEscaped = (product.nombre || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
    const imagenEscaped = (imagen || '').replace(/'/g, "\\'");

    return `
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col" 
         data-product-id="${id}">
        <a href="detalle-producto.html?id=${id}" class="block relative pt-[100%] overflow-hidden bg-gray-50 rounded-t-xl">
            <img src="${imagen}" 
                 alt="${product.nombre}" 
                 class="absolute top-0 left-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500">
            ${product.badge ? `
                <span class="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                    ${product.badge}
                </span>
            ` : ''}
        </a>
        <div class="p-4 flex flex-col flex-1">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">${product.categoria || product.marca || ''}</p>
            <a href="detalle-producto.html?id=${id}">
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors" title="${product.nombre}">
                    ${product.nombre}
                </h3>
            </a>
            <div class="mt-auto">
                <div class="flex items-end justify-between mb-4">
                    <div>
                        <span class="text-lg font-bold text-primary block">
                            ${formatPrice(precio)}
                        </span>
                        ${precioAnterior ? `
                            <span class="text-sm text-gray-400 line-through">
                                ${formatPrice(precioAnterior)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <button onclick="event.preventDefault(); event.stopPropagation(); addToCart(${id}, '${nombreEscaped}', ${precio}, '${imagenEscaped}')"
                    class="w-full p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 group-btn">
                    <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                    <span class="text-sm font-medium">Agregar</span>
                </button>
            </div>
        </div>
    </div>
    `;
}

/**
 * Load Shared Components (Navbar and Footer)
 */
async function loadSharedComponents() {
    const navbarRoot = document.getElementById('navbar-root');
    const footerRoot = document.getElementById('footer-root');

    // Helper to fetch and inject HTML
    const loadHtml = async (url, rootElement) => {
        if (!rootElement) return;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const html = await response.text();
                rootElement.innerHTML = html;
            } else {
                console.error(`Failed to load component from ${url}`);
            }
        } catch (error) {
            console.error(`Error loading component from ${url}:`, error);
        }
    };

    // Load both concurrently
    await Promise.all([
        loadHtml('navbar.html', navbarRoot),
        loadHtml('footer.html', footerRoot)
    ]);

    // Re-initialize components that depend on DOM elements in navbar/footer
    // 1. Lucide icons - First pass
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. Auth state (User menu)
    if (typeof setupUserMenu === 'function') {
        setupUserMenu();
    } else if (window.Auth && typeof window.Auth.init === 'function') {
        window.Auth.init();
    } else if (typeof updateAuthUI === 'function') {
        updateAuthUI(); // From auth.js
    }

    // 3. Cart count update
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }

    // 4. Lucide icons - Second pass after auth UI updates
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Initialize loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadSharedComponents();

    // Global Lucide init fallback
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
