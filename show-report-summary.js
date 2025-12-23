/**
 * 📊 Mostrar Resumen del Reporte
 */

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'reporte_5_productos.json');
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('\n' + '='.repeat(80));
console.log('📊 RESUMEN DEL REPORTE - PRIMEROS 5 PRODUCTOS POR ARCHIVO');
console.log('='.repeat(80) + '\n');

// Agrupar por archivo
const porArchivo = {};
data.forEach(item => {
    if (!porArchivo[item.archivo]) {
        porArchivo[item.archivo] = [];
    }
    porArchivo[item.archivo].push(item);
});

// Mostrar resumen por archivo
for (const [archivo, productos] of Object.entries(porArchivo)) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📁 ${archivo}`);
    console.log(`${'─'.repeat(80)}`);

    productos.forEach((item, idx) => {
        console.log(`\n   ${idx + 1}. ${item.original.nombre.substring(0, 50)}${item.original.nombre.length > 50 ? '...' : ''}`);
        console.log(`      REF: ${item.original.ref}`);
        console.log(`      Precio: $${item.original.precio_contado.toLocaleString()}`);
        console.log(`      ➜ Categoría: ${item.clasificacion.categoria.nombre}`);
        console.log(`      ➜ Subcategoría: ${item.clasificacion.subcategoria.nombre} (${item.clasificacion.subcategoria.accion})`);
        console.log(`      ➜ Marca: ${item.clasificacion.marca.nombre}`);
        if (item.clasificacion.atributos && item.clasificacion.atributos.length > 0) {
            console.log(`      ➜ Atributos: ${item.clasificacion.atributos.map(a => `${a.nombre}=${a.valor}`).join(', ')}`);
        }
    });
}

// Estadísticas generales
console.log('\n\n' + '='.repeat(80));
console.log('📈 ESTADÍSTICAS GENERALES');
console.log('='.repeat(80));

const stats = {
    total: data.length,
    archivos: Object.keys(porArchivo).length,
    categorias: {},
    subcategorias: new Set(),
    marcas: new Set(),
    confianzaAlta: 0,
    subcategoriasCreadas: 0,
    marcasCreadas: 0
};

data.forEach(item => {
    const cat = item.clasificacion.categoria.nombre;
    if (!stats.categorias[cat]) stats.categorias[cat] = 0;
    stats.categorias[cat]++;

    stats.subcategorias.add(item.clasificacion.subcategoria.nombre);
    stats.marcas.add(item.clasificacion.marca.nombre);

    if (item.clasificacion.categoria.confianza > 0.8) stats.confianzaAlta++;
    if (item.clasificacion.subcategoria.accion === 'crear_nueva') stats.subcategoriasCreadas++;
    if (item.clasificacion.marca.accion === 'crear_nueva') stats.marcasCreadas++;
});

console.log(`\n📦 Total productos analizados: ${stats.total}`);
console.log(`📁 Archivos procesados: ${stats.archivos}`);
console.log(`📊 Promedio por archivo: ${(stats.total / stats.archivos).toFixed(1)} productos`);

console.log(`\n📁 Distribución por Categoría:`);
for (const [cat, count] of Object.entries(stats.categorias)) {
    const porcentaje = (count / stats.total * 100).toFixed(0);
    console.log(`   ${cat}: ${count} (${porcentaje}%)`);
}

console.log(`\n📂 Subcategorías únicas: ${stats.subcategorias.size}`);
console.log(`   ${Array.from(stats.subcategorias).join(', ')}`);

console.log(`\n🏷️  Marcas únicas: ${stats.marcas.size}`);
console.log(`   ${Array.from(stats.marcas).join(', ')}`);

console.log(`\n✅ Clasificaciones con alta confianza (>80%): ${stats.confianzaAlta}/${stats.total} (${(stats.confianzaAlta / stats.total * 100).toFixed(0)}%)`);
console.log(`🆕 Subcategorías nuevas creadas: ${stats.subcategoriasCreadas}`);
console.log(`🆕 Marcas nuevas creadas: ${stats.marcasCreadas}`);

console.log('\n' + '='.repeat(80));
console.log('✅ RESUMEN COMPLETADO');
console.log('='.repeat(80) + '\n');
