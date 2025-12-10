/**
 * Logica de la pagina de Detalle de Producto
 */

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
            renderProduct(currentProduct);
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

// Renderizar información del producto
function renderProduct(product) {
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
        breadCategory.textContent = product.categoria;
        breadCategory.href = `productos.html?categoria=${product.categoria_slug}`;
    }
    const breadProduct = document.getElementById('breadcrumb-product');
    if (breadProduct) breadProduct.textContent = product.nombre;

    // Info básica
    setText('product-brand', product.marca);
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
        if (badgeContainer) badgeContainer.innerHTML = `<span class="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">${product.badge}</span>`;
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

    // Imágenes
    const mainImgUrl = product.imagen_principal || 'https://via.placeholder.com/600x600?text=Sin+Imagen';
    const mainImage = dom.mainImage();
    if (mainImage) mainImage.src = mainImgUrl;

    // Renderizar thumbnails
    const thumbnailsContainer = dom.thumbnails();
    let images = product.imagenes || [];
    if (images.length === 0 && product.imagen_principal) {
        images = [{ url: product.imagen_principal }];
    }

    if (images.length > 0 && thumbnailsContainer) {
        thumbnailsContainer.innerHTML = images.map((img, index) => `
            <button data-url="${img.url}" data-index="${index}"
                class="thumbnail ${index === 0 ? 'active border-primary' : 'border-gray-200'} border-2 rounded-lg overflow-hidden aspect-square hover:border-primary transition-all">
                <img src="${img.url}" alt="Vista ${index + 1}" class="w-full h-full object-contain p-1 pointer-events-none">
            </button>
        `).join('');
    }

    // Descripción larga
    const fullDesc = document.getElementById('full-description');
    if (fullDesc) fullDesc.innerHTML = product.descripcion_larga || `<p>${product.descripcion_corta}</p>`;

    // Especificaciones
    renderSpecs(product);

    // WhatsApp Button
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        const whatsappMsg = `Hola, estoy interesado en el producto ${product.nombre} (Ref: ${product.sku})`;
        whatsappBtn.href = `https://wa.me/573001234567?text=${encodeURIComponent(whatsappMsg)}`;
    }

    // Add to Cart Button Logic
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.onclick = () => {
            // Usar funcion global de cart-sidebar.js
            if (window.addToCart) {
                window.addToCart(product.id_producto, product.nombre, product.precio_actual, product.imagen_principal, currentQuantity);
            }
        };
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

// Helper para renderizar especificaciones
function renderSpecs(product) {
    const specsContainer = document.getElementById('specs-container');
    if (!specsContainer) return;

    if (product.especificaciones && product.especificaciones.length > 0) {
        const midPoint = Math.ceil(product.especificaciones.length / 2);
        const col1Specs = product.especificaciones.slice(0, midPoint);
        const col2Specs = product.especificaciones.slice(midPoint);

        const renderList = (specs) => specs.map(spec => `
            <div class="flex justify-between py-3 border-b border-gray-200">
                <span class="font-semibold text-gray-700">${spec.nombre}:</span>
                <span class="text-gray-600">${spec.valor}</span>
            </div>
        `).join('');

        specsContainer.innerHTML = `
            <div class="space-y-3">${renderList(col1Specs)}</div>
            <div class="space-y-3">${renderList(col2Specs)}</div>
        `;
    } else {
        specsContainer.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between py-3 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Marca:</span>
                    <span class="text-gray-600">${product.marca}</span>
                </div>
                <div class="flex justify-between py-3 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Categoría:</span>
                    <span class="text-gray-600">${product.categoria}</span>
                </div>
                 <div class="flex justify-between py-3 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">SKU:</span>
                    <span class="text-gray-600">${product.sku}</span>
                </div>
            </div>
        `;
    }
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
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'text-primary', 'border-primary');
        btn.classList.add('text-gray-600', 'border-transparent');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeBtn = document.getElementById(`tab-${tabName}`);
    const activeContent = document.getElementById(`content-${tabName}`);

    if (activeBtn) {
        activeBtn.classList.add('active', 'text-primary', 'border-primary');
        activeBtn.classList.remove('text-gray-600', 'border-transparent');
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
