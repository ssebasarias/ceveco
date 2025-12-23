/**
 * 🔍 AUDITORÍA COMPLETA - EXCEL HONDA
 * 
 * Analiza los primeros 5 productos del Excel Honda
 * y genera un reporte detallado de cada paso del proceso
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const fs = require('fs');
const path = require('path');

class HondaAuditor {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.report = {
            fecha: new Date().toISOString(),
            archivo: 'HONDA.xlsx',
            productos_analizados: 0,
            normalizacion: {},
            clasificacion: [],
            imagenes: [],
            descripciones: [],
            atributos: [],
            problemas_detectados: [],
            recomendaciones: []
        };
    }

    /**
     * PASO 1: NORMALIZACIÓN DEL EXCEL
     */
    async auditarNormalizacion() {
        console.log('\n📋 PASO 1: AUDITORÍA DE NORMALIZACIÓN\n');

        const excelPath = path.join(__dirname, 'raw_data', 'HONDA AGOSTO 01 2025.xlsx');

        if (!fs.existsSync(excelPath)) {
            console.log('❌ Archivo HONDA AGOSTO 01 2025.xlsx no encontrado en raw_data/');
            this.report.problemas_detectados.push('Archivo HONDA AGOSTO 01 2025.xlsx no encontrado');
            return null;
        }

        const normalizer = new ExcelNormalizer();
        const productos = normalizer.readAndNormalize(excelPath);

        console.log(`✅ Productos encontrados: ${productos.length}`);
        console.log(`✅ Tomando primeros 5 para análisis\n`);

        const primeros5 = productos.slice(0, 5);
        this.report.productos_analizados = primeros5.length;

        // Analizar estructura del Excel
        this.report.normalizacion = {
            total_productos: productos.length,
            primeros_5: primeros5.map((p, i) => ({
                index: i + 1,
                sku: p.ref || p.sku,
                nombre: p.nombre,
                precio: p.precio,
                categoria_excel: p.categoria || 'N/A',
                columnas_disponibles: Object.keys(p)
            }))
        };

        console.log('📊 DATOS NORMALIZADOS:\n');
        primeros5.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nombre}`);
            console.log(`   SKU: ${p.ref || p.sku}`);
            console.log(`   Precio: ${p.precio}`);
            console.log(`   Columnas: ${Object.keys(p).join(', ')}`);
            console.log('');
        });

        return primeros5;
    }

    /**
     * PASO 2: CLASIFICACIÓN
     */
    async auditarClasificacion(productos) {
        console.log('\n🏷️  PASO 2: AUDITORÍA DE CLASIFICACIÓN\n');

        const classifier = new RuleBasedClassifier(this.pool);

        for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];
            console.log(`\n${i + 1}. Clasificando: ${producto.nombre}\n`);

            try {
                const clasificacion = await classifier.classify(producto);

                console.log(`   ✅ Categoría: ${clasificacion.categoria}`);
                console.log(`   ✅ Subcategoría: ${clasificacion.subcategoria}`);
                console.log(`   ✅ Marca: ${clasificacion.marca}`);
                console.log(`   ✅ Nombre sugerido: ${clasificacion.nombre_sugerido}`);

                this.report.clasificacion.push({
                    producto_original: producto.nombre,
                    sku: producto.ref || producto.sku,
                    categoria_detectada: clasificacion.categoria,
                    subcategoria_detectada: clasificacion.subcategoria,
                    marca_detectada: clasificacion.marca,
                    nombre_sugerido: clasificacion.nombre_sugerido,
                    id_categoria: clasificacion.id_categoria,
                    id_subcategoria: clasificacion.id_subcategoria,
                    id_marca: clasificacion.id_marca
                });

            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                this.report.problemas_detectados.push({
                    paso: 'clasificacion',
                    producto: producto.nombre,
                    error: error.message
                });
            }
        }
    }

    /**
     * PASO 3: ANÁLISIS DE IMÁGENES
     */
    async auditarImagenes(productos) {
        console.log('\n🖼️  PASO 3: AUDITORÍA DE IMÁGENES\n');

        const imageDir = path.join(__dirname, 'product_images_final');

        for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];
            const sku = (producto.ref || producto.sku || '').replace(/[^a-zA-Z0-9]/g, '_');

            console.log(`\n${i + 1}. Buscando imágenes para: ${producto.nombre}`);
            console.log(`   SKU sanitizado: ${sku}`);

            // Buscar imágenes existentes
            const imagenesEncontradas = [];

            if (fs.existsSync(imageDir)) {
                const files = fs.readdirSync(imageDir);
                const imagenesSKU = files.filter(f => f.includes(sku) && f.endsWith('.webp'));

                for (const img of imagenesSKU) {
                    const imgPath = path.join(imageDir, img);
                    const stats = fs.statSync(imgPath);

                    imagenesEncontradas.push({
                        nombre: img,
                        tamaño_kb: (stats.size / 1024).toFixed(2),
                        ruta: imgPath
                    });
                }
            }

            console.log(`   Imágenes encontradas: ${imagenesEncontradas.length}`);
            imagenesEncontradas.forEach(img => {
                console.log(`   - ${img.nombre} (${img.tamaño_kb} KB)`);
            });

            // Simular búsqueda de Google
            const searchQuery = `Honda ${producto.nombre} moto`;
            console.log(`   Búsqueda Google: "${searchQuery}"`);

            this.report.imagenes.push({
                producto: producto.nombre,
                sku: sku,
                busqueda_google: searchQuery,
                imagenes_encontradas: imagenesEncontradas.length,
                imagenes: imagenesEncontradas,
                resolucion_actual: '800x800px',
                problema: imagenesEncontradas.length === 0 ? 'Sin imágenes' :
                    imagenesEncontradas.length < 3 ? 'Menos de 3 imágenes' : null
            });

            if (imagenesEncontradas.length === 0) {
                this.report.problemas_detectados.push({
                    paso: 'imagenes',
                    producto: producto.nombre,
                    problema: 'No se encontraron imágenes descargadas'
                });
            }
        }

        // Análisis de resolución
        console.log('\n⚠️  ANÁLISIS DE RESOLUCIÓN:');
        console.log('   Resolución actual: 800x800px');
        console.log('   Recomendación: 1200x1200px o superior');
        console.log('   Razón: Mejor calidad en detalle de producto');

        this.report.recomendaciones.push({
            area: 'imagenes',
            problema: 'Resolución de 800x800px insuficiente para detalle de producto',
            solucion: 'Aumentar a 1200x1200px o 1600x1600px',
            impacto: 'Alto - Mejora significativa en calidad visual'
        });
    }

    /**
     * PASO 4: ANÁLISIS DE DESCRIPCIONES
     */
    async auditarDescripciones(productos) {
        console.log('\n📝 PASO 4: AUDITORÍA DE DESCRIPCIONES\n');

        for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];

            // Simular generación de descripción actual
            const descripcionCorta = producto.nombre.substring(0, 200);
            const descripcionLarga = `<div class="product-description">
  <h3>Honda ${producto.nombre}</h3>
  <p>Producto de alta calidad de la marca Honda.</p>
  
  <h4>Características:</h4>
  <p>Consulta las especificaciones técnicas en la ficha del producto.</p>
  
  <h4>Garantía y Soporte:</h4>
  <ul class="benefits">
    <li>✓ Garantía de fábrica</li>
    <li>✓ Envío a todo el país</li>
    <li>✓ Soporte técnico especializado</li>
  </ul>
</div>`;

            console.log(`\n${i + 1}. ${producto.nombre}`);
            console.log(`   Descripción corta: ${descripcionCorta}`);
            console.log(`   Descripción larga: ${descripcionLarga.substring(0, 100)}...`);

            // Analizar información disponible en Excel
            const infoDisponible = [];
            const infoUsada = [];
            const infoNoUsada = [];

            Object.keys(producto).forEach(key => {
                if (producto[key] && producto[key] !== '') {
                    infoDisponible.push({ columna: key, valor: producto[key] });

                    if (key === 'nombre' || key === 'ref' || key === 'sku') {
                        infoUsada.push(key);
                    } else {
                        infoNoUsada.push(key);
                    }
                }
            });

            console.log(`   Info disponible en Excel: ${infoDisponible.length} columnas`);
            console.log(`   Info usada en descripción: ${infoUsada.length} columnas`);
            console.log(`   Info NO usada: ${infoNoUsada.join(', ')}`);

            this.report.descripciones.push({
                producto: producto.nombre,
                descripcion_corta: descripcionCorta,
                descripcion_larga_preview: descripcionLarga.substring(0, 200),
                info_disponible_excel: infoDisponible,
                info_usada: infoUsada,
                info_no_usada: infoNoUsada,
                problema: infoNoUsada.length > 0 ? 'Información del Excel no aprovechada' : null
            });

            if (infoNoUsada.length > 0) {
                this.report.problemas_detectados.push({
                    paso: 'descripciones',
                    producto: producto.nombre,
                    problema: `${infoNoUsada.length} columnas del Excel no se usan en la descripción`,
                    columnas_ignoradas: infoNoUsada
                });
            }
        }

        this.report.recomendaciones.push({
            area: 'descripciones',
            problema: 'Descripciones genéricas que no aprovechan datos del Excel',
            solucion: 'Crear plantillas dinámicas que incluyan todas las columnas relevantes',
            impacto: 'Medio - Mejora en SEO y experiencia de usuario'
        });
    }

    /**
     * PASO 5: ANÁLISIS DE ATRIBUTOS
     */
    async auditarAtributos(productos) {
        console.log('\n🔧 PASO 5: AUDITORÍA DE ATRIBUTOS\n');

        for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];
            const nombre = producto.nombre;

            // Extraer atributos del NOMBRE (método actual)
            const atributosDelNombre = this.extraerAtributosDelNombre(nombre);

            // Identificar atributos disponibles en EXCEL
            const atributosEnExcel = [];
            Object.keys(producto).forEach(key => {
                if (key !== 'nombre' && key !== 'ref' && key !== 'sku' && key !== 'precio' && producto[key]) {
                    atributosEnExcel.push({ columna: key, valor: producto[key] });
                }
            });

            console.log(`\n${i + 1}. ${producto.nombre}`);
            console.log(`   Atributos extraídos del NOMBRE: ${Object.keys(atributosDelNombre).length}`);
            Object.entries(atributosDelNombre).forEach(([key, val]) => {
                console.log(`      - ${key}: ${val.valor} ${val.unidad || ''}`);
            });

            console.log(`   Atributos disponibles en EXCEL: ${atributosEnExcel.length}`);
            atributosEnExcel.forEach(attr => {
                console.log(`      - ${attr.columna}: ${attr.valor}`);
            });

            const atributosPerdidos = atributosEnExcel.filter(a =>
                !Object.keys(atributosDelNombre).includes(a.columna.toLowerCase())
            );

            if (atributosPerdidos.length > 0) {
                console.log(`   ⚠️  Atributos NO capturados: ${atributosPerdidos.length}`);
                atributosPerdidos.forEach(a => console.log(`      - ${a.columna}`));
            }

            this.report.atributos.push({
                producto: producto.nombre,
                atributos_del_nombre: atributosDelNombre,
                atributos_en_excel: atributosEnExcel,
                atributos_perdidos: atributosPerdidos,
                problema: atributosPerdidos.length > 0 ?
                    `${atributosPerdidos.length} atributos del Excel no se capturan` : null
            });

            if (atributosPerdidos.length > 0) {
                this.report.problemas_detectados.push({
                    paso: 'atributos',
                    producto: producto.nombre,
                    problema: 'Atributos del Excel no se extraen',
                    atributos_perdidos: atributosPerdidos.map(a => a.columna)
                });
            }
        }

        this.report.recomendaciones.push({
            area: 'atributos',
            problema: 'Solo se extraen atributos del nombre, se ignoran columnas del Excel',
            solucion: 'Leer TODAS las columnas del Excel y mapearlas a atributos',
            impacto: 'Alto - Fichas técnicas más completas'
        });
    }

    /**
     * Helper: Extraer atributos del nombre
     */
    extraerAtributosDelNombre(nombre) {
        const specs = {};

        const pesoMatch = nombre.match(/(\d+(?:\.\d+)?)\s*kg/i);
        if (pesoMatch) specs.peso = { valor: pesoMatch[1], unidad: 'kg' };

        const hpMatch = nombre.match(/(\d+(?:\.\d+)?)\s*HP/i);
        if (hpMatch) specs.potencia = { valor: hpMatch[1], unidad: 'HP' };

        const ccMatch = nombre.match(/(\d+)\s*cm[³3]|(\d+)\s*cc/i);
        if (ccMatch) specs.cilindraje = { valor: ccMatch[1] || ccMatch[2], unidad: 'cc' };

        if (nombre.includes('4T')) specs.tipo_motor = { valor: '4 Tiempos', unidad: null };
        if (nombre.toLowerCase().includes('gasolina')) specs.combustible = { valor: 'Gasolina', unidad: null };

        return specs;
    }

    /**
     * GENERAR REPORTE FINAL
     */
    async generarReporte() {
        console.log('\n' + '='.repeat(100));
        console.log('📊 GENERANDO REPORTE FINAL');
        console.log('='.repeat(100) + '\n');

        // Resumen de problemas
        console.log('❌ PROBLEMAS DETECTADOS:\n');
        this.report.problemas_detectados.forEach((p, i) => {
            console.log(`${i + 1}. [${p.paso.toUpperCase()}] ${p.problema}`);
            if (p.producto) console.log(`   Producto: ${p.producto}`);
            if (p.columnas_ignoradas) console.log(`   Columnas: ${p.columnas_ignoradas.join(', ')}`);
            console.log('');
        });

        // Resumen de recomendaciones
        console.log('\n💡 RECOMENDACIONES:\n');
        this.report.recomendaciones.forEach((r, i) => {
            console.log(`${i + 1}. [${r.area.toUpperCase()}]`);
            console.log(`   Problema: ${r.problema}`);
            console.log(`   Solución: ${r.solucion}`);
            console.log(`   Impacto: ${r.impacto}`);
            console.log('');
        });

        // Guardar reporte JSON
        const reportPath = path.join(__dirname, 'audit-honda-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
        console.log(`✅ Reporte guardado en: ${reportPath}\n`);

        // Guardar reporte Markdown
        await this.generarReporteMarkdown();

        await this.pool.end();
    }

    /**
     * Generar reporte en Markdown
     */
    async generarReporteMarkdown() {
        const md = `# 🔍 REPORTE DE AUDITORÍA - EXCEL HONDA

**Fecha:** ${new Date(this.report.fecha).toLocaleString()}  
**Archivo:** ${this.report.archivo}  
**Productos analizados:** ${this.report.productos_analizados}

---

## 📋 1. NORMALIZACIÓN

**Total productos en Excel:** ${this.report.normalizacion.total_productos}

### Primeros 5 productos:

${this.report.normalizacion.primeros_5.map(p => `
#### ${p.index}. ${p.nombre}
- **SKU:** ${p.sku}
- **Precio:** ${p.precio}
- **Categoría Excel:** ${p.categoria_excel}
- **Columnas disponibles:** ${p.columnas_disponibles.join(', ')}
`).join('\n')}

---

## 🏷️  2. CLASIFICACIÓN

${this.report.clasificacion.map((c, i) => `
### ${i + 1}. ${c.producto_original}
- **Categoría detectada:** ${c.categoria_detectada}
- **Subcategoría:** ${c.subcategoria_detectada}
- **Marca:** ${c.marca_detectada}
- **Nombre sugerido:** ${c.nombre_sugerido}
`).join('\n')}

---

## 🖼️  3. IMÁGENES

${this.report.imagenes.map((img, i) => `
### ${i + 1}. ${img.producto}
- **Búsqueda Google:** "${img.busqueda_google}"
- **Imágenes encontradas:** ${img.imagenes_encontradas}
- **Resolución actual:** ${img.resolucion_actual}
${img.problema ? `- **⚠️  Problema:** ${img.problema}` : ''}
`).join('\n')}

---

## 📝 4. DESCRIPCIONES

${this.report.descripciones.map((d, i) => `
### ${i + 1}. ${d.producto}
- **Info usada:** ${d.info_usada.join(', ')}
- **Info NO usada:** ${d.info_no_usada.join(', ')}
${d.problema ? `- **⚠️  Problema:** ${d.problema}` : ''}
`).join('\n')}

---

## 🔧 5. ATRIBUTOS

${this.report.atributos.map((a, i) => `
### ${i + 1}. ${a.producto}
- **Atributos del nombre:** ${Object.keys(a.atributos_del_nombre).length}
- **Atributos en Excel:** ${a.atributos_en_excel.length}
- **Atributos perdidos:** ${a.atributos_perdidos.length}
${a.problema ? `- **⚠️  Problema:** ${a.problema}` : ''}
`).join('\n')}

---

## ❌ PROBLEMAS DETECTADOS (${this.report.problemas_detectados.length})

${this.report.problemas_detectados.map((p, i) => `
${i + 1}. **[${p.paso.toUpperCase()}]** ${p.problema}
   ${p.producto ? `- Producto: ${p.producto}` : ''}
`).join('\n')}

---

## 💡 RECOMENDACIONES (${this.report.recomendaciones.length})

${this.report.recomendaciones.map((r, i) => `
### ${i + 1}. ${r.area.toUpperCase()}
- **Problema:** ${r.problema}
- **Solución:** ${r.solucion}
- **Impacto:** ${r.impacto}
`).join('\n')}

---

**Generado automáticamente por audit-honda-complete.js**
`;

        const mdPath = path.join(__dirname, 'AUDIT-HONDA-REPORT.md');
        fs.writeFileSync(mdPath, md);
        console.log(`✅ Reporte Markdown guardado en: ${mdPath}\n`);
    }

    /**
     * EJECUTAR AUDITORÍA COMPLETA
     */
    async ejecutar() {
        console.log('\n' + '█'.repeat(100));
        console.log('🔍 AUDITORÍA COMPLETA - EXCEL HONDA');
        console.log('█'.repeat(100));

        try {
            // Paso 1: Normalización
            const productos = await this.auditarNormalizacion();
            if (!productos) return;

            // Paso 2: Clasificación
            await this.auditarClasificacion(productos);

            // Paso 3: Imágenes
            await this.auditarImagenes(productos);

            // Paso 4: Descripciones
            await this.auditarDescripciones(productos);

            // Paso 5: Atributos
            await this.auditarAtributos(productos);

            // Generar reporte final
            await this.generarReporte();

            console.log('█'.repeat(100));
            console.log('✅ AUDITORÍA COMPLETADA');
            console.log('█'.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error en auditoría:', error);
            console.error(error.stack);
            await this.pool.end();
        }
    }
}

// Ejecutar
const auditor = new HondaAuditor();
auditor.ejecutar();
