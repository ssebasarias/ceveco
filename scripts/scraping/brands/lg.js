// scripts/scraping/brands/lg.js
// Adaptador para LG Colombia.
// Host: https://www.lg.com/co
//
// TODO: refinar selectores con prueba real. LG suele usar
// `.product-detail-gallery`, `.gallery-thumb-image` y `.spec-list` —
// patrones que ya están cubiertos por los selectores genéricos de
// _brand-helpers, pero conviene validar.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.lg.com';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/co/search/?search=${q}`,
        `${HOST}/co/buscar/?q=${q}`,
        `${HOST}/co/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/co/"][href*="/p/"]',  // patrón típico de LG: /co/<categoria>/p/<sku>
    'a[href*="/co/electrodomesticos/"]',
    'a[href*="/co/producto/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'lg-oficial',
        extra: {
            imageSelectors: ['.product-detail-gallery img', '.gallery-thumb-image img'],
            specRowSelectors: ['.spec-list tr', '.product-spec tr']
        }
    }, product, browser, drivers);
}

module.exports = { search };
