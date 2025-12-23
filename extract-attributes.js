/**
 * 🔧 EXTRACTOR DE ATRIBUTOS TÉCNICOS - MOTOS HONDA
 * 
 * Extrae atributos técnicos del nombre del producto y los guarda en la BD
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

class AttributeExtractor {
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
            atributos_creados: 0,
            valores_insertados: 0
        };
    }

    /**
     * Crear o obtener atributos estándar para motos
     */
    async crearAtributosMotos(idCategoria) {
        const atributos = [
            { nombre: 'Cilindraje', unidad: 'cc', tipo_dato: 'numero' },
            { nombre: 'Potencia', unidad: 'HP', tipo_dato: 'numero' },
            { nombre: 'Tipo de Motor', unidad: null, tipo_dato: 'texto' },
            { nombre: 'Combustible', unidad: null, tipo_dato: 'texto' },
            { nombre: 'Transmisión', unidad: null, tipo_dato: 'texto' },
            { nombre: 'Peso', unidad: 'kg', tipo_dato: 'numero' },
            { nombre: 'Capacidad Tanque', unidad: 'L', tipo_dato: 'numero' },
            { nombre: 'Sistema de Frenos', unidad: null, tipo_dato: 'texto' },
            { nombre: 'Tipo de Arranque', unidad: null, tipo_dato: 'texto' },
            { nombre: 'Año', unidad: null, tipo_dato: 'numero' }
        ];

        const atributosCreados = {};

        for (const attr of atributos) {
            let result = await this.pool.query(
                'SELECT id_atributo FROM atributos WHERE nombre = $1 AND id_categoria = $2',
                [attr.nombre, idCategoria]
            );

            if (result.rows.length === 0) {
                result = await this.pool.query(
                    'INSERT INTO atributos (nombre, unidad, tipo_dato, id_categoria) VALUES ($1, $2, $3, $4) RETURNING id_atributo',
                    [attr.nombre, attr.unidad, attr.tipo_dato, idCategoria]
                );
                this.stats.atributos_creados++;
                console.log(`   ✅ Atributo creado: ${attr.nombre}`);
            }

            atributosCreados[attr.nombre] = result.rows[0].id_atributo;
        }

        return atributosCreados;
    }

    /**
     * Extraer atributos del nombre del producto
     */
    extraerAtributos(nombre) {
        const atributos = {};

        // Cilindraje (ej: 110, 125, 190, 300)
        const cilindrajeMatch = nombre.match(/(\d+)\s*(?:cc|cm³|cm3)?/i);
        if (cilindrajeMatch) {
            const valor = parseInt(cilindrajeMatch[1]);
            // Solo si es un valor razonable para cilindraje
            if (valor >= 50 && valor <= 1500) {
                atributos.Cilindraje = valor;
            }
        }

        // Año (ej: 2026, 2025, 2024)
        const añoMatch = nombre.match(/(202[0-9])/);
        if (añoMatch) {
            atributos.Año = parseInt(añoMatch[1]);
        }

        // Tipo de Motor
        if (nombre.includes('4T') || nombre.includes('4 Tiempos')) {
            atributos['Tipo de Motor'] = '4 Tiempos';
        } else if (nombre.includes('2T') || nombre.includes('2 Tiempos')) {
            atributos['Tipo de Motor'] = '2 Tiempos';
        }

        // Combustible
        if (nombre.toLowerCase().includes('gasolina')) {
            atributos.Combustible = 'Gasolina';
        } else if (nombre.toLowerCase().includes('electr')) {
            atributos.Combustible = 'Eléctrico';
        } else {
            atributos.Combustible = 'Gasolina'; // Default para motos Honda
        }

        // Sistema de Frenos (CBS = Combined Brake System)
        if (nombre.includes('CBS')) {
            atributos['Sistema de Frenos'] = 'CBS (Sistema Combinado)';
        } else if (nombre.includes('ABS')) {
            atributos['Sistema de Frenos'] = 'ABS';
        }

        // Transmisión (por defecto para motos)
        atributos.Transmisión = 'Manual';

        // Tipo de Arranque
        atributos['Tipo de Arranque'] = 'Eléctrico y Pedal';

        // Atributos específicos por modelo
        if (nombre.includes('WAVE')) {
            atributos.Peso = 110;
            atributos['Capacidad Tanque'] = 4.1;
        } else if (nombre.includes('CB 100')) {
            atributos.Peso = 115;
            atributos['Capacidad Tanque'] = 9.2;
        } else if (nombre.includes('CB 125F')) {
            atributos.Peso = 127;
            atributos['Capacidad Tanque'] = 10.1;
            atributos.Potencia = 10.7;
        } else if (nombre.includes('CB190R')) {
            atributos.Peso = 140;
            atributos['Capacidad Tanque'] = 12;
            atributos.Potencia = 17;
        } else if (nombre.includes('XR 150L')) {
            atributos.Peso = 135;
            atributos['Capacidad Tanque'] = 7.6;
            atributos.Potencia = 12.5;
        } else if (nombre.includes('XR 190L')) {
            atributos.Peso = 138;
            atributos['Capacidad Tanque'] = 12;
            atributos.Potencia = 16.1;
        } else if (nombre.includes('XR 300L')) {
            atributos.Peso = 146;
            atributos['Capacidad Tanque'] = 7.8;
            atributos.Potencia = 25.3;
        } else if (nombre.includes('NX 190')) {
            atributos.Peso = 140;
            atributos['Capacidad Tanque'] = 12;
            atributos.Potencia = 16.1;
        } else if (nombre.includes('PCX')) {
            atributos.Peso = 130;
            atributos['Capacidad Tanque'] = 8;
            atributos.Potencia = 15.8;
            atributos.Transmisión = 'Automática CVT';
        } else if (nombre.includes('DIO')) {
            atributos.Peso = 102;
            atributos['Capacidad Tanque'] = 5.3;
            atributos.Transmisión = 'Automática CVT';
        } else if (nombre.includes('NAVI')) {
            atributos.Peso = 107;
            atributos['Capacidad Tanque'] = 3.8;
            atributos.Transmisión = 'Automática CVT';
        }

        return atributos;
    }

    /**
     * Guardar atributos en la BD
     */
    async guardarAtributos(idProducto, atributos, atributosIds) {
        for (const [nombre, valor] of Object.entries(atributos)) {
            const idAtributo = atributosIds[nombre];
            if (!idAtributo) continue;

            // Determinar el tipo de valor
            const esNumero = typeof valor === 'number';
            const esBooleano = typeof valor === 'boolean';

            try {
                await this.pool.query(`
          INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto, valor_numero, valor_booleano)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id_producto, id_atributo) DO UPDATE
          SET valor_texto = $3, valor_numero = $4, valor_booleano = $5
        `, [
                    idProducto,
                    idAtributo,
                    esNumero || esBooleano ? null : String(valor),
                    esNumero ? valor : null,
                    esBooleano ? valor : null
                ]);

                this.stats.valores_insertados++;
            } catch (error) {
                console.log(`      ⚠️  Error guardando ${nombre}: ${error.message}`);
            }
        }
    }

    /**
     * Procesar productos Honda
     */
    async procesarProductos() {
        console.log('\n' + '='.repeat(100));
        console.log('🔧 EXTRACTOR DE ATRIBUTOS TÉCNICOS - MOTOS HONDA');
        console.log('='.repeat(100) + '\n');

        try {
            // Obtener categoría Motos
            const catResult = await this.pool.query(
                'SELECT id_categoria FROM categorias WHERE nombre = $1',
                ['Motos']
            );

            if (catResult.rows.length === 0) {
                console.log('❌ Categoría Motos no encontrada');
                return;
            }

            const idCategoria = catResult.rows[0].id_categoria;
            console.log(`✅ Categoría Motos: ID ${idCategoria}\n`);

            // Crear atributos estándar
            console.log('📋 Creando atributos estándar...\n');
            const atributosIds = await this.crearAtributosMotos(idCategoria);
            console.log(`\n✅ ${this.stats.atributos_creados} atributos creados\n`);

            // Obtener productos Honda
            const productos = await this.pool.query(`
        SELECT p.id_producto, p.nombre
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        WHERE m.nombre = 'Honda'
        ORDER BY p.nombre
      `);

            console.log(`📦 Productos Honda: ${productos.rows.length}\n`);
            console.log('='.repeat(100));

            // Procesar cada producto
            for (let i = 0; i < productos.rows.length; i++) {
                const producto = productos.rows[i];
                const progreso = ((i + 1) / productos.rows.length * 100).toFixed(0);

                console.log(`\n[${progreso}%] ${i + 1}/${productos.rows.length}`);
                console.log(`📦 ${producto.nombre}`);

                // Extraer atributos
                const atributos = this.extraerAtributos(producto.nombre);
                console.log(`   🔍 Atributos extraídos: ${Object.keys(atributos).length}`);

                // Mostrar atributos
                for (const [nombre, valor] of Object.entries(atributos)) {
                    const unidad = atributosIds[nombre] ?
                        (await this.pool.query('SELECT unidad FROM atributos WHERE id_atributo = $1', [atributosIds[nombre]])).rows[0]?.unidad : '';
                    console.log(`      - ${nombre}: ${valor}${unidad ? ' ' + unidad : ''}`);
                }

                // Guardar en BD
                await this.guardarAtributos(producto.id_producto, atributos, atributosIds);
                this.stats.procesados++;
            }

            // Reporte final
            console.log('\n' + '='.repeat(100));
            console.log('📊 RESUMEN');
            console.log('='.repeat(100));
            console.log(`\n✅ Productos procesados:    ${this.stats.procesados}`);
            console.log(`🔧 Atributos creados:       ${this.stats.atributos_creados}`);
            console.log(`💾 Valores insertados:      ${this.stats.valores_insertados}`);
            console.log('\n' + '='.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error(error.stack);
        } finally {
            await this.pool.end();
        }
    }
}

const extractor = new AttributeExtractor();
extractor.procesarProductos();
