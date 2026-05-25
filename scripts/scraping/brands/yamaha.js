// scripts/scraping/brands/yamaha.js
// Adaptador para Yamaha Motor Colombia.
// Host: https://www.yamaha-motor.com.co
//
// TODO: refinar selectores con prueba real. Yamaha suele tener una galería
// con selectores propios (.product-detail-gallery, .yamaha-gallery); por
// ahora confiamos en los selectores genéricos de _brand-helpers.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.yamaha-motor.com.co';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/buscar?q=${q}`,
        `${HOST}/motocicletas`,
        `${HOST}/motos`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/motocicletas/"]',
    'a[href*="/motos/"]',
    'a[href*="/producto/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'yamaha-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
