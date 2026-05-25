/**
 * Home Page Script
 * Maneja la lógica específica de la página de inicio (Carruseles, Productos Destacados)
 */

/**
 * Renders N skeleton product cards into the given container.
 * @param {HTMLElement} container
 * @param {number} n
 */
function renderSkeletonCards(container, n = 6) {
    container.innerHTML = Array(n).fill(0).map(() => `
        <article class="skeleton-card" style="min-width:240px;width:240px">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-body">
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text long"></div>
                <div class="skeleton skeleton-text long"></div>
                <div class="skeleton skeleton-text price"></div>
                <div class="skeleton skeleton-button skeleton"></div>
            </div>
        </article>
    `).join('');
}

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

// Escape helper (matches productos.js)
function _escHomeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Build a small product card matching frontend/components/card-producto.html (no price, modelo cotización)
function buildHomeProductCard(product) {
    const id = product.id_producto || product.id;
    const nombre = product.nombre || '';
    const imagen = product.imagen_principal
        || product.imagen
        || (product.imagenes && product.imagenes[0]?.url_imagen)
        || '/images/productos/placeholder.webp';
    const marcaName = typeof product.marca === 'object' ? (product.marca?.nombre || '') : (product.marca || '');
    const categoria = product.categoria?.nombre || product.categoria || marcaName;

    window.__productosCache = window.__productosCache || {};
    if (id) window.__productosCache[id] = product;

    let badgeBlock = '';
    if (product.destacado) {
        badgeBlock = `<span class="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-[#FE2418] text-white text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-md shadow-md"><i data-lucide="flame" class="w-3 h-3"></i> Destacado</span>`;
    }

    const fallbackImages = Array.isArray(product.imagenes)
        ? product.imagenes.map(i => i.url_imagen).filter(Boolean)
        : [];
    const fallbackAttr = _escHomeHtml(JSON.stringify(fallbackImages));

    return `<div class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group h-full flex flex-col relative cursor-pointer js-product-card snap-start"
    data-product-id="${id}">
    <button type="button"
        class="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all z-20 btn-favorite transform transition-transform duration-200 js-toggle-favorite"
        data-id="${id}">
        <i data-lucide="heart" class="w-4 h-4 text-gray-400 transition-colors pointer-events-none"></i>
    </button>

    <a href="/pages/detalle-producto.html?id=${id}" class="block relative pt-[100%] overflow-hidden bg-gray-50 rounded-t-xl">
        <img src="${_escHomeHtml(imagen)}" alt="${_escHomeHtml(nombre)}" loading="lazy" decoding="async"
            data-fallback-images="${fallbackAttr}"
            class="js-product-image absolute top-0 left-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500">
        ${badgeBlock}
    </a>

    <div class="p-4 flex flex-col flex-1">
        <div class="mb-1">
            <p class="text-xs text-gray-500 uppercase tracking-wider line-clamp-1">${_escHomeHtml(categoria)}</p>
        </div>
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 h-[2.5rem] overflow-hidden group-hover:text-primary transition-colors leading-tight" title="${_escHomeHtml(nombre)}">
            ${_escHomeHtml(nombre)}
        </h3>
        <div class="mt-auto">
            <button type="button"
                class="w-full h-10 px-4 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-md transform active:scale-95 js-quote-product"
                data-id="${id}" data-name="${_escHomeHtml(nombre)}" data-image="${_escHomeHtml(imagen)}"
                data-brand="${_escHomeHtml(marcaName)}">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span class="text-sm font-bold pointer-events-none">Cotizar producto</span>
            </button>
        </div>
    </div>
</div>`;
}

// Cargar productos destacados
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    // Show skeleton loaders immediately
    renderSkeletonCards(container, 6);

    try {
        // Reducir a 6 productos para no saturar
        const response = await window.ProductService.getFeatured(6);

        if (response && response.success && response.data && response.data.length > 0) {
            const cardsHtml = response.data.map(producto => buildHomeProductCard(producto)).join('');
            container.innerHTML = cardsHtml;
            if (window.lucide) lucide.createIcons();
        } else {
            container.innerHTML = `<p class="text-center text-gray-500 py-8 w-full">No hay productos destacados disponibles.</p>`;
        }

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
            // Build one set of brand elements
            const brandElements = brands.map(marca =>
                `<span>${marca.nombre}</span>`
            ).join('');
            // Duplicate exactly once so translateX(-50%) creates a seamless loop
            container.innerHTML = brandElements + brandElements;
        } else {
            container.innerHTML = '<span>No hay marcas disponibles</span>';
        }
    } catch (error) {
        console.error('Error loading brands:', error);
        container.innerHTML = '<span>Error al cargar marcas</span>';
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

function startCarousel(heroImageEl, heroImages, initialIndex) {
    if (heroImages.length === 0) return;

    // Usar una variable que persista entre llamadas
    let currentHeroIndex = initialIndex;

    // Establecer la primera imagen inmediatamente
    const setImage = (index) => {
        const imageUrl = heroImages[index];
        if (!imageUrl) return;

        // Pre-cargar la imagen para evitar mostrar imagen rota
        const img = new Image();
        img.onload = () => {
            heroImageEl.src = imageUrl;
            heroImageEl.style.opacity = '1';
            // Mantener object-fit cover para llenar el espacio fijo
            heroImageEl.style.objectFit = 'cover';
            heroImageEl.style.objectPosition = 'center center';
        };
        img.onerror = () => {
            console.error('Error cargando imagen de banner:', imageUrl);
            // Si hay error, intentar con la siguiente imagen
            if (heroImages.length > 1) {
                const nextIndex = (index + 1) % heroImages.length;
                if (nextIndex !== currentHeroIndex) {
                    setImage(nextIndex);
                }
            }
        };
        img.src = imageUrl;
    };

    // Establecer la primera imagen inmediatamente
    setImage(currentHeroIndex);

    // Si solo hay una imagen, no iniciar el carrusel
    if (heroImages.length <= 1) return;

    // Iniciar el carrusel para cambiar imágenes cada 5 segundos
    setInterval(() => {
        heroImageEl.style.opacity = '0';
        setTimeout(() => {
            currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
            setImage(currentHeroIndex);
        }, 1000);
    }, 5000);
}
