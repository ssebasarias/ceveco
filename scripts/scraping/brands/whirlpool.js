// scripts/scraping/brands/whirlpool.js
// Adaptador para Whirlpool Colombia.
// Host: https://www.whirlpool.com.co
//
// TODO: refinar selectores con prueba real. Whirlpool LATAM suele usar
// React/Next con galerías client-side; los selectores genéricos cubren la
// mayoría de páginas pero pueden requerir esperar más tiempo para la
// hidratación.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.whirlpool.com.co';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/busqueda?q=${q}`,
        `${HOST}/buscar?q=${q}`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/electrodomesticos/"]',
    'a[href*="/producto/"]',
    'a[href*="/product/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'whirlpool-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
