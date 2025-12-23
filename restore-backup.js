/**
 * Script de Restauración de Backup
 * Ceveco E-Commerce
 * 
 * Uso: node restore-backup.js <nombre_archivo_backup.sql>
 * Ejemplo: node restore-backup.js ceveco_backup_2025-12-22T09-30-00.sql
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración de la base de datos
const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'ceveco_db',
    user: 'postgres',
    password: 'postgres'
});

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'green');
    console.log('='.repeat(60) + '\n');
}

async function confirmRestore(backupFile) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n' + '='.repeat(60));
        log('  ⚠️  ADVERTENCIA: RESTAURACIÓN DE BACKUP', 'yellow');
        console.log('='.repeat(60) + '\n');

        log('Se van a RESTAURAR los productos desde el backup:', 'yellow');
        console.log(`  Archivo: ${backupFile}\n`);

        log('NOTA: Esto NO eliminará los productos actuales.', 'cyan');
        log('Si quieres reemplazar los productos actuales, ejecuta primero:', 'cyan');
        log('  node backup-and-clean.js', 'yellow');
        console.log('');

        rl.question('¿Continuar con la restauración? (escribe SI para confirmar): ', (answer) => {
            rl.close();
            resolve(answer.trim().toUpperCase() === 'SI');
        });
    });
}

async function restoreBackup(backupFile) {
    logSection('RESTAURANDO BACKUP');

    const backupPath = path.join(__dirname, 'backups', backupFile);

    if (!fs.existsSync(backupPath)) {
        throw new Error(`Archivo de backup no encontrado: ${backupPath}`);
    }

    log(`Leyendo archivo: ${backupFile}...`, 'cyan');
    const sqlContent = fs.readFileSync(backupPath, 'utf8');

    // Dividir en statements individuales
    const statements = sqlContent
        .split('\n')
        .filter(line => line.trim() && !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .filter(stmt => stmt.trim());

    log(`Ejecutando ${statements.length} statements SQL...`, 'cyan');

    const client = await pool.connect();
    let successCount = 0;
    let errorCount = 0;

    try {
        await client.query('BEGIN');

        for (const statement of statements) {
            try {
                await client.query(statement);
                successCount++;
            } catch (error) {
                errorCount++;
                log(`⚠ Error en statement: ${error.message}`, 'yellow');
            }
        }

        await client.query('COMMIT');

        log(`\n✓ Restauración completada`, 'green');
        log(`  Exitosos: ${successCount}`, 'green');
        if (errorCount > 0) {
            log(`  Errores: ${errorCount}`, 'yellow');
        }

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        logSection('RESTAURACIÓN DE BACKUP - CEVECO');

        // Obtener nombre del archivo desde argumentos
        const backupFile = process.argv[2];

        if (!backupFile) {
            log('✗ Error: Debes especificar el archivo de backup', 'red');
            console.log('\nUso:');
            log('  node restore-backup.js <nombre_archivo.sql>', 'cyan');
            console.log('\nEjemplo:');
            log('  node restore-backup.js ceveco_backup_2025-12-22T09-30-00.sql', 'yellow');
            console.log('\nArchivos disponibles:');

            const backupDir = path.join(__dirname, 'backups');
            if (fs.existsSync(backupDir)) {
                const files = fs.readdirSync(backupDir)
                    .filter(f => f.endsWith('.sql'))
                    .sort()
                    .reverse();

                if (files.length > 0) {
                    files.forEach(f => console.log(`  - ${f}`));
                } else {
                    console.log('  (No hay backups disponibles)');
                }
            }

            process.exit(1);
        }

        // Verificar conexión
        log('Verificando conexión a la base de datos...', 'cyan');
        await pool.query('SELECT NOW()');
        log('✓ Conexión exitosa', 'green');

        // Confirmar restauración
        const confirmed = await confirmRestore(backupFile);

        if (!confirmed) {
            log('\n✗ Operación cancelada por el usuario', 'yellow');
            process.exit(0);
        }

        // Restaurar backup
        await restoreBackup(backupFile);

        logSection('RESTAURACIÓN COMPLETADA');
        log('✓ Los productos han sido restaurados desde el backup', 'green');
        console.log('');

    } catch (error) {
        log('\n✗ Error: ' + error.message, 'red');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Ejecutar
main();
