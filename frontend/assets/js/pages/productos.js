/**
 * Catálogo de Productos - Ceveco
 * Filtros completos con sync URL <-> filtros, chips de filtros activos
 */

// Inicializar iconos Lucide
if (window.lucide) lucide.createIcons();

// Estado
let currentPage = 1;
let currentLimit = 12;
let totalPages = 1;
let filtersData = null; // datos del endpoint /filters

// Cache de productos para cotización rápida
window.__productosCache = window.__productosCache || {};

// Función de búsqueda global
window.handleSearch = function () {
    const query = document.getElementById('search-input')?.value;
    if (query) {
        window.location.href = `productos.html?q=${encodeURIComponent(query)}`;
    }
};

// ============================================================
// URL HELPERS
// ============================================================
function getUrlParams() {
    const p = new URLSearchParams(window.location.search);
    return {
        categoria: p.get('categoria') || '',
        q: p.get('q') || '',
        destacado: p.get('destacado') || '',
        marca: p.get('marca') || '',          // CSV ids
        subcategoria: p.get('subcategoria') || '',
        precio_min: p.get('precio_min') || '',
        precio_max: p.get('precio_max') || '',
        stock: p.get('stock') || '',
        rating: p.get('rating') || '',
        sort: p.get('sort') || '',
        page: p.get('page') ? parseInt(p.get('page')) : 1
    };
}

function pushUrlParams(params) {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) p.set(k, String(v));
    });
    const newUrl = `${window.location.pathname}?${p.toString()}`;
    history.replaceState(null, '', newUrl);
}

// ============================================================
// FILTROS - LEER DESDE DOM
// ============================================================
function getActiveFilters() {
    const urlParams = getUrlParams();

    // Categoria: prefer radio selection in sidebar, fallback to URL param
    const categoriaRadio = document.querySelector('input[name="categoria"]:checked');
    const categoriaVal = categoriaRadio ? categoriaRadio.value : (urlParams.categoria || '');

    const filters = {
        page: currentPage,
        limit: currentLimit,
        categoria: categoriaVal || undefined,
        q: urlParams.q || undefined,
        destacado: urlParams.destacado || undefined
    };

    // Marcas seleccionadas (checkboxes)
    const marcasChecked = [...document.querySelectorAll('input[name="marca"]:checked')].map(el => el.value);
    if (marcasChecked.length > 0) filters.marca = marcasChecked.join(',');

    // Subcategorías seleccionadas
    const subcatChecked = [...document.querySelectorAll('input[name="subcategoria"]:checked')].map(el => el.value);
    if (subcatChecked.length > 0) filters.subcategoria = subcatChecked[0]; // single

    // Precio
    const minVal = document.getElementById('price-min')?.value;
    const maxVal = document.getElementById('price-max')?.value;
    if (minVal) filters.precio_min = minVal;
    if (maxVal) filters.precio_max = maxVal;

    // Stock
    const stockChk = document.getElementById('filter-stock');
    if (stockChk?.checked) filters.stock = '1';

    // Rating
    const ratingChecked = document.querySelector('input[name="rating"]:checked');
    if (ratingChecked?.value) filters.rating = ratingChecked.value;

    // Sort
    const sortSel = document.getElementById('sort-select');
    if (sortSel?.value && sortSel.value !== 'relevance') filters.sort = sortSel.value;

    return filters;
}

// ============================================================
// SYNC DOM FILTERS -> URL -> FETCH
// ============================================================
function applyFilters() {
    currentPage = 1;
    const filters = getActiveFilters();
    pushUrlParams({ ...filters, page: currentPage });
    updateClearFiltersVisibility();
    updateActiveChips();
    loadProducts();
}

// ============================================================
// LOAD FILTER DATA FROM BACKEND
// ============================================================
async function loadFilterData(categoria) {
    try {
        const url = categoria
            ? `/api/v1/productos/filters?categoria=${encodeURIComponent(categoria)}`
            : `/api/v1/productos/filters`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('filters fetch failed');
        const json = await resp.json();
        if (json.success) {
            filtersData = json.data;
            renderMarcasFilter(json.data.marcas || []);
            renderSubcategoriasFilter(json.data.subcategorias || []);
            applyUrlFiltersToDOM();
        }
    } catch (err) {
        console.error('Error loading filter data:', err);
        // Non-fatal: render empty states
        renderMarcasFilter([]);
    }
}

function renderMarcasFilter(marcas) {
    const container = document.getElementById('marca-options');
    if (!container) return;

    if (marcas.length === 0) {
        container.innerHTML = '<div class="text-xs text-gray-400 py-2 text-center">Sin marcas disponibles</div>';
        return;
    }

    container.innerHTML = marcas.map(m => `
        <label class="filter-option" for="filter-marca-${m.id_marca}">
            <input type="checkbox" id="filter-marca-${m.id_marca}" name="marca"
                value="${m.id_marca}" class="filter-checkbox">
            <span class="filter-label">${escapeHtml(m.nombre)}</span>
            <span class="text-xs text-gray-400 ml-auto">(${m.count})</span>
        </label>
    `).join('');

    // Bind events
    container.querySelectorAll('input[name="marca"]').forEach(cb => {
        cb.addEventListener('change', () => {
            updateGroupBadge('marca-badge', 'input[name="marca"]:checked');
            applyFilters();
        });
    });

    // Marca search input filter
    const searchInput = document.getElementById('marca-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            container.querySelectorAll('.filter-option').forEach(opt => {
                const label = opt.querySelector('.filter-label')?.textContent?.toLowerCase() || '';
                opt.style.display = label.includes(term) ? '' : 'none';
            });
        });
    }
}

function renderSubcategoriasFilter(subcats) {
    const group = document.getElementById('subcategoria-filter-group');
    const container = document.getElementById('subcategoria-options');
    if (!container || !group) return;

    if (subcats.length === 0) {
        group.classList.add('hidden');
        return;
    }

    group.classList.remove('hidden');
    container.innerHTML = subcats.map(s => `
        <label class="filter-option" for="filter-subcat-${s.id_subcategoria}">
            <input type="checkbox" id="filter-subcat-${s.id_subcategoria}" name="subcategoria"
                value="${s.id_subcategoria}" class="filter-checkbox">
            <span class="filter-label">${escapeHtml(s.nombre)}</span>
            <span class="text-xs text-gray-400 ml-auto">(${s.count})</span>
        </label>
    `).join('');

    container.querySelectorAll('input[name="subcategoria"]').forEach(cb => {
        cb.addEventListener('change', () => {
            updateGroupBadge('subcategoria-badge', 'input[name="subcategoria"]:checked');
            applyFilters();
        });
    });
}

function applyUrlFiltersToDOM() {
    const urlParams = getUrlParams();

    // Apply categoria radio
    const categoriaSlug = urlParams.categoria || '';
    const catRadio = document.querySelector(`input[name="categoria"][value="${categoriaSlug}"]`);
    if (catRadio) catRadio.checked = true;
    else {
        // Default to "all"
        const allCatRadio = document.querySelector('input[name="categoria"][value=""]');
        if (allCatRadio) allCatRadio.checked = true;
    }

    // Apply marca checkboxes
    if (urlParams.marca) {
        const ids = urlParams.marca.split(',').map(s => s.trim());
        ids.forEach(id => {
            const cb = document.getElementById(`filter-marca-${id}`);
            if (cb) cb.checked = true;
        });
        updateGroupBadge('marca-badge', 'input[name="marca"]:checked');
    }

    // Apply subcategoria
    if (urlParams.subcategoria) {
        const cb = document.getElementById(`filter-subcat-${urlParams.subcategoria}`);
        if (cb) { cb.checked = true; updateGroupBadge('subcategoria-badge', 'input[name="subcategoria"]:checked'); }
    }

    // Price
    if (urlParams.precio_min) { const el = document.getElementById('price-min'); if (el) el.value = urlParams.precio_min; }
    if (urlParams.precio_max) { const el = document.getElementById('price-max'); if (el) el.value = urlParams.precio_max; }

    // Stock
    if (urlParams.stock === '1') { const el = document.getElementById('filter-stock'); if (el) el.checked = true; }

    // Rating
    if (urlParams.rating) { const el = document.querySelector(`input[name="rating"][value="${urlParams.rating}"]`); if (el) el.checked = true; }

    // Sort
    if (urlParams.sort) { const el = document.getElementById('sort-select'); if (el) el.value = urlParams.sort; }

    // Page
    currentPage = urlParams.page || 1;

    updateClearFiltersVisibility();
    updateActiveChips();
}

// ============================================================
// BADGES & CHIPS
// ============================================================
function updateGroupBadge(badgeId, selector) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    const count = document.querySelectorAll(selector).length;
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
}

function updateClearFiltersVisibility() {
    const filters = getActiveFilters();
    const hasFilters = filters.marca || filters.subcategoria ||
        filters.precio_min || filters.precio_max ||
        filters.stock || filters.rating;
    const btn = document.getElementById('clear-filters-btn');
    if (btn) btn.style.display = hasFilters ? 'inline-block' : 'none';
}

function updateActiveChips() {
    const container = document.getElementById('active-filters-chips');
    if (!container) return;

    const chips = [];
    const filters = getActiveFilters();

    if (filters.marca) {
        const ids = filters.marca.split(',');
        ids.forEach(id => {
            const label = document.getElementById(`filter-marca-${id}`)?.closest('.filter-option')?.querySelector('.filter-label')?.textContent;
            if (label) chips.push({ label: `Marca: ${label}`, action: () => uncheckFilter(`filter-marca-${id}`) });
        });
    }

    if (filters.subcategoria) {
        const cb = document.getElementById(`filter-subcat-${filters.subcategoria}`);
        const label = cb?.closest('.filter-option')?.querySelector('.filter-label')?.textContent;
        if (label) chips.push({ label: `Subcategoría: ${label}`, action: () => uncheckFilter(`filter-subcat-${filters.subcategoria}`) });
    }

    if (filters.precio_min) chips.push({ label: `Precio mín: $${Number(filters.precio_min).toLocaleString('es-CO')}`, action: () => { document.getElementById('price-min').value = ''; applyFilters(); } });
    if (filters.precio_max) chips.push({ label: `Precio máx: $${Number(filters.precio_max).toLocaleString('es-CO')}`, action: () => { document.getElementById('price-max').value = ''; applyFilters(); } });
    if (filters.stock) chips.push({ label: 'Con stock', action: () => { document.getElementById('filter-stock').checked = false; applyFilters(); } });
    if (filters.rating) chips.push({ label: `${filters.rating}+ estrellas`, action: () => { const el = document.getElementById('filter-rating-any'); if (el) el.checked = true; applyFilters(); } });

    if (chips.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = chips.map((chip, i) => `
        <span class="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs font-medium px-2 py-1 rounded-full border border-blue-200 cursor-pointer hover:bg-blue-100" data-chip-index="${i}">
            ${escapeHtml(chip.label)}
            <button type="button" class="ml-1 text-blue-500 hover:text-red-500 font-bold leading-none" aria-label="Quitar filtro">&times;</button>
        </span>
    `).join('');

    container.querySelectorAll('[data-chip-index]').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.chipIndex);
            chips[idx]?.action();
        });
    });
}

function uncheckFilter(id) {
    const el = document.getElementById(id);
    if (el) { el.checked = false; }
    applyFilters();
}

function clearAllFilters() {
    document.querySelectorAll('.filter-checkbox').forEach(cb => { cb.checked = false; });
    const ratingAny = document.getElementById('filter-rating-any');
    if (ratingAny) ratingAny.checked = true;
    // Keep categoria from URL (don't reset it via "clear filters")
    const urlParams = getUrlParams();
    const catRadio = document.querySelector(`input[name="categoria"][value="${urlParams.categoria || ''}"]`);
    if (catRadio) catRadio.checked = true;
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    updateGroupBadge('marca-badge', 'input[name="marca"]:checked');
    updateGroupBadge('subcategoria-badge', 'input[name="subcategoria"]:checked');
    applyFilters();
}

// ============================================================
// ACCORDION
// ============================================================
function initAccordions() {
    document.querySelectorAll('.filter-group-header').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.closest('.filter-group');
            if (group) group.classList.toggle('open');
            if (window.lucide) window.lucide.createIcons();
        });
    });
}

// ============================================================
// LOAD PRODUCTS
// ============================================================
async function loadProducts() {
    const grid = document.getElementById('product-grid');
    const loading = document.getElementById('loading-state');
    const empty = document.getElementById('empty-state');
    const pagination = document.getElementById('pagination');

    grid.innerHTML = '';
    loading.classList.remove('hidden');
    loading.classList.add('flex');
    empty.classList.add('hidden');
    if (pagination) pagination.classList.add('hidden');

    const urlParams = getUrlParams();
    const filters = getActiveFilters();

    try {
        updatePageHeader(urlParams);

        if (!window.ProductService) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        let response;
        if (filters.q) {
            response = await window.ProductService.search(filters.q, filters);
        } else {
            response = await window.ProductService.getAll(filters);
        }

        if (response.success && response.data.length > 0) {
            // Cache products for quote
            response.data.forEach(p => {
                window.__productosCache[p.id_producto] = p;
            });

            const cardsHtml = response.data.map(p => createProductCard(p)).join('');
            grid.innerHTML = cardsHtml;

            // Setup image error handlers
            grid.querySelectorAll('img.js-product-image, img[data-product-img]').forEach(img => {
                img.addEventListener('error', function () {
                    this.onerror = null;
                    this.src = '/images/placeholder.webp';
                });
            });

            totalPages = response.pagination.totalPages;
            updatePagination();
            if (pagination) pagination.classList.remove('hidden');

            if (window.lucide) window.lucide.createIcons();
        } else {
            empty.classList.remove('hidden');
            if (filters.q) {
                const h3 = empty.querySelector('h3');
                const p = empty.querySelector('p');
                if (h3) h3.textContent = 'No encontramos resultados';
                if (p) p.textContent = `No hay productos que coincidan con "${filters.q}".`;
            }
        }

        document.dispatchEvent(new CustomEvent('productsRendered'));

    } catch (error) {
        console.error('Error loading products:', error);
        empty.classList.remove('hidden');
        const h3 = empty.querySelector('h3');
        const p = empty.querySelector('p');
        if (h3) h3.textContent = 'Error al cargar productos';
        if (p) p.textContent = 'Por favor intenta nuevamente más tarde.';
    } finally {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

// ============================================================
// PRODUCT CARD
// La plantilla canónica vive en core.js (window.createProductCard) y la
// comparten catálogo, detalle (productos relacionados) y favoritos para que
// las tarjetas se vean idénticas en todas las páginas.
// ============================================================
function createProductCard(product) {
    return window.createProductCard(product);
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ============================================================
// PAGE HEADER & PAGINATION
// ============================================================
function updatePageHeader(params) {
    const title = document.getElementById('catalog-title');
    const heroSection = document.getElementById('category-hero');
    const heroTitle = document.getElementById('hero-title');

    if (params.q) {
        if (title) title.textContent = `Resultados para "${params.q}"`;
        document.title = `Búsqueda: ${params.q} - Ceveco`;
        if (heroSection) heroSection.classList.add('hidden');
    } else if (params.categoria) {
        const catName = formatCategoryName(params.categoria);
        if (title) title.textContent = catName;
        document.title = `${catName} - Ceveco`;
        if (heroSection) heroSection.classList.remove('hidden');
        if (heroTitle) heroTitle.textContent = catName;
        const heroImg = document.getElementById('hero-image');
        if (heroImg) {
            const heroMap = {
                'electro-hogar': '../assets/img/banner-category/hero_electro.jpg',
                'muebles': '../assets/img/banner-category/hero_muebles.jpg',
                'motos': '../assets/img/banner-category/hero_motos.jpg',
                'herramientas': '../assets/img/banner-category/hero_herramientas.jpg'
            };
            heroImg.src = heroMap[params.categoria] || '../assets/img/banner-hero/hero_main.jpg';
        }
    } else if (params.destacado) {
        if (title) title.textContent = 'Productos Destacados';
        document.title = 'Destacados - Ceveco';
        if (heroSection) heroSection.classList.add('hidden');
    } else {
        if (title) title.textContent = 'Todos los Productos';
        document.title = 'Catálogo - Ceveco';
        if (heroSection) heroSection.classList.add('hidden');
    }
}

function formatCategoryName(slug) {
    const names = {
        'electro-hogar': 'Electrodomésticos y Tecnología',
        'muebles': 'Muebles y Decoración',
        'motos': 'Movilidad y Transporte',
        'herramientas': 'Maquinaria y Herramientas'
    };
    return names[slug] || 'Productos';
}

function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        const filters = getActiveFilters();
        pushUrlParams({ ...filters, page: currentPage });
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updatePagination() {
    const info = document.getElementById('page-info');
    const prev = document.getElementById('prev-page');
    const next = document.getElementById('next-page');
    if (info) info.textContent = `Página ${currentPage} de ${totalPages}`;
    if (prev) prev.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === totalPages;
}

// ============================================================
// COTIZAR via WhatsApp (data-action="cotizar")
// ============================================================
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="cotizar"]');
    if (!btn) return;
    const id = btn.dataset.productId;
    const product = window.__productosCache?.[id];
    if (product) {
        if (typeof window.cotizarProducto === 'function') window.cotizarProducto(product);
        else openWhatsAppFallback(product);
    } else {
        fetch(`/api/v1/productos/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success && d.data) {
                    window.__productosCache[id] = d.data;
                    if (typeof window.cotizarProducto === 'function') window.cotizarProducto(d.data);
                    else openWhatsAppFallback(d.data);
                }
            })
            .catch(err => console.error('Error fetching product for quote:', err));
    }
});

function openWhatsAppFallback(product) {
    const wa = '573216453672';
    const precio = product.precio_actual
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.precio_actual)
        : 'consultar';
    const url = `${location.origin}/pages/detalle-producto.html?id=${product.id_producto}`;
    const msg = `Hola Ceveco, quiero cotizar:\n\n*${product.nombre}*\nSKU: ${product.sku || '-'}\nPrecio listado: ${precio}\n\n${url}\n\n¿Está disponible y cuáles son los métodos de pago?`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Load sidebar HTML into root
    const sidebarRoot = document.getElementById('filters-sidebar-root');
    if (sidebarRoot) {
        try {
            const resp = await fetch('../components/filters-sidebar.html');
            if (resp.ok) {
                sidebarRoot.innerHTML = await resp.text();
                if (window.lucide) window.lucide.createIcons();
            }
        } catch (e) {
            console.warn('Could not load filters sidebar:', e);
        }
    }

    // Mobile toggle
    const toggleBtn = document.getElementById('filters-toggle-mobile');
    const wrapper = document.getElementById('filters-wrapper');
    if (toggleBtn && wrapper) {
        toggleBtn.addEventListener('click', () => {
            wrapper.classList.toggle('hidden');
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // Clear all filters button
    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);

    // Apply price filter button
    const applyPrice = document.getElementById('apply-price-filter');
    if (applyPrice) applyPrice.addEventListener('click', applyFilters);

    // Categoria radios
    document.querySelectorAll('input[name="categoria"]').forEach(r => {
        r.addEventListener('change', () => {
            // When categoria changes reload filters too
            const val = r.value;
            loadFilterData(val || null).then(() => {
                applyFilters();
            });
        });
    });

    // Stock checkbox
    const stockChk = document.getElementById('filter-stock');
    if (stockChk) stockChk.addEventListener('change', applyFilters);

    // Rating radios
    document.querySelectorAll('input[name="rating"]').forEach(r => r.addEventListener('change', applyFilters));

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.addEventListener('click', () => changePage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changePage(1));

    // Accordion init
    initAccordions();

    // Load filter data from backend
    const urlParams = getUrlParams();
    currentPage = urlParams.page || 1;
    await loadFilterData(urlParams.categoria || null);

    // Load products
    loadProducts();
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
    const urlParams = getUrlParams();
    currentPage = urlParams.page || 1;
    applyUrlFiltersToDOM();
    loadProducts();
});
