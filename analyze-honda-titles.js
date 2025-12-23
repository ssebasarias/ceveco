/**
 * 🔍 ANÁLISIS DE TÍTULOS Y DESCRIPCIONES - HONDA
 * 
 * Muestra cómo se generan actualmente y qué se puede mejorar
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const path = require('path');

class HondaTitleAnalyzer {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });
    }

    /**
     * Generar título mejorado para moto Honda
     */
    generarTituloMejorado(producto) {
        // Extraer modelo del nombre
        const nombre = producto.nombre;
        let titulo = 'Honda';

        // Detectar modelo (ej: WAVE 110S, CB 125F, etc.)
        const modeloMatch = nombre.match(/([A-Z]+\s*\d+[A-Z]*(?:\s*\d+\.\d+)?(?:\s*[A-Z]+)?)/i);
        if (modeloMatch) {
            titulo += ` ${modeloMatch[1].trim()}`;
        }

        // Agregar año si está disponible
        const añoMatch = nombre.match(/Modelo\s*(\d{4})/i);
        if (añoMatch) {
            titulo += ` ${añoMatch[1]}`;
        }

        // Agregar características especiales
        if (nombre.includes('CBS')) titulo += ' CBS';
        if (nombre.includes('MAX')) titulo += ' MAX';
        if (nombre.includes('DLX')) titulo += ' DLX';

        return titulo;
    }

    /**
     * Generar descripción mejorada
     */
    generarDescripcionMejorada(producto) {
        const modelo = this.generarTituloMejorado(producto);

        const descripcion = {
            corta: `${modelo} - Motocicleta Honda de última generación`,
            larga: `<div class="product-description">
  <h3>${modelo}</h3>
  <p>Motocicleta Honda de última generación, diseñada para ofrecer el mejor rendimiento, economía y confiabilidad.</p>
  
  <h4>Características Principales:</h4>
  <ul class="features">
    <li><strong>Marca:</strong> Honda</li>
    <li><strong>Modelo:</strong> ${modelo}</li>
    ${producto.precio_contado ? `<li><strong>Disponible:</strong> En stock</li>` : ''}
    ${producto.categoria ? `<li><strong>Tipo:</strong> ${producto.categoria}</li>` : ''}
  </ul>
  
  <h4>Ventajas Honda:</h4>
  <ul class="benefits">
    <li>✓ Tecnología Honda de vanguardia</li>
    <li>✓ Bajo consumo de combustible</li>
    <li>✓ Fácil mantenimiento</li>
    <li>✓ Repuestos originales disponibles</li>
    <li>✓ Red de servicio técnico autorizado</li>
  </ul>
  
  <h4>Garantía y Soporte:</h4>
  <p>Todas nuestras motocicletas Honda cuentan con garantía de fábrica y soporte técnico especializado.</p>
  
  <p class="cta"><strong>¡Cotiza ahora y obtén las mejores condiciones de financiación!</strong></p>
</div>`
        };

        return descripcion;
    }

    /**
     * Analizar productos Honda
     */
    async analizar() {
        console.log('\n' + '='.repeat(100));
        console.log('🔍 ANÁLISIS DE TÍTULOS Y DESCRIPCIONES - HONDA');
        console.log('='.repeat(100) + '\n');

        try {
            // 1. Leer Excel Honda
            const excelPath = path.join(__dirname, 'raw_data', 'HONDA AGOSTO 01 2025.xlsx');
            const normalizer = new ExcelNormalizer();
            const productos = normalizer.readAndNormalize(excelPath);

            console.log(`📦 Productos en Excel: ${productos.length}\n`);
            console.log('Analizando primeros 5 productos...\n');

            // 2. Analizar cada producto
            for (let i = 0; i < Math.min(5, productos.length); i++) {
                const producto = productos[i];

                console.log('='.repeat(100));
                console.log(`\n${i + 1}. PRODUCTO: ${producto.nombre}\n`);
                console.log('='.repeat(100));

                // Datos del Excel
                console.log('\n📋 DATOS DEL EXCEL:\n');
                console.log(`   REF/SKU:          ${producto.ref || producto.sku}`);
                console.log(`   Nombre:           ${producto.nombre}`);
                console.log(`   Categoría:        ${producto.categoria || 'N/A'}`);
                console.log(`   Precio Contado:   ${producto.precio_contado || 'N/A'}`);
                console.log(`   Precio Promo:     ${producto.precio_promo || 'N/A'}`);
                console.log(`   Raw Data:         ${producto.raw || 'N/A'}`);

                // Título actual vs mejorado
                console.log('\n📝 TÍTULOS:\n');
                console.log(`   ❌ Actual:        ${producto.nombre}`);
                console.log(`   ✅ Mejorado:      ${this.generarTituloMejorado(producto)}`);

                // Descripción mejorada
                const descripcion = this.generarDescripcionMejorada(producto);

                console.log('\n📄 DESCRIPCIÓN CORTA:\n');
                console.log(`   ${descripcion.corta}`);

                console.log('\n📄 DESCRIPCIÓN LARGA (preview):\n');
                const preview = descripcion.larga
                    .replace(/<[^>]+>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 200);
                console.log(`   ${preview}...`);

                // Información disponible vs usada
                console.log('\n📊 ANÁLISIS DE DATOS:\n');
                const columnasDisponibles = Object.keys(producto).filter(k => producto[k] && producto[k] !== '');
                const columnasUsadas = ['ref', 'nombre', 'categoria'];
                const columnasNoUsadas = columnasDisponibles.filter(c => !columnasUsadas.includes(c));

                console.log(`   Columnas disponibles:  ${columnasDisponibles.length}`);
                console.log(`   Columnas usadas:       ${columnasUsadas.length}`);
                console.log(`   Columnas NO usadas:    ${columnasNoUsadas.length}`);

                if (columnasNoUsadas.length > 0) {
                    console.log(`\n   ⚠️  Datos NO aprovechados:`);
                    columnasNoUsadas.forEach(col => {
                        console.log(`      - ${col}: ${producto[col]}`);
                    });
                }

                console.log('\n');
            }

            // 3. Recomendaciones
            console.log('\n' + '='.repeat(100));
            console.log('💡 RECOMENDACIONES');
            console.log('='.repeat(100) + '\n');

            console.log('1. TÍTULOS:');
            console.log('   ✅ Usar formato: "Honda [MODELO] [AÑO] [CARACTERÍSTICAS]"');
            console.log('   ✅ Ejemplo: "Honda WAVE 110S 2026 CBS"');
            console.log('   ✅ Más corto, más claro, mejor SEO\n');

            console.log('2. DESCRIPCIONES:');
            console.log('   ✅ Incluir información del Excel (precio_contado, precio_promo)');
            console.log('   ✅ Agregar características técnicas si están disponibles');
            console.log('   ✅ Mantener estructura HTML para mejor presentación');
            console.log('   ✅ NO incluir precios en la descripción (solo en campos dedicados)\n');

            console.log('3. DATOS DEL EXCEL:');
            console.log('   ✅ Mapear "precio_contado" → precio_actual');
            console.log('   ✅ Mapear "precio_promo" → precio_promocional');
            console.log('   ✅ Usar "raw" para información adicional');
            console.log('   ✅ Usar "categoria" para clasificación\n');

            console.log('4. PRÓXIMOS PASOS:');
            console.log('   1. Actualizar ExcelNormalizer para mapear precios correctamente');
            console.log('   2. Crear generador de títulos específico para motos');
            console.log('   3. Crear plantilla de descripción para Honda');
            console.log('   4. Procesar Excel Honda completo con mejoras\n');

            console.log('='.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error(error.stack);
        } finally {
            await this.pool.end();
        }
    }
}

// Ejecutar
const analyzer = new HondaTitleAnalyzer();
analyzer.analizar();
