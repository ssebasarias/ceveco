// scripts/scraping/brands/mabe.js
// Adaptador para Mabe Colombia.
// Host: https://www.mabe.com.co
//
// TODO: refinar selectores con prueba real.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.mabe.com.co';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/busqueda?q=${q}`,
        `${HOST}/buscar?q=${q}`,
        `${HOST}/productos`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/producto/"]',
    'a[href*="/products/"]',
    'a[href*="/refrigeradores/"]',
    'a[href*="/lavadoras/"]',
    'a[href*="/estufas/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'mabe-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
