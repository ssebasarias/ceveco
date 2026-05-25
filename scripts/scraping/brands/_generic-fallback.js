// scripts/scraping/brands/_generic-fallback.js
//
// Adaptador usado cuando no hay adaptador específico de marca, o cuando el
// adaptador específico no encontró nada. Estrategia: ir a Google Images con
// filtro `site:<dominio-marca>` para limitar el origen a páginas oficiales.
// Es un fallback, no la primera opción.
//
// Retorna SOLO imágenes; descripción/specs quedan null porque Google Images
// no expone texto estructurado del producto.

const BRAND_DOMAINS = {
    honda: ['honda.com.co', 'hondamotos.com.co'],
    suzuki: ['suzuki.com.co', 'suzukimotos.com.co'],
    akt: ['aktmotos.com'],
    yamaha: ['yamaha-motor.com.co', 'yamaha.com.co'],
    samurai: ['samurai.com.co'],
    whirlpool: ['whirlpool.com.co'],
    lg: ['lg.com'],
    samsung: ['samsung.com'],
    mabe: ['mabe.com.co'],
    haceb: ['haceb.com'],
    challenger: ['challenger.com.co']
};

function brandKey(marca) {
    const m = (marca || '').toLowerCase().trim();
    return Object.keys(BRAND_DOMAINS).find(k => m.includes(k)) || null;
}

async function search(product, browser, { newPage }) {
    const key = brandKey(product.marca);
    const domains = key ? BRAND_DOMAINS[key] : [];
    const siteFilter = domains.length
        ? '(' + domains.map(d => `site:${d}`).join(' OR ') + ')'
        : '';

    const queryParts = [product.marca, product.nombre, siteFilter].filter(Boolean);
    const q = queryParts.join(' ');
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}&safe=active&hl=es-CO&gl=co`;

    const page = await newPage(browser);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Esperar a que al menos un <img> con src real esté presente.
        await page.waitForSelector('img', { timeout: 10000 }).catch(() => {});

        const imageUrls = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            const urls = imgs
                .map(i => i.src || i.getAttribute('data-src'))
                .filter(s => typeof s === 'string' && s.startsWith('http'))
                // Filtrar logos de Google y sprites del propio buscador.
                .filter(s => !/gstatic\.com\/images|google\.com\/logos|favicons/.test(s));
            // Dedup preservando orden.
            return [...new Set(urls)].slice(0, 6);
        });

        if (!imageUrls.length) return null;

        return {
            source: `generic-fallback(${key || 'no-domain'})`,
            sourceUrl: url,
            images: imageUrls,
            description: null,
            specs: null,
            componentes: null
        };
    } finally {
        await page.context().close();
    }
}

module.exports = { search, BRAND_DOMAINS };
