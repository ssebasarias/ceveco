const BaseProductLoader = require('./base-loader');

class STIHLLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // STIHL usa: ean_referencia, sku, nombre, descripcion, marca, categoria, subcategoria, precio_base, precio_promocion, imagenes (array), especificaciones (objeto)
        return {
            sku: product.sku || product.ean_referencia || `STIHL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto STIHL sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio_base) || 0,
            precio_promocional: product.precio_promocion ? parseFloat(product.precio_promocion) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.especificaciones || {},
            marca: product.marca || 'STIHL',
            categoria: product.categoria || 'Herramientas',
            subcategoria: product.subcategoria || null
        };
    }
}

if (require.main === module) {
    const loader = new STIHLLoader({
        filePath: 'scrapers/resultados/stihl_enrich_fixed.jsonl',
        defaultBrand: 'STIHL',
        defaultCategory: 'Herramientas'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = STIHLLoader;
