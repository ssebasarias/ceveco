// scripts/scraping/brands/_generic-fallback.js
//
// Adaptador usado cuando no hay adaptador específico de marca, o cuando el
// adaptador específico no encontró nada. Estrategia: ir a Google Images con
// filtro `site:<dominio-marca>` para limitar el origen a páginas oficiales.
// Es un fallback, no la primera opción.
//
// Retorna SOLO imágenes; descripción/specs quedan null porque Google Images
// no expone texto estructurado del producto.

// Real BD brand → official domain(s) mapping. Verified against Ceveco's
// actual product catalog. STIHL, Kalley, furniture brands added because
// they have products in BD that the original list didn't cover.
const BRAND_DOMAINS = {
    // Motos
    honda: ['motos.honda.com.co', 'honda.com.co'],
    suzuki: ['suzukimotos.com.co', 'suzuki.com.co'],
    akt: ['aktmotos.com'],
    yamaha: ['yamaha-motor.com.co', 'yamaha.com.co'],
    hyundai: ['hyundai.com.co'],

    // Herramientas (STIHL = 44 productos en BD)
    stihl: ['stihl.com.co', 'stihl.com'],

    // Cocina / parrillas
    samurai: ['samuraicolombia.com'],

    // Electrodomésticos
    lg: ['lg.com'],
    samsung: ['samsung.com'],
    whirlpool: ['whirlpool.com.co'],
    mabe: ['mabe.com.co'],
    haceb: ['haceb.com'],
    challenger: ['challenger.com.co'],
    kalley: ['kalley.com.co'],

    // Muebles
    comodisimos: ['comodisimos.com', 'comodisimos.com.co'],
    maximuebles: ['maximuebles.com.co'],
    inval: ['inval.com.co']
};

function brandKey(marca) {
    const m = (marca || '').toLowerCase().trim();
    // Handle accents in 'Comodísimos' → 'comodisimos'
    const ascii = m.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return Object.keys(BRAND_DOMAINS).find(k => m.includes(k) || ascii.includes(k)) || null;
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
