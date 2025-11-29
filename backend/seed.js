const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/db');

async function seed() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'seed_products.sql'), 'utf8');
        console.log('Ejecutando seed...');
        await pool.query(sql);
        console.log('Seed completado exitosamente.');
    } catch (error) {
        console.error('Error durante el seed:', error);
    } finally {
        await pool.end();
    }
}

seed();
