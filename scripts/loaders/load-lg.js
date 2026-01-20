const BaseProductLoader = require('./base-loader');

class LGLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // LG usa: referencia, nombre, descripcion, imagenes (array), especificaciones (objeto), marca, categoria, subcategoria, precio
        return {
            sku: product.referencia || `LG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto LG sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio) || 0,
            precio_promocional: null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.especificaciones || {},
            marca: product.marca || 'LG',
            categoria: product.categoria || 'Electrohogar',
            subcategoria: product.subcategoria || null
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const loader = new LGLoader({
        filePath: 'scrapers/resultados/LG.jsonl',
        defaultBrand: 'LG',
        defaultCategory: 'Electrohogar'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = LGLoader;
