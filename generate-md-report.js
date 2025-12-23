/**
 * 📊 Generar Reporte en Markdown
 */

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'reporte_scraping_completo.json');
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const exitosos = data.filter(d => d.exito);

let md = `# 📊 VISTA PREVIA DE DATOS PARA BASE DE DATOS

## Resumen General

**Total productos:** ${exitosos.length}
**Total imágenes:** ${exitosos.reduce((sum, item) => sum + item.final.imagenes.length, 0)}
**Total atributos:** ${exitosos.reduce((sum, item) => sum + item.final.atributos.length, 0)}

---

`;

exitosos.forEach((item, index) => {
    const product = item.final;

    md += `## ${index + 1}. ${item.archivo}\n\n`;

    md += `### 📦 TABLA: productos\n\n`;
    md += `| Campo | Tipo | Valor |\n`;
    md += `|-------|------|-------|\n`;
    md += `| ref | VARCHAR(100) | \`${product.ref}\` |\n`;
    md += `| nombre | VARCHAR(255) | ${product.nombre} |\n`;
    md += `| descripcion_corta | TEXT | ${product.descripcion_corta.substring(0, 80)}... |\n`;
    md += `| descripcion_larga | TEXT | ${product.descripcion_larga.substring(0, 80)}... |\n`;
    md += `| id_categoria | INTEGER | ${product.id_categoria} → ${item.clasificacion.categoria.nombre} |\n`;
    md += `| id_subcategoria | INTEGER | ${product.id_subcategoria} → ${item.clasificacion.subcategoria.nombre} |\n`;
    md += `| id_marca | INTEGER | ${product.id_marca} → ${item.clasificacion.marca.nombre} |\n`;
    md += `| precio | DECIMAL | $${product.precio.toLocaleString()} |\n`;
    md += `| precio_oferta | DECIMAL | $${product.precio_oferta.toLocaleString()} |\n`;
    md += `| stock | INTEGER | ${product.stock} |\n`;
    md += `| activo | BOOLEAN | ${product.activo} |\n`;
    md += `| destacado | BOOLEAN | ${product.destacado} |\n\n`;

    if (product.imagenes && product.imagenes.length > 0) {
        md += `### 🖼️ TABLA: producto_imagenes\n\n`;
        md += `| # | URL | Orden | Principal | Archivo | Tamaño |\n`;
        md += `|---|-----|-------|-----------|---------|--------|\n`;
        product.imagenes.forEach((img, idx) => {
            md += `| ${idx + 1} | \`${img.url}\` | ${idx + 1} | ${idx === 0 ? '✅' : '❌'} | ${img.filename} | ${(img.size / 1024).toFixed(1)} KB |\n`;
        });
        md += `\n`;
    }

    if (product.atributos && product.atributos.length > 0) {
        md += `### 🔧 TABLA: producto_atributos\n\n`;
        md += `| Nombre | Valor | Unidad |\n`;
        md += `|--------|-------|--------|\n`;
        product.atributos.forEach(attr => {
            md += `| ${attr.nombre} | ${attr.valor} | ${attr.unidad || '-'} |\n`;
        });
        md += `\n`;
    }

    md += `### 📋 Datos Originales del Excel\n\n`;
    md += `- **REF:** ${item.original.ref}\n`;
    md += `- **Nombre:** ${item.original.nombre}\n`;
    md += `- **Categoría:** ${item.original.categoria}\n`;
    md += `- **Precio Contado:** $${item.original.precio_contado.toLocaleString()}\n`;
    md += `- **Precio Promoción:** $${item.original.precio_promo.toLocaleString()}\n\n`;

    md += `### ✅ Verificación\n\n`;
    const checks = [];

    if (product.ref.length > 100) checks.push('⚠️ REF muy larga');
    if (product.nombre.length > 255) checks.push('⚠️ Nombre muy largo');
    if (product.imagenes.length === 0) checks.push('⚠️ Sin imágenes');
    if (product.atributos.length === 0) checks.push('ℹ️ Sin atributos');
    if (item.clasificacion.categoria.confianza < 0.8) checks.push('⚠️ Baja confianza en clasificación');

    if (checks.length === 0) {
        md += `✅ **Todo correcto - Listo para insertar**\n\n`;
    } else {
        checks.forEach(check => {
            md += `${check}\n`;
        });
        md += `\n`;
    }

    md += `---\n\n`;
});

md += `## 📊 Estadísticas Generales\n\n`;
md += `### Por Tabla\n\n`;
md += `| Tabla | Registros | Promedio/Producto |\n`;
md += `|-------|-----------|-------------------|\n`;
md += `| productos | ${exitosos.length} | 1 |\n`;
md += `| producto_imagenes | ${exitosos.reduce((sum, item) => sum + item.final.imagenes.length, 0)} | ${(exitosos.reduce((sum, item) => sum + item.final.imagenes.length, 0) / exitosos.length).toFixed(1)} |\n`;
md += `| producto_atributos | ${exitosos.reduce((sum, item) => sum + item.final.atributos.length, 0)} | ${(exitosos.reduce((sum, item) => sum + item.final.atributos.length, 0) / exitosos.length).toFixed(1)} |\n\n`;

md += `### Por Categoría\n\n`;
const porCategoria = {};
exitosos.forEach(item => {
    const cat = item.clasificacion.categoria.nombre;
    if (!porCategoria[cat]) porCategoria[cat] = 0;
    porCategoria[cat]++;
});

md += `| Categoría | Productos | Porcentaje |\n`;
md += `|-----------|-----------|------------|\n`;
for (const [cat, count] of Object.entries(porCategoria)) {
    md += `| ${cat} | ${count} | ${((count / exitosos.length) * 100).toFixed(0)}% |\n`;
}
md += `\n`;

md += `## ⚠️ Advertencias\n\n`;
const sinImagenes = exitosos.filter(item => item.final.imagenes.length === 0);
const descCortas = exitosos.filter(item => item.final.descripcion_larga.length < 50);
const bajaConfianza = exitosos.filter(item => item.clasificacion.categoria.confianza < 0.8);

if (sinImagenes.length > 0) md += `- ⚠️ ${sinImagenes.length} productos sin imágenes\n`;
if (descCortas.length > 0) md += `- ⚠️ ${descCortas.length} productos con descripción muy corta\n`;
if (bajaConfianza.length > 0) md += `- ⚠️ ${bajaConfianza.length} productos con clasificación de baja confianza\n`;

if (sinImagenes.length === 0 && descCortas.length === 0 && bajaConfianza.length === 0) {
    md += `✅ **No hay advertencias - Todos los datos están listos**\n`;
}

md += `\n## 💡 Próximos Pasos\n\n`;
md += `1. Revisar este reporte y hacer correcciones si es necesario\n`;
md += `2. Si todo está correcto, proceder a insertar en BD\n`;
md += `3. Verificar los datos insertados con \`check-db.js\`\n`;

const mdPath = path.join(__dirname, 'VISTA_PREVIA_BD.md');
fs.writeFileSync(mdPath, md);

console.log(`\n✅ Reporte generado: ${mdPath}\n`);
console.log(`📄 Abre el archivo para ver todos los detalles de cómo quedarán los datos en la BD\n`);
