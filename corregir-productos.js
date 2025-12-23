/**
 * 🔧 CORRECCIÓN COMPLETA DE PRODUCTOS
 * - Reclasifica productos incorrectos
 * - Genera nombres dicientes
 * - Crea descripciones sin precios
 * - Inserta atributos técnicos reales
 * - Elimina imágenes rotas
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const ExcelNormalizer = require('./lib/excel-normalizer');
const path = require('path');

class ProductCorrector {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.stats = {
            reclasificados: 0,
            nombres_actualizados: 0,
            descripciones_actualizadas: 0,
            atributos_creados: 0,
            imagenes_eliminadas: 0
        };
    }

    /**
     * Detectar tipo de producto STIHL por nombre/ref
     */
    detectarTipoSTIHL(nombre, ref) {
        const texto = `${nombre} ${ref}`.toUpperCase();

        if (texto.includes('MOTOSIERRA') || texto.includes('MS ') || texto.includes('GTA')) {
            return { tipo: 'Motosierra', subcategoria: 'Motosierras' };
        }
        if (texto.includes('DESBROZADORA') || texto.includes('FS ') || texto.includes('FR ')) {
            return { tipo: 'Desbrozadora', subcategoria: 'Desbrozadoras' };
        }
        if (texto.includes('SOPLADOR') || texto.includes('BG ') || texto.includes('BR ')) {
            return { tipo: 'Soplador', subcategoria: 'Sopladores' };
        }
        if (texto.includes('MOTOGUADAÑA')) {
            return { tipo: 'Motoguadaña', subcategoria: 'Desbrozadoras' };
        }
        if (texto.includes('CORTASETO') || texto.includes('HS ')) {
            return { tipo: 'Cortasetos', subcategoria: 'Cortasetos' };
        }

        return { tipo: 'Herramienta', subcategoria: 'Herramientas STIHL' };
    }

    /**
     * Extraer especificaciones del nombre
     */
    extraerEspecificaciones(nombre) {
        const specs = {};

        // Peso
        const pesoMatch = nombre.match(/(\d+(?:\.\d+)?)\s*kg/i);
        if (pesoMatch) specs.peso = { valor: pesoMatch[1], unidad: 'kg' };

        // Potencia HP
        const hpMatch = nombre.match(/(\d+(?:\.\d+)?)\s*HP/i);
        if (hpMatch) specs.potencia = { valor: hpMatch[1], unidad: 'HP' };

        // Potencia kW
        const kwMatch = nombre.match(/(\d+(?:\.\d+)?)\s*kW/i);
        if (kwMatch) specs.potencia_kw = { valor: kwMatch[1], unidad: 'kW' };

        // Cilindraje
        const ccMatch = nombre.match(/(\d+)\s*cm[³3]|(\d+)\s*cc/i);
        if (ccMatch) specs.cilindraje = { valor: ccMatch[1] || ccMatch[2], unidad: 'cc' };

        // Tipo de motor
        if (nombre.includes('4T') || nombre.includes('4 tiempos')) {
            specs.tipo_motor = { valor: '4 Tiempos', unidad: null };
        } else if (nombre.includes('2T') || nombre.includes('2 tiempos')) {
            specs.tipo_motor = { valor: '2 Tiempos', unidad: null };
        }

        // Combustible
        if (nombre.toLowerCase().includes('gasolina')) {
            specs.combustible = { valor: 'Gasolina', unidad: null };
        } else if (nombre.toLowerCase().includes('electrica') || nombre.toLowerCase().includes('bateria')) {
            specs.combustible = { valor: 'Eléctrico', unidad: null };
        }

        // Longitud de espada (motosierras)
        const espadaMatch = nombre.match(/(\d+)\s*cm.*espada|espada.*(\d+)\s*cm/i);
        if (espadaMatch) specs.longitud_espada = { valor: espadaMatch[1] || espadaMatch[2], unidad: 'cm' };

        return specs;
    }

    /**
     * Generar nombre diciente
     */
    generarNombreDiciente(producto, tipoInfo, specs) {
        let nombre = `STIHL ${tipoInfo.tipo}`;

        // Agregar modelo si está en el SKU
        const modeloMatch = producto.sku.match(/[A-Z]{2,}\s*\d+/);
        if (modeloMatch) {
            nombre += ` ${modeloMatch[0]}`;
        }

        // Agregar specs clave
        const specsTexto = [];
        if (specs.potencia) specsTexto.push(`${specs.potencia.valor}HP`);
        if (specs.cilindraje) specsTexto.push(`${specs.cilindraje.valor}cc`);
        if (specs.longitud_espada) specsTexto.push(`Espada ${specs.longitud_espada.valor}cm`);

        if (specsTexto.length > 0) {
            nombre += `, ${specsTexto.join(', ')}`;
        }

        return nombre;
    }

    /**
     * Generar descripción profesional sin precios
     */
    generarDescripcion(producto, tipoInfo, specs) {
        let desc = `<div class="product-description">
  <h3>STIHL ${tipoInfo.tipo}</h3>
  <p>Herramienta profesional de la marca STIHL, líder mundial en equipos de jardinería y forestales.</p>
  
  <h4>Características Principales:</h4>
  <ul class="features">`;

        if (specs.potencia) {
            desc += `\n    <li><strong>Potencia:</strong> ${specs.potencia.valor} HP`;
            if (specs.potencia_kw) desc += ` (${specs.potencia_kw.valor} kW)`;
            desc += `</li>`;
        }

        if (specs.cilindraje) {
            desc += `\n    <li><strong>Cilindraje:</strong> ${specs.cilindraje.valor} cc</li>`;
        }

        if (specs.peso) {
            desc += `\n    <li><strong>Peso:</strong> ${specs.peso.valor} kg</li>`;
        }

        if (specs.tipo_motor) {
            desc += `\n    <li><strong>Motor:</strong> ${specs.tipo_motor.valor}`;
            if (specs.combustible) desc += ` a ${specs.combustible.valor}`;
            desc += `</li>`;
        }

        if (specs.longitud_espada) {
            desc += `\n    <li><strong>Longitud de Espada:</strong> ${specs.longitud_espada.valor} cm</li>`;
        }

        desc += `\n  </ul>
  
  <h4>Aplicaciones:</h4>
  <p>Ideal para uso ${tipoInfo.tipo.toLowerCase() === 'motosierra' ? 'forestal y corte de madera' :
                tipoInfo.tipo.toLowerCase() === 'desbrozadora' ? 'en jardines, terrenos y áreas verdes' :
                    tipoInfo.tipo.toLowerCase() === 'soplador' ? 'en limpieza de hojas y residuos' :
                        'profesional y doméstico'}.</p>
  
  <h4>Garantía y Soporte:</h4>
  <ul class="benefits">
    <li>✓ Garantía de fábrica STIHL</li>
    <li>✓ Repuestos originales disponibles</li>
    <li>✓ Servicio técnico especializado</li>
  </ul>
</div>`;

        return desc;
    }

    /**
     * Obtener o crear atributo
     */
    async getOrCreateAtributo(nombre, unidad = null, tipoDato = 'texto') {
        const result = await this.pool.query(
            'SELECT id_atributo FROM atributos WHERE nombre = $1',
            [nombre]
        );

        if (result.rows.length > 0) {
            return result.rows[0].id_atributo;
        }

        // Crear nuevo con estructura correcta
        const insert = await this.pool.query(
            'INSERT INTO atributos (nombre, unidad, tipo_dato, id_categoria) VALUES ($1, $2, $3, $4) RETURNING id_atributo',
            [nombre, unidad, tipoDato, 4] // id_categoria 4 = STIHL
        );

        return insert.rows[0].id_atributo;
    }

    /**
     * Corregir producto
     */
    async corregirProducto(producto) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Detectar tipo de producto
            const tipoInfo = this.detectarTipoSTIHL(producto.nombre, producto.sku);

            // 2. Extraer especificaciones
            const specs = this.extraerEspecificaciones(producto.nombre);

            // 3. Generar nuevo nombre
            const nuevoNombre = this.generarNombreDiciente(producto, tipoInfo, specs);

            // 4. Generar descripción sin precios
            const nuevaDescripcion = this.generarDescripcion(producto, tipoInfo, specs);

            // 5. Obtener ID de categoría STIHL (4)
            const categoriaSTIHL = 4;

            // 6. Obtener o crear subcategoría
            let idSubcategoria = producto.id_subcategoria;
            const subcatResult = await client.query(
                'SELECT id_subcategoria FROM subcategorias WHERE nombre = $1 AND id_categoria = $2',
                [tipoInfo.subcategoria, categoriaSTIHL]
            );

            if (subcatResult.rows.length > 0) {
                idSubcategoria = subcatResult.rows[0].id_subcategoria;
            } else {
                // Crear subcategoría
                const slug = tipoInfo.subcategoria.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-');

                const newSubcat = await client.query(
                    'INSERT INTO subcategorias (id_categoria, nombre, slug, activo) VALUES ($1, $2, $3, true) RETURNING id_subcategoria',
                    [categoriaSTIHL, tipoInfo.subcategoria, slug]
                );
                idSubcategoria = newSubcat.rows[0].id_subcategoria;
            }

            // 7. Actualizar producto
            await client.query(`
        UPDATE productos SET
          nombre = $1,
          descripcion_corta = $2,
          descripcion_larga = $3,
          id_categoria = $4,
          id_subcategoria = $5,
          fecha_actualizacion = NOW()
        WHERE id_producto = $6
      `, [
                nuevoNombre,
                nuevoNombre.substring(0, 200),
                nuevaDescripcion,
                categoriaSTIHL,
                idSubcategoria,
                producto.id_producto
            ]);

            this.stats.nombres_actualizados++;
            this.stats.descripciones_actualizadas++;
            if (producto.id_categoria !== categoriaSTIHL) {
                this.stats.reclasificados++;
            }

            // 8. Eliminar atributos antiguos
            await client.query('DELETE FROM producto_atributos WHERE id_producto = $1', [producto.id_producto]);

            // 9. Insertar atributos técnicos reales
            for (const [nombre, data] of Object.entries(specs)) {
                const nombreAtributo = nombre.replace(/_/g, ' ')
                    .split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                // Determinar tipo de dato
                const esNumero = !isNaN(parseFloat(data.valor));
                const tipoDato = esNumero ? 'numero' : 'texto';

                const idAtributo = await this.getOrCreateAtributo(nombreAtributo, data.unidad, tipoDato);

                await client.query(`
          INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto, valor_numero)
          VALUES ($1, $2, $3, $4)
        `, [
                    producto.id_producto,
                    idAtributo,
                    data.valor, // Solo el valor, la unidad está en la tabla atributos
                    esNumero ? parseFloat(data.valor) : null
                ]);

                this.stats.atributos_creados++;
            }

            await client.query('COMMIT');
            return { success: true, nombre: nuevoNombre, tipo: tipoInfo.tipo };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Eliminar imágenes rotas
     */
    async eliminarImagenesRotas() {
        const result = await this.pool.query(`
      SELECT id_imagen, url_imagen 
      FROM producto_imagenes 
      WHERE url_imagen IS NULL OR url_imagen = ''
    `);

        for (const img of result.rows) {
            await this.pool.query('DELETE FROM producto_imagenes WHERE id_imagen = $1', [img.id_imagen]);
            this.stats.imagenes_eliminadas++;
        }
    }

    /**
     * Ejecutar corrección completa
     */
    async ejecutarCorreccion() {
        console.log('\n' + '█'.repeat(120));
        console.log('🔧 CORRECCIÓN COMPLETA DE PRODUCTOS');
        console.log('█'.repeat(120) + '\n');

        // 1. Obtener todos los productos STIHL
        const result = await this.pool.query(`
      SELECT p.id_producto, p.sku, p.nombre, p.id_categoria, p.id_subcategoria, m.nombre as marca
      FROM productos p
      JOIN marcas m ON p.id_marca = m.id_marca
      WHERE m.nombre = 'STIHL'
      ORDER BY p.id_producto
    `);

        console.log(`📦 Productos STIHL encontrados: ${result.rows.length}\n`);

        for (let i = 0; i < result.rows.length; i++) {
            const producto = result.rows[i];

            try {
                const resultado = await this.corregirProducto(producto);
                const progress = ((i + 1) / result.rows.length * 100).toFixed(0);
                console.log(`   [${progress}%] ✅ ${resultado.tipo} - ${resultado.nombre.substring(0, 60)}...`);
            } catch (error) {
                console.error(`   ❌ Error en ${producto.sku}: ${error.message}`);
            }
        }

        // 2. Eliminar imágenes rotas
        console.log('\n🖼️  Eliminando imágenes rotas...');
        await this.eliminarImagenesRotas();

        // 3. Reporte final
        console.log('\n\n' + '█'.repeat(120));
        console.log('📊 REPORTE DE CORRECCIÓN');
        console.log('█'.repeat(120));

        console.log(`\n✅ Productos reclasificados:        ${this.stats.reclasificados}`);
        console.log(`✅ Nombres actualizados:            ${this.stats.nombres_actualizados}`);
        console.log(`✅ Descripciones actualizadas:      ${this.stats.descripciones_actualizadas}`);
        console.log(`✅ Atributos técnicos creados:      ${this.stats.atributos_creados}`);
        console.log(`✅ Imágenes rotas eliminadas:       ${this.stats.imagenes_eliminadas}`);

        console.log('\n' + '█'.repeat(120));
        console.log('✅ CORRECCIÓN COMPLETADA');
        console.log('█'.repeat(120) + '\n');

        await this.pool.end();
    }
}

// Ejecutar
const corrector = new ProductCorrector();
corrector.ejecutarCorreccion().catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
});
