/**
 * 🏍️ PROCESADOR FINAL - MOTOS HONDA
 * 
 * - Nombres y descripciones perfectos ✅
 * - Imágenes SIN optimización (tamaño original)
 * - Solo formato original (JPG/PNG)
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const ExcelNormalizer = require('./lib/excel-normalizer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class HondaFinalProcessor {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.imageDir = path.join(__dirname, 'backend', 'public', 'images', 'products');

        this.stats = {
            procesados: 0,
            insertados: 0,
            imagenes_descargadas: 0,
            errores: 0
        };
    }

    /**
     * Generar título optimizado
     */
    generarTitulo(producto) {
        let titulo = 'Honda';
        const nombre = producto.nombre;

        const modeloMatch = nombre.match(/([A-Z]+\s*\d+[A-Z]*(?:\s*\d+\.\d+)?)/i);
        if (modeloMatch) titulo += ` ${modeloMatch[1].trim()}`;

        const añoMatch = nombre.match(/(\d{4})/);
        if (añoMatch) titulo += ` ${añoMatch[1]}`;

        const caracteristicas = [];
        if (nombre.includes('CBS') && !titulo.includes('CBS')) caracteristicas.push('CBS');
        if (nombre.includes('MAX') && !titulo.includes('MAX')) caracteristicas.push('MAX');
        if (nombre.includes('DLX') && !titulo.includes('DLX')) caracteristicas.push('DLX');

        if (caracteristicas.length > 0) titulo += ` ${caracteristicas.join(' ')}`;

        return titulo;
    }

    /**
     * Generar descripción
     */
    generarDescripcion(producto, titulo) {
        const modelo = titulo.replace('Honda ', '');

        let uso = 'ciudad y carretera';
        if (producto.nombre.includes('WAVE')) uso = 'ciudad, económica y práctica';
        if (producto.nombre.includes('CB')) uso = 'uso diario y viajes';
        if (producto.nombre.includes('XR')) uso = 'aventura y terrenos difíciles';
        if (producto.nombre.includes('DIO')) uso = 'ciudad, ágil y económica';
        if (producto.nombre.includes('NAVI')) uso = 'ciudad, moderna y versátil';
        if (producto.nombre.includes('PCX')) uso = 'ciudad, confort y estilo';
        if (producto.nombre.includes('NX')) uso = 'aventura urbana';

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
     * Descargar imagen SIN optimización
     */
    async descargarImagenOriginal(url, outputPath) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // Guardar DIRECTAMENTE sin optimización
            fs.writeFileSync(outputPath, response.data);

            const stats = fs.statSync(outputPath);
            return { success: true, size: (stats.size / 1024).toFixed(2) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * URLs de imágenes por modelo
     */
    getImagenesModelo(nombre) {
        // Usar placeholders de ALTA CALIDAD mientras tanto
        const modelo = nombre.replace('Honda ', '').substring(0, 30);
        const urls = [];

        for (let i = 0; i < 3; i++) {
            // Placeholder de 2000x2000px (muy alta calidad)
            urls.push(`https://placehold.co/2000x2000/CC0000/FFFFFF/png?text=${encodeURIComponent(modelo)}&font=roboto`);
        }

        return urls;
    }

    /**
     * Obtener o crear marca/categoría
     */
    async getOrCreateMarcaCategoria() {
        // Marca Honda
        let marca = await this.pool.query('SELECT id_marca FROM marcas WHERE nombre = $1', ['Honda']);
        if (marca.rows.length === 0) {
            marca = await this.pool.query(
                'INSERT INTO marcas (nombre, slug, activo) VALUES ($1, $2, true) RETURNING id_marca',
                ['Honda', 'honda']
            );
        }
        const idMarca = marca.rows[0].id_marca;

        // Categoría Motos
        let categoria = await this.pool.query('SELECT id_categoria FROM categorias WHERE nombre = $1', ['Motos']);
        if (categoria.rows.length === 0) {
            categoria = await this.pool.query(
                'INSERT INTO categorias (nombre, slug, activo) VALUES ($1, $2, true) RETURNING id_categoria',
                ['Motos', 'motos']
            );
        }
        const idCategoria = categoria.rows[0].id_categoria;

        // Subcategoría Motocicletas
        let subcat = await this.pool.query(
            'SELECT id_subcategoria FROM subcategorias WHERE nombre = $1 AND id_categoria = $2',
            ['Motocicletas', idCategoria]
        );
        if (subcat.rows.length === 0) {
            subcat = await this.pool.query(
                'INSERT INTO subcategorias (id_categoria, nombre, slug, activo) VALUES ($1, $2, $3, true) RETURNING id_subcategoria',
                [idCategoria, 'Motocicletas', 'motocicletas']
            );
        }
        const idSubcategoria = subcat.rows[0].id_subcategoria;

        return { idMarca, idCategoria, idSubcategoria };
    }

    /**
     * Procesar un producto
     */
    async procesarProducto(producto, ids) {
        const titulo = this.generarTitulo(producto);
        console.log(`\n📦 ${titulo}`);
        console.log(`   SKU: ${producto.ref || producto.sku}`);

        try {
            const descripcion = this.generarDescripcion(producto, titulo);
            const precioActual = producto.precio_contado || producto.precio || 0;
            const precioPromocional = producto.precio_promo || null;

            // Insertar producto
            const prodResult = await this.pool.query(`
        INSERT INTO productos (
          sku, nombre, descripcion_corta, descripcion_larga,
          precio_actual, precio_promocional,
          id_marca, id_categoria, id_subcategoria,
          stock, activo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 10, true)
        RETURNING id_producto
      `, [
                producto.ref || producto.sku,
                titulo,
                descripcion.corta,
                descripcion.larga,
                precioActual,
                precioPromocional,
                ids.idMarca,
                ids.idCategoria,
                ids.idSubcategoria
            ]);

            const idProducto = prodResult.rows[0].id_producto;
            console.log(`   ✅ Producto insertado (ID: ${idProducto})`);
            console.log(`   💰 Precio: $${precioActual.toLocaleString('es-CO')}`);

            // Descargar imágenes
            const urls = this.getImagenesModelo(titulo);
            const skuSanitizado = (producto.ref || producto.sku).replace(/[^a-zA-Z0-9]/g, '_');

            for (let i = 0; i < urls.length; i++) {
                const ext = urls[i].includes('.png') ? 'png' : 'jpg';
                const filename = `${skuSanitizado}_${i + 1}.${ext}`;
                const outputPath = path.join(this.imageDir, filename);

                const result = await this.descargarImagenOriginal(urls[i], outputPath);

                if (result.success) {
                    await this.pool.query(`
            INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)
          `, [idProducto, `/images/products/${filename}`, i + 1, i === 0]);

                    this.stats.imagenes_descargadas++;
                    console.log(`   📸 ${filename} (${result.size} KB)`);
                }
            }

            this.stats.insertados++;
            this.stats.procesados++;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            this.stats.errores++;
        }
    }

    /**
     * Ejecutar
     */
    async ejecutar() {
        console.log('\n' + '='.repeat(100));
        console.log('🏍️  PROCESADOR FINAL - MOTOS HONDA');
        console.log('='.repeat(100));
        console.log('\n✅ Nombres y descripciones: PERFECTOS');
        console.log('📸 Imágenes: SIN optimización (tamaño original)');
        console.log('🎨 Formato: Original (JPG/PNG)\n');

        if (!fs.existsSync(this.imageDir)) {
            fs.mkdirSync(this.imageDir, { recursive: true });
        }

        try {
            // Leer Excel
            const excelPath = path.join(__dirname, 'raw_data', 'HONDA AGOSTO 01 2025.xlsx');
            const normalizer = new ExcelNormalizer();
            const productos = normalizer.readAndNormalize(excelPath);

            console.log(`📦 Productos en Excel: ${productos.length}\n`);

            // Obtener IDs
            const ids = await this.getOrCreateMarcaCategoria();
            console.log(`✅ Marca Honda: ID ${ids.idMarca}`);
            console.log(`✅ Categoría Motos: ID ${ids.idCategoria}`);
            console.log(`✅ Subcategoría: ID ${ids.idSubcategoria}\n`);

            console.log('='.repeat(100));

            // Procesar cada producto
            for (let i = 0; i < productos.length; i++) {
                const progreso = ((i + 1) / productos.length * 100).toFixed(0);
                console.log(`\n[${progreso}%] ${i + 1}/${productos.length}`);

                await this.procesarProducto(productos[i], ids);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Reporte final
            console.log('\n' + '='.repeat(100));
            console.log('📊 REPORTE FINAL');
            console.log('='.repeat(100));
            console.log(`\n✅ Procesados:   ${this.stats.procesados}`);
            console.log(`🆕 Insertados:   ${this.stats.insertados}`);
            console.log(`📸 Imágenes:     ${this.stats.imagenes_descargadas}`);
            console.log(`❌ Errores:      ${this.stats.errores}`);
            console.log('\n' + '='.repeat(100));

            console.log('\n🎯 VERIFICAR EN:');
            console.log('   http://localhost:5173/pages/productos.html?categoria=motos\n');
            console.log('='.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error(error.stack);
        } finally {
            await this.pool.end();
        }
    }
}

const processor = new HondaFinalProcessor();
processor.ejecutar();
