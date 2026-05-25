// scripts/scraping/brands/samsung.js
// Adaptador para Samsung Colombia.
// Host: https://www.samsung.com/co
//
// TODO: refinar selectores con prueba real. Samsung LATAM usa Next.js con
// rutas /co/<cat>/<modelo>/ y galerías virtualizadas; los selectores
// genéricos suelen capturar la imagen principal pero la galería completa
// puede requerir scroll programado.

const { genericSearch } = require('./_brand-helpers');

const HOST = 'https://www.samsung.com';

const SEARCH_URLS_FOR = (product) => {
    const q = encodeURIComponent(product.nombre);
    return [
        `${HOST}/co/search/searchMain/?searchTerm=${q}`,
        `${HOST}/co/buscar/?q=${q}`,
        `${HOST}/co/`
    ];
};

const LINK_SELECTORS = [
    'a[href*="/co/"][href*="/sm-"]',         // smartphones / electrodomésticos
    'a[href*="/co/refrigeradores/"]',
    'a[href*="/co/lavadoras/"]',
    'a[href*="/co/electrodomesticos/"]',
    'a[href*="/co/televisores/"]'
];

async function search(product, browser, drivers) {
    return genericSearch({
        host: HOST,
        searchUrls: SEARCH_URLS_FOR(product),
        linkSelectors: LINK_SELECTORS,
        source: 'samsung-oficial',
        extra: {
            imageSelectors: ['.product-detail__visual img', '.visual-gallery img'],
            specRowSelectors: ['.spec-detail tr', '.specs__list tr']
        }
    }, product, browser, drivers);
}

module.exports = { search };
