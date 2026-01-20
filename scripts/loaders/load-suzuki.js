const BaseProductLoader = require('./base-loader');

class SuzukiLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // Suzuki usa: referencia, nombre, marca, categoria, subcategoria, precio, precio_promocion, descripcion, especificaciones (objeto), imagenes (array)
        return {
            sku: product.referencia || `SUZUKI-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto Suzuki sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio) || 0,
            precio_promocional: product.precio_promocion ? parseFloat(product.precio_promocion) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.especificaciones || {},
            marca: product.marca || 'Suzuki',
            categoria: product.categoria || 'Motos',
            subcategoria: product.subcategoria || null
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const loader = new SuzukiLoader({
        filePath: 'scrapers/resultados/suzuki_con_precios.jsonl',
        defaultBrand: 'Suzuki',
        defaultCategory: 'Motos'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = SuzukiLoader;
