/**
 * 📊 Reporte Detallado de Datos para BD
 * Muestra exactamente cómo quedará cada campo en cada tabla
 */

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'reporte_scraping_completo.json');
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('\n' + '█'.repeat(140));
console.log('📊 REPORTE DETALLADO - VISTA PREVIA DE DATOS EN BD');
console.log('█'.repeat(140) + '\n');

const exitosos = data.filter(d => d.exito);

exitosos.forEach((item, index) => {
    const product = item.final;

    console.log('\n' + '═'.repeat(140));
    console.log(`PRODUCTO ${index + 1}/${exitosos.length}: ${item.archivo}`);
    console.log('═'.repeat(140));

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
    console.log('\n┌─ TABLA: productos ────────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│');

    const fields = [
        { name: 'ref', value: product.ref, type: 'VARCHAR(100)' },
        { name: 'nombre', value: product.nombre, type: 'VARCHAR(255)' },
        { name: 'descripcion_corta', value: product.descripcion_corta, type: 'TEXT' },
        { name: 'descripcion_larga', value: product.descripcion_larga, type: 'TEXT' },
        { name: 'id_categoria', value: product.id_categoria, type: 'INTEGER' },
        { name: 'id_subcategoria', value: product.id_subcategoria, type: 'INTEGER' },
        { name: 'id_marca', value: product.id_marca, type: 'INTEGER' },
        { name: 'precio', value: product.precio, type: 'DECIMAL(10,2)' },
        { name: 'precio_oferta', value: product.precio_oferta, type: 'DECIMAL(10,2)' },
        { name: 'stock', value: product.stock, type: 'INTEGER' },
        { name: 'activo', value: product.activo, type: 'BOOLEAN' },
        { name: 'destacado', value: product.destacado, type: 'BOOLEAN' }
    ];

    fields.forEach(field => {
        const displayValue = typeof field.value === 'string' && field.value.length > 80
            ? field.value.substring(0, 77) + '...'
            : field.value;

        const fieldName = field.name.padEnd(20);
        const typeInfo = `(${field.type})`.padEnd(20);

        console.log(`│  ${fieldName} ${typeInfo} = ${JSON.stringify(displayValue)}`);
    });

    console.log('│');
    console.log('│  REFERENCIAS:');
    console.log(`│    → Categoría:    ID ${product.id_categoria} = ${item.clasificacion.categoria.nombre}`);
    console.log(`│    → Subcategoría: ID ${product.id_subcategoria} = ${item.clasificacion.subcategoria.nombre}`);
    console.log(`│    → Marca:        ID ${product.id_marca} = ${item.clasificacion.marca.nombre}`);
    console.log('│');
    console.log('└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘');

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
    if (product.imagenes && product.imagenes.length > 0) {
        console.log('\n┌─ TABLA: producto_imagenes ────────────────────────────────────────────────────────────────────────────────┐');
        console.log('│');

        product.imagenes.forEach((img, idx) => {
            console.log(`│  IMAGEN ${idx + 1}:`);
            console.log(`│    id_producto        (INTEGER)          = (FK a productos.id_producto)`);
            console.log(`│    url                (VARCHAR(500))     = '${img.url}'`);
            console.log(`│    orden              (INTEGER)          = ${idx + 1}`);
            console.log(`│    es_principal       (BOOLEAN)          = ${idx === 0}`);
            console.log('│');
            console.log(`│    ARCHIVO FÍSICO:`);
            console.log(`│      Nombre:          ${img.filename}`);
            console.log(`│      Tamaño:          ${(img.size / 1024).toFixed(1)} KB`);
            console.log(`│      Ruta completa:   ${img.filepath}`);
            console.log(`│      URL original:    ${img.original_url ? img.original_url.substring(0, 70) + '...' : 'N/A'}`);
            console.log('│');
        });

        console.log('└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
    if (product.atributos && product.atributos.length > 0) {
        console.log('\n┌─ TABLA: producto_atributos ───────────────────────────────────────────────────────────────────────────────┐');
        console.log('│');

        product.atributos.forEach((attr, idx) => {
            console.log(`│  ATRIBUTO ${idx + 1}:`);
            console.log(`│    id_producto        (INTEGER)          = (FK a productos.id_producto)`);
            console.log(`│    nombre             (VARCHAR(100))     = '${attr.nombre}'`);
            console.log(`│    valor              (VARCHAR(255))     = '${attr.valor}'`);
            console.log(`│    unidad             (VARCHAR(50))      = ${attr.unidad ? `'${attr.unidad}'` : 'NULL'}`);
            console.log('│');
        });

        console.log('└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
    } else {
        console.log('\n┌─ TABLA: producto_atributos ───────────────────────────────────────────────────────────────────────────────┐');
        console.log('│');
        console.log('│  ⚠️  Sin atributos detectados para este producto');
        console.log('│');
        console.log('└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
    }

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
    console.log('\n┌─ DATOS ORIGINALES DEL EXCEL ──────────────────────────────────────────────────────────────────────────────┐');
    console.log('│');
    console.log(`│  REF Excel:           ${item.original.ref}`);
    console.log(`│  Nombre Excel:        ${item.original.nombre.substring(0, 80)}${item.original.nombre.length > 80 ? '...' : ''}`);
    console.log(`│  Categoría Excel:     ${item.original.categoria}`);
    console.log(`│  Precio Contado:      $${item.original.precio_contado.toLocaleString()}`);
    console.log(`│  Precio Promoción:    $${item.original.precio_promo.toLocaleString()}`);
    console.log('│');
    console.log('└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘');

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
    console.log('\n┌─ VERIFICACIÓN Y NOTAS ────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│');

    // Verificaciones
    const checks = [];

    if (product.ref.length > 100) {
        checks.push('⚠️  REF muy larga (>100 caracteres)');
    }

    if (product.nombre.length > 255) {
        checks.push('⚠️  Nombre muy largo (>255 caracteres) - se truncará');
    }

    if (!product.id_categoria || !product.id_subcategoria || !product.id_marca) {
        checks.push('❌ Faltan IDs de relaciones');
    }

    if (product.imagenes.length === 0) {
        checks.push('⚠️  Sin imágenes');
    }

    if (product.atributos.length === 0) {
        checks.push('ℹ️  Sin atributos técnicos');
    }

    if (product.descripcion_larga.length < 50) {
        checks.push('⚠️  Descripción larga muy corta');
    }

    if (item.clasificacion.categoria.confianza < 0.8) {
        checks.push('⚠️  Clasificación con baja confianza - revisar manualmente');
    }

    if (checks.length === 0) {
        console.log('│  ✅ Todo correcto - Listo para insertar');
    } else {
        checks.forEach(check => {
            console.log(`│  ${check}`);
        });
    }

    console.log('│');
    console.log('│  SCRAPING:');
    console.log(`│    Imágenes encontradas:  ${item.imagenes_scrapeadas}`);
    console.log(`│    Imágenes descargadas:  ${item.imagenes_descargadas}`);
    console.log(`│    Tasa de éxito:         ${((item.imagenes_descargadas / item.imagenes_scrapeadas) * 100).toFixed(0)}%`);
    console.log('│');
    console.log('└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log('\n\n' + '█'.repeat(140));
console.log('📊 RESUMEN GENERAL DE DATOS');
console.log('█'.repeat(140));

console.log('\n📋 ESTADÍSTICAS POR TABLA:');
console.log('\n  TABLA: productos');
console.log(`    Total registros a insertar:     ${exitosos.length}`);
console.log(`    Campos por registro:            12 campos`);
console.log(`    Referencias a otras tablas:     3 (categorias, subcategorias, marcas)`);

const totalImagenes = exitosos.reduce((sum, item) => sum + item.final.imagenes.length, 0);
console.log('\n  TABLA: producto_imagenes');
console.log(`    Total registros a insertar:     ${totalImagenes}`);
console.log(`    Promedio por producto:          ${(totalImagenes / exitosos.length).toFixed(1)}`);
console.log(`    Imágenes principales:           ${exitosos.length} (1 por producto)`);

const totalAtributos = exitosos.reduce((sum, item) => sum + item.final.atributos.length, 0);
console.log('\n  TABLA: producto_atributos');
console.log(`    Total registros a insertar:     ${totalAtributos}`);
console.log(`    Promedio por producto:          ${(totalAtributos / exitosos.length).toFixed(1)}`);
console.log(`    Productos sin atributos:        ${exitosos.filter(item => item.final.atributos.length === 0).length}`);

console.log('\n📊 DISTRIBUCIÓN POR CATEGORÍA:');
const porCategoria = {};
exitosos.forEach(item => {
    const cat = item.clasificacion.categoria.nombre;
    if (!porCategoria[cat]) porCategoria[cat] = 0;
    porCategoria[cat]++;
});

for (const [cat, count] of Object.entries(porCategoria)) {
    console.log(`    ${cat.padEnd(30)} ${count} productos (${((count / exitosos.length) * 100).toFixed(0)}%)`);
}

console.log('\n⚠️  ADVERTENCIAS Y RECOMENDACIONES:');

const warnings = [];

// Verificar productos sin imágenes
const sinImagenes = exitosos.filter(item => item.final.imagenes.length === 0);
if (sinImagenes.length > 0) {
    warnings.push(`${sinImagenes.length} productos sin imágenes`);
}

// Verificar descripciones cortas
const descCortas = exitosos.filter(item => item.final.descripcion_larga.length < 50);
if (descCortas.length > 0) {
    warnings.push(`${descCortas.length} productos con descripción muy corta`);
}

// Verificar clasificación con baja confianza
const bajaConfianza = exitosos.filter(item => item.clasificacion.categoria.confianza < 0.8);
if (bajaConfianza.length > 0) {
    warnings.push(`${bajaConfianza.length} productos con clasificación de baja confianza`);
}

if (warnings.length === 0) {
    console.log('    ✅ No hay advertencias - Todos los datos están listos');
} else {
    warnings.forEach(w => console.log(`    ⚠️  ${w}`));
}

console.log('\n💡 ACCIONES RECOMENDADAS ANTES DE INSERTAR:');
console.log('    1. Revisar productos con advertencias');
console.log('    2. Verificar que las categorías/subcategorías sean correctas');
console.log('    3. Confirmar que las imágenes se descargaron correctamente');
console.log('    4. Revisar descripciones muy cortas y mejorarlas si es necesario');
console.log('    5. Validar precios (contado vs promoción)');

console.log('\n✅ SIGUIENTE PASO:');
console.log('    Si todo se ve correcto, puedes:');
console.log('    • Generar SQL para estos productos: node generate-insert-sql.js');
console.log('    • Insertar directamente en BD: node insert-to-db.js');
console.log('    • Procesar todos los productos: node product-enrichment-full.js');

console.log('\n' + '█'.repeat(140));
console.log('✅ REPORTE COMPLETADO');
console.log('█'.repeat(140) + '\n');
