const BaseProductLoader = require('./base-loader');

class HondaLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // Honda usa: nombre, descripcion, imagenes (array), especificaciones_tecnicas (objeto anidado), marca, categoria, subcategoria, precio_base, precio_promocion
        return {
            sku: this.generateSKUFromName(product.nombre) || `HONDA-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto Honda sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: parseFloat(product.precio_base) || 0,
            precio_promocional: product.precio_promocion ? parseFloat(product.precio_promocion) : null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: this.flattenSpecs(product.especificaciones_tecnicas),
            marca: product.marca || 'Honda',
            categoria: product.categoria || 'Motos',
            subcategoria: product.subcategoria || null
        };
    }

    generateSKUFromName(nombre) {
        if (!nombre) return null;
        // Extraer modelo del nombre (ej: "CB 100 2026" -> "CB100")
        const match = nombre.match(/([A-Z]+\s*\d+)/);
        return match ? match[1].replace(/\s+/g, '') : null;
    }

    flattenSpecs(specs) {
        if (!specs || typeof specs !== 'object') return {};
        
        const result = {};
        
        // Aplanar objeto anidado
        for (const [key, value] of Object.entries(specs)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Si es objeto anidado, agregar prefijo
                for (const [subKey, subValue] of Object.entries(value)) {
                    if (Array.isArray(subValue)) {
                        result[`${key}_${subKey}`] = subValue.join(', ');
                    } else {
                        result[`${key}_${subKey}`] = subValue;
                    }
                }
            } else if (Array.isArray(value)) {
                result[key] = value.join(', ');
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const loader = new HondaLoader({
        filePath: 'scrapers/resultados/honda.jsonl',
        defaultBrand: 'Honda',
        defaultCategory: 'Motos'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = HondaLoader;
