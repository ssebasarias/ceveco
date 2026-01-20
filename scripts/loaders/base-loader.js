require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'ceveco_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

/**
 * Clase base para cargar productos desde JSONL
 * Maneja la normalización de campos y la inserción en BD
 */
class BaseProductLoader {
    constructor(config) {
        this.config = config;
        this.stats = {
            processed: 0,
            inserted: 0,
            updated: 0,
            imagesInserted: 0,
            errors: 0
        };
    }

    /**
     * Normaliza el SKU desde diferentes campos posibles
     */
    normalizeSKU(product) {
        return product.sku || 
               product.referencia || 
               product.referencia_completa || 
               product.referencia_buscada || 
               product.referencia_excel ||
               `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Normaliza el nombre del producto
     */
    normalizeName(product) {
        return product.nombre || product.name || 'Producto sin nombre';
    }

    /**
     * Normaliza la descripción
     */
    normalizeDescription(product) {
        return product.descripcion || product.description || '';
    }

    /**
     * Normaliza el precio base
     */
    normalizePrice(product) {
        let price = product.precio_base || 
                   product.precio || 
                   product.precio_actual || 
                   0;
        
        if (typeof price === 'string') {
            price = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
        }
        
        return parseFloat(price) || 0;
    }

    /**
     * Normaliza el precio promocional
     */
    normalizePromoPrice(product) {
        let promoPrice = product.precio_promocion || 
                        product.precio_promocional || 
                        product.precio_descuento || 
                        null;
        
        if (typeof promoPrice === 'string') {
            promoPrice = parseFloat(promoPrice.replace(/[^0-9.]/g, '')) || null;
        }
        
        if (promoPrice === 0 || promoPrice === null || promoPrice === undefined) {
            return null;
        }
        
        return parseFloat(promoPrice);
    }

    /**
     * Normaliza las imágenes desde diferentes formatos
     * Retorna array de URLs (strings)
     */
    normalizeImages(product) {
        if (!product.imagenes) return [];
        
        // Si es array de strings, retornarlo directamente
        if (Array.isArray(product.imagenes)) {
            return product.imagenes
                .map(img => {
                    if (typeof img === 'string') return img;
                    if (typeof img === 'object' && img.url) return img.url;
                    if (typeof img === 'object' && img.url_imagen) return img.url_imagen;
                    return null;
                })
                .filter(img => img && img.trim() !== '');
        }
        
        // Si es string, convertir a array
        if (typeof product.imagenes === 'string') {
            return [product.imagenes].filter(img => img && img.trim() !== '');
        }
        
        return [];
    }

    /**
     * Normaliza las especificaciones/características
     */
    normalizeSpecs(product) {
        if (!product.especificaciones && !product.caracteristicas) return {};
        
        const specs = product.especificaciones || product.caracteristicas || {};
        
        // Si es string, intentar parsearlo
        if (typeof specs === 'string') {
            try {
                return JSON.parse(specs);
            } catch (e) {
                // Intentar parsear formato "Key: Value; Key2: Value2"
                const result = {};
                const parts = specs.split(';');
                for (const part of parts) {
                    const [key, ...valParts] = part.split(':');
                    if (key && valParts.length > 0) {
                        result[key.trim()] = valParts.join(':').trim();
                    }
                }
                return result;
            }
        }
        
        // Si es objeto, aplanarlo si tiene estructura anidada
        if (typeof specs === 'object') {
            // Si tiene campo "todas", usar ese
            if (specs.todas && typeof specs.todas === 'object') {
                return specs.todas;
            }
            return specs;
        }
        
        return {};
    }

    /**
     * Obtiene o crea una marca
     */
    async getOrCreateBrand(brandName) {
        if (!brandName) {
            brandName = this.config.defaultBrand || 'Generica';
        }
        
        let res = await pool.query('SELECT id_marca FROM marcas WHERE nombre ILIKE $1', [brandName]);
        if (res.rows.length > 0) {
            return res.rows[0].id_marca;
        }
        
        res = await pool.query(
            'INSERT INTO marcas (nombre, activo) VALUES ($1, true) RETURNING id_marca',
            [brandName]
        );
        console.log(`  ✨ Marca creada: ${brandName} (ID: ${res.rows[0].id_marca})`);
        return res.rows[0].id_marca;
    }

    /**
     * Obtiene el ID de una categoría
     */
    async getCategoryId(categoryName) {
        if (!categoryName) {
            categoryName = this.config.defaultCategory;
        }
        
        const res = await pool.query(
            'SELECT id_categoria FROM categorias WHERE nombre ILIKE $1',
            [categoryName]
        );
        
        if (res.rows.length > 0) {
            return res.rows[0].id_categoria;
        }
        
        // Fallback mappings
        const fallbacks = {
            'Muebles y Organización': 2,
            'Motos': 3,
            'Motocicletas': 3,
            'Electrohogar': 1,
            'Electro Hogar': 1,
            'Herramientas': 4
        };
        
        for (const [key, id] of Object.entries(fallbacks)) {
            if (categoryName.includes(key) || key.includes(categoryName)) {
                return id;
            }
        }
        
        return null;
    }

    /**
     * Obtiene o crea una subcategoría
     */
    async getOrCreateSubcategory(subcategoryName, categoryId) {
        if (!subcategoryName || !categoryId) return null;
        
        let res = await pool.query(
            'SELECT id_subcategoria FROM subcategorias WHERE nombre ILIKE $1 AND id_categoria = $2',
            [subcategoryName, categoryId]
        );
        
        if (res.rows.length > 0) {
            return res.rows[0].id_subcategoria;
        }
        
        // Crear slug
        const slug = subcategoryName.toLowerCase()
            .replace(/[áäàâ]/g, 'a')
            .replace(/[éëèê]/g, 'e')
            .replace(/[íïìî]/g, 'i')
            .replace(/[óöòô]/g, 'o')
            .replace(/[úüùû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        
        // Verificar si el slug existe
        const slugCheck = await pool.query('SELECT id_subcategoria FROM subcategorias WHERE slug = $1', [slug]);
        let finalSlug = slug;
        if (slugCheck.rows.length > 0) {
            finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        
        res = await pool.query(
            'INSERT INTO subcategorias (nombre, slug, id_categoria, activo) VALUES ($1, $2, $3, true) RETURNING id_subcategoria',
            [subcategoryName, finalSlug, categoryId]
        );
        
        console.log(`  ✨ Subcategoría creada: ${subcategoryName} (ID: ${res.rows[0].id_subcategoria})`);
        return res.rows[0].id_subcategoria;
    }

    /**
     * Inserta o actualiza un producto
     */
    async upsertProduct(normalizedData) {
        const { sku, nombre, descripcion_corta, descripcion_larga, precio_actual, precio_promocional, id_marca, id_categoria, id_subcategoria } = normalizedData;
        
        // Verificar si existe
        const existing = await pool.query('SELECT id_producto FROM productos WHERE sku = $1', [sku]);
        
        let productId;
        
        if (existing.rows.length > 0) {
            // Actualizar
            productId = existing.rows[0].id_producto;
            await pool.query(`
                UPDATE productos SET
                    nombre = $1,
                    descripcion_corta = $2,
                    descripcion_larga = $3,
                    precio_actual = $4,
                    precio_promocional = $5,
                    id_marca = $6,
                    id_categoria = $7,
                    id_subcategoria = $8,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id_producto = $9
            `, [nombre, descripcion_corta, descripcion_larga, precio_actual, precio_promocional, id_marca, id_categoria, id_subcategoria, productId]);
            
            this.stats.updated++;
        } else {
            // Insertar
            const res = await pool.query(`
                INSERT INTO productos (
                    sku, nombre, descripcion_corta, descripcion_larga,
                    precio_actual, precio_promocional,
                    id_marca, id_categoria, id_subcategoria,
                    stock, activo
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
                RETURNING id_producto
            `, [sku, nombre, descripcion_corta, descripcion_larga, precio_actual, precio_promocional, id_marca, id_categoria, id_subcategoria, 10]);
            
            productId = res.rows[0].id_producto;
            this.stats.inserted++;
        }
        
        return productId;
    }

    /**
     * Inserta las imágenes del producto
     */
    async insertImages(productId, imageUrls) {
        if (!imageUrls || imageUrls.length === 0) return;
        
        // Obtener imágenes existentes
        const existingRes = await pool.query(
            'SELECT url_imagen FROM producto_imagenes WHERE id_producto = $1',
            [productId]
        );
        const existingUrls = new Set(existingRes.rows.map(row => row.url_imagen));
        
        // Verificar si ya hay una imagen principal
        const hasPrincipal = existingRes.rows.some(row => row.es_principal === true);
        
        // Obtener el orden máximo actual
        const maxOrdenRes = await pool.query(
            'SELECT MAX(orden) as max_orden FROM producto_imagenes WHERE id_producto = $1',
            [productId]
        );
        let currentOrden = maxOrdenRes.rows[0]?.max_orden ?? -1;
        
        // Insertar nuevas imágenes
        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i].trim();
            
            // Validar URL
            if (!url || url === '' || url.includes('placeholder') || url.includes('no-image')) {
                continue;
            }
            
            // Evitar duplicados
            if (existingUrls.has(url)) {
                continue;
            }
            
            currentOrden++;
            const esPrincipal = !hasPrincipal && i === 0;
            
            try {
                await pool.query(
                    'INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal, alt_text) VALUES ($1, $2, $3, $4, $5)',
                    [productId, url, currentOrden, esPrincipal, `Imagen ${i + 1} del producto`]
                );
                
                this.stats.imagesInserted++;
                
                // Marcar que ya hay una principal
                if (esPrincipal) {
                    hasPrincipal = true;
                }
            } catch (err) {
                console.error(`    ⚠️  Error insertando imagen: ${err.message}`);
            }
        }
    }

    /**
     * Inserta los atributos/especificaciones del producto
     */
    async insertAttributes(productId, specs) {
        if (!specs || Object.keys(specs).length === 0) return;
        
        for (const [key, value] of Object.entries(specs)) {
            if (!value || value === 'N/A' || value === '') continue;
            
            // Normalizar nombre del atributo
            const attrName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
            
            // Obtener o crear atributo
            let attrRes = await pool.query('SELECT id_atributo FROM atributos WHERE nombre ILIKE $1', [attrName]);
            let attrId;
            
            if (attrRes.rows.length > 0) {
                attrId = attrRes.rows[0].id_atributo;
            } else {
                const newAttr = await pool.query(
                    'INSERT INTO atributos (nombre, tipo_dato) VALUES ($1, $2) RETURNING id_atributo',
                    [attrName, 'texto']
                );
                attrId = newAttr.rows[0].id_atributo;
            }
            
            // Upsert valor
            try {
                await pool.query(`
                    INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (id_producto, id_atributo) 
                    DO UPDATE SET valor_texto = EXCLUDED.valor_texto
                `, [productId, attrId, value.toString()]);
            } catch (err) {
                // Ignorar errores de atributos
            }
        }
    }

    /**
     * Normaliza un producto desde el formato del JSONL
     * Debe ser sobrescrito por clases hijas para formatos específicos
     */
    normalizeProduct(product) {
        return {
            sku: this.normalizeSKU(product),
            nombre: this.normalizeName(product),
            descripcion_corta: this.normalizeDescription(product).substring(0, 500),
            descripcion_larga: `<div class="product-description">${this.normalizeDescription(product)}</div>`,
            precio_actual: this.normalizePrice(product),
            precio_promocional: this.normalizePromoPrice(product),
            imagenes: this.normalizeImages(product),
            especificaciones: this.normalizeSpecs(product),
            marca: product.marca || this.config.defaultBrand,
            categoria: product.categoria || this.config.defaultCategory,
            subcategoria: product.subcategoria || null
        };
    }

    /**
     * Procesa un producto individual
     */
    async processProduct(rawProduct) {
        try {
            this.stats.processed++;
            
            // Normalizar producto
            const normalized = this.normalizeProduct(rawProduct);
            
            // Obtener IDs de marca, categoría y subcategoría
            const id_marca = await this.getOrCreateBrand(normalized.marca);
            const id_categoria = await this.getCategoryId(normalized.categoria);
            
            if (!id_categoria) {
                throw new Error(`Categoría "${normalized.categoria}" no encontrada`);
            }
            
            const id_subcategoria = normalized.subcategoria 
                ? await this.getOrCreateSubcategory(normalized.subcategoria, id_categoria)
                : null;
            
            // Upsert producto
            const productId = await this.upsertProduct({
                ...normalized,
                id_marca,
                id_categoria,
                id_subcategoria
            });
            
            // Insertar imágenes
            await this.insertImages(productId, normalized.imagenes);
            
            // Insertar atributos
            await this.insertAttributes(productId, normalized.especificaciones);
            
            console.log(`  ✅ [${normalized.sku}] ${normalized.nombre.substring(0, 50)}...`);
            
        } catch (err) {
            console.error(`  ❌ Error procesando producto: ${err.message}`);
            this.stats.errors++;
        }
    }

    /**
     * Lee y parsea un archivo JSONL (soporta formato multilínea)
     */
    readJSONLFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Intentar primero como JSONL estándar (una línea por objeto)
        const lines = content.split('\n').filter(line => line.trim());
        const standardProducts = [];
        
        for (const line of lines) {
            try {
                const product = JSON.parse(line.trim());
                if (product && typeof product === 'object') {
                    standardProducts.push(product);
                }
            } catch (e) {
                // Si falla, puede ser formato multilínea
            }
        }
        
        // Si se parsearon productos, retornarlos
        if (standardProducts.length > 0) {
            return standardProducts;
        }
        
        // Si no, intentar parsear como JSON multilínea
        let currentObj = '';
        let braceCount = 0;
        const multilineProducts = [];
        
        for (const line of lines) {
            currentObj += line + '\n';
            
            // Contar llaves para saber cuándo termina un objeto
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            
            // Si las llaves están balanceadas, tenemos un objeto completo
            if (braceCount === 0 && currentObj.trim()) {
                try {
                    const product = JSON.parse(currentObj.trim());
                    if (product && typeof product === 'object') {
                        multilineProducts.push(product);
                    }
                    currentObj = '';
                } catch (e) {
                    // Ignorar errores de parseo
                    currentObj = '';
                }
            }
        }
        
        return multilineProducts;
    }

    /**
     * Ejecuta la carga completa
     */
    async execute() {
        const filePath = path.join(__dirname, '../../', this.config.filePath);
        
        console.log('\n' + '='.repeat(60));
        console.log(`📂 Procesando: ${this.config.filePath}`);
        console.log('='.repeat(60));
        
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Archivo no encontrado: ${filePath}`);
            return;
        }
        
        // Leer productos
        const products = this.readJSONLFile(filePath);
        console.log(`📦 Productos encontrados: ${products.length}\n`);
        
        // Procesar cada producto
        for (const product of products) {
            await this.processProduct(product);
        }
        
        // Mostrar estadísticas
        console.log('\n' + '='.repeat(60));
        console.log('✅ CARGA COMPLETADA');
        console.log('='.repeat(60));
        console.log(`Procesados: ${this.stats.processed}`);
        console.log(`Insertados: ${this.stats.inserted}`);
        console.log(`Actualizados: ${this.stats.updated}`);
        console.log(`Imágenes insertadas: ${this.stats.imagesInserted}`);
        console.log(`Errores: ${this.stats.errors}`);
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Cierra la conexión a la BD
     */
    async close() {
        await pool.end();
    }
}

module.exports = BaseProductLoader;
