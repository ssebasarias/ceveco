// Buscador genérico via Google Images con Puppeteer.
// Prefiere dominios colombianos y de marca cuando es posible.

const PREFERRED_DOMAINS = [
    'honda.com.co', 'suzuki.com.co', 'stihl.com.co', 'lg.com', 'mabe.com.co',
    'kalley.com.co', 'inval.com.co', 'hyundai',
    'falabella.com.co', 'exito.com', 'alkosto.com', 'mercadolibre.com.co',
    'homecenter.com.co', 'olimpica.com', 'jumbo.com.co',
    'autolarte.com', 'motoa.com.co', 'autotec.com.co'
];

const BLOCKED_DOMAINS = ['gstatic.com', 'googleusercontent.com', 'youtube.com', 'pinterest', 'lookaside.fbsbx'];

function scoreUrl(url) {
    const lower = url.toLowerCase();
    if (BLOCKED_DOMAINS.some(d => lower.includes(d))) return -1;
    let score = 0;
    for (let i = 0; i < PREFERRED_DOMAINS.length; i++) {
        if (lower.includes(PREFERRED_DOMAINS[i])) {
            score += (PREFERRED_DOMAINS.length - i) * 10;
            break;
        }
    }
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) score += 5;
    if (lower.includes('.co/')) score += 3;
    return score;
}

async function search(product, browser) {
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        const queryParts = [product.marca, product.nombre];
        if (product.categoria && !product.nombre.toLowerCase().includes(product.categoria.toLowerCase())) {
            queryParts.push(product.categoria);
        }
        const q = encodeURIComponent(queryParts.join(' '));
        const url = `https://www.google.com/search?tbm=isch&q=${q}&safe=active`;

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('img', { timeout: 10000 }).catch(() => {});

        // Wait a bit for images to load
        await new Promise(r => setTimeout(r, 1500));

        const candidates = await page.evaluate(() => {
            // Google Images stores full URLs in anchor href as imgurl parameter,
            // and srcset / data-src attributes. We collect everything that looks like an image URL.
            const results = [];
            // Method 1: large <img> tags with src starting with http
            document.querySelectorAll('img[src^="http"]').forEach(img => {
                const w = img.naturalWidth || parseInt(img.getAttribute('width') || '0', 10);
                const h = img.naturalHeight || parseInt(img.getAttribute('height') || '0', 10);
                results.push({ url: img.src, w, h, type: 'img-src' });
            });
            // Method 2: anchor with imgurl param
            document.querySelectorAll('a[href*="imgurl="]').forEach(a => {
                try {
                    const u = new URL(a.href, location.origin);
                    const target = u.searchParams.get('imgurl');
                    if (target) results.push({ url: target, w: 0, h: 0, type: 'imgurl' });
                } catch {}
            });
            return results;
        });

        // Rank by domain preference + size, drop tiny base64/data URLs
        const ranked = candidates
            .filter(c => c.url && c.url.startsWith('http'))
            .map(c => ({ ...c, score: scoreUrl(c.url) + (c.w * c.h > 90000 ? 10 : 0) }))
            .filter(c => c.score >= 0)
            .sort((a, b) => b.score - a.score);

        const top = ranked[0];
        return top ? { url: top.url, source: 'google-images' } : null;
    } finally {
        await page.close().catch(() => {});
    }
}

module.exports = { search };
