const BaseProductLoader = require('./base-loader');

class HyundaiLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // Hyundai usa: ean_referencia, sku, nombre, descripcion, marca, categoria, subcategoria, precio_base, precio_promocion, imagenes (array), especificaciones (objeto)
        return {
            sku: product.sku || product.ean_referencia || `HYUNDAI-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto Hyundai sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio_base) || 0,
            precio_promocional: product.precio_promocion ? parseFloat(product.precio_promocion) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.especificaciones || {},
            marca: product.marca || 'Hyundai',
            categoria: product.categoria || 'Electrohogar',
            subcategoria: product.subcategoria || null
        };
    }
}

if (require.main === module) {
    const loader = new HyundaiLoader({
        filePath: 'scrapers/resultados/hyundai_final.jsonl',
        defaultBrand: 'Hyundai',
        defaultCategory: 'Electrohogar'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = HyundaiLoader;
