// scripts/scraping/brands/_brand-helpers.js
//
// Helpers compartidos por los adaptadores de marca. Centraliza:
//   - Extracción de imágenes desde selectores comunes.
//   - Extracción de descripción larga.
//   - Extracción de specs (tablas y dl/dt/dd).
//   - Búsqueda del enlace al detalle del producto.
//
// Los adaptadores específicos pueden:
//   - Pasar selectores adicionales.
//   - Sobrescribir cualquier extractor con su propia lógica.
//
// NOTA: muchos selectores son hipótesis razonables (Swiper, ficha-tecnica,
// dl/dt/dd) y vienen marcados con `TODO: refinar selectores con prueba real`.
// Los adaptadores funcionan al 60-80% con esto; un trabajo de afinamiento
// posterior contra cada sitio real (Playwright headed) sube el rendimiento.

const DEFAULT_IMAGE_SELECTORS = [
    '.swiper-slide img',
    '.swiper-wrapper img',
    '.gallery img',
    '.galeria img',
    '.product-gallery img',
    '.product-image img',
    '.product-detail__image img',
    '.product-images img',
    'figure img',
    'img[itemprop="image"]',
    'picture img'
];

const DEFAULT_DESCRIPTION_SELECTORS = [
    '.product-description',
    '.descripcion',
    '.descripcion-producto',
    '.product-detail__description',
    '[itemprop="description"]',
    'meta[name="description"]'
];

const DEFAULT_SPEC_ROW_SELECTORS = [
    '.specs tr',
    '.ficha-tecnica tr',
    '.especificaciones tr',
    'table.tabla-ficha tr',
    'table tr'
];

/**
 * Extrae las URLs de imágenes más probables de la página.
 * Aplica filtros razonables para descartar iconos, logos pequeños y SVG.
 *
 * @param {import('playwright').Page} page
 * @param {string[]} [extraSelectors] - Selectores adicionales del adaptador.
 * @returns {Promise<string[]>}
 */
async function extractImages(page, extraSelectors = []) {
    return page.evaluate((sels) => {
        const isProbablyProductImage = (s) => {
            if (!s || !/^https?:/.test(s)) return false;
            // Descartar SVG, sprites, logos y placeholders genéricos.
            if (/\.(svg)(\?|$)/i.test(s)) return false;
            if (/sprite|logo|icon|favicon|placeholder|blank|spinner|loader/i.test(s)) return false;
            return true;
        };
        const set = new Set();
        sels.forEach(sel => {
            document.querySelectorAll(sel).forEach(img => {
                const candidates = [
                    img.currentSrc,
                    img.src,
                    img.getAttribute('data-src'),
                    img.getAttribute('data-lazy'),
                    img.getAttribute('data-original'),
                    img.getAttribute('data-zoom'),
                    img.getAttribute('data-large')
                ];
                for (const c of candidates) {
                    if (isProbablyProductImage(c)) {
                        set.add(c.split('?')[0]);
                        break;
                    }
                }
            });
        });
        return [...set].slice(0, 8);
    }, [...DEFAULT_IMAGE_SELECTORS, ...extraSelectors]);
}

/**
 * Extrae el primer bloque de texto que parezca descripción larga.
 *
 * @param {import('playwright').Page} page
 * @param {string[]} [extraSelectors]
 * @returns {Promise<string|null>}
 */
async function extractDescription(page, extraSelectors = []) {
    return page.evaluate((sels) => {
        for (const sel of sels) {
            // Soporte para meta[name="description"] aparte.
            if (sel.startsWith('meta[')) {
                const meta = document.querySelector(sel);
                if (meta) {
                    const content = meta.getAttribute('content');
                    if (content && content.trim().length > 30) return content.trim().slice(0, 4000);
                }
                continue;
            }
            const el = document.querySelector(sel);
            if (el && el.innerText && el.innerText.trim().length > 30) {
                return el.innerText.trim().slice(0, 4000);
            }
        }
        return null;
    }, [...DEFAULT_DESCRIPTION_SELECTORS, ...extraSelectors]);
}

/**
 * Extrae pares clave/valor de tablas y dl/dt/dd que parezcan ficha técnica.
 *
 * @param {import('playwright').Page} page
 * @param {string[]} [extraSelectors]
 * @returns {Promise<Object<string,string>|null>}
 */
async function extractSpecs(page, extraSelectors = []) {
    return page.evaluate((sels) => {
        const out = {};
        // Tablas.
        sels.forEach(sel => {
            document.querySelectorAll(sel).forEach(tr => {
                const cells = tr.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    const k = (cells[0].innerText || '').trim();
                    const v = (cells[1].innerText || '').trim();
                    if (k && v && k.length <= 80 && v.length <= 200 && !(k in out)) {
                        out[k] = v;
                    }
                }
            });
        });
        // dl/dt/dd.
        document.querySelectorAll('dl').forEach(dl => {
            const dts = dl.querySelectorAll('dt');
            const dds = dl.querySelectorAll('dd');
            for (let i = 0; i < Math.min(dts.length, dds.length); i++) {
                const k = (dts[i].innerText || '').trim();
                const v = (dds[i].innerText || '').trim();
                if (k && v && k.length <= 80 && v.length <= 200 && !(k in out)) {
                    out[k] = v;
                }
            }
        });
        return Object.keys(out).length ? out : null;
    }, [...DEFAULT_SPEC_ROW_SELECTORS, ...extraSelectors]);
}

/**
 * Devuelve el primer enlace de la página de listado que coincida con el
 * nombre del producto buscado.
 *
 * @param {import('playwright').Page} page
 * @param {string} productNameLower - Nombre del producto en minúsculas.
 * @param {string[]} linkSelectors - Selectores de anchors candidatos.
 */
async function findProductLink(page, productNameLower, linkSelectors) {
    const links = await page.evaluate((sels) => {
        const anchors = Array.from(document.querySelectorAll(sels.join(', ')));
        return anchors.map(a => ({
            href: a.getAttribute('href'),
            text: (a.innerText || a.title || a.getAttribute('aria-label') || '').trim()
        })).filter(x => x.href);
    }, linkSelectors);

    if (!links.length) return null;

    const exact = links.find(l => l.text.toLowerCase().includes(productNameLower));
    return (exact || links[0]).href;
}

function absolutize(href, host) {
    if (!href) return null;
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return 'https:' + href;
    if (href.startsWith('/')) return host + href;
    return host + '/' + href;
}

/**
 * Estrategia estándar: intentar URLs de búsqueda en orden, buscar el primer
 * enlace candidato, navegar y extraer imágenes + descripción + specs.
 *
 * Si nada se encuentra, retorna null (el orquestador caerá al fallback).
 *
 * @param {Object} opts
 * @param {string} opts.host - https://www.marca.com.co
 * @param {string[]} opts.searchUrls - URLs a probar para encontrar el producto.
 * @param {string[]} opts.linkSelectors - Selectores de enlaces al detalle.
 * @param {string} opts.source - Etiqueta para el reporte (ej. 'honda-oficial').
 * @param {Object} product
 * @param {import('playwright').Browser} browser
 * @param {{ newPage: function }} drivers
 * @param {Object} [extra] - Selectores adicionales para los extractores.
 */
async function genericSearch({ host, searchUrls, linkSelectors, source, extra = {} }, product, browser, { newPage }) {
    const productNameLower = (product.nombre || '').toLowerCase();
    const page = await newPage(browser);

    try {
        let productUrl = null;
        for (const url of searchUrls) {
            try {
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            } catch {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
            }
            productUrl = await findProductLink(page, productNameLower, linkSelectors);
            if (productUrl) break;
        }

        if (!productUrl) return null;
        const fullUrl = absolutize(productUrl, host);

        try {
            await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
        } catch {
            await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        }

        const images = await extractImages(page, extra.imageSelectors);
        const description = await extractDescription(page, extra.descriptionSelectors);
        const specs = await extractSpecs(page, extra.specRowSelectors);

        if (!images.length) return null;

        return {
            source,
            sourceUrl: fullUrl,
            images,
            description,
            specs,
            componentes: null
        };
    } finally {
        await page.context().close();
    }
}

module.exports = {
    extractImages,
    extractDescription,
    extractSpecs,
    findProductLink,
    absolutize,
    genericSearch,
    DEFAULT_IMAGE_SELECTORS,
    DEFAULT_DESCRIPTION_SELECTORS,
    DEFAULT_SPEC_ROW_SELECTORS
};
