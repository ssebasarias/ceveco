const BaseProductLoader = require('./base-loader');

class CorbetaLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // Corbeta usa: sku, nombre, descripcion, marca, categoria, subcategoria, precio_base, precio_promocion, imagenes (array), especificaciones (objeto)
        return {
            sku: product.sku || product.ean_referencia || `CORBETA-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio_base) || 0,
            precio_promocional: product.precio_promocion ? parseFloat(product.precio_promocion) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.especificaciones || {},
            marca: product.marca || 'Kalley',
            categoria: product.categoria || 'Electrohogar',
            subcategoria: product.subcategoria || null
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const loader = new CorbetaLoader({
        filePath: 'scrapers/resultados/corbeta_enrich.jsonl',
        defaultBrand: 'Kalley',
        defaultCategory: 'Electrohogar'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = CorbetaLoader;
