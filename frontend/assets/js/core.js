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
    // 7. FOOTER & LEGAL MODAL - Implementación Limpia
    // ==========================================
    const LEGAL_CONTENT = {
        terms: {
            title: 'Términos y Condiciones',
            content: `
                <h4 class="font-bold mb-2">1. Introducción</h4>
                <p class="mb-4">Bienvenido a Ceveco (ceveco.com.co). Estos términos y condiciones regulan el uso de nuestro sitio web y la compra de productos a través del mismo.</p>
                <h4 class="font-bold mb-2">2. Uso del Sitio</h4>
                <p class="mb-4">Al acceder a este sitio, usted confirma que tiene al menos 18 años de edad o que está accediendo bajo la supervisión de un padre o tutor.</p>
                <h4 class="font-bold mb-2">3. Precios y Disponibilidad</h4>
                <p class="mb-4">Todos los precios están en pesos colombianos (COP). Nos reservamos el derecho de modificar los precios sin previo aviso.</p>
            `
        },
        privacy: {
            title: 'Política de Privacidad',
            content: `
                <h4 class="font-bold mb-2">Protección de Datos</h4>
                <p class="mb-4">En cumplimiento de la Ley 1581 de 2012, Ceveco se compromete a proteger sus datos personales. Sus datos serán tratados de manera confidencial y solo para los fines establecidos.</p>
                <h4 class="font-bold mb-2">Recopilación de Información</h4>
                <p class="mb-4">Recopilamos información cuando usted se registra, realiza una compra o se suscribe a nuestro boletín.</p>
            `
        },
        shipping: {
            title: 'Política de Envíos',
            content: `
                <h4 class="font-bold mb-2">Cobertura</h4>
                <p class="mb-4">Realizamos envíos a los principales municipios de Colombia.</p>
                <h4 class="font-bold mb-2">Tiempos de Entrega</h4>
                <p class="mb-4">El tiempo estimado de entrega es de 2 a 5 días hábiles en ciudades principales y hasta 8 días en otras zonas. Pueden presentarse variaciones por causas ajenas a nuestra voluntad.</p>
            `
        },
        returns: {
            title: 'Garantías y Devoluciones',
            content: `
                <h4 class="font-bold mb-2">Garantía Legal</h4>
                <p class="mb-4">Todos nuestros productos cuentan con la garantía legal establecida por la Superintendencia de Industria y Comercio.</p>
                <h4 class="font-bold mb-2">Derecho de Retracto</h4>
                <p class="mb-4">Usted tiene derecho a devolver el producto dentro de los 5 días hábiles siguientes a la recepción, siempre que esté en perfectas condiciones y en su empaque original.</p>
            `
        },
        cookies: {
            title: 'Política de Cookies',
            content: `
                <p class="mb-4">Utilizamos cookies propias y de terceros para mejorar su experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido.</p>
            `
        }
    };

    // Función para abrir el modal
    window.openLegalModal = function (type) {
        const modal = document.getElementById('legal-modal');
        const backdrop = document.getElementById('legal-backdrop');
        const card = document.getElementById('legal-modal-card');
        const title = document.getElementById('legal-title');
        const content = document.getElementById('legal-content');

        if (!modal || !backdrop || !card || !title || !content) {
            console.error('Modal elements not found');
            return;
        }

        const data = LEGAL_CONTENT[type];
        if (!data) {
            console.error('Legal content not found for type:', type);
            return;
        }

        // Set content
        title.textContent = data.title;
        content.innerHTML = data.content;

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Trigger animations
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        });

        // Reinit lucide icons if needed
        if (window.lucide) window.lucide.createIcons();
    };

    // Función para cerrar el modal
    window.closeLegalModal = function () {
        const modal = document.getElementById('legal-modal');
        const backdrop = document.getElementById('legal-backdrop');
        const card = document.getElementById('legal-modal-card');

        if (!modal || !backdrop || !card) return;

        // Animate out
        backdrop.style.opacity = '0';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';

        // Hide after animation
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    };

    // Setup event listeners for legal modal
    function setupLegalModalListeners() {
        // Open modal when clicking legal links
        document.addEventListener('click', (e) => {
            const legalBtn = e.target.closest('.legal-link');
            if (legalBtn) {
                e.preventDefault();
                const type = legalBtn.dataset.legal;
                if (type) window.openLegalModal(type);
            }
        });

        // Close modal listeners
        const closeElements = ['legal-close-x', 'legal-ok-btn', 'legal-backdrop'];
        closeElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.closeLegalModal();
                });
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('legal-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    window.closeLegalModal();
                }
            }
        });
    }

    // Initialize legal modal listeners after components load
    document.addEventListener('components:loaded', setupLegalModalListeners);
    // Also try immediate setup in case components are already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(setupLegalModalListeners, 100);
    }

    // ==========================================
    // 8. BANK QR MODAL
    // ==========================================
    const BANK_QR_DATA = {
        bancolombia: {
            title: 'Pago con Bancolombia',
            image: '../assets/img/qr-bancolombia.png'
        },
        davivienda: {
            title: 'Pago con Davivienda',
            image: '../assets/img/qr-davivienda.png'
        }
    };

    // Función para abrir el modal de QR bancario
    window.openBankQRModal = function (bank) {
        const modal = document.getElementById('bank-qr-modal');
        const backdrop = document.getElementById('bank-qr-backdrop');
        const card = document.getElementById('bank-qr-card');
        const title = document.getElementById('bank-qr-title');
        const image = document.getElementById('bank-qr-image');

        if (!modal || !backdrop || !card || !title || !image) {
            console.error('Bank QR modal elements not found');
            return;
        }

        const data = BANK_QR_DATA[bank];
        if (!data) {
            console.error('Bank QR data not found for:', bank);
            return;
        }

        // Set content
        title.textContent = data.title;
        image.src = data.image;
        image.alt = `Código QR ${data.title}`;

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Trigger animations
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        });

        // Reinit lucide icons if needed
        if (window.lucide) window.lucide.createIcons();
    };

    // Función para cerrar el modal de QR bancario
    window.closeBankQRModal = function () {
        const modal = document.getElementById('bank-qr-modal');
        const backdrop = document.getElementById('bank-qr-backdrop');
        const card = document.getElementById('bank-qr-card');
        const image = document.getElementById('bank-qr-image');

        if (!modal || !backdrop || !card) return;

        // Reset zoom state
        if (image) {
            image.classList.remove('scale-150');
            image.classList.remove('cursor-zoom-out');
            image.classList.add('cursor-zoom-in');
            if (card.classList.contains('overflow-auto')) {
                card.classList.remove('overflow-auto');
            }
        }

        // Animate out
        backdrop.style.opacity = '0';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';

        // Hide after animation
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    };

    // Setup event listeners for bank QR modal
    function setupBankQRModalListeners() {
        // Open modal when clicking bank buttons
        document.addEventListener('click', (e) => {
            const bankBtn = e.target.closest('.bank-qr-btn');
            if (bankBtn) {
                e.preventDefault();
                const bank = bankBtn.dataset.bank;
                if (bank) window.openBankQRModal(bank);
            }
        });

        // Close modal listeners
        const closeElements = ['bank-qr-close-x', 'bank-qr-backdrop'];
        closeElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.closeBankQRModal();
                });
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('bank-qr-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    window.closeBankQRModal();
                }
            }
        });

        // Zoom toggle on image click
        document.addEventListener('click', (e) => {
            const qrImage = e.target.closest('#bank-qr-image');
            if (qrImage) {
                e.stopPropagation(); // Prevent closing modal
                const card = document.getElementById('bank-qr-card');
                const isZoomed = qrImage.classList.contains('scale-150');

                if (isZoomed) {
                    // Zoom out
                    qrImage.classList.remove('scale-150');
                    qrImage.classList.remove('cursor-zoom-out');
                    qrImage.classList.add('cursor-zoom-in');
                    if (card) card.classList.remove('overflow-auto');
                } else {
                    // Zoom in
                    qrImage.classList.add('scale-150');
                    qrImage.classList.remove('cursor-zoom-in');
                    qrImage.classList.add('cursor-zoom-out');
                    if (card) card.classList.add('overflow-auto');
                }
            }
        });
    }

    // Initialize bank QR modal listeners after components load
    document.addEventListener('components:loaded', setupBankQRModalListeners);
    // Also try immediate setup in case components are already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(setupBankQRModalListeners, 100);
    }

    // ==========================================
    // 6. EXECUTION START
    // ==========================================
    document.addEventListener('DOMContentLoaded', async () => {
        await loadSharedComponents();
        setupGlobalListeners();
    });

})();
