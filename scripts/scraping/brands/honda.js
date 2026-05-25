// scripts/scraping/brands/honda.js
// Adaptador para Honda Motos Colombia.
// Host: https://www.hondamotos.com.co
//
// TODO: refinar selectores con prueba real (Playwright headed) contra el
// sitio oficial. Los selectores usados son heredados de _brand-helpers, que
// cubre patrones comunes (Swiper, tablas, dl/dt/dd). Si el sitio cambia su
// estructura, agregar selectores específicos en `extra` aquí.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.hondamotos.com.co';

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
    'a[href*="/moto-"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'honda-oficial'
    }, product, browser, drivers);
}

module.exports = { search };
