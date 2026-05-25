#!/usr/bin/env node
/**
 * Extrae specs estructuradas (clave/valor) de las descripciones largas y
 * las guarda en productos.specs (JSONB). Conserva en descripcion_larga
 * solo la parte narrativa antes del bloque de specs.
 *
 * Patrones detectados:
 *  - "Potencia: 40 W"           → { Potencia: "40 W" }
 *  - "Cilindrada 30 cm³"        → { Cilindrada: "30 cm³" }
 *  - "Garantía: 24 meses"       → { "Garantía": "24 meses" }
 *  - Lista al final separada por comas con pares clave-valor.
 *
 * No sobreescribe specs si ya tiene contenido (respeta ediciones del admin).
 * No modifica productos cuyo manual_override = true.
 *
 * Uso: node scripts/maintenance/extract-specs-from-descriptions.js [--dry]
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'ceveco_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

const SPEC_KEYS_REGEX = /\b(Potencia|Cilindrada|Peso|Tensi[oó]n|Voltaje|Capacidad|Garant[ií]a|Velocidades?|Aspas|Material|Marca|Modelo|Color|Dimensiones|Frecuencia|Consumo|RPM|Pantalla|Resoluci[oó]n|Sistema|Conectividad|Refrigeraci[oó]n|Eficiencia|Volumen|Altura|Ancho|Profundidad|Origen)\b/i;

function extractSpecs(text) {
    if (!text || typeof text !== 'string') return { narrative: text || '', specs: {} };

    const specs = {};

    // Patrón 1: "Clave: valor" (con separadores `,`, `.`, ` ` o `;`)
    // Se itera buscando la primera aparición de cualquier SPEC_KEY y extrae el valor hasta el siguiente SPEC_KEY o final
    const re1 = new RegExp(
        '(' + SPEC_KEYS_REGEX.source + ')\\s*[:\\-]?\\s*([^,;.\\n]+?)(?=(?:\\s*[,;.]\\s*' + SPEC_KEYS_REGEX.source + '|\\s*$|\\s*\\.[^0-9]))',
        'gi'
    );
    let lastSpecPos = text.length;
    let firstSpecPos = text.length;
    let match;
    while ((match = re1.exec(text)) !== null) {
        const key = match[1].trim();
        const value = match[3].trim().replace(/\s*\.?$/, '');
        if (key && value && value.length <= 80) {
            specs[capitalize(key)] = value;
            if (match.index < firstSpecPos) firstSpecPos = match.index;
            lastSpecPos = re1.lastIndex;
        }
    }

    // Si encontramos specs al final del texto, el narrativo es la parte antes
    let narrative = text;
    if (Object.keys(specs).length > 0 && firstSpecPos > 0 && firstSpecPos > text.length * 0.3) {
        narrative = text.slice(0, firstSpecPos).trim().replace(/[,;.]\s*$/, '').trim();
    }
    if (!narrative) narrative = text;

    return { narrative, specs };
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

async function main() {
    const dry = process.argv.includes('--dry');
    console.log(dry ? '🔍 DRY RUN (sin escribir BD)' : '✍️  Escribiendo BD');

    const { rows: products } = await pool.query(`
        SELECT id_producto, nombre, descripcion_corta, descripcion_larga,
               COALESCE(specs, '{}'::jsonb) AS specs
        FROM productos
        WHERE activo = TRUE
          AND COALESCE(manual_override, FALSE) = FALSE
        ORDER BY id_producto
    `);

    let extracted = 0, skipped = 0, updated = 0;
    for (const p of products) {
        // Si ya hay specs no vacías, respetar
        const currentKeys = Object.keys(p.specs || {});
        if (currentKeys.length > 0) {
            skipped++;
            continue;
        }

        const source = p.descripcion_larga || p.descripcion_corta || '';
        const { narrative, specs } = extractSpecs(source);

        if (Object.keys(specs).length === 0) {
            skipped++;
            continue;
        }
        extracted++;

        if (!dry) {
            await pool.query(
                `UPDATE productos
                    SET specs = $2::jsonb,
                        descripcion_larga = COALESCE(NULLIF($3, ''), descripcion_larga)
                  WHERE id_producto = $1`,
                [p.id_producto, JSON.stringify(specs), narrative]
            );
            updated++;
        }

        console.log(`#${p.id_producto} ${p.nombre.slice(0, 50)}  →  ${Object.keys(specs).length} specs`);
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   Procesados:   ${products.length}`);
    console.log(`   Con specs ya: ${skipped - (products.length - extracted - skipped)}`);
    console.log(`   Extraídos:    ${extracted}`);
    console.log(`   Actualizados: ${updated}`);

    await pool.end();
}

main().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
