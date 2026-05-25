// Fallback: DuckDuckGo image search (sin captcha, más permisivo que Google)
const axios = require('axios');

async function search(product, browser) {
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        const q = encodeURIComponent(`${product.marca} ${product.nombre}`);
        const initUrl = `https://duckduckgo.com/?q=${q}&iax=images&ia=images`;
        await page.goto(initUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1200));

        // DuckDuckGo Images stores its session as vqd token. Use the JSON API.
        const html = await page.content();
        const m = html.match(/vqd=['"]?([\d-]+)['"]?/);
        if (!m) return null;
        const vqd = m[1];

        const apiUrl = `https://duckduckgo.com/i.js?l=co-es&o=json&q=${q}&vqd=${vqd}&f=,,,,,&p=1`;
        const cookies = await page.cookies();
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': initUrl,
                'Cookie': cookieHeader
            },
            timeout: 15000
        });

        if (!data || !Array.isArray(data.results) || data.results.length === 0) return null;

        // Prefer larger images and Colombian domains
        const ranked = data.results
            .filter(r => r.image && r.image.startsWith('http'))
            .filter(r => r.width >= 400 && r.height >= 400)
            .sort((a, b) => {
                const aCo = a.image.includes('.co/') ? 10 : 0;
                const bCo = b.image.includes('.co/') ? 10 : 0;
                return (b.width * b.height + bCo) - (a.width * a.height + aCo);
            });

        const top = ranked[0] || data.results.find(r => r.image && r.image.startsWith('http'));
        return top ? { url: top.image, source: 'duckduckgo-images' } : null;
    } catch (err) {
        return null;
    } finally {
        await page.close().catch(() => {});
    }
}

module.exports = { search };
