#!/usr/bin/env node

/**
 * Script para restaurar backup de la base de datos PostgreSQL
 * 
 * Soporta archivos .sql (texto plano) y .dump (formato custom)
 * 
 * Uso: 
 *   node scripts/restore-db.js <ruta-al-backup>
 * 
 * Ejemplo:
 *   node scripts/restore-db.js backups/ceveco_backup_2026-01-20T08-28-44.sql
 */

require('dotenv').config({ path: './backend/.env' });
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const readline = require('readline');

const execAsync = promisify(exec);

/**
 * Pregunta al usuario y espera respuesta
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

/**
 * Restaura backup de la base de datos
 */
async function restoreBackup(backupFilePath) {
  try {
    // Verificar que el archivo existe
    try {
      await fs.access(backupFilePath);
    } catch (error) {
      console.error('❌ Error: El archivo de backup no existe:', backupFilePath);
      process.exit(1);
    }

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ceveco_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    };

    if (!dbConfig.password) {
      console.error('❌ Error: DB_PASSWORD no está configurado en .env');
      process.exit(1);
    }

    const fileExtension = path.extname(backupFilePath).toLowerCase();
    const stats = await fs.stat(backupFilePath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 RESTAURACIÓN DE BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Configuración:');
    console.log(`   Archivo: ${backupFilePath}`);
    console.log(`   Tamaño: ${fileSizeInMB} MB`);
    console.log(`   Formato: ${fileExtension === '.sql' ? 'SQL' : fileExtension === '.dump' ? 'Custom' : 'Desconocido'}`);
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Puerto: ${dbConfig.port}`);
    console.log(`   Base de datos: ${dbConfig.database}`);
    console.log(`   Usuario: ${dbConfig.user}`);
    console.log('');

    // Advertencia importante
    console.log('⚠️  ADVERTENCIA: Esta operación SOBRESCRIBIRÁ la base de datos actual.');
    console.log('   Todos los datos existentes serán ELIMINADOS y reemplazados por el backup.');
    console.log('');

    const confirm = await askQuestion('¿Estás seguro de que deseas continuar? (escribe "SI" para confirmar): ');
    
    if (confirm.toUpperCase() !== 'SI') {
      console.log('❌ Restauración cancelada.');
      process.exit(0);
    }

    console.log('');
    console.log('🔄 Iniciando restauración...');
    console.log('');

    // Configurar variable de entorno para la contraseña
    const env = { ...process.env, PGPASSWORD: dbConfig.password };

    if (fileExtension === '.sql') {
      // Restaurar desde archivo SQL
      console.log('📦 Restaurando desde archivo SQL...');
      
      // Para archivos SQL con --create, necesitamos conectarnos a postgres
      const psqlCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -f "${backupFilePath}"`;
      
      try {
        await execAsync(psqlCommand, { 
          env, 
          maxBuffer: 1024 * 1024 * 50 
        });
        
        console.log('');
        console.log('✅ Base de datos restaurada exitosamente desde archivo SQL!');
      } catch (error) {
        console.error('');
        console.error('❌ Error durante la restauración:', error.message);
        console.error('💡 Revisa los mensajes anteriores para más detalles.');
        process.exit(1);
      }
      
    } else if (fileExtension === '.dump') {
      // Restaurar desde archivo custom
      console.log('📦 Restaurando desde archivo Custom...');
      
      // Primero crear la base de datos si no existe
      const createDbCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "CREATE DATABASE ${dbConfig.database};"`;
      
      try {
        await execAsync(createDbCommand, { env });
      } catch (error) {
        // La base de datos ya existe, continuar
        console.log('   ℹ️  La base de datos ya existe, continuando...');
      }
      
      const pgRestoreCommand = `pg_restore -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} --verbose --clean --if-exists --no-owner "${backupFilePath}"`;
      
      try {
        await execAsync(pgRestoreCommand, { 
          env, 
          maxBuffer: 1024 * 1024 * 50 
        });
        
        console.log('');
        console.log('✅ Base de datos restaurada exitosamente desde archivo Custom!');
      } catch (error) {
        console.error('');
        console.error('❌ Error durante la restauración:', error.message);
        console.error('💡 Revisa los mensajes anteriores para más detalles.');
        process.exit(1);
      }
      
    } else {
      console.error('❌ Error: Formato de archivo no soportado. Use .sql o .dump');
      process.exit(1);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ RESTAURACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ ERROR AL RESTAURAR BACKUP');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    console.error('Detalles del error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Obtener ruta del backup desde argumentos
const backupFilePath = process.argv[2];

if (!backupFilePath) {
  console.error('❌ Error: Debes especificar la ruta al archivo de backup');
  console.error('');
  console.error('Uso: node scripts/restore-db.js <ruta-al-backup>');
  console.error('');
  console.error('Ejemplo:');
  console.error('  node scripts/restore-db.js backups/ceveco_backup_2026-01-20T08-28-44.sql');
  console.error('');
  process.exit(1);
}

// Ejecutar restauración
restoreBackup(backupFilePath);
