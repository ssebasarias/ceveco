const BaseProductLoader = require('./base-loader');

class MaximueblesLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // Maximuebles usa: sku, nombre, descripcion, imagenes (array), especificaciones (string), categoria, subcategoria, precio_base, precio_promocion
        return {
            sku: product.sku || `MX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio_base) || 0,
            precio_promocional: product.precio_promocion ? parseFloat(product.precio_promocion) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: this.parseSpecsString(product.especificaciones),
            marca: 'Maximuebles',
            categoria: product.categoria || 'Muebles y Organización',
            subcategoria: product.subcategoria || null
        };
    }

    parseSpecsString(specs) {
        if (!specs || typeof specs !== 'string') return {};
        
        const result = {};
        const parts = specs.split('.').filter(p => p.trim());
        
        for (const part of parts) {
            const colonIndex = part.indexOf(':');
            if (colonIndex > 0) {
                const key = part.substring(0, colonIndex).trim();
                const value = part.substring(colonIndex + 1).trim();
                if (key && value) {
                    result[key] = value;
                }
            }
        }
        
        return result;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const loader = new MaximueblesLoader({
        filePath: 'scrapers/resultados/maximuebles.jsonl',
        defaultBrand: 'Maximuebles',
        defaultCategory: 'Muebles y Organización'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = MaximueblesLoader;
