/**
 * 🧪 PRUEBA DE CORRECCIÓN - 1 Producto
 * Verifica que todo funciona antes de procesar todos
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

async function testCorreccion() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('\n🧪 PRUEBA DE CORRECCIÓN - 1 Producto STIHL\n');

    try {
        // 1. Obtener un producto STIHL
        const producto = await pool.query(`
      SELECT p.id_producto, p.sku, p.nombre, p.id_categoria, m.nombre as marca
      FROM productos p
      JOIN marcas m ON p.id_marca = m.id_marca
      WHERE m.nombre = 'STIHL'
      LIMIT 1
    `);

        if (producto.rows.length === 0) {
            console.log('❌ No se encontraron productos STIHL');
            await pool.end();
            return;
        }

        const prod = producto.rows[0];
        console.log('📦 Producto a corregir:');
        console.log(`   ID: ${prod.id_producto}`);
        console.log(`   SKU: ${prod.sku}`);
        console.log(`   Nombre actual: ${prod.nombre}`);
        console.log(`   Categoría actual: ${prod.id_categoria}\n`);

        // 2. Extraer especificaciones del nombre
        const specs = {};
        const nombre = prod.nombre;

        const pesoMatch = nombre.match(/(\d+(?:\.\d+)?)\s*kg/i);
        if (pesoMatch) specs.peso = { valor: pesoMatch[1], unidad: 'kg' };

        const hpMatch = nombre.match(/(\d+(?:\.\d+)?)\s*HP/i);
        if (hpMatch) specs.potencia = { valor: hpMatch[1], unidad: 'HP' };

        const ccMatch = nombre.match(/(\d+)\s*cm[³3]|(\d+)\s*cc/i);
        if (ccMatch) specs.cilindraje = { valor: ccMatch[1] || ccMatch[2], unidad: 'cc' };

        if (nombre.includes('4T')) specs.tipo_motor = { valor: '4 Tiempos', unidad: null };
        if (nombre.toLowerCase().includes('gasolina')) specs.combustible = { valor: 'Gasolina', unidad: null };

        console.log('🔧 Especificaciones detectadas:');
        Object.entries(specs).forEach(([key, data]) => {
            console.log(`   ${key}: ${data.valor}${data.unidad ? ' ' + data.unidad : ''}`);
        });

        // 3. Crear atributos en tabla atributos
        console.log('\n📝 Creando atributos en tabla "atributos"...\n');

        for (const [nombre, data] of Object.entries(specs)) {
            const nombreAtributo = nombre.replace(/_/g, ' ')
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

            const esNumero = !isNaN(parseFloat(data.valor));
            const tipoDato = esNumero ? 'numero' : 'texto';

            // Verificar si existe
            const existe = await pool.query(
                'SELECT id_atributo FROM atributos WHERE nombre = $1',
                [nombreAtributo]
            );

            let idAtributo;
            if (existe.rows.length > 0) {
                idAtributo = existe.rows[0].id_atributo;
                console.log(`   ♻️  Atributo existente: ${nombreAtributo} (ID: ${idAtributo})`);
            } else {
                const nuevo = await pool.query(
                    'INSERT INTO atributos (nombre, unidad, tipo_dato, id_categoria) VALUES ($1, $2, $3, $4) RETURNING id_atributo',
                    [nombreAtributo, data.unidad, tipoDato, 4]
                );
                idAtributo = nuevo.rows[0].id_atributo;
                console.log(`   🆕 Atributo creado: ${nombreAtributo} (ID: ${idAtributo}, Unidad: ${data.unidad || 'N/A'}, Tipo: ${tipoDato})`);
            }

            // 4. Insertar en producto_atributos
            const valorTexto = data.unidad ? `${data.valor} ${data.unidad}` : data.valor;
            const valorNumero = esNumero ? parseFloat(data.valor) : null;

            // Verificar si ya existe este atributo para este producto
            const existeRelacion = await pool.query(
                'SELECT id_producto_atributo FROM producto_atributos WHERE id_producto = $1 AND id_atributo = $2',
                [prod.id_producto, idAtributo]
            );

            if (existeRelacion.rows.length > 0) {
                // Actualizar
                await pool.query(
                    'UPDATE producto_atributos SET valor_texto = $1, valor_numero = $2 WHERE id_producto = $3 AND id_atributo = $4',
                    [valorTexto, valorNumero, prod.id_producto, idAtributo]
                );
                console.log(`   🔄 Valor actualizado en producto_atributos: ${valorTexto}`);
            } else {
                // Insertar
                await pool.query(
                    'INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto, valor_numero) VALUES ($1, $2, $3, $4)',
                    [prod.id_producto, idAtributo, valorTexto, valorNumero]
                );
                console.log(`   ✅ Valor insertado en producto_atributos: ${valorTexto}`);
            }
        }

        // 5. Verificar resultado
        console.log('\n📊 VERIFICACIÓN FINAL:\n');

        const atributosProducto = await pool.query(`
      SELECT a.nombre, a.unidad, a.tipo_dato, pa.valor_texto, pa.valor_numero
      FROM producto_atributos pa
      JOIN atributos a ON pa.id_atributo = a.id_atributo
      WHERE pa.id_producto = $1
    `, [prod.id_producto]);

        console.log(`   Atributos del producto (${atributosProducto.rows.length} total):\n`);
        atributosProducto.rows.forEach(attr => {
            console.log(`   📌 ${attr.nombre}`);
            console.log(`      Unidad: ${attr.unidad || 'N/A'}`);
            console.log(`      Tipo: ${attr.tipo_dato}`);
            console.log(`      Valor texto: ${attr.valor_texto || 'N/A'}`);
            console.log(`      Valor número: ${attr.valor_numero || 'N/A'}`);
            console.log('');
        });

        console.log('✅ PRUEBA EXITOSA - Todo funciona correctamente\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

testCorreccion();
