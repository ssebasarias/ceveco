
import { FiltersSidebar } from '../components/filters-sidebar.js';

// Inicializar iconos Lucide
if (window.lucide) lucide.createIcons();

// Estado global
let currentPage = 1;
let currentLimit = 12;
let totalPages = 1;

// Componente de filtros
let filtersSidebar;

// Función de búsqueda
window.handleSearch = function () {
    const query = document.getElementById('search-input').value;
    if (query) {
        window.location.href = `productos.html?q=${encodeURIComponent(query)}`;
    }
};

// Obtener parámetros de URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        categoria: params.get('categoria'),
        q: params.get('q'),
        destacado: params.get('destacado')
    };
}

// Cargar productos
async function loadProducts() {
    const grid = document.getElementById('product-grid');
    const loading = document.getElementById('loading-state');
    const empty = document.getElementById('empty-state');
    const pagination = document.getElementById('pagination');

    // Mostrar loading
    grid.innerHTML = '';
    loading.classList.remove('hidden');
    loading.classList.add('flex');
    empty.classList.add('hidden');
    pagination.classList.add('hidden');

    const params = getUrlParams();
    const sortValue = document.getElementById('sort-select').value;

    // Load filters via component if needed
    if (params.categoria && filtersSidebar) {
        const dynamicContainer = document.getElementById('dynamic-filters-container');
        if (dynamicContainer && !dynamicContainer.querySelector('.filter-group')) {
            await filtersSidebar.loadDynamicFilters(params.categoria);
        }
    }

    // Preparar filtros
    const filters = {
        page: currentPage,
        limit: currentLimit
    };

    if (params.categoria) filters.categoria = params.categoria;
    if (params.q) filters.busqueda = params.q;
    if (params.destacado) filters.destacado = true;

    // Get values from component
    if (filtersSidebar) {
        const values = filtersSidebar.getFilterValues();
        if (values.precioMin !== null) filters.precioMin = values.precioMin;
        if (values.precioMax !== null) filters.precioMax = values.precioMax;
        if (values.subcategoria) filters.subcategoria = values.subcategoria;
        if (values.atributos) filters.atributos = values.atributos;
    } else {
        // Fallback if component not ready
        const minInput = document.getElementById('price-min');
        const maxInput = document.getElementById('price-max');
        if (minInput && minInput.value) filters.precioMin = Number(minInput.value);
        if (maxInput && maxInput.value) filters.precioMax = Number(maxInput.value);
    }

    // Ordenamiento
    if (sortValue === 'precio_asc') {
        filters.orderBy = 'precio_actual';
        filters.orderDir = 'ASC';
    } else if (sortValue === 'precio_desc') {
        filters.orderBy = 'precio_actual';
        filters.orderDir = 'DESC';
    }

    try {
        // Actualizar UI según contexto
        updatePageHeader(params);

        let response;

        // Wait for ProductService if needed (should be loaded by core)
        if (!window.ProductService) {
            console.warn('ProductService not ready, waiting...');
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Si hay búsqueda, usar endpoint de búsqueda
        if (params.q) {
            response = await window.ProductService.search(params.q, filters);
        } else {
            // Fetch productos normales
            response = await window.ProductService.getAll(filters);
        }

        if (response.success && response.data.length > 0) {
            // Renderizar productos usando la función global de core.js
            // Ensure renderProductCard is available
            if (!window.renderProductCard) {
                console.warn('renderProductCard not ready yet');
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const cardsHtml = (await Promise.all(response.data.map(product => window.renderProductCard(product)))).join('');
            grid.innerHTML = cardsHtml;

            // Actualizar paginación
            totalPages = response.pagination.totalPages;
            updatePagination();
            pagination.classList.remove('hidden');

            // Re-init iconos
            if (window.lucide) lucide.createIcons();
        } else {
            empty.classList.remove('hidden');
            if (params.q) {
                empty.querySelector('h3').textContent = 'No encontramos resultados';
                empty.querySelector('p').textContent = `No hay productos que coincidan con "${params.q}". Intenta con otras palabras.`;
            }
        }

        // Notificar que se renderizaron productos para que el módulo de favoritos se sincronice
        document.dispatchEvent(new CustomEvent('productsRendered'));

    } catch (error) {
        console.error('Error loading products:', error);
        empty.classList.remove('hidden');
        empty.querySelector('h3').textContent = 'Error al cargar productos';
        empty.querySelector('p').textContent = 'Por favor intenta nuevamente más tarde.';
    } finally {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

// Actualizar encabezado de página
function updatePageHeader(params) {
    const title = document.getElementById('catalog-title');
    const heroSection = document.getElementById('category-hero');
    const heroTitle = document.getElementById('hero-title');

    if (params.q) {
        title.textContent = `Resultados para "${params.q}"`;
        document.title = `Búsqueda: ${params.q} - Ceveco`;
        heroSection.classList.add('hidden');
    } else if (params.categoria) {
        const catName = formatCategoryName(params.categoria);
        title.textContent = catName;
        document.title = `${catName} - Ceveco`;

        // Mostrar Hero específico
        heroSection.classList.remove('hidden');
        heroTitle.innerHTML = `${catName}`;

        // Update Hero Image dynamically
        const heroImg = document.getElementById('hero-image');
        if (params.categoria === 'electro-hogar') {
            heroImg.src = '../assets/img/banner-category/hero_electro.jpg';
        } else if (params.categoria === 'muebles') {
            heroImg.src = '../assets/img/banner-category/hero_muebles.jpg';
        } else if (params.categoria === 'motos') {
            heroImg.src = '../assets/img/banner-category/hero_motos.jpg';
        } else if (params.categoria === 'herramientas') {
            heroImg.src = '../assets/img/banner-category/hero_herramientas.jpg';
        } else {
            heroImg.src = '../assets/img/banner-hero/hero_main.jpg';
        }
    } else if (params.destacado) {
        title.textContent = 'Productos Destacados';
        document.title = 'Destacados - Ceveco';
        heroSection.classList.add('hidden');
    } else {
        title.textContent = 'Todos los Productos';
        document.title = 'Catálogo - Ceveco';
        heroSection.classList.add('hidden');
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


// Paginación y Filtros
function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updatePagination() {
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function applyFilters() {
    currentPage = 1;
    loadProducts();
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Filter Component
    filtersSidebar = new FiltersSidebar('filters-sidebar-root', {
        onFilterChange: () => {
            applyFilters();
        }
    });
    await filtersSidebar.init();

    // Add event listener for sort dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);

    // Add event listeners for pagination buttons
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    if (prevPage) prevPage.addEventListener('click', () => changePage(-1));
    if (nextPage) nextPage.addEventListener('click', () => changePage(1));

    // Load initial products
    loadProducts();
});
