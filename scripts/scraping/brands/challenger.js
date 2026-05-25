// scripts/scraping/brands/challenger.js
// Adaptador para Challenger Colombia.
// Host: https://www.challenger.com.co
//
// TODO: refinar selectores con prueba real.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.challenger.com.co';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/buscar?q=${q}`,
        `${HOST}/?s=${q}`,        // por si usa WordPress
        `${HOST}/productos`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/producto/"]',
    'a[href*="/product/"]',
    'a[href*="/electrodomesticos/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'challenger-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
