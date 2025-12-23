/**
 * 🗑️ LIMPIAR BASE DE DATOS - SOLO MOTOS
 * 
 * Elimina todos los productos y deja la BD lista para procesar solo motos Honda
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

class DatabaseCleaner {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });
    }

    async limpiar() {
        console.log('\n' + '='.repeat(80));
        console.log('🗑️  LIMPIEZA DE BASE DE DATOS');
        console.log('='.repeat(80) + '\n');

        try {
            // 1. Contar productos actuales
            const count = await this.pool.query('SELECT COUNT(*) FROM productos');
            console.log(`📊 Productos actuales: ${count.rows[0].count}\n`);

            // 2. Eliminar imágenes de productos
            const imgResult = await this.pool.query('DELETE FROM producto_imagenes');
            console.log(`🖼️  Imágenes eliminadas: ${imgResult.rowCount}`);

            // 3. Eliminar atributos de productos
            const attrResult = await this.pool.query('DELETE FROM producto_atributos');
            console.log(`🔧 Atributos eliminados: ${attrResult.rowCount}`);

            // 4. Eliminar productos
            const prodResult = await this.pool.query('DELETE FROM productos');
            console.log(`📦 Productos eliminados: ${prodResult.rowCount}`);

            // 5. Resetear secuencias
            await this.pool.query('ALTER SEQUENCE productos_id_producto_seq RESTART WITH 1');
            console.log(`🔄 Secuencias reseteadas`);

            console.log('\n✅ Base de datos limpia y lista para motos Honda\n');
            console.log('='.repeat(80) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
        } finally {
            await this.pool.end();
        }
    }
}

const cleaner = new DatabaseCleaner();
cleaner.limpiar();
