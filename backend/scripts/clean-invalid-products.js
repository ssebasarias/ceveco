/**
 * Script para limpiar productos inválidos (sin nombre, sin imagen, etc.)
 * Uso: node scripts/clean-invalid-products.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env si existe
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

// Configuración de la base de datos
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'ceveco_db'
});

async function cleanInvalidProducts() {
    console.log('🧹 Iniciando limpieza de productos inválidos...\n');

    const client = await pool.connect();

    try {
        // 1. Buscar productos sin nombre o con "Producto sin nombre"
        const invalidProductsQuery = `
            SELECT id_producto, nombre, sku, descripcion_corta
            FROM productos
            WHERE nombre IS NULL 
               OR nombre = '' 
               OR nombre LIKE '%sin nombre%'
               OR nombre LIKE '%Producto sin nombre%';
        `;

        const result = await client.query(invalidProductsQuery);

        if (result.rows.length === 0) {
            console.log('✅ No se encontraron productos inválidos.');
            return;
        }

        console.log(`📋 Productos inválidos encontrados: ${result.rows.length}\n`);

        result.rows.forEach((producto, index) => {
            console.log(`${index + 1}. ID: ${producto.id_producto}`);
            console.log(`   Nombre: ${producto.nombre || '(vacío)'}`);
            console.log(`   SKU: ${producto.sku}`);
            console.log(`   Descripción: ${producto.descripcion_corta?.substring(0, 50) || '(vacía)'}...`);
            console.log('');
        });

        // 2. Eliminar productos inválidos
        const deleteQuery = `
            DELETE FROM productos
            WHERE nombre IS NULL 
               OR nombre = '' 
               OR nombre LIKE '%sin nombre%'
               OR nombre LIKE '%Producto sin nombre%'
            RETURNING id_producto, nombre;
        `;

        const deleteResult = await client.query(deleteQuery);

        console.log('='.repeat(50));
        console.log(`✅ Productos eliminados: ${deleteResult.rows.length}`);
        console.log('='.repeat(50));

        deleteResult.rows.forEach((producto) => {
            console.log(`   ❌ Eliminado: ID ${producto.id_producto} - ${producto.nombre || '(sin nombre)'}`);
        });

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        await cleanInvalidProducts();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal:', error);
        await pool.end();
        process.exit(1);
    }
}

main();
