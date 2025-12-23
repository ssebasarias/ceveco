/**
 * 🏍️ PROCESADOR UNIVERSAL - TODAS LAS MOTOS
 * 
 * Procesa Excel de todas las marcas de motos:
 * - Honda
 * - Suzuki
 * - Otras marcas que se encuentren
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const ExcelNormalizer = require('./lib/excel-normalizer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class UniversalMotorcycleProcessor {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.baseImageDir = path.join(__dirname, 'backend', 'public', 'images', 'products');

        this.stats = {
            total_productos: 0,
            total_imagenes: 0,
            total_atributos: 0,
            por_marca: {}
        };

        // Archivos Excel de motos
        this.archivosMotos = [
            { archivo: 'HONDA AGOSTO 01 2025.xlsx', marca: 'Honda' },
            { archivo: 'SUZUKI SEPTIEMBRE 01 2025.xlsx', marca: 'Suzuki' }
        ];
    }

    /**
     * Generar título optimizado
     */
    generarTitulo(producto, marca) {
        let titulo = marca;
        const nombre = producto.nombre;

        // Extraer modelo
        const modeloMatch = nombre.match(/([A-Z]+\s*\d+[A-Z]*(?:\s*\d+\.\d+)?)/i);
        if (modeloMatch) titulo += ` ${modeloMatch[1].trim()}`;

        // Extraer año
        const añoMatch = nombre.match(/(\d{4})/);
        if (añoMatch) titulo += ` ${añoMatch[1]}`;

        // Características especiales
        const caracteristicas = [];
        if (nombre.includes('CBS') && !titulo.includes('CBS')) caracteristicas.push('CBS');
        if (nombre.includes('MAX') && !titulo.includes('MAX')) caracteristicas.push('MAX');
        if (nombre.includes('DLX') && !titulo.includes('DLX')) caracteristicas.push('DLX');
        if (nombre.includes('ABS') && !titulo.includes('ABS')) caracteristicas.push('ABS');

        if (caracteristicas.length > 0) titulo += ` ${caracteristicas.join(' ')}`;

        return titulo;
    }

    /**
     * Generar descripción
     */
    generarDescripcion(producto, titulo, marca) {
        const modelo = titulo.replace(`${marca} `, '');

        let uso = 'ciudad y carretera';
        const nombreLower = producto.nombre.toLowerCase();

        // Determinar uso según modelo
        if (nombreLower.includes('wave') || nombreLower.includes('dio') || nombreLower.includes('navi')) {
            uso = 'ciudad, económica y práctica';
        } else if (nombreLower.includes('cb') || nombreLower.includes('gixxer')) {
            uso = 'uso diario y viajes';
        } else if (nombreLower.includes('xr') || nombreLower.includes('dr')) {
            uso = 'aventura y terrenos difíciles';
        } else if (nombreLower.includes('pcx') || nombreLower.includes('burgman')) {
            uso = 'ciudad, confort y estilo';
        }

        const descripcionCorta = `Motocicleta ${titulo}. Ideal para ${uso}.`;

        const descripcionLarga = `<div class="product-description">
  <h3>${titulo}</h3>
  <p>Motocicleta ${marca} ${modelo}, diseñada para ofrecer el mejor rendimiento, economía y confiabilidad que caracteriza a ${marca}.</p>
  
  <h4>Características Principales:</h4>
  <ul class="features">
    <li><strong>Marca:</strong> ${marca}</li>
    <li><strong>Modelo:</strong> ${modelo}</li>
    <li><strong>Uso recomendado:</strong> ${uso}</li>
  </ul>
  
  <h4>Ventajas ${marca}:</h4>
  <ul class="benefits">
    <li>✓ Tecnología de vanguardia</li>
    <li>✓ Excelente rendimiento de combustible</li>
    <li>✓ Bajo costo de mantenimiento</li>
    <li>✓ Repuestos originales disponibles</li>
    <li>✓ Red de servicio técnico autorizado</li>
    <li>✓ Garantía de fábrica</li>
  </ul>
  
  <p class="cta"><strong>¡Cotiza ahora y obtén las mejores condiciones de financiación!</strong></p>
</div>`;

        return { corta: descripcionCorta, larga: descripcionLarga };
    }

    /**
     * Descargar imagen
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

            fs.writeFileSync(outputPath, response.data);
            const stats = fs.statSync(outputPath);
            return { success: true, size: (stats.size / 1024).toFixed(2) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener URLs de imágenes
     */
    getImagenesModelo(nombre, marca) {
        const modelo = nombre.replace(`${marca} `, '').substring(0, 30);
        const urls = [];

        for (let i = 0; i < 3; i++) {
            urls.push(`https://placehold.co/2000x2000/CC0000/FFFFFF/png?text=${encodeURIComponent(modelo)}&font=roboto`);
        }

        return urls;
    }

    /**
     * Obtener o crear marca/categoría
     */
    async getOrCreateMarcaCategoria(nombreMarca) {
        // Marca
        let marca = await this.pool.query('SELECT id_marca FROM marcas WHERE nombre = $1', [nombreMarca]);
        if (marca.rows.length === 0) {
            const slug = nombreMarca.toLowerCase();
            marca = await this.pool.query(
                'INSERT INTO marcas (nombre, slug, activo) VALUES ($1, $2, true) RETURNING id_marca',
                [nombreMarca, slug]
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

        // Subcategoría
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
    async procesarProducto(producto, ids, marca) {
        const titulo = this.generarTitulo(producto, marca);

        try {
            const descripcion = this.generarDescripcion(producto, titulo, marca);
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

            // Descargar imágenes
            const marcaDir = path.join(this.baseImageDir, marca.toLowerCase());
            if (!fs.existsSync(marcaDir)) fs.mkdirSync(marcaDir, { recursive: true });

            const urls = this.getImagenesModelo(titulo, marca);
            const skuSanitizado = (producto.ref || producto.sku).replace(/[^a-zA-Z0-9]/g, '_');

            let imagenesDescargadas = 0;
            for (let i = 0; i < urls.length; i++) {
                const ext = urls[i].includes('.png') ? 'png' : 'jpg';
                const filename = `${skuSanitizado}_${i + 1}.${ext}`;
                const outputPath = path.join(marcaDir, filename);

                const result = await this.descargarImagenOriginal(urls[i], outputPath);

                if (result.success) {
                    await this.pool.query(`
            INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)
          `, [idProducto, `/images/products/${marca.toLowerCase()}/${filename}`, i + 1, i === 0]);

                    imagenesDescargadas++;
                }
            }

            return { success: true, titulo, imagenes: imagenesDescargadas };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Procesar archivo Excel
     */
    async procesarArchivo(archivoInfo) {
        const { archivo, marca } = archivoInfo;

        console.log('\n' + '='.repeat(100));
        console.log(`🏍️  PROCESANDO: ${marca.toUpperCase()}`);
        console.log('='.repeat(100) + '\n');

        try {
            const excelPath = path.join(__dirname, 'raw_data', archivo);

            if (!fs.existsSync(excelPath)) {
                console.log(`⚠️  Archivo no encontrado: ${archivo}\n`);
                return;
            }

            const normalizer = new ExcelNormalizer();
            const productos = normalizer.readAndNormalize(excelPath);

            console.log(`📦 Productos en Excel: ${productos.length}\n`);

            const ids = await this.getOrCreateMarcaCategoria(marca);
            console.log(`✅ Marca ${marca}: ID ${ids.idMarca}`);
            console.log(`✅ Categoría Motos: ID ${ids.idCategoria}\n`);

            const stats = { procesados: 0, imagenes: 0 };

            for (let i = 0; i < productos.length; i++) {
                const progreso = ((i + 1) / productos.length * 100).toFixed(0);
                console.log(`[${progreso}%] ${i + 1}/${productos.length}`);
                console.log(`📦 ${productos[i].nombre}`);

                const result = await this.procesarProducto(productos[i], ids, marca);

                if (result.success) {
                    console.log(`   ✅ ${result.titulo}`);
                    console.log(`   📸 ${result.imagenes} imágenes\n`);
                    stats.procesados++;
                    stats.imagenes += result.imagenes;
                } else {
                    console.log(`   ❌ Error: ${result.error}\n`);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            this.stats.por_marca[marca] = stats;
            this.stats.total_productos += stats.procesados;
            this.stats.total_imagenes += stats.imagenes;

            console.log(`\n✅ ${marca}: ${stats.procesados} productos, ${stats.imagenes} imágenes\n`);

        } catch (error) {
            console.error(`\n❌ Error procesando ${marca}:`, error.message);
        }
    }

    /**
     * Ejecutar procesamiento de todas las marcas
     */
    async ejecutar() {
        console.log('\n' + '='.repeat(100));
        console.log('🏍️  PROCESADOR UNIVERSAL - TODAS LAS MOTOS');
        console.log('='.repeat(100) + '\n');

        for (const archivoInfo of this.archivosMotos) {
            await this.procesarArchivo(archivoInfo);
        }

        // Reporte final
        console.log('\n' + '='.repeat(100));
        console.log('📊 REPORTE FINAL');
        console.log('='.repeat(100));
        console.log(`\n✅ Total Productos: ${this.stats.total_productos}`);
        console.log(`📸 Total Imágenes:  ${this.stats.total_imagenes}\n`);

        console.log('Por Marca:');
        for (const [marca, stats] of Object.entries(this.stats.por_marca)) {
            console.log(`   ${marca}: ${stats.procesados} productos, ${stats.imagenes} imágenes`);
        }

        console.log('\n' + '='.repeat(100) + '\n');

        await this.pool.end();
    }
}

const processor = new UniversalMotorcycleProcessor();
processor.ejecutar();
