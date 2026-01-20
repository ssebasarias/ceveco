const BaseProductLoader = require('./base-loader');

class LYLLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // LYL usa formato similar a maximuebles
        return {
            sku: product.sku || `LYL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio_base || product.precio) || 0,
            precio_promocional: product.precio_promocion ? parseFloat(product.precio_promocion) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.especificaciones || {},
            marca: 'L&L',
            categoria: product.categoria || 'Muebles y Organización',
            subcategoria: product.subcategoria || null
        };
    }
}

if (require.main === module) {
    const loader = new LYLLoader({
        filePath: 'scrapers/resultados/LYL.jsonl',
        defaultBrand: 'L&L',
        defaultCategory: 'Muebles y Organización'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = LYLLoader;
