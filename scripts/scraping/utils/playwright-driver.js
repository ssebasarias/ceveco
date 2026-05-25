// scripts/scraping/utils/playwright-driver.js
//
// Driver compartido por todos los adaptadores de marca. Encapsula:
//   - Lanzamiento de Chromium con flags anti-detección razonables.
//   - Creación de contextos/páginas con UA realista y locale es-CO.
//   - Bloqueo de tracking/ads para acelerar scraping.
//   - Descarga de imágenes vía APIRequestContext (respeta cookies del contexto).
//
// El driver es deliberadamente delgado: cada adaptador de marca puede pedir
// una página nueva, navegar, extraer datos y cerrar el contexto.

const { chromium } = require('playwright');

const DEFAULT_LAUNCH_OPTS = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
    ]
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const BLOCK_HOST_REGEX = /(googletagmanager|google-analytics|doubleclick|facebook\.net|hotjar|optimizely|segment\.io|googleadservices|adsystem\.amazon|criteo|taboola|outbrain|chartbeat|newrelic|clarity\.ms)/i;

async function launchBrowser(opts = {}) {
    return chromium.launch({ ...DEFAULT_LAUNCH_OPTS, ...opts });
}

/**
 * Crea una página nueva con un contexto fresco (cookies y cache aisladas).
 * Llamadores deben cerrar el contexto cuando terminen:
 *   const page = await newPage(browser);
 *   ...
 *   await page.context().close();
 */
async function newPage(browser, opts = {}) {
    const ctx = await browser.newContext({
        userAgent: UA,
        viewport: { width: 1366, height: 900 },
        locale: 'es-CO',
        timezoneId: 'America/Bogota',
        ...opts
    });

    // Bloquear analytics/ads para acelerar y reducir ruido.
    // No bloqueamos imágenes (las necesitamos) ni CSS (algunos sitios cargan
    // imágenes vía background-image en CSS y bloquearlo rompe la página).
    await ctx.route('**/*', (route) => {
        const url = route.request().url();
        if (BLOCK_HOST_REGEX.test(url)) {
            return route.abort();
        }
        return route.continue();
    });

    return ctx.newPage();
}

/**
 * Descarga el binario de una imagen reutilizando el contexto de la página
 * (mismas cookies, mismo UA). Permite pasar un Referer explícito para CDNs
 * que validan hotlinking.
 *
 * @param {import('playwright').Page} page
 * @param {string} url
 * @param {string} [referer]
 * @returns {Promise<Buffer>}
 */
async function downloadImage(page, url, referer) {
    const apiCtx = page.context().request;
    const headers = {
        'User-Agent': UA,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
    };
    if (referer) headers['Referer'] = referer;

    const response = await apiCtx.get(url, { headers, timeout: 25000 });
    if (!response.ok()) {
        throw new Error(`HTTP ${response.status()} ${response.statusText()} for ${url}`);
    }
    return await response.body();
}

module.exports = {
    launchBrowser,
    newPage,
    downloadImage,
    UA
};
