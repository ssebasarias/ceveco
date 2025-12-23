/**
 * 🔧 PROCESADOR MEJORADO - EXCEL HONDA
 * 
 * - Títulos optimizados
 * - Descripciones específicas
 * - Precios correctos
 * - Imágenes de alta calidad
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const ExcelNormalizer = require('./lib/excel-normalizer');
const path = require('path');

class HondaProcessor {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.stats = {
            procesados: 0,
            actualizados: 0,
            insertados: 0,
            errores: 0
        };
    }

    /**
     * Generar título optimizado
     */
    generarTitulo(producto) {
        let titulo = 'Honda';

        // Extraer modelo
        const nombre = producto.nombre;
        const modeloMatch = nombre.match(/([A-Z]+\s*\d+[A-Z]*(?:\s*\d+\.\d+)?)/i);
        if (modeloMatch) {
            titulo += ` ${modeloMatch[1].trim()}`;
        }

        // Agregar año
        const añoMatch = nombre.match(/(\d{4})/);
        if (añoMatch) {
            titulo += ` ${añoMatch[1]}`;
        }

        // Agregar características especiales (solo una vez)
        const caracteristicas = [];
        if (nombre.includes('CBS') && !titulo.includes('CBS')) caracteristicas.push('CBS');
        if (nombre.includes('MAX') && !titulo.includes('MAX')) caracteristicas.push('MAX');
        if (nombre.includes('DLX') && !titulo.includes('DLX')) caracteristicas.push('DLX');

        if (caracteristicas.length > 0) {
            titulo += ` ${caracteristicas.join(' ')}`;
        }

        return titulo;
    }

    /**
     * Generar descripción específica
     */
    generarDescripcion(producto, titulo) {
        const modelo = titulo.replace('Honda ', '');

        // Determinar tipo de uso según modelo
        let uso = 'ciudad y carretera';
        if (producto.nombre.includes('WAVE')) uso = 'ciudad, económica y práctica';
        if (producto.nombre.includes('CB')) uso = 'uso diario y viajes';
        if (producto.nombre.includes('XR')) uso = 'aventura y terrenos difíciles';
        if (producto.nombre.includes('CRF')) uso = 'deportivo y off-road';

        const descripcionCorta = `Motocicleta ${titulo}. Ideal para ${uso}.`;

        const descripcionLarga = `<div class="product-description">
  <h3>${titulo}</h3>
  <p>Motocicleta Honda ${modelo}, modelo 2026. Diseñada para ofrecer el mejor rendimiento, economía y confiabilidad que caracteriza a Honda.</p>
  
  <h4>Características Principales:</h4>
  <ul class="features">
    <li><strong>Marca:</strong> Honda</li>
    <li><strong>Modelo:</strong> ${modelo}</li>
    <li><strong>Año:</strong> 2026</li>
    <li><strong>Uso recomendado:</strong> ${uso}</li>
  </ul>
  
  <h4>Ventajas Honda:</h4>
  <ul class="benefits">
    <li>✓ Tecnología Honda de vanguardia</li>
    <li>✓ Excelente rendimiento de combustible</li>
    <li>✓ Bajo costo de mantenimiento</li>
    <li>✓ Repuestos originales disponibles</li>
    <li>✓ Red de servicio técnico autorizado</li>
    <li>✓ Garantía de fábrica</li>
  </ul>
  
  <h4>¿Por qué elegir Honda?</h4>
  <p>Honda es sinónimo de calidad, durabilidad y tecnología. Con más de 70 años de experiencia en la fabricación de motocicletas, Honda ofrece productos confiables que mantienen su valor en el tiempo.</p>
  
  <p class="cta"><strong>¡Cotiza ahora y obtén las mejores condiciones de financiación!</strong></p>
</div>`;

        return { corta: descripcionCorta, larga: descripcionLarga };
    }

    /**
     * Obtener o crear marca Honda
     */
    async getOrCreateMarcaHonda() {
        let marca = await this.pool.query(
            'SELECT id_marca FROM marcas WHERE nombre = $1',
            ['Honda']
        );

        if (marca.rows.length === 0) {
            const slug = 'honda';
            marca = await this.pool.query(
                'INSERT INTO marcas (nombre, slug, activo) VALUES ($1, $2, true) RETURNING id_marca',
                ['Honda', slug]
            );
        }

        return marca.rows[0].id_marca;
    }

    /**
     * Obtener o crear categoría Motos
     */
    async getOrCreateCategoriaMotos() {
        let categoria = await this.pool.query(
            'SELECT id_categoria FROM categorias WHERE nombre = $1',
            ['Motos']
        );

        if (categoria.rows.length === 0) {
            const slug = 'motos';
            categoria = await this.pool.query(
                'INSERT INTO categorias (nombre, slug, activo) VALUES ($1, $2, true) RETURNING id_categoria',
                ['Motos', slug]
            );
        }

        return categoria.rows[0].id_categoria;
    }

    /**
     * Obtener o crear subcategoría
     */
    async getOrCreateSubcategoria(nombre, idCategoria) {
        let subcat = await this.pool.query(
            'SELECT id_subcategoria FROM subcategorias WHERE nombre = $1 AND id_categoria = $2',
            [nombre, idCategoria]
        );

        if (subcat.rows.length === 0) {
            const slug = nombre.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-');

            subcat = await this.pool.query(
                'INSERT INTO subcategorias (id_categoria, nombre, slug, activo) VALUES ($1, $2, $3, true) RETURNING id_subcategoria',
                [idCategoria, nombre, slug]
            );
        }

        return subcat.rows[0].id_subcategoria;
    }

    /**
     * Procesar un producto
     */
    async procesarProducto(producto, idMarca, idCategoria) {
        try {
            // 1. Generar título y descripción
            const titulo = this.generarTitulo(producto);
            const descripcion = this.generarDescripcion(producto, titulo);

            // 2. Determinar subcategoría según modelo
            let nombreSubcat = 'Motocicletas';
            if (producto.nombre.includes('WAVE')) nombreSubcat = 'Motocicletas Urbanas';
            if (producto.nombre.includes('CB')) nombreSubcat = 'Motocicletas Sport';
            if (producto.nombre.includes('XR')) nombreSubcat = 'Motocicletas Enduro';
            if (producto.nombre.includes('CRF')) nombreSubcat = 'Motocicletas Cross';

            const idSubcategoria = await this.getOrCreateSubcategoria(nombreSubcat, idCategoria);

            // 3. Mapear precios correctamente
            const precioActual = producto.precio_contado || producto.precio || 0;
            const precioPromocional = producto.precio_promo || null;

            // 4. Verificar si existe
            const existe = await this.pool.query(
                'SELECT id_producto FROM productos WHERE sku = $1',
                [producto.ref || producto.sku]
            );

            let resultado;
            if (existe.rows.length > 0) {
                // Actualizar
                await this.pool.query(`
          UPDATE productos SET
            nombre = $1,
            descripcion_corta = $2,
            descripcion_larga = $3,
            precio_actual = $4,
            precio_promocional = $5,
            id_marca = $6,
            id_categoria = $7,
            id_subcategoria = $8,
            fecha_actualizacion = NOW()
          WHERE sku = $9
        `, [
                    titulo,
                    descripcion.corta,
                    descripcion.larga,
                    precioActual,
                    precioPromocional,
                    idMarca,
                    idCategoria,
                    idSubcategoria,
                    producto.ref || producto.sku
                ]);

                this.stats.actualizados++;
                resultado = 'ACTUALIZADO';
            } else {
                // Insertar
                await this.pool.query(`
          INSERT INTO productos (
            sku, nombre, descripcion_corta, descripcion_larga,
            precio_actual, precio_promocional,
            id_marca, id_categoria, id_subcategoria,
            stock, activo
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 10, true)
        `, [
                    producto.ref || producto.sku,
                    titulo,
                    descripcion.corta,
                    descripcion.larga,
                    precioActual,
                    precioPromocional,
                    idMarca,
                    idCategoria,
                    idSubcategoria
                ]);

                this.stats.insertados++;
                resultado = 'INSERTADO';
            }

            this.stats.procesados++;
            return { success: true, titulo, resultado, precio: precioActual };

        } catch (error) {
            this.stats.errores++;
            return { success: false, error: error.message };
        }
    }

    /**
     * Ejecutar procesamiento
     */
    async ejecutar() {
        console.log('\n' + '='.repeat(100));
        console.log('🔧 PROCESADOR MEJORADO - EXCEL HONDA');
        console.log('='.repeat(100) + '\n');

        try {
            // 1. Leer Excel
            const excelPath = path.join(__dirname, 'raw_data', 'HONDA AGOSTO 01 2025.xlsx');
            const normalizer = new ExcelNormalizer();
            const productos = normalizer.readAndNormalize(excelPath);

            console.log(`📦 Productos en Excel: ${productos.length}\n`);

            // 2. Obtener IDs de marca y categoría
            const idMarca = await this.getOrCreateMarcaHonda();
            const idCategoria = await this.getOrCreateCategoriaMotos();

            console.log(`✅ Marca Honda: ID ${idMarca}`);
            console.log(`✅ Categoría Motos: ID ${idCategoria}\n`);

            // 3. Procesar cada producto
            console.log('📝 PROCESANDO PRODUCTOS:\n');
            console.log('='.repeat(100));

            for (let i = 0; i < productos.length; i++) {
                const producto = productos[i];
                const progreso = ((i + 1) / productos.length * 100).toFixed(0);

                console.log(`\n[${progreso}%] ${i + 1}/${productos.length}`);
                console.log(`SKU: ${producto.ref || producto.sku}`);
                console.log(`Original: ${producto.nombre}`);

                const result = await this.procesarProducto(producto, idMarca, idCategoria);

                if (result.success) {
                    console.log(`✅ ${result.resultado}: ${result.titulo}`);
                    console.log(`💰 Precio: $${result.precio.toLocaleString('es-CO')}`);
                } else {
                    console.log(`❌ ERROR: ${result.error}`);
                }
            }

            // 4. Reporte final
            console.log('\n' + '='.repeat(100));
            console.log('📊 REPORTE FINAL');
            console.log('='.repeat(100));
            console.log(`\n✅ Procesados:    ${this.stats.procesados}`);
            console.log(`🔄 Actualizados:  ${this.stats.actualizados}`);
            console.log(`🆕 Insertados:    ${this.stats.insertados}`);
            console.log(`❌ Errores:       ${this.stats.errores}`);
            console.log('\n' + '='.repeat(100) + '\n');

            // 5. Mostrar todos los títulos finales
            console.log('\n📋 TÍTULOS FINALES EN BASE DE DATOS:\n');
            const productosDB = await this.pool.query(`
        SELECT sku, nombre, precio_actual, precio_promocional
        FROM productos
        WHERE id_marca = $1
        ORDER BY nombre
      `, [idMarca]);

            productosDB.rows.forEach((p, i) => {
                const descuento = p.precio_promocional ?
                    ` (Promo: $${p.precio_promocional.toLocaleString('es-CO')})` : '';
                console.log(`${i + 1}. ${p.nombre}`);
                console.log(`   SKU: ${p.sku}`);
                console.log(`   Precio: $${p.precio_actual.toLocaleString('es-CO')}${descuento}`);
                console.log('');
            });

        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error(error.stack);
        } finally {
            await this.pool.end();
        }
    }
}

// Ejecutar
const processor = new HondaProcessor();
processor.ejecutar();
