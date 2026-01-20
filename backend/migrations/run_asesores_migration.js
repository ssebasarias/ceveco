require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'ceveco_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

async function runMigration() {
    try {
        console.log('🔄 Ejecutando migración: create_asesores_table.sql\n');

        const sqlPath = path.join(__dirname, 'create_asesores_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        await pool.query(sql);

        console.log('✅ Migración ejecutada exitosamente');
        console.log('\n📊 Verificando datos insertados...\n');

        const result = await pool.query('SELECT * FROM asesores ORDER BY orden');

        console.log(`Total de asesores: ${result.rows.length}\n`);
        result.rows.forEach((asesor, idx) => {
            console.log(`${idx + 1}. ${asesor.nombre_completo}`);
            console.log(`   📞 ${asesor.telefono}`);
            console.log(`   ⭐ ${asesor.calificacion_promedio} (${asesor.total_calificaciones} calificaciones)`);
            console.log(`   🎯 ${asesor.especialidad}`);
            console.log(`   🕐 ${asesor.horario_atencion}`);
            console.log('');
        });

    } catch (e) {
        console.error('❌ Error ejecutando migración:', e.message);
    } finally {
        await pool.end();
    }
}

runMigration();
