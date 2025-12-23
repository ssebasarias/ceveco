/**
 * Script de Backup y Limpieza de Productos
 * Ceveco E-Commerce
 * 
 * Este script:
 * 1. Crea un backup completo de la base de datos
 * 2. Muestra estadísticas actuales
 * 3. Limpia todos los productos y datos relacionados
 * 4. Deja la BD lista para cargar nuevos productos
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
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
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

// Crear directorio de backups
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    log('✓ Directorio de backups creado', 'green');
}

// Nombre del archivo de backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = path.join(backupDir, `ceveco_backup_${timestamp}.sql`);
const statsFile = path.join(backupDir, `estadisticas_${timestamp}.json`);

async function getTableStats() {
    const query = `
    SELECT 
      (SELECT COUNT(*) FROM productos) as total_productos,
      (SELECT COUNT(*) FROM producto_imagenes) as total_imagenes,
      (SELECT COUNT(*) FROM producto_atributos) as total_atributos,
      (SELECT COUNT(*) FROM carrito_items) as items_en_carrito,
      (SELECT COUNT(*) FROM favoritos) as productos_favoritos,
      (SELECT COUNT(*) FROM resenas) as total_resenas,
      (SELECT COUNT(*) FROM sede_inventario) as inventario_sedes,
      (SELECT COUNT(*) FROM pedido_items) as items_pedidos;
  `;

    const result = await pool.query(query);
    return result.rows[0];
}

async function createBackup() {
    logSection('PASO 1: Creando backup de productos');

    const tables = [
        'productos',
        'producto_imagenes',
        'producto_atributos',
        'carrito_items',
        'favoritos',
        'pedido_items',
        'resenas',
        'sede_inventario'
    ];

    let backupSQL = `-- Backup de Productos - Ceveco\n`;
    backupSQL += `-- Fecha: ${new Date().toLocaleString('es-CO')}\n`;
    backupSQL += `-- ============================================\n\n`;

    for (const table of tables) {
        log(`Respaldando tabla: ${table}...`, 'cyan');

        // Obtener datos de la tabla
        const result = await pool.query(`SELECT * FROM ${table}`);

        if (result.rows.length > 0) {
            backupSQL += `\n-- Tabla: ${table} (${result.rows.length} registros)\n`;

            // Obtener nombres de columnas
            const columns = Object.keys(result.rows[0]);

            for (const row of result.rows) {
                const values = columns.map(col => {
                    const val = row[col];
                    if (val === null) return 'NULL';
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                    if (val instanceof Date) return `'${val.toISOString()}'`;
                    return val;
                });

                backupSQL += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
            }
        } else {
            backupSQL += `\n-- Tabla: ${table} (vacía)\n`;
        }
    }

    fs.writeFileSync(backupFile, backupSQL, 'utf8');
    const fileSize = (fs.statSync(backupFile).size / 1024).toFixed(2);
    log(`✓ Backup creado: ${backupFile}`, 'green');
    log(`  Tamaño: ${fileSize} KB`, 'green');
}

async function showStats(label) {
    logSection(label);

    const stats = await getTableStats();

    console.table({
        'Productos': stats.total_productos,
        'Imágenes de productos': stats.total_imagenes,
        'Atributos de productos': stats.total_atributos,
        'Items en carritos': stats.items_en_carrito,
        'Productos favoritos': stats.productos_favoritos,
        'Reseñas': stats.total_resenas,
        'Inventario por sede': stats.inventario_sedes,
        'Items en pedidos': stats.items_pedidos
    });

    return stats;
}

async function confirmAction() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n' + '='.repeat(60));
        log('  ⚠️  ADVERTENCIA: LIMPIEZA DE PRODUCTOS', 'yellow');
        console.log('='.repeat(60) + '\n');

        log('Se van a ELIMINAR todos los productos y datos relacionados:', 'yellow');
        console.log('  • Productos');
        console.log('  • Imágenes de productos');
        console.log('  • Atributos de productos');
        console.log('  • Items en carritos');
        console.log('  • Productos favoritos');
        console.log('  • Items de pedidos (histórico)');
        console.log('  • Reseñas de productos');
        console.log('  • Inventario por sede\n');

        log(`✓ El backup ha sido creado en: ${backupFile}`, 'green');
        console.log('');

        rl.question('¿Estás seguro de que quieres continuar? (escribe SI para confirmar): ', (answer) => {
            rl.close();
            resolve(answer.trim().toUpperCase() === 'SI');
        });
    });
}

async function cleanProducts() {
    logSection('PASO 3: Limpiando datos de productos');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        log('Limpiando tablas relacionadas...', 'cyan');

        // Orden importante por las foreign keys
        await client.query('TRUNCATE TABLE carrito_items CASCADE');
        log('✓ carrito_items limpiada', 'green');

        await client.query('TRUNCATE TABLE favoritos CASCADE');
        log('✓ favoritos limpiada', 'green');

        await client.query('TRUNCATE TABLE pedido_items CASCADE');
        log('✓ pedido_items limpiada', 'green');

        await client.query('TRUNCATE TABLE resenas CASCADE');
        log('✓ resenas limpiada', 'green');

        await client.query('TRUNCATE TABLE sede_inventario CASCADE');
        log('✓ sede_inventario limpiada', 'green');

        await client.query('TRUNCATE TABLE producto_atributos CASCADE');
        log('✓ producto_atributos limpiada', 'green');

        await client.query('TRUNCATE TABLE producto_imagenes CASCADE');
        log('✓ producto_imagenes limpiada', 'green');

        await client.query('TRUNCATE TABLE productos RESTART IDENTITY CASCADE');
        log('✓ productos limpiada (IDs reiniciados)', 'green');

        await client.query('COMMIT');
        log('\n✓ Limpieza completada exitosamente', 'green');

    } catch (error) {
        await client.query('ROLLBACK');
        log('✗ Error durante la limpieza: ' + error.message, 'red');
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        logSection('BACKUP Y LIMPIEZA DE BASE DE DATOS - CEVECO');

        // Verificar conexión
        log('Verificando conexión a la base de datos...', 'cyan');
        await pool.query('SELECT NOW()');
        log('✓ Conexión exitosa', 'green');

        // Mostrar estadísticas antes
        const statsBefore = await showStats('ESTADÍSTICAS ACTUALES');

        // Guardar estadísticas
        fs.writeFileSync(statsFile, JSON.stringify(statsBefore, null, 2), 'utf8');

        // Crear backup
        await createBackup();

        // Confirmar acción
        const confirmed = await confirmAction();

        if (!confirmed) {
            log('\n✗ Operación cancelada por el usuario', 'yellow');
            log('Los backups se han guardado y están disponibles.', 'cyan');
            process.exit(0);
        }

        // Limpiar productos
        await cleanProducts();

        // Mostrar estadísticas después
        await showStats('ESTADÍSTICAS DESPUÉS DE LA LIMPIEZA');

        // Resumen final
        logSection('PROCESO COMPLETADO EXITOSAMENTE');

        log('Archivos generados:', 'cyan');
        console.log(`  1. Backup SQL: ${backupFile}`);
        console.log(`  2. Estadísticas: ${statsFile}\n`);

        log('✓ Base de datos limpia y lista para nuevos productos', 'green');
        console.log('');
        log('Para restaurar desde el backup si es necesario:', 'cyan');
        log(`  node restore-backup.js ${path.basename(backupFile)}`, 'yellow');
        console.log('');
        log('Siguiente paso: Tu equipo puede comenzar a cargar productos', 'cyan');
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
