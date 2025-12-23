/**
 * 📊 Análisis Completo de Estructura de BD
 * Genera mapeo de todas las tablas relevantes
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');

async function analyzeDatabase() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('\n' + '='.repeat(100));
    console.log('📊 ANÁLISIS COMPLETO DE ESTRUCTURA DE BD');
    console.log('='.repeat(100) + '\n');

    const tables = [
        'productos',
        'producto_imagenes',
        'producto_atributos',
        'atributos',
        'categorias',
        'subcategorias',
        'marcas'
    ];

    const structure = {};

    for (const table of tables) {
        const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [table]);

        structure[table] = result.rows;

        console.log(`\n📋 TABLA: ${table}`);
        console.log('─'.repeat(100));

        result.rows.forEach(col => {
            const type = col.data_type + (col.character_maximum_length ? `(${col.character_maximum_length})` : '');
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const def = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            console.log(`  ${col.column_name.padEnd(30)} ${type.padEnd(20)} ${nullable}${def}`);
        });
    }

    // Generar mapeo para el código
    console.log('\n\n' + '='.repeat(100));
    console.log('🔧 MAPEO PARA CÓDIGO');
    console.log('='.repeat(100) + '\n');

    console.log('const DB_MAPPING = {');
    console.log('  productos: {');
    structure.productos.forEach(col => {
        console.log(`    ${col.column_name}: '${col.column_name}',`);
    });
    console.log('  },');

    console.log('  producto_imagenes: {');
    structure.producto_imagenes.forEach(col => {
        console.log(`    ${col.column_name}: '${col.column_name}',`);
    });
    console.log('  },');

    console.log('  producto_atributos: {');
    structure.producto_atributos.forEach(col => {
        console.log(`    ${col.column_name}: '${col.column_name}',`);
    });
    console.log('  }');
    console.log('};');

    // Guardar en archivo
    const mapping = {
        productos: {},
        producto_imagenes: {},
        producto_atributos: {},
        atributos: {},
        categorias: {},
        subcategorias: {},
        marcas: {}
    };

    for (const table of tables) {
        structure[table].forEach(col => {
            mapping[table][col.column_name] = {
                type: col.data_type,
                length: col.character_maximum_length,
                nullable: col.is_nullable === 'YES',
                default: col.column_default
            };
        });
    }

    fs.writeFileSync('db-structure.json', JSON.stringify(mapping, null, 2));
    console.log('\n💾 Estructura guardada en: db-structure.json\n');

    await pool.end();
}

analyzeDatabase().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
