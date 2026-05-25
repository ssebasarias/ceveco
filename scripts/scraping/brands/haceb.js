// scripts/scraping/brands/haceb.js
// Adaptador para HACEB.
// Host: https://www.haceb.com
//
// TODO: refinar selectores con prueba real. HACEB usa VTEX en muchas
// páginas, lo que implica selectores como .vtex-store-components-3-x-...
// que cambian por versión; los selectores genéricos suelen capturar la
// imagen del producto en la mayoría de los casos.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.haceb.com';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/buscar?_q=${q}&map=ft`,
        `${HOST}/${q}`,
        `${HOST}/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/p"]',            // VTEX: /<slug>/p
    'a[href*="/producto/"]',
    'a[href*="/refrigeradores/"]',
    'a[href*="/lavadoras/"]',
    'a[href*="/estufas/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'haceb-oficial',
        extra: {
            imageSelectors: ['.vtex-store-components-3-x-productImageTag', '.vtex-store-components-3-x-thumbImg']
        }
    }, product, browser, drivers);
}

module.exports = { search };
