/**
 * 🔍 Buscador Avanzado de Productos con IA
 * Usa Puppeteer para búsqueda real en Google y extracción de datos
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

class ProductSearcher {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    /**
     * Buscar producto en Google y obtener URLs relevantes
     */
    async searchGoogle(ref, categoria) {
        const query = `${ref} ${categoria} especificaciones técnicas`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });

        // Extraer URLs de resultados
        const results = await this.page.evaluate(() => {
            const links = [];
            document.querySelectorAll('a[href]').forEach(a => {
                const href = a.href;
                if (href.includes('lg.com') ||
                    href.includes('samsung.com') ||
                    href.includes('mercadolibre') ||
                    href.includes('exito.com') ||
                    href.includes('alkosto.com') ||
                    href.includes('ktronix.com')) {
                    links.push(href);
                }
            });
            return links;
        });

        return results.slice(0, 5); // Top 5 resultados
    }

    /**
     * Buscar imágenes en Google Images
     */
    async searchImages(ref, categoria) {
        const query = `${ref} ${categoria}`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

        await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });

        // Extraer URLs de imágenes
        const images = await this.page.evaluate(() => {
            const imgs = [];
            document.querySelectorAll('img').forEach(img => {
                if (img.src && img.src.startsWith('http') && !img.src.includes('google')) {
                    imgs.push(img.src);
                }
            });
            return imgs;
        });

        return images.slice(0, 10); // Top 10 imágenes
    }

    /**
     * Extraer información de página de producto
     */
    async extractProductInfo(url) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Intentar extraer información común
            const info = {
                title: $('h1').first().text().trim(),
                description: $('meta[name="description"]').attr('content') || '',
                images: [],
                specs: {}
            };

            // Extraer imágenes del producto
            $('img').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.includes('product') || src.includes('imagen')) {
                    info.images.push(src);
                }
            });

            // Intentar extraer especificaciones (varía por sitio)
            $('.specs, .specifications, .caracteristicas').find('li, tr').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.includes(':')) {
                    const [key, value] = text.split(':');
                    info.specs[key.trim()] = value.trim();
                }
            });

            return info;

        } catch (error) {
            console.log(`Error extrayendo de ${url}: ${error.message}`);
            return null;
        }
    }

    /**
     * Búsqueda completa de producto
     */
    async searchProduct(ref, categoria) {
        console.log(`🔍 Buscando: ${ref} - ${categoria}`);

        // Buscar URLs relevantes
        const urls = await this.searchGoogle(ref, categoria);
        console.log(`  📄 ${urls.length} URLs encontradas`);

        // Buscar imágenes
        const images = await this.searchImages(ref, categoria);
        console.log(`  📸 ${images.length} imágenes encontradas`);

        // Extraer info de las mejores URLs
        const productInfos = [];
        for (const url of urls.slice(0, 3)) {
            const info = await this.extractProductInfo(url);
            if (info) {
                productInfos.push(info);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay
        }

        // Combinar información
        return {
            urls,
            images: images.filter(img =>
                img.includes('.jpg') ||
                img.includes('.png') ||
                img.includes('.webp')
            ).slice(0, 5),
            infos: productInfos
        };
    }
}

module.exports = ProductSearcher;
