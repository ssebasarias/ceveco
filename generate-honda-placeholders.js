/**
 * 🖼️ GENERADOR DE IMÁGENES PLACEHOLDER - ALTA CALIDAD
 * 
 * Genera placeholders profesionales de 1600x1600px para productos Honda
 * mientras conseguimos las imágenes reales
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RESOLUCION = 1600;

class PlaceholderGenerator {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.imageDir = path.join(__dirname, 'product_images_final');
        this.backendImageDir = path.join(__dirname, 'backend', 'public', 'images', 'products');

        this.stats = { procesados: 0, generadas: 0 };
    }

    /**
     * Generar imagen placeholder profesional
     */
    async generarPlaceholder(producto, numero) {
        const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${skuSanitizado}_${numero}.webp`;
        const outputPath = path.join(this.imageDir, filename);

        // Colores Honda (rojo oficial)
        const colores = [
            { bg: '#CC0000', text: '#FFFFFF' }, // Rojo Honda
            { bg: '#1A1A1A', text: '#CC0000' }, // Negro con rojo
            { bg: '#FFFFFF', text: '#CC0000' }  // Blanco con rojo
        ];

        const color = colores[numero - 1] || colores[0];

        // Crear SVG profesional
        const modelo = producto.nombre.replace('Honda ', '').substring(0, 25);
        const svg = `
      <svg width="${RESOLUCION}" height="${RESOLUCION}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${numero}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${this.darken(color.bg, 20)};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Fondo con gradiente -->
        <rect width="${RESOLUCION}" height="${RESOLUCION}" fill="url(#grad${numero})"/>
        
        <!-- Logo Honda (simplificado) -->
        <g transform="translate(${RESOLUCION / 2}, ${RESOLUCION / 2 - 200})">
          <rect x="-200" y="-100" width="400" height="200" rx="20" fill="${color.text}" opacity="0.1"/>
          <text x="0" y="30" font-family="Arial, sans-serif" font-size="120" font-weight="bold" 
                fill="${color.text}" text-anchor="middle">HONDA</text>
        </g>
        
        <!-- Modelo -->
        <text x="${RESOLUCION / 2}" y="${RESOLUCION / 2 + 100}" 
              font-family="Arial, sans-serif" font-size="60" font-weight="600" 
              fill="${color.text}" text-anchor="middle">${modelo}</text>
        
        <!-- Línea decorativa -->
        <line x1="${RESOLUCION / 2 - 300}" y1="${RESOLUCION / 2 + 150}" 
              x2="${RESOLUCION / 2 + 300}" y2="${RESOLUCION / 2 + 150}" 
              stroke="${color.text}" stroke-width="4" opacity="0.5"/>
        
        <!-- Año -->
        <text x="${RESOLUCION / 2}" y="${RESOLUCION / 2 + 220}" 
              font-family="Arial, sans-serif" font-size="40" 
              fill="${color.text}" text-anchor="middle" opacity="0.8">2026</text>
      </svg>
    `;

        // Convertir SVG a WebP
        await sharp(Buffer.from(svg))
            .webp({ quality: 95 })
            .toFile(outputPath);

        return outputPath;
    }

    /**
     * Oscurecer color
     */
    darken(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1).toUpperCase();
    }

    /**
     * Procesar producto
     */
    async procesarProducto(producto) {
        console.log(`\n📦 ${producto.nombre}`);

        try {
            // Eliminar imágenes antiguas
            const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');

            await this.pool.query(
                'DELETE FROM producto_imagenes WHERE id_producto = $1',
                [producto.id_producto]
            );

            [this.imageDir, this.backendImageDir].forEach(dir => {
                if (fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir);
                    files.forEach(file => {
                        if (file.includes(skuSanitizado)) {
                            fs.unlinkSync(path.join(dir, file));
                        }
                    });
                }
            });

            // Generar 3 placeholders
            const imagenesGeneradas = [];

            for (let i = 1; i <= 3; i++) {
                const outputPath = await this.generarPlaceholder(producto, i);
                const filename = path.basename(outputPath);
                const backendPath = path.join(this.backendImageDir, filename);

                fs.copyFileSync(outputPath, backendPath);

                imagenesGeneradas.push({
                    url: `/images/products/${filename}`,
                    orden: i
                });

                this.stats.generadas++;
                console.log(`   ✅ ${filename}`);
            }

            // Actualizar BD
            for (const img of imagenesGeneradas) {
                await this.pool.query(`
          INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
          VALUES ($1, $2, $3, $4)
        `, [producto.id_producto, img.url, img.orden, img.orden === 1]);
            }

            // Nota: imagen_principal no existe en la tabla productos
            // Las imágenes se manejan solo a través de producto_imagenes

            this.stats.procesados++;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }

    async ejecutar() {
        console.log('\n' + '='.repeat(80));
        console.log('🖼️  GENERADOR DE PLACEHOLDERS PROFESIONALES - HONDA');
        console.log('='.repeat(80));
        console.log(`\n📐 Resolución: ${RESOLUCION}x${RESOLUCION}px`);
        console.log(`🎨 Estilo: Profesional con colores Honda\n`);

        [this.imageDir, this.backendImageDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        try {
            const result = await this.pool.query(`
        SELECT p.id_producto, p.sku, p.nombre
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        WHERE m.nombre = 'Honda'
        ORDER BY p.nombre
      `);

            console.log(`📦 Productos: ${result.rows.length}\n`);

            for (let i = 0; i < result.rows.length; i++) {
                const progreso = ((i + 1) / result.rows.length * 100).toFixed(0);
                console.log(`[${progreso}%] ${i + 1}/${result.rows.length}`);

                await this.procesarProducto(result.rows[i]);
            }

            console.log('\n' + '='.repeat(80));
            console.log('📊 RESUMEN');
            console.log('='.repeat(80));
            console.log(`✅ Procesados: ${this.stats.procesados}`);
            console.log(`📸 Generadas:  ${this.stats.generadas}`);
            console.log('='.repeat(80) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
        } finally {
            await this.pool.end();
        }
    }
}

const generator = new PlaceholderGenerator();
generator.ejecutar();
