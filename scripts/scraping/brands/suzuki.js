// scripts/scraping/brands/suzuki.js
// Adaptador para Suzuki Motos Colombia.
// Host: https://www.suzukimotos.com.co
//
// TODO: refinar selectores con prueba real. Los selectores actuales son
// genéricos (heredados de _brand-helpers). Validar con Playwright headed.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.suzukimotos.com.co';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/buscar?q=${q}`,
        `${HOST}/motos`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/motos/"]',
    'a[href*="/producto/"]',
    'a[href*="/motocicletas/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'suzuki-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
