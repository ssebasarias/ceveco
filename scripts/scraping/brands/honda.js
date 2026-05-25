// scripts/scraping/brands/honda.js
// Adaptador para Honda Motos Colombia.
// Host: https://www.hondamotos.com.co
//
// TODO: refinar selectores con prueba real (Playwright headed) contra el
// sitio oficial. Los selectores usados son heredados de _brand-helpers, que
// cubre patrones comunes (Swiper, tablas, dl/dt/dd). Si el sitio cambia su
// estructura, agregar selectores específicos en `extra` aquí.

const { genericSearch } = require('./_brand-helpers');

// Verified host with Playwright MCP: www.hondamotos.com.co does NOT resolve;
// the canonical host for Honda Colombia motos catalog is motos.honda.com.co.
const HOST = 'https://motos.honda.com.co';

// Honda site uses /motos-honda/{categoria}/{modelo} URLs. Search box doesn't
// exist; we hit the master listing page and the category landings.
const SEARCH_URLS_FOR = (product) => {
    return [
        `${HOST}/motos-honda`,
        `${HOST}/motos-honda/motos-sport`,
        `${HOST}/motos-honda/scooter-y-semiautomatica`,
        `${HOST}/motos-honda/todo-terreno`,
        `${HOST}/motos-honda/aventura`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/motos-honda/"][href*="/"]',
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
