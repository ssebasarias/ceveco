/**
 * 🚀 Sistema Completo de Enriquecimiento con IA
 * Versión mejorada que integra búsqueda web + IA
 */

const XLSX = require('xlsx');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Importar módulos personalizados
const ProductSearcher = require('./lib/product-searcher');
const AIEnricher = require('./lib/ai-enricher');

// Configuración
const CONFIG = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    },

    dirs: {
        images: './frontend/assets/images/productos',
        temp: './temp_downloads'
    },

    images: {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 85,
        format: 'webp'
    },

    useAI: !!process.env.GEMINI_API_KEY,
    useWebSearch: process.argv.includes('--web-search'),
    requestDelay: 2000
};

const pool = new Pool(CONFIG.db);
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString('es-CO');
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Leer productos desde Excel
 */
async function readExcelProducts(filePath) {
    log(`📂 Leyendo Excel: ${path.basename(filePath)}`, 'cyan');

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const products = data.map(row => {
        const keys = Object.keys(row);
        return {
            ref: (row.REF || row.ref || row.Ref || '').toString().trim(),
            categoria: keys[1] || 'GENERAL',
            nombre: (row[keys[1]] || '').toString().trim(),
            precio_contado: parseFloat(String(row.CONTADO || row.contado || 0).replace(/[,\.]/g, '')),
            precio_promo: parseFloat(String(row.PROMO || row.promo || 0).replace(/[,\.]/g, ''))
        };
    }).filter(p => p.ref && p.nombre);

    log(`✅ ${products.length} productos válidos encontrados`, 'green');
    return products;
}

/**
 * Descargar y optimizar imagen
 */
async function downloadAndOptimizeImage(url, ref, index) {
    try {
        await fs.mkdir(CONFIG.dirs.images, { recursive: true });

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const filename = `${ref.replace(/[^a-zA-Z0-9]/g, '_')}_${index}.${CONFIG.images.format}`;
        const filepath = path.join(CONFIG.dirs.images, filename);

        await sharp(response.data)
            .resize(CONFIG.images.maxWidth, CONFIG.images.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: CONFIG.images.quality })
            .toFile(filepath);

        log(`  ✅ Imagen guardada: ${filename}`, 'green');
        return `/assets/images/productos/${filename}`;

    } catch (error) {
        log(`  ⚠️  Error con imagen: ${error.message}`, 'yellow');
        return null;
    }
}

/**
 * Obtener IDs de categoría y marca
 */
async function getCategoryAndBrand(categoria, ref, nombre) {
    const client = await pool.connect();

    try {
        // Mapeo de categorías
        const categoryMap = {
            'TELEVISORES': { cat: 'Electro Hogar', sub: 'Televisores' },
            'NEVERAS': { cat: 'Electro Hogar', sub: 'Neveras' },
            'LAVADORAS': { cat: 'Electro Hogar', sub: 'Lavadoras' },
            'ESTUFAS': { cat: 'Electro Hogar', sub: 'Estufas' },
            'MICROONDAS': { cat: 'Electro Hogar', sub: 'Microondas' }
        };

        const mapping = categoryMap[categoria.toUpperCase()] || { cat: 'Electro Hogar', sub: null };

        // Buscar categoría
        const catResult = await client.query(
            'SELECT id_categoria FROM categorias WHERE nombre ILIKE $1',
            [mapping.cat]
        );
        const id_categoria = catResult.rows[0]?.id_categoria || 1;

        // Buscar subcategoría
        let id_subcategoria = null;
        if (mapping.sub) {
            const subResult = await client.query(
                'SELECT id_subcategoria FROM subcategorias WHERE nombre ILIKE $1 AND id_categoria = $2',
                [mapping.sub, id_categoria]
            );
            id_subcategoria = subResult.rows[0]?.id_subcategoria;
        }

        // Detectar marca
        const text = `${ref} ${nombre}`.toUpperCase();
        const brands = ['LG', 'SAMSUNG', 'KALLEY', 'HACEB', 'MABE', 'WHIRLPOOL', 'OSTER', 'SONY'];

        let id_marca = 2; // Default: Kalley
        for (const brand of brands) {
            if (text.includes(brand)) {
                const brandResult = await client.query(
                    'SELECT id_marca FROM marcas WHERE nombre ILIKE $1',
                    [brand]
                );
                if (brandResult.rows.length > 0) {
                    id_marca = brandResult.rows[0].id_marca;
                    break;
                }
            }
        }

        return { id_categoria, id_subcategoria, id_marca };

    } finally {
        client.release();
    }
}

/**
 * Extraer especificaciones básicas
 */
function extractBasicSpecs(nombre) {
    const specs = [];

    // Pulgadas
    const pulgadasMatch = nombre.match(/(\d+)["'']/);
    if (pulgadasMatch) {
        specs.push({ nombre: 'Tamaño de Pantalla', valor: pulgadasMatch[1], unidad: 'pulgadas' });
    }

    // Resolución
    if (/4K|UHD/i.test(nombre)) {
        specs.push({ nombre: 'Resolución', valor: '4K Ultra HD', unidad: null });
    } else if (/Full\s*HD/i.test(nombre)) {
        specs.push({ nombre: 'Resolución', valor: 'Full HD 1080p', unidad: null });
    } else if (/\bHD\b/i.test(nombre)) {
        specs.push({ nombre: 'Resolución', valor: 'HD 720p', unidad: null });
    }

    // Smart TV
    if (/Smart/i.test(nombre)) {
        specs.push({ nombre: 'Smart TV', valor: 'Sí', unidad: null });
    }

    // Sistema operativo
    if (/WebOS|webOS/i.test(nombre)) {
        specs.push({ nombre: 'Sistema Operativo', valor: 'webOS', unidad: null });
    } else if (/Tizen/i.test(nombre)) {
        specs.push({ nombre: 'Sistema Operativo', valor: 'Tizen', unidad: null });
    } else if (/Android/i.test(nombre)) {
        specs.push({ nombre: 'Sistema Operativo', valor: 'Android TV', unidad: null });
    }

    // HDMI
    const hdmiMatch = nombre.match(/(\d+)\s*HDMI/i);
    if (hdmiMatch) {
        specs.push({ nombre: 'Puertos HDMI', valor: hdmiMatch[1], unidad: 'puertos' });
    }

    // USB
    if (/USB/i.test(nombre)) {
        specs.push({ nombre: 'Puerto USB', valor: 'Sí', unidad: null });
    }

    return specs;
}

/**
 * Insertar producto en BD
 */
async function insertProduct(product, enrichedData) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id_categoria, id_subcategoria, id_marca } = await getCategoryAndBrand(
            product.categoria,
            product.ref,
            product.nombre
        );

        // Insertar producto
        const productResult = await client.query(`
      INSERT INTO productos (
        sku, referencia_proveedor, nombre, 
        descripcion_corta, descripcion_larga,
        id_categoria, id_subcategoria, id_marca,
        precio_actual, precio_anterior, precio_promocional,
        stock, garantia_meses, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id_producto
    `, [
            product.ref,
            product.ref,
            product.nombre,
            enrichedData.descripcion_corta,
            enrichedData.descripcion_larga,
            id_categoria,
            id_subcategoria,
            id_marca,
            product.precio_contado,
            product.precio_contado,
            product.precio_promo,
            10,
            12,
            true
        ]);

        const id_producto = productResult.rows[0].id_producto;

        // Insertar imágenes
        for (let i = 0; i < enrichedData.imagenes.length; i++) {
            const imagePath = enrichedData.imagenes[i];
            if (imagePath) {
                await client.query(`
          INSERT INTO producto_imagenes (
            id_producto, url_imagen, alt_text, orden, es_principal
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
                    id_producto,
                    imagePath,
                    `${product.nombre} - Imagen ${i + 1}`,
                    i + 1,
                    i === 0
                ]);
            }
        }

        // Insertar especificaciones
        for (const spec of enrichedData.especificaciones) {
            const attrResult = await client.query(
                'SELECT id_atributo FROM atributos WHERE nombre = $1',
                [spec.nombre]
            );

            let id_atributo;
            if (attrResult.rows.length > 0) {
                id_atributo = attrResult.rows[0].id_atributo;
            } else {
                const newAttr = await client.query(
                    'INSERT INTO atributos (nombre, unidad, tipo_dato) VALUES ($1, $2, $3) RETURNING id_atributo',
                    [spec.nombre, spec.unidad, 'texto']
                );
                id_atributo = newAttr.rows[0].id_atributo;
            }

            await client.query(
                'INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto) VALUES ($1, $2, $3)',
                [id_producto, id_atributo, spec.valor]
            );
        }

        await client.query('COMMIT');
        log(`✅ Producto insertado: ${product.ref} (ID: ${id_producto})`, 'green');

        return id_producto;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Procesar un producto
 */
async function processProduct(product, searcher, aiEnricher) {
    log(`\n${'='.repeat(70)}`, 'cyan');
    log(`Procesando: ${product.ref} - ${product.nombre.substring(0, 50)}...`, 'cyan');
    log('='.repeat(70), 'cyan');

    try {
        let enrichedData = {
            descripcion_corta: product.nombre.substring(0, 200),
            descripcion_larga: `<p>${product.nombre}</p>`,
            especificaciones: extractBasicSpecs(product.nombre),
            imagenes: []
        };

        // Búsqueda web (si está habilitada)
        if (CONFIG.useWebSearch && searcher) {
            log('🔍 Buscando en web...', 'yellow');
            const searchResults = await searcher.searchProduct(product.ref, product.categoria);

            // Descargar imágenes
            for (let i = 0; i < Math.min(searchResults.images.length, 3); i++) {
                const imagePath = await downloadAndOptimizeImage(
                    searchResults.images[i],
                    product.ref,
                    i + 1
                );
                if (imagePath) {
                    enrichedData.imagenes.push(imagePath);
                }
            }
        }

        // Enriquecimiento con IA (si está habilitado)
        if (CONFIG.useAI && aiEnricher) {
            log('🤖 Generando con IA...', 'yellow');

            const aiDescription = await aiEnricher.generateDescription(
                product.ref,
                product.nombre,
                product.categoria,
                {}
            );

            if (aiDescription) {
                enrichedData.descripcion_corta = aiDescription.descripcion_corta;
                enrichedData.descripcion_larga = aiDescription.descripcion_larga;
            }

            const aiSpecs = await aiEnricher.extractSpecifications(
                product.ref,
                product.nombre,
                product.categoria,
                {}
            );

            if (aiSpecs && aiSpecs.length > 0) {
                enrichedData.especificaciones = aiSpecs;
            }
        }

        // Si no hay imágenes, usar placeholders
        if (enrichedData.imagenes.length === 0) {
            log('  ℹ️  Usando imágenes placeholder', 'yellow');
            enrichedData.imagenes = [
                `/assets/images/productos/placeholder_${product.ref}_1.jpg`,
                `/assets/images/productos/placeholder_${product.ref}_2.jpg`
            ];
        }

        // Insertar en BD
        await insertProduct(product, enrichedData);

        return true;

    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

/**
 * Main
 */
async function main() {
    const excelFile = process.argv[2];

    if (!excelFile) {
        console.log('❌ Uso: node product-enrichment-full.js <archivo.xlsx> [--web-search]');
        console.log('\nEjemplo:');
        console.log('  node product-enrichment-full.js raw_data/productos.xlsx');
        console.log('  node product-enrichment-full.js raw_data/productos.xlsx --web-search');
        process.exit(1);
    }

    console.log('\n' + '='.repeat(70));
    log('🚀 SISTEMA DE ENRIQUECIMIENTO AUTOMÁTICO', 'cyan');
    console.log('='.repeat(70));

    log(`📊 Configuración:`, 'cyan');
    console.log(`  - IA: ${CONFIG.useAI ? '✅ Habilitada' : '❌ Deshabilitada'}`);
    console.log(`  - Búsqueda Web: ${CONFIG.useWebSearch ? '✅ Habilitada' : '❌ Deshabilitada'}`);
    console.log('');

    let searcher = null;
    let aiEnricher = null;

    try {
        // Inicializar módulos
        if (CONFIG.useWebSearch) {
            searcher = new ProductSearcher();
            await searcher.init();
        }

        if (CONFIG.useAI) {
            aiEnricher = new AIEnricher(process.env.GEMINI_API_KEY);
        }

        // Leer productos
        const products = await readExcelProducts(excelFile);

        // Procesar productos
        let successCount = 0;
        let errorCount = 0;

        for (const product of products) {
            const success = await processProduct(product, searcher, aiEnricher);
            if (success) {
                successCount++;
            } else {
                errorCount++;
            }

            // Delay entre productos
            await new Promise(resolve => setTimeout(resolve, CONFIG.requestDelay));
        }

        // Resumen
        console.log('\n' + '='.repeat(70));
        log('📊 RESUMEN FINAL', 'cyan');
        console.log('='.repeat(70));
        console.log(`✅ Exitosos: ${successCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📦 Total: ${products.length}`);
        console.log('');

    } catch (error) {
        log(`❌ Error fatal: ${error.message}`, 'red');
        console.error(error);
    } finally {
        if (searcher) await searcher.close();
        await pool.end();
    }
}

main();
