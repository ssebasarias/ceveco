// scripts/scraping/brands/samurai.js
// Adaptador para Samurai (parrillas / cocina).
// Host: https://www.samuraicolombia.com (samurai.com.co no existe).

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.samuraicolombia.com';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/buscar?q=${q}`,
        `${HOST}/?s=${q}`,
        `${HOST}/productos`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/producto/"]',
    'a[href*="/product/"]',
    'a[href*="/parrillas/"]',
    'a[href*="/asadores/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'samurai-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
