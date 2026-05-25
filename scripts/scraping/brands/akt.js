// scripts/scraping/brands/akt.js
// Adaptador para AKT Motos.
// Host: https://aktmotos.com
//
// TODO: refinar selectores con prueba real. Los selectores actuales son
// genéricos (heredados de _brand-helpers).

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.aktmotos.com';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/?s=${q}`,            // WordPress-style search (común en sitios PYME).
        `${HOST}/motos`,
        `${HOST}/productos`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/moto/"]',
    'a[href*="/motos/"]',
    'a[href*="/producto/"]',
    'a[href*="/product/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'akt-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
