const BaseProductLoader = require('./base-loader');

class HacebLoader extends BaseProductLoader {
    normalizeProduct(product) {
        // Haceb usa: referencia_buscada, nombre, descripcion, imagenes (array), caracteristicas (objeto anidado con "todas")
        return {
            sku: product.referencia_buscada || product.caracteristicas?.todas?.Referencia || `HACEB-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nombre: product.nombre || 'Producto Haceb sin nombre',
            descripcion_corta: (product.descripcion || '').substring(0, 500),
            descripcion_larga: `<div class="product-description">${product.descripcion || ''}</div>`,
            precio_actual: this.extractPrice(product) || 0,
            precio_promocional: null,
            imagenes: Array.isArray(product.imagenes) ? product.imagenes.filter(img => img && img.trim() !== '') : [],
            especificaciones: product.caracteristicas?.todas || product.caracteristicas || {},
            marca: 'Haceb',
            categoria: 'Electrohogar',
            subcategoria: this.extractSubcategory(product)
        };
    }

    extractPrice(product) {
        // Haceb no tiene precio en el JSONL, retornar 0
        // Se puede actualizar manualmente después
        return 0;
    }

    extractSubcategory(product) {
        const tipo = product.caracteristicas?.todas?.['Tipo de producto'];
        if (tipo) {
            return tipo;
        }
        return null;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const loader = new HacebLoader({
        filePath: 'scrapers/resultados/haceb.jsonl',
        defaultBrand: 'Haceb',
        defaultCategory: 'Electrohogar'
    });
    
    loader.execute()
        .then(() => loader.close())
        .catch(err => {
            console.error('ERROR FATAL:', err);
            process.exit(1);
        });
}

module.exports = HacebLoader;
