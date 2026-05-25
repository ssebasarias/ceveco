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
        console.warn('💡 Verifica que todos los scripts se hayan cargado en el orden correcto');
    } else {
        console.log('✅ Core Services Ready');
        initializeGlobalState();
    }

    // Función de diagnóstico de servicios (disponible globalmente)
    window.checkServicesStatus = function () {
        console.log('\n🔍 VERIFICACIÓN DE SERVICIOS CEVECO\n');
        console.log('═'.repeat(50));

        const services = {
            'CONSTANTS': window.CONSTANTS,
            'StorageUtils': window.StorageUtils,
            'API': window.API,
            'AuthService': window.AuthService,
            'ProductService': window.ProductService,
            'FavoritesService': window.FavoritesService,
            'OrdersService': window.OrdersService
        };

        let allOk = true;
        Object.keys(services).forEach(name => {
            const service = services[name];
            if (service && typeof service === 'object') {
                console.log(`✅ ${name}: Disponible`);
            } else {
                console.log(`❌ ${name}: NO DISPONIBLE`);
                allOk = false;
            }
        });

        console.log('═'.repeat(50));

        // Verificar endpoints del API
        if (window.API && window.CONSTANTS) {
            console.log('\n📡 Verificando conectividad con el backend...');
            fetch('/health')
                .then(res => res.json())
                .then(data => {
                    console.log('✅ Backend conectado:', data.message);
                    console.log('   Entorno:', data.environment);
                })
                .catch(err => {
                    console.error('❌ No se pudo conectar al backend:', err.message);
                    console.log('💡 Asegúrate de que el servidor esté corriendo en el puerto 3000');
                });
        }

        if (allOk) {
            console.log('\n🎉 Todos los servicios están disponibles');
        } else {
            console.log('\n⚠️  Algunos servicios no están disponibles');
            console.log('💡 Recarga la página o verifica la consola para más detalles');
        }

        return allOk;
    };

    function initializeGlobalState() {
        // Restore session if token exists
        if (window.AuthService && window.AuthService.isAuthenticated()) {
            window.AuthService.refreshProfile().catch(() => {
                if (window.StorageUtils) window.StorageUtils.removeUser();
            });
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

    // Helper for rich card HTML generation (sync, no template needed)
    window.createProductCard = function (product) {
        const _escHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const _formatCOP = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

        const id = product.id_producto || product.id || '';
        const imagen = product.imagen_principal || (product.imagenes && (product.imagenes[0]?.url_imagen || product.imagenes[0]?.url)) || '/images/placeholder.webp';
        const precioFormat = product.precio_actual != null ? _formatCOP(product.precio_actual) : 'Consultar precio';
        const precioAnterior = product.precio_anterior && +product.precio_anterior > +product.precio_actual
            ? `<span class="text-gray-400 line-through text-xs mr-1">${_formatCOP(product.precio_anterior)}</span>` : '';

        let badge = '';
        if (product.destacado) {
            badge = `<span class="absolute top-2 left-2 z-10 bg-[#FE2418] text-white text-[10px] font-bold px-2 py-0.5 rounded">DESTACADO</span>`;
        } else if (product.badge) {
            badge = `<span class="absolute top-2 left-2 z-10 bg-[#FFD23F] text-[#091C49] text-[10px] font-bold px-2 py-0.5 rounded">${_escHtml(product.badge)}</span>`;
        }

        const stars = (product.total_resenas > 0 && product.calificacion_promedio)
            ? `<div class="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><span class="text-yellow-400">&#9733;</span>${(+product.calificacion_promedio).toFixed(1)}<span class="text-gray-400">(${product.total_resenas})</span></div>` : '';

        const marcaName = typeof product.marca === 'object' ? (product.marca?.nombre || '') : (product.marca || '');

        return `<article class="product-card relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col">
    ${badge}
    <button class="favorite-btn absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-300 hover:text-[#FE2418] z-10 transition-colors"
        data-product-id="${id}" data-action="toggle-favorite" aria-label="Agregar a favoritos">
        <i data-lucide="heart" class="w-4 h-4"></i>
    </button>
    <a href="/pages/detalle-producto.html?id=${id}" class="block">
        <div class="aspect-square bg-gray-50 overflow-hidden">
            <img src="${_escHtml(imagen)}"
                alt="${_escHtml(product.nombre || '')}"
                loading="lazy" decoding="async"
                class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                onerror="this.onerror=null;this.src='/images/placeholder.webp'">
        </div>
    </a>
    <div class="p-3 flex flex-col flex-1">
        <p class="text-xs font-semibold text-[#00458E] uppercase tracking-wide mb-0.5">${_escHtml(marcaName)}</p>
        <h3 class="text-sm font-bold text-[#091C49] leading-tight mb-1 min-h-[2.5rem] line-clamp-2">${_escHtml(product.nombre || '')}</h3>
        ${stars}
        <div class="mt-1.5 mb-2">${precioAnterior}<p class="text-lg font-extrabold text-[#FE2418] leading-tight">${precioFormat}</p></div>
        <div class="flex gap-1.5 mt-auto">
            <button class="flex-1 bg-[#FE2418] hover:bg-[#d91b10] text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                data-action="cotizar" data-product-id="${id}" aria-label="Cotizar por WhatsApp">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>Cotizar
            </button>
            <a href="/pages/detalle-producto.html?id=${id}"
                class="flex-1 border border-gray-300 hover:border-[#091C49] text-[#091C49] text-xs font-bold py-2 rounded-lg text-center transition-colors flex items-center justify-center">
                Ver detalle
            </a>
        </div>
    </div>
</article>`;
    };

    window.renderProductCard = async function (product) {
        // Cache product for cotizar
        if (product.id_producto) {
            window.__productosCache = window.__productosCache || {};
            window.__productosCache[product.id_producto] = product;
        }
        return window.createProductCard(product);
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
            const [navbarHtml, footerHtml] = await Promise.all([
                fetchText('/components/navbar.html'),
                fetchText('/components/footer.html'),
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

            // Init Components
            if (window.lucide) window.lucide.createIcons();
            document.dispatchEvent(new CustomEvent('components:loaded'));

            // Init Auth UI
            if (typeof window.updateAuthUI === 'function') window.updateAuthUI();
            else if (typeof window.setupUserMenu === 'function') window.setupUserMenu();

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

            // Quote Product (WhatsApp) - data-action="cotizar" (new rich cards)
            const cotizarBtn = e.target.closest('[data-action="cotizar"]');
            if (cotizarBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = cotizarBtn.dataset.productId;
                const product = window.__productosCache?.[id];
                if (product) {
                    if (typeof window.cotizarProducto === 'function') window.cotizarProducto(product);
                } else if (id) {
                    fetch(`/api/v1/productos/${id}`)
                        .then(r => r.json())
                        .then(d => {
                            if (d.success && d.data) {
                                window.__productosCache = window.__productosCache || {};
                                window.__productosCache[id] = d.data;
                                if (typeof window.cotizarProducto === 'function') window.cotizarProducto(d.data);
                            }
                        })
                        .catch(err => console.error('Error fetching product for quote:', err));
                }
                return;
            }

            // Quote Product (legacy .js-quote-product) - Ahora abre modal de asesores
            const quoteBtn = e.target.closest('.js-quote-product');
            if (quoteBtn) {
                e.preventDefault();
                e.stopPropagation();

                const d = quoteBtn.dataset;
                const productInfo = {
                    nombre: d.name || 'Producto',
                    sku: d.id || ''
                };

                // Abrir modal de selección de asesor
                if (typeof abrirModalAsesor === 'function') {
                    abrirModalAsesor(productInfo);
                } else {
                    console.warn('Modal de asesores no disponible, usando WhatsApp directo');
                    let phone = '573001234567';
                    if (window.CONFIG && window.CONFIG.APP && window.CONFIG.APP.whatsapp) {
                        phone = window.CONFIG.APP.whatsapp.replace(/\D/g, '');
                    }
                    const message = `Hola, me interesa cotizar este producto:\n\n*${productInfo.nombre}*\nRef/ID: ${productInfo.sku}`;
                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                    window.open(url, '_blank');
                }
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
