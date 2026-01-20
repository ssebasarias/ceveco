#!/usr/bin/env node

/**
 * Script para generar backup de la base de datos
 * Uso: node scripts/backup-db.js
 */

require('dotenv').config({ path: './backend/.env' });
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');

const execAsync = promisify(exec);

async function generateBackup() {
  try {
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

    // Crear directorio de backups si no existe
    const backupsDir = path.join(__dirname, '../backups');
    await fs.mkdir(backupsDir, { recursive: true });

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `ceveco_backup_${timestamp}.sql`;
    const backupPath = path.join(backupsDir, backupFileName);

    console.log('🔄 Generando backup de la base de datos...');
    console.log(`📦 Base de datos: ${dbConfig.database}`);
    console.log(`💾 Archivo: ${backupFileName}`);

    // Comando pg_dump
    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${backupPath}"`;

    // Configurar variable de entorno para la contraseña
    const env = { ...process.env, PGPASSWORD: dbConfig.password };

    try {
      await execAsync(pgDumpCommand, { env, maxBuffer: 1024 * 1024 * 10 });
      
      // Obtener información del archivo
      const stats = await fs.stat(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log('✅ Backup generado exitosamente!');
      console.log(`📊 Tamaño: ${fileSizeInMB} MB`);
      console.log(`📁 Ubicación: ${backupPath}`);
    } catch (error) {
      console.error('❌ Error ejecutando pg_dump:', error.message);
      console.error('💡 Asegúrate de que pg_dump esté instalado y las credenciales sean correctas.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error al generar backup:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateBackup();
}

module.exports = { generateBackup };
