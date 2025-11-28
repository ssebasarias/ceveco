const products = [
    {
        id: 1,
        brand: "Honda",
        name: "Moto CB 125F DLX Modelo 2026",
        image: "https://placehold.co/400x400/png?text=Moto+CB125F",
        price: 6500000,
        oldPrice: 6800000,
        badge: "Nuevo",
        category: "motos"
    },
    {
        id: 2,
        brand: "Kalley",
        name: "Lavadora Carga Superior 14KG Gris",
        image: "https://placehold.co/400x400/png?text=Lavadora+14KG",
        price: 1200000,
        oldPrice: 1450000,
        badge: "Oferta",
        category: "electro-hogar"
    },
    {
        id: 3,
        brand: "Haceb",
        name: "Nevera No Frost 243 Litros Titanio",
        image: "https://placehold.co/400x400/png?text=Nevera+Haceb",
        price: 1500000,
        oldPrice: null,
        badge: null,
        category: "electro-hogar"
    },
    {
        id: 4,
        brand: "Samsung",
        name: "TV 50\" Crystal UHD 4K Smart TV",
        image: "https://placehold.co/400x400/png?text=TV+Samsung",
        price: 1800000,
        oldPrice: 2200000,
        badge: "Destacado",
        category: "tecnologia"
    },
    {
        id: 5,
        brand: "Samsung",
        name: "Barra de Sonido HW-C400",
        image: "https://placehold.co/400x400/png?text=Soundbar",
        price: 450000,
        oldPrice: null,
        badge: null,
        category: "tecnologia"
    },
    {
        id: 6,
        brand: "LG",
        name: "Lavadora Smart Inverter 19kg Negra",
        image: "https://placehold.co/400x400/png?text=Lavadora+LG",
        price: 2100000,
        oldPrice: 2500000,
        badge: "Oferta",
        category: "electro-hogar"
    },
    {
        id: 7,
        brand: "Rimax",
        name: "Escritorio Moderno con Cajones",
        image: "https://placehold.co/400x400/png?text=Escritorio",
        price: 350000,
        oldPrice: null,
        badge: null,
        category: "muebles"
    },
    {
        id: 8,
        brand: "STIHL",
        name: "Motosierra MS 170",
        image: "https://placehold.co/400x400/png?text=Motosierra",
        price: 850000,
        oldPrice: null,
        badge: null,
        category: "herramientas"
    },
    {
        id: 9,
        brand: "Yamaha",
        name: "Moto XTZ 150 Modelo 2024",
        image: "https://placehold.co/400x400/png?text=Moto+XTZ",
        price: 7200000,
        oldPrice: null,
        badge: null,
        category: "motos"
    },
    {
        id: 10,
        brand: "Rimax",
        name: "Estantería 5 Niveles Blanca",
        image: "https://placehold.co/400x400/png?text=Estanteria",
        price: 280000,
        oldPrice: null,
        badge: null,
        category: "muebles"
    },
    {
        id: 11,
        brand: "STIHL",
        name: "Guadaña FS 38",
        image: "https://placehold.co/400x400/png?text=Guadana",
        price: 620000,
        oldPrice: null,
        badge: null,
        category: "herramientas"
    },
    {
        id: 12,
        brand: "Haceb",
        name: "Estufa 4 Puestos Acero Inoxidable",
        image: "https://placehold.co/400x400/png?text=Estufa",
        price: 980000,
        oldPrice: null,
        badge: null,
        category: "electro-hogar"
    }
];


const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    const productGrid = document.getElementById('product-grid');
    const featuredGrid = document.getElementById('featured-products');

    // If we're on the homepage (featured products)
    if (featuredGrid) {
        const featuredProducts = products.filter(p => p.badge).slice(0, 4);
        featuredProducts.forEach(product => {
            featuredGrid.appendChild(createProductCard(product));
        });
    }

    // If we're on a category page (full catalog)
    if (productGrid) {
        const categoryFilter = productGrid.dataset.category;
        const filteredProducts = categoryFilter
            ? products.filter(p => p.category === categoryFilter)
            : products;

        filteredProducts.forEach(product => {
            productGrid.appendChild(createProductCard(product));
        });
    }

    // Re-initialize icons for dynamically added content
    lucide.createIcons();
});

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative';

    const badgeHtml = product.badge
        ? `<span class="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide z-10">${product.badge}</span>`
        : '';

    const oldPriceHtml = product.oldPrice
        ? `<span class="text-xs text-gray-400 line-through ml-2">${formatPrice(product.oldPrice)}</span>`
        : '';

    card.innerHTML = `
        ${badgeHtml}
        <a href="producto-detalle.html?id=${product.id}" class="relative h-64 p-6 bg-white flex items-center justify-center overflow-hidden">
            <img src="${product.image}" alt="${product.name}" class="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500">
        </a>
        
        <div class="p-5 flex-1 flex flex-col">
            <div class="mb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">${product.brand}</div>
            <a href="producto-detalle.html?id=${product.id}">
                <h3 class="text-sm font-medium text-gray-900 mb-3 line-clamp-2 min-h-[40px] hover:text-primary transition-colors" title="${product.name}">
                    ${product.name}
                </h3>
            </a>
            
            <div class="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
                <div>
                    <div class="text-lg font-bold text-gray-900">${formatPrice(product.price)}</div>
                    ${oldPriceHtml}
                </div>
                <button onclick="addToCart(${product.id})" class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}
