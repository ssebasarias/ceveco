/**
 * Logica de la pagina de Detalle de Producto
 */

function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Variables globales para el producto actual
let currentProduct = null;
let currentQuantity = 1;
let currentImageIndex = 0;

// Elementos del DOM
const dom = {
    loadingState: () => document.getElementById('loading-state'),
    errorState: () => document.getElementById('error-state'),
    content: () => document.getElementById('product-content'),
    tabs: () => document.getElementById('product-details-tabs'),
    related: () => document.getElementById('related-products-section'),
    qtyInput: () => document.getElementById('quantity-input'),
    mainImage: () => document.getElementById('main-image'),
    thumbnails: () => document.getElementById('thumbnails-container')
};

// Función de búsqueda
function handleSearch() {
    const query = document.getElementById('search-input').value;
    if (query) {
        window.location.href = `productos.html?q=${encodeURIComponent(query)}`;
    }
}

// Obtener ID del producto de la URL
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Cargar detalles del producto
async function loadProductDetails() {
    const productId = getProductIdFromUrl();

    if (!productId) {
        showError();
        return;
    }

    try {
        const response = await window.ProductService.getById(productId);

        if (response.success && response.data) {
            currentProduct = response.data;
            await renderProduct(currentProduct);
            loadRelatedProducts(currentProduct.id_producto);
        } else {
            showError();
        }
    } catch (error) {
        console.error('Error al cargar producto:', error);
        showError();
    } finally {
        const loader = dom.loadingState();
        if (loader) {
            loader.classList.remove('flex');
            loader.classList.add('hidden');
        }
    }
}

// Filtra imágenes rotas haciendo preload de cada URL
async function filterValidImages(images) {
    if (!Array.isArray(images) || images.length === 0) return [];
    const checks = images.map(img => new Promise(resolve => {
        const url = img.url_imagen || img.url;
        if (!url) return resolve(null);
        const test = new Image();
        let done = false;
        const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, 5000);
        test.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve(img); } };
        test.onerror = () => { if (!done) { done = true; clearTimeout(timer); resolve(null); } };
        test.src = url;
    }));
    const results = await Promise.all(checks);
    return results.filter(Boolean);
}

// Renderizar información del producto
async function renderProduct(product) {
    // Mostrar contenido
    dom.content().classList.remove('hidden');
    dom.tabs().classList.remove('hidden');
    dom.related().classList.remove('hidden');

    // Título y Meta
    document.title = `${product.nombre} - Ceveco`;
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = `${product.nombre} - Ceveco`;

    // Breadcrumbs
    const breadCategory = document.getElementById('breadcrumb-category');
    if (breadCategory) {
        const catDisplay = typeof product.categoria === 'object' ? (product.categoria?.nombre || '') : (product.categoria || '');
        breadCategory.textContent = catDisplay;
        breadCategory.href = `productos.html?categoria=${product.categoria_slug || ''}`;
    }
    const breadProduct = document.getElementById('breadcrumb-product');
    if (breadProduct) breadProduct.textContent = product.nombre;

    // Info básica
    const marcaDisplay = typeof product.marca === 'object' ? (product.marca?.nombre || '') : (product.marca || '');
    setText('product-brand', marcaDisplay);
    setText('product-name', product.nombre);
    setText('product-short-desc', product.descripcion_corta || '');

    // Precios
    setText('product-price', window.formatPrice(product.precio_actual));
    if (product.precio_anterior) {
        const oldPriceEl = document.getElementById('product-old-price');
        setText('product-old-price', window.formatPrice(product.precio_anterior));
        if (oldPriceEl) oldPriceEl.classList.remove('hidden');
    }

    // Badge
    if (product.badge) {
        const badgeContainer = document.getElementById('product-badge');
        if (badgeContainer) badgeContainer.innerHTML = `<span class="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">${escHtml(product.badge)}</span>`;
    }

    // Stock
    const stockStatus = document.getElementById('stock-status');
    if (stockStatus) {
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (product.stock > 0) {
            stockStatus.textContent = `Disponible (${product.stock} unidades) - Envío gratis`;
            stockStatus.parentElement.classList.add('text-green-600');
        } else {
            stockStatus.textContent = 'Agotado';
            stockStatus.parentElement.classList.remove('text-green-600');
            stockStatus.parentElement.classList.add('text-red-600');
            const icon = document.querySelector('.lucide-check-circle');
            if (icon) icon.setAttribute('data-lucide', 'x-circle');

            if (addToCartBtn) {
                addToCartBtn.disabled = true;
                addToCartBtn.classList.add('opacity-50', 'cursor-not-allowed');
                addToCartBtn.textContent = 'Agotado';
            }
        }
    }

    // Imágenes - filtrar imágenes rotas antes de renderizar y ordenar por es_principal + orden
    let rawImages = product.imagenes || [];

    // Sort: es_principal first, then by orden ascending
    rawImages = rawImages.slice().sort((a, b) => {
        if (a.es_principal && !b.es_principal) return -1;
        if (!a.es_principal && b.es_principal) return 1;
        return (a.orden || 0) - (b.orden || 0);
    });

    // Filter broken images by trying to load each
    const images = await filterValidImages(rawImages);

    const fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 400 400\'%3E%3Crect fill=\'%23f3f4f6\' width=\'400\' height=\'400\'/%3E%3Ctext fill=\'%239ca3af\' font-family=\'sans-serif\' font-size=\'24\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3ESin Imagen%3C/text%3E%3C/svg%3E';
    let mainImgUrl = fallbackSvg;
    if (images.length > 0) {
        const imagenPrincipal = images.find(img => img.es_principal) || images[0];
        mainImgUrl = imagenPrincipal.url_imagen || imagenPrincipal.url || fallbackSvg;
    }

    const mainImage = dom.mainImage();
    if (mainImage) {
        mainImage.src = mainImgUrl;
        mainImage.onerror = function() {
            this.onerror = null;
            this.src = fallbackSvg;
        };
    }

    // Renderizar thumbnails (solo las válidas)
    const thumbnailsContainer = dom.thumbnails();

    if (images.length > 0 && thumbnailsContainer) {
        thumbnailsContainer.innerHTML = images.map((img, index) => {
            const imgUrl = img.url_imagen || img.url || fallbackSvg;
            return `
            <button data-url="${imgUrl}" data-index="${index}"
                class="thumbnail ${index === 0 ? 'active border-primary' : 'border-gray-200'} border-2 rounded-lg overflow-hidden aspect-square hover:border-primary transition-all">
                <img src="${imgUrl}" alt="Vista ${index + 1}"
                    onerror="this.onerror=null;this.src='${fallbackSvg}';"
                    class="w-full h-full object-contain p-1 pointer-events-none">
            </button>
        `;
        }).join('');
    } else if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
    }

    // Descripción: prefer descripcion_larga (scraped), fallback to descripcion or descripcion_corta
    const fullDesc = document.getElementById('full-description');
    const descripcion = product.descripcion_larga || product.descripcion || product.descripcion_corta || '';
    if (fullDesc) {
        if (descripcion) {
            fullDesc.innerHTML = `<p>${escHtml(descripcion)}</p>`;
        } else {
            fullDesc.innerHTML = `<p class="text-gray-400 italic">Sin descripción disponible.</p>`;
        }
    }

    // Especificaciones (soporta product.specs JSONB del scraper Y product.especificaciones legacy)
    renderSpecs(product);

    // WhatsApp / Cotizar Button — wire data-* para que asesor-modal.js (event delegation .js-quote-product) lo capture
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.dataset.id = product.id_producto;
        whatsappBtn.dataset.name = product.nombre || '';
        whatsappBtn.dataset.image = (product.imagenes?.[0]?.url_imagen) || '';
        const marca = typeof product.marca === 'object' ? (product.marca?.nombre || '') : (product.marca || '');
        whatsappBtn.dataset.brand = marca;
        // Cache producto para que asesor-modal pueda recuperarlo si hace falta
        window.__productosCache = window.__productosCache || {};
        window.__productosCache[product.id_producto] = product;
    }

    // Favorite Button Setup
    const favBtn = document.getElementById('detail-fav-btn');
    if (favBtn) favBtn.setAttribute('data-id', product.id_producto);

    // Re-init icons
    if (window.lucide) window.lucide.createIcons();

    // Update Favorites State
    if (typeof window.updateFavoritesUI === 'function') {
        window.updateFavoritesUI();
    }
}

// Helper para renderizar especificaciones (soporta product.specs JSONB del scraper Y product.especificaciones legacy)
function renderSpecs(product) {
    const specsContainer = document.getElementById('specs-container');
    if (!specsContainer) return;

    const rowHtml = (k, v) => `
        <div class="flex justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2 rounded">
            <span class="font-semibold text-gray-700">${escHtml(k)}:</span>
            <span class="text-gray-900 font-medium">${escHtml(v)}</span>
        </div>
    `;

    // 1) Prefer product.specs (JSONB scraped — object con clave/valor)
    if (product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0) {
        const entries = Object.entries(product.specs).filter(([k, v]) => k && v != null && String(v).trim() !== '');
        if (entries.length > 0) {
            const html = entries.map(([k, v]) => rowHtml(k, String(v))).join('');
            specsContainer.innerHTML = `<div class="space-y-1">${html}</div>`;
            return;
        }
    }

    // 2) Legacy: product.especificaciones (array)
    if (Array.isArray(product.especificaciones) && product.especificaciones.length > 0) {
        const html = product.especificaciones.map(spec => {
            const valor = spec.valor || 'N/A';
            const unidad = spec.unidad ? ` ${spec.unidad}` : '';
            return rowHtml(spec.nombre, `${valor}${unidad}`);
        }).join('');
        specsContainer.innerHTML = `<div class="space-y-1">${html}</div>`;
        return;
    }

    // 3) Fallback: ocultar elegantemente o mensaje suave
    specsContainer.innerHTML = `
        <div class="p-6 bg-gray-50 border border-gray-100 rounded-lg text-center">
            <svg class="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm text-gray-500">
                Especificaciones técnicas no disponibles. Contacta a un asesor para más información.
            </p>
        </div>
    `;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Cargar productos relacionados
async function loadRelatedProducts(productId) {
    try {
        const response = await window.ProductService.getRelated(productId, 4);
        const container = document.getElementById('related-products');
        const section = document.getElementById('related-products-section');

        if (response.success && response.data.length > 0 && container) {
            const cardsHtml = (await Promise.all(response.data.map(p => window.renderProductCard(p)))).join('');
            container.innerHTML = cardsHtml;
            if (window.lucide) window.lucide.createIcons();
            if (typeof window.updateFavoritesUI === 'function') window.updateFavoritesUI();
        } else if (section) {
            section.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function showError() {
    const loading = dom.loadingState();
    const error = dom.errorState();
    if (loading) {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
    if (error) error.classList.remove('hidden');
}

function changeImage(url, index) {
    const mainImage = dom.mainImage();
    if (mainImage) mainImage.src = url;
    currentImageIndex = index;

    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active', 'border-primary');
            thumb.classList.remove('border-gray-200');
        } else {
            thumb.classList.remove('active', 'border-primary');
            thumb.classList.add('border-gray-200');
        }
    });
}

function updateQuantity(change) {
    const input = dom.qtyInput();
    if (!input) return;

    let newValue = parseInt(input.value) + change;
    if (newValue < 1) newValue = 1;
    if (currentProduct && newValue > currentProduct.stock) newValue = currentProduct.stock;

    input.value = newValue;
    currentQuantity = newValue;
}

function switchTab(tabName) {
    const activeClasses = ['active', 'bg-white', 'text-primary', 'shadow-sm', 'ring-1', 'ring-black/5', 'font-semibold'];
    const inactiveClasses = ['text-gray-500', 'hover:text-gray-900', 'font-medium'];

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove(...activeClasses);
        btn.classList.add(...inactiveClasses);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeBtn = document.getElementById(`tab-${tabName}`);
    const activeContent = document.getElementById(`content-${tabName}`);

    if (activeBtn) {
        activeBtn.classList.add(...activeClasses);
        activeBtn.classList.remove(...inactiveClasses);
    }
    if (activeContent) activeContent.classList.remove('hidden');
}

// Initialize Listeners
function setupEventListeners() {
    // Quantity
    const minusBtn = document.getElementById('qty-minus-btn');
    const plusBtn = document.getElementById('qty-plus-btn');
    if (minusBtn) minusBtn.addEventListener('click', () => updateQuantity(-1));
    if (plusBtn) plusBtn.addEventListener('click', () => updateQuantity(1));

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-button');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Thumbnails (Delegation)
    const thumbsContainer = document.getElementById('thumbnails-container');
    if (thumbsContainer) {
        thumbsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.thumbnail');
            if (btn) {
                changeImage(btn.dataset.url, parseInt(btn.dataset.index));
            }
        });
    }

    // Favorites (Delegation or direct if id exists)
    const favBtn = document.getElementById('detail-fav-btn');
    if (favBtn) {
        favBtn.addEventListener('click', (e) => {
            if (currentProduct && window.handleToggleFavorite) {
                window.handleToggleFavorite(favBtn, currentProduct.id_producto, e);
            }
        });
    }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar iconos Lucide
    if (window.lucide) window.lucide.createIcons();

    setupEventListeners();
    await loadProductDetails();
});
