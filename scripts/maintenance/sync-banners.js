#!/usr/bin/env node
/**
 * Sincroniza los archivos de banner-hero del FS con la tabla `banners`.
 * Idempotente: se puede correr múltiples veces sin duplicar.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'ceveco_db',
});

const BANNERS_DIR = path.join(__dirname, '../../frontend/assets/img/banner-hero');
const URL_PREFIX = '/assets/img/banner-hero/';

async function main() {
    const files = fs.readdirSync(BANNERS_DIR)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
        .sort();
    console.log(`Archivos encontrados: ${files.length}`);

    const { rows: existing } = await pool.query(
        `SELECT imagen_url FROM banners WHERE imagen_url LIKE $1`,
        [`${URL_PREFIX}%`]
    );
    const existingUrls = new Set(existing.map(r => r.imagen_url));

    let inserted = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = `${URL_PREFIX}${file}`;
        if (existingUrls.has(url)) {
            console.log(`   Ya existe: ${url}`);
            continue;
        }
        await pool.query(
            `INSERT INTO banners (titulo, imagen_url, posicion, orden, activo)
             VALUES ($1, $2, 'hero', $3, true)`,
            [`Banner Hero ${i + 1}`, url, i]
        );
        console.log(`   Insertado: ${url}`);
        inserted++;
    }

    console.log(`Listo. ${inserted} insertados, ${files.length - inserted} ya existian.`);
    await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
