const BaseProductLoader = require('./base-loader');

class ComodisimosLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // Comodisimos usa: referencia_excel, nombre, descripcion, marca, categoria, subcategoria, precio, precio_descuento, imagenes (array), caracteristicas (objeto)
        return {
            sku: product.referencia_excel || `COM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio) || 0,
            precio_promocional: product.precio_descuento ? parseFloat(product.precio_descuento) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.caracteristicas || {},
            marca: product.marca || 'Comodisimos',
            categoria: product.categoria || 'Muebles y Organización',
            subcategoria: product.subcategoria || null
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const loader = new ComodisimosLoader({
        filePath: 'scrapers/resultados/comodisimos.jsonl',
        defaultBrand: 'Comodisimos',
        defaultCategory: 'Muebles y Organización'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = ComodisimosLoader;
