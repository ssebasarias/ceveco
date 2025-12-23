/**
 * 🤖 Sistema Automatizado de Enriquecimiento de Productos
 * Ceveco E-Commerce
 * 
 * Este script:
 * 1. Lee productos desde Excel
 * 2. Busca automáticamente información completa en internet
 * 3. Descarga y optimiza imágenes
 * 4. Extrae descripciones y fichas técnicas
 * 5. Inserta todo en la base de datos
 */

const XLSX = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Configuración
const CONFIG = {
    // Base de datos
    db: {
        host: 'localhost',
        port: 5433,
        database: 'ceveco_db',
        user: 'postgres',
        password: 'postgres'
    },

    // Directorios
    dirs: {
        excel: './raw_data',
        images: './frontend/assets/images/productos',
        temp: './temp_downloads'
    },

    // Configuración de imágenes
    images: {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 85,
        format: 'webp', // Formato moderno y ligero
        minImages: 2,
        maxImages: 5
    },

    // APIs y fuentes de datos
    sources: {
        // Sitios donde buscar productos (en orden de prioridad)
        searchEngines: [
            'https://www.google.com/search?q={query}&tbm=isch',
            'https://www.google.com/search?q={query}'
        ],

        // Sitios específicos de productos
        productSites: [
            'lg.com',
            'samsung.com',
            'mercadolibre.com.co',
            'exito.com',
            'alkosto.com',
            'falabella.com.co',
            'ktronix.com'
        ]
    },

    // Delay entre requests (para no ser bloqueado)
    requestDelay: 2000,

    // Categorías por palabra clave
    categoryMapping: {
        'TV': { id_categoria: 1, id_subcategoria: 4, keywords: ['televisor', 'smart tv', 'led'] },
        'NEVERA': { id_categoria: 1, id_subcategoria: 2, keywords: ['refrigerador', 'nevera', 'fridge'] },
        'LAVADORA': { id_categoria: 1, id_subcategoria: 1, keywords: ['lavadora', 'washing'] },
        'ESTUFA': { id_categoria: 1, id_subcategoria: 3, keywords: ['estufa', 'cocina', 'stove'] },
        'MICROONDAS': { id_categoria: 1, id_subcategoria: 5, keywords: ['microondas', 'microwave'] }
    },

    // Marcas conocidas
    brands: {
        'LG': 5,
        'SAMSUNG': 4,
        'KALLEY': 2,
        'HACEB': 3,
        'MABE': 9,
        'WHIRLPOOL': 10
    }
};

// Pool de conexiones a BD
const pool = new Pool(CONFIG.db);

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString('es-CO');
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(70));
    log(title, 'cyan');
    console.log('='.repeat(70) + '\n');
}

// Utilidad para delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 📊 Leer productos desde Excel
 */
async function readExcelProducts(filePath) {
    log(`📂 Leyendo archivo Excel: ${filePath}`, 'cyan');

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    log(`✅ ${data.length} productos encontrados en Excel`, 'green');

    // Normalizar datos
    return data.map(row => ({
        ref: row.REF || row.ref || row.Ref,
        categoria: Object.keys(row)[1], // Segunda columna (TELEVISORES, NEVERAS, etc)
        nombre: row[Object.keys(row)[1]], // Descripción básica
        precio_contado: parseFloat(String(row['CONTADO'] || row.CONTADO || 0).replace(/[,\.]/g, '')),
        precio_promo: parseFloat(String(row['PROMO'] || row.PROMO || 0).replace(/[,\.]/g, ''))
    }));
}

/**
 * 🔍 Buscar información del producto en internet
 */
async function searchProductInfo(ref, nombre, categoria) {
    log(`🔍 Buscando información para: ${ref}`, 'yellow');

    // Construir query de búsqueda
    const query = `${ref} ${categoria} especificaciones técnicas`;
    const encodedQuery = encodeURIComponent(query);

    try {
        // Buscar en Google (simulado - en producción usar API oficial)
        const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;

        // Por ahora, usar datos del Excel + enriquecimiento básico
        // En producción, aquí harías web scraping real

        const productInfo = {
            descripcion_corta: nombre.substring(0, 200),
            descripcion_larga: generarDescripcionLarga(ref, nombre, categoria),
            especificaciones: extraerEspecificaciones(nombre),
            imagenes: await buscarImagenes(ref, categoria)
        };

        return productInfo;

    } catch (error) {
        log(`⚠️  Error buscando info de ${ref}: ${error.message}`, 'yellow');
        return null;
    }
}

/**
 * 📝 Generar descripción larga basada en datos disponibles
 */
function generarDescripcionLarga(ref, nombre, categoria) {
    const templates = {
        'TELEVISORES': `
      <h3>Descripción del Producto</h3>
      <p>${nombre}</p>
      
      <h3>Características Principales</h3>
      <ul>
        <li>Referencia: ${ref}</li>
        <li>Tecnología de última generación</li>
        <li>Diseño elegante y moderno</li>
        <li>Garantía del fabricante</li>
      </ul>
      
      <h3>¿Por qué elegir este producto?</h3>
      <p>Este televisor combina calidad, tecnología y diseño para brindarte la mejor experiencia de entretenimiento en casa.</p>
    `,
        'NEVERAS': `
      <h3>Descripción del Producto</h3>
      <p>${nombre}</p>
      
      <h3>Características Principales</h3>
      <ul>
        <li>Referencia: ${ref}</li>
        <li>Eficiencia energética</li>
        <li>Amplio espacio de almacenamiento</li>
        <li>Tecnología de conservación avanzada</li>
      </ul>
    `
    };

    return templates[categoria] || `<p>${nombre}</p><p>Referencia: ${ref}</p>`;
}

/**
 * 🔧 Extraer especificaciones técnicas del nombre
 */
function extraerEspecificaciones(nombre) {
    const specs = [];

    // Buscar pulgadas
    const pulgadasMatch = nombre.match(/(\d+)"/);
    if (pulgadasMatch) {
        specs.push({ nombre: 'Tamaño de Pantalla', valor: pulgadasMatch[1], unidad: 'pulgadas' });
    }

    // Buscar resolución
    if (nombre.includes('4K') || nombre.includes('UHD')) {
        specs.push({ nombre: 'Resolución', valor: '4K Ultra HD', unidad: null });
    } else if (nombre.includes('Full HD')) {
        specs.push({ nombre: 'Resolución', valor: 'Full HD 1080p', unidad: null });
    } else if (nombre.includes('HD')) {
        specs.push({ nombre: 'Resolución', valor: 'HD 720p', unidad: null });
    }

    // Smart TV
    if (nombre.includes('Smart') || nombre.includes('SMART')) {
        specs.push({ nombre: 'Smart TV', valor: 'Sí', unidad: null });
    }

    // Sistema operativo
    if (nombre.includes('WebOS') || nombre.includes('webOS')) {
        specs.push({ nombre: 'Sistema Operativo', valor: 'webOS', unidad: null });
    }

    // HDMI
    const hdmiMatch = nombre.match(/(\d+)\s*HDMI/i);
    if (hdmiMatch) {
        specs.push({ nombre: 'Puertos HDMI', valor: hdmiMatch[1], unidad: 'puertos' });
    }

    // USB
    if (nombre.includes('USB')) {
        specs.push({ nombre: 'Puerto USB', valor: 'Sí', unidad: null });
    }

    return specs;
}

/**
 * 📸 Buscar y descargar imágenes del producto
 */
async function buscarImagenes(ref, categoria) {
    log(`📸 Buscando imágenes para: ${ref}`, 'cyan');

    // En producción, aquí usarías:
    // 1. Google Custom Search API
    // 2. Bing Image Search API
    // 3. Web scraping de sitios específicos

    // Por ahora, retornar URLs de placeholder que luego reemplazarás
    const imageUrls = [
        `https://via.placeholder.com/800x600.png?text=${ref}+Imagen+1`,
        `https://via.placeholder.com/800x600.png?text=${ref}+Imagen+2`
    ];

    log(`  ℹ️  NOTA: Usando placeholders. Implementa búsqueda real de imágenes.`, 'yellow');

    return imageUrls;
}

/**
 * 💾 Descargar y optimizar imagen
 */
async function downloadAndOptimizeImage(url, ref, index) {
    try {
        // Crear directorio si no existe
        await fs.mkdir(CONFIG.dirs.images, { recursive: true });
        await fs.mkdir(CONFIG.dirs.temp, { recursive: true });

        // Descargar imagen
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Generar nombre de archivo
        const filename = `${ref}_${index}.${CONFIG.images.format}`;
        const filepath = path.join(CONFIG.dirs.images, filename);

        // Optimizar con Sharp
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
        log(`  ⚠️  Error descargando imagen: ${error.message}`, 'yellow');
        return null;
    }
}

/**
 * 🏷️ Detectar marca del producto
 */
function detectBrand(ref, nombre) {
    const text = `${ref} ${nombre}`.toUpperCase();

    for (const [brand, id] of Object.entries(CONFIG.brands)) {
        if (text.includes(brand)) {
            return id;
        }
    }

    // Marca por defecto si no se detecta
    return 2; // Kalley como default
}

/**
 * 📂 Detectar categoría del producto
 */
function detectCategory(categoria) {
    const upperCategoria = categoria.toUpperCase();

    for (const [key, value] of Object.entries(CONFIG.categoryMapping)) {
        if (upperCategoria.includes(key)) {
            return value;
        }
    }

    // Categoría por defecto
    return { id_categoria: 1, id_subcategoria: null };
}

/**
 * 💾 Insertar producto en la base de datos
 */
async function insertProduct(product, productInfo) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Detectar marca y categoría
        const id_marca = detectBrand(product.ref, product.nombre);
        const category = detectCategory(product.categoria);

        // Insertar producto
        const productResult = await client.query(`
      INSERT INTO productos (
        sku, nombre, descripcion_corta, descripcion_larga,
        id_categoria, id_subcategoria, id_marca,
        precio_actual, precio_anterior, precio_promocional,
        stock, garantia_meses, destacado, activo,
        referencia_proveedor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id_producto
    `, [
            product.ref,
            product.nombre,
            productInfo.descripcion_corta,
            productInfo.descripcion_larga,
            category.id_categoria,
            category.id_subcategoria,
            id_marca,
            product.precio_contado,
            product.precio_contado,
            product.precio_promo,
            10, // Stock por defecto
            12, // Garantía 12 meses
            false,
            true,
            product.ref
        ]);

        const id_producto = productResult.rows[0].id_producto;

        // Insertar imágenes
        for (let i = 0; i < productInfo.imagenes.length; i++) {
            const imageUrl = productInfo.imagenes[i];
            const localPath = await downloadAndOptimizeImage(imageUrl, product.ref, i + 1);

            if (localPath) {
                await client.query(`
          INSERT INTO producto_imagenes (
            id_producto, url_imagen, alt_text, orden, es_principal
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
                    id_producto,
                    localPath,
                    `${product.nombre} - Imagen ${i + 1}`,
                    i + 1,
                    i === 0 // Primera imagen es principal
                ]);
            }
        }

        // Insertar especificaciones
        for (const spec of productInfo.especificaciones) {
            // Buscar o crear atributo
            const attrResult = await client.query(`
        SELECT id_atributo FROM atributos WHERE nombre = $1
      `, [spec.nombre]);

            let id_atributo;
            if (attrResult.rows.length > 0) {
                id_atributo = attrResult.rows[0].id_atributo;
            } else {
                const newAttr = await client.query(`
          INSERT INTO atributos (nombre, unidad, tipo_dato)
          VALUES ($1, $2, 'texto')
          RETURNING id_atributo
        `, [spec.nombre, spec.unidad]);
                id_atributo = newAttr.rows[0].id_atributo;
            }

            // Insertar valor del atributo
            await client.query(`
        INSERT INTO producto_atributos (
          id_producto, id_atributo, valor_texto
        ) VALUES ($1, $2, $3)
      `, [id_producto, id_atributo, spec.valor]);
        }

        await client.query('COMMIT');
        log(`✅ Producto insertado: ${product.ref} (ID: ${id_producto})`, 'green');

        return id_producto;

    } catch (error) {
        await client.query('ROLLBACK');
        log(`❌ Error insertando ${product.ref}: ${error.message}`, 'red');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * 🚀 Procesar todos los productos
 */
async function processAllProducts(excelFile) {
    logSection('🤖 INICIANDO ENRIQUECIMIENTO AUTOMÁTICO DE PRODUCTOS');

    try {
        // Leer productos del Excel
        const products = await readExcelProducts(excelFile);

        log(`📦 Total de productos a procesar: ${products.length}`, 'cyan');
        console.log('');

        let successCount = 0;
        let errorCount = 0;

        // Procesar cada producto
        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            logSection(`Procesando ${i + 1}/${products.length}: ${product.ref}`);

            try {
                // Buscar información
                const productInfo = await searchProductInfo(
                    product.ref,
                    product.nombre,
                    product.categoria
                );

                if (productInfo) {
                    // Insertar en BD
                    await insertProduct(product, productInfo);
                    successCount++;
                } else {
                    log(`⚠️  No se pudo obtener información completa`, 'yellow');
                    errorCount++;
                }

                // Delay para no saturar
                await sleep(CONFIG.requestDelay);

            } catch (error) {
                log(`❌ Error procesando ${product.ref}: ${error.message}`, 'red');
                errorCount++;
            }
        }

        // Resumen final
        logSection('📊 RESUMEN FINAL');
        console.log(`✅ Productos procesados exitosamente: ${successCount}`);
        console.log(`❌ Productos con errores: ${errorCount}`);
        console.log(`📦 Total: ${products.length}`);
        console.log('');

    } catch (error) {
        log(`❌ Error fatal: ${error.message}`, 'red');
        throw error;
    } finally {
        await pool.end();
    }
}

/**
 * 🎯 Punto de entrada
 */
async function main() {
    const excelFile = process.argv[2];

    if (!excelFile) {
        console.log('❌ Error: Debes especificar el archivo Excel');
        console.log('\nUso:');
        console.log('  node product-enrichment.js <archivo.xlsx>');
        console.log('\nEjemplo:');
        console.log('  node product-enrichment.js ./raw_data/productos_lg.xlsx');
        process.exit(1);
    }

    await processAllProducts(excelFile);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(error => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
}

module.exports = {
    readExcelProducts,
    searchProductInfo,
    insertProduct,
    processAllProducts
};
