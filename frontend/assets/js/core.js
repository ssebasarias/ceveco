/**
 * Core Bootstrapper
 * Inicializa los servicios y utilidades esenciales
 * Debe cargarse antes que app.js o cualquier lógica de página
 */

/**
 * Ceveco Core System
 * Central unified bootstrapper for Services, UI Components, and Global Logic.
 * Replaces: core.js, ceveco-core.js, app-core.js
 */

(function () {
    console.log('🚀 Ceveco Core System Initializing...');

    // ==========================================
    // 1. DEPENDENCY CHECK & INITIALIZATION
    // ==========================================
    const dependencies = [
        'CONSTANTS',
        'StorageUtils',
        'API',
        'AuthService',
        'ProductService',
        'FavoritesService',
        'OrdersService'
    ];

    let missing = [];
    dependencies.forEach(dep => {
        if (!window[dep]) missing.push(dep);
    });

    if (missing.length > 0) {
        console.warn('⚠️ Core Dependencies Missing:', missing.join(', '));
    } else {
        console.log('✅ Core Services Ready');
        initializeGlobalState();
    }

    function initializeGlobalState() {
        // Restore session if token exists
        if (window.AuthService && window.AuthService.isAuthenticated()) {
            window.AuthService.refreshProfile().catch(() => {
                if (window.StorageUtils) window.StorageUtils.removeUser();
            });
        }
        // Initialize cart from storage if not in memory
        if (!window.cart && window.StorageUtils) {
            window.cart = window.StorageUtils.getCart();
        }
    }

    // ==========================================
    // 2. GLOBAL HELPERS (Exposed to Window)
    // ==========================================

    // Price Formatter
    window.formatPrice = function (price) {
        if (typeof Utils !== 'undefined' && Utils.formatPrice) return Utils.formatPrice(price);
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Mobile Menu Toggle
    window.toggleMobileMenu = function () {
        const backdrop = document.getElementById('mobile-menu-backdrop');
        const drawer = document.getElementById('mobile-menu-drawer');

        if (backdrop && drawer) {
            if (backdrop.classList.contains('hidden')) {
                // Open
                backdrop.classList.remove('hidden');
                // Force reflow
                void backdrop.offsetWidth;
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

    // Navigation Helper
    window.goToProduct = function (id) {
        if (!id) return;
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        const targetPath = isInPagesDir ? `detalle-producto.html?id=${id}` : `pages/detalle-producto.html?id=${id}`;
        window.location.href = targetPath;
    };

    // Search Handler
    window.handleSearch = function (inputId = 'search-input') {
        const input = document.getElementById(inputId);
        if (input && input.value.trim()) {
            const query = input.value.trim();
            const currentPath = window.location.pathname;
            const isInPagesDir = currentPath.includes('/pages/');
            const targetPage = 'productos.html';
            const targetPath = isInPagesDir ? targetPage : `pages/${targetPage}`;
            window.location.href = `${targetPath}?q=${encodeURIComponent(query)}`;
        }
    };

    // ==========================================
    // 3. COMPONENT RENDERING (Product Cards)
    // ==========================================
    let productCardTemplateCache = null;

    async function getProductCardTemplate() {
        if (productCardTemplateCache) return productCardTemplateCache;
        try {
            // Try absolute first
            let response = await fetch('/components/card-producto.html');
            if (!response.ok) {
                // Try relative
                response = await fetch('../components/card-producto.html');
            }
            if (response.ok) {
                productCardTemplateCache = await response.text();
                return productCardTemplateCache;
            }
            return null;
        } catch (error) {
            console.error('Error loading template:', error);
            return null;
        }
    }

    window.renderProductCard = async function (product) {
        const template = await getProductCardTemplate();
        const formatter = window.formatPrice;

        // Fallback if template missing
        if (!template) {
            return `<div class="p-4 border">Error template: ${product.nombre}</div>`;
        }

        // Normalize Data
        const id = product.id_producto || product.id || '';
        const precio = product.precio_actual || product.price || 0;
        const precioAnterior = product.precio_anterior || product.oldPrice || 0;

        // Fallback Image
        const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ESin Imagen%3C/text%3E%3C/svg%3E";

        let imagenUrl = product.imagen_principal || product.image;
        if (!imagenUrl || imagenUrl.includes('via.placeholder.com')) imagenUrl = fallbackImage;

        const nombre = product.nombre || 'Producto sin nombre';
        const categoria = product.categoria || product.marca || '';

        // HTML Blocks
        const badgeBlock = product.badge
            ? `<span class="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">${product.badge}</span>`
            : '';

        const oldPriceBlock = precioAnterior && precioAnterior > precio
            ? `<span class="text-sm text-gray-400 line-through">${formatter(precioAnterior)}</span>`
            : '';

        // Safe Strings
        const safeNombre = String(nombre);
        const safeImagen = String(imagenUrl);
        const safeCategoria = String(categoria);

        const escapeJs = (str) => str.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const escapeHtml = (str) => str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        return template
            .replace(/{{id}}/g, id)
            .replace(/{{image}}/g, safeImagen)
            .replace(/{{image_attr}}/g, escapeHtml(safeImagen))
            .replace(/{{name}}/g, safeNombre)
            .replace(/{{name_escaped}}/g, escapeJs(safeNombre))
            .replace(/{{name_attr}}/g, escapeHtml(safeNombre))
            .replace(/{{category}}/g, safeCategoria)
            .replace(/{{category_attr}}/g, escapeHtml(safeCategoria))
            .replace(/{{price}}/g, formatter(precio))
            .replace(/{{price_raw}}/g, precio)
            .replace(/{{image_escaped}}/g, escapeJs(safeImagen))
            .replace(/{{badge_block}}/g, badgeBlock)
            .replace(/{{old_price_block}}/g, oldPriceBlock);
    };

    // ==========================================
    // 4. SHARED COMPONENTS LOADER (Navbar/Footer)
    // ==========================================
    async function loadSharedComponents() {
        if (window.location.protocol === 'file:') return;

        console.log('🔄 Loading Layout Components...');
        const navbarRoot = document.getElementById('navbar-root');
        const footerRoot = document.getElementById('footer-root');

        const fetchText = async (url) => {
            try {
                let res = await fetch(url);
                if (!res.ok) res = await fetch('.' + url);
                if (!res.ok && url.startsWith('/')) res = await fetch('..' + url); // Try parent
                return res.ok ? await res.text() : null;
            } catch (e) {
                return null;
            }
        };

        try {
            const [navbarHtml, footerHtml, cartHtml] = await Promise.all([
                fetchText('/components/navbar.html'),
                fetchText('/components/footer.html'),
                fetchText('/components/cart.html'),
                getProductCardTemplate() // Preload
            ]);

            // Navbar
            if (navbarRoot && navbarHtml) {
                navbarRoot.innerHTML = navbarHtml;
                // Move mobile menu to body to avoid z-index issues
                const backdrop = document.getElementById('mobile-menu-backdrop');
                const drawer = document.getElementById('mobile-menu-drawer');
                if (backdrop) document.body.appendChild(backdrop);
                if (drawer) document.body.appendChild(drawer);

                // Attach Event Listeners
                const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
                if (mobileToggleBtn) mobileToggleBtn.onclick = (e) => { e.preventDefault(); window.toggleMobileMenu(); };

                const mobileCloseBtn = document.getElementById('mobile-menu-close');
                if (mobileCloseBtn) mobileCloseBtn.onclick = (e) => { e.preventDefault(); window.toggleMobileMenu(); };
            }

            // Footer
            if (footerRoot && footerHtml) {
                footerRoot.innerHTML = footerHtml;
            }

            // Cart Sidebar injection
            if (cartHtml && !document.getElementById('cart-sidebar')) {
                const div = document.createElement('div');
                div.innerHTML = cartHtml;
                while (div.firstChild) document.body.appendChild(div.firstChild);
            }

            // Init Components
            if (window.lucide) window.lucide.createIcons();
            document.dispatchEvent(new CustomEvent('components:loaded'));

            // Init Auth UI
            if (typeof window.updateAuthUI === 'function') window.updateAuthUI();
            else if (typeof window.setupUserMenu === 'function') window.setupUserMenu();

            // Init Cart Logic
            if (typeof window.loadCart === 'function') window.loadCart();

            console.log('✅ Shared Components Loaded');

            // Init Navbar Interactions
            if (window.setupNavbarInteractions) window.setupNavbarInteractions();

        } catch (error) {
            console.error('❌ Component Loading Error:', error);
        }
    }

    // ==========================================
    // 5. NAVBAR INTERACTIONS
    // ==========================================
    window.setupNavbarInteractions = function () {
        const header = document.getElementById('main-header');
        if (!header) return;

        const currentPath = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const currentCategory = params.get('categoria');

        // 1. Highlight Active Link with Animation
        const links = document.querySelectorAll('#main-header nav a, #main-header .hidden.lg\\:flex > a');
        links.forEach(link => {
            // Apply base animation class by default if not button
            if (!link.classList.contains('nav-link-animated') && !link.classList.contains('border-primary')) {
                link.classList.add('nav-link-animated');
            }

            const href = link.getAttribute('href');
            if (!href) return;

            let isActive = false;

            // Check exact category match
            if (href.includes('categoria=') && currentCategory) {
                if (href.includes(`categoria=${currentCategory}`)) isActive = true;
            }
            // Check Page Match
            else if (!href.includes('categoria=') && !href.startsWith('#')) {
                const linkPath = href.split('?')[0];
                // Special case for Home
                if ((linkPath === 'index.html' || linkPath === './index.html') &&
                    (currentPath.endsWith('index.html') || currentPath === '/')) {
                    isActive = true;
                }
                // Other pages
                else if (linkPath !== 'index.html' && linkPath !== './index.html' && currentPath.includes(linkPath.replace('./', '').replace('../', ''))) {
                    isActive = true;
                }
            }

            if (isActive) {
                // Determine if it's a nav link or the special button
                if (!link.classList.contains('border-primary')) {
                    link.classList.add('active'); // Triggers the CSS sweep
                    link.classList.remove('text-gray-600', 'font-medium');
                }
            }
        });

        // 2. Ensure Standard Sticky Header
        // We removed the overlap logic so the navbar sits ABOVE the banner (creating the requested white space).
        // Standard sticky behavior is handled by CSS in navbar.html (#navbar-root { position: sticky })

        // Ensure consistent background
        if (header) {
            header.classList.remove('bg-transparent', 'bg-white/80');
            header.classList.add('bg-white/95', 'backdrop-blur-sm', 'shadow-sm', 'border-b');
        }
    };

    // ==========================================
    // 6. GLOBAL EVENT LISTENERS
    // ==========================================
    function setupGlobalListeners() {
        // Search Inputs
        const connectSearch = (retry = 0) => {
            const inputs = ['search-input', 'mobile-search-input'];
            let found = false;
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    found = true;
                    el.onkeypress = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            window.handleSearch(id);
                        }
                    };
                }
            });
            // Retry if navbar hasn't loaded yet
            if (!found && retry < 10) setTimeout(() => connectSearch(retry + 1), 500);
        };
        connectSearch();

        // Delegate Clicks
        document.addEventListener('click', (e) => {
            // Buy Now
            const buyBtn = e.target.closest('.js-buy-now');
            if (buyBtn) {
                e.preventDefault();
                e.stopPropagation();
                const d = buyBtn.dataset;
                if (window.buyNow) window.buyNow(d.id, d.name, parseFloat(d.price), d.image);
                return;
            }

            // Product Link
            const card = e.target.closest('.js-product-card');
            if (card && !e.target.closest('button') && !e.target.closest('a')) {
                window.goToProduct(card.dataset.productId);
            }

            // Quote Product (WhatsApp)
            const quoteBtn = e.target.closest('.js-quote-product');
            if (quoteBtn) {
                e.preventDefault();
                e.stopPropagation();

                const d = quoteBtn.dataset;
                const name = d.name || 'Producto';
                const id = d.id || '';
                // Use absolute URL for the image if possible, otherwise just send the name
                const image = d.image || '';

                // Get global phone or fallback
                let phone = '573001234567'; // Default fallback
                if (window.CONFIG && window.CONFIG.APP && window.CONFIG.APP.whatsapp) {
                    phone = window.CONFIG.APP.whatsapp.replace(/\D/g, '');
                }

                const message = `Hola, me interesa cotizar este producto:\n\n*${name}*\nRef/ID: ${id}\n${window.location.origin}${image}`;
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

                window.open(url, '_blank');
            }
        });
    }

    // ==========================================
    // 6. EXECUTION START
    // ==========================================
    document.addEventListener('DOMContentLoaded', async () => {
        await loadSharedComponents();
        setupGlobalListeners();
    });

})();
