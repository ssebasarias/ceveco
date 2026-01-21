#!/usr/bin/env node

/**
 * Script para generar backup COMPLETO usando conexión directa de Node.js
 * Este script NO requiere pg_dump en el PATH, usa la librería pg directamente
 * 
 * IMPORTANTE: Este script respeta el puerto configurado en backend/.env
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function generateBackupDirect() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'ceveco_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  };

  if (!dbConfig.password) {
    console.error('❌ Error: DB_PASSWORD no está configurado en .env');
    process.exit(1);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔄 GENERANDO BACKUP COMPLETO (Método Directo)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 Configuración:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Puerto: ${dbConfig.port} ⚠️  IMPORTANTE: Este es el puerto que se usará`);
  console.log(`   Base de datos: ${dbConfig.database}`);
  console.log(`   Usuario: ${dbConfig.user}`);
  console.log('');

  // Crear directorio de backups
  const backupsDir = path.join(__dirname, '../backups');
  await fs.mkdir(backupsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileNameSQL = `ceveco_backup_${timestamp}.sql`;
  const backupPathSQL = path.join(backupsDir, backupFileNameSQL);

  // Intentar encontrar pg_dump en ubicaciones comunes de Windows
  let pgDumpPath = null;
  const commonPaths = [
    'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe',
    'C:\\Program Files (x86)\\PostgreSQL\\15\\bin\\pg_dump.exe',
    'C:\\Program Files (x86)\\PostgreSQL\\14\\bin\\pg_dump.exe',
  ];

  console.log('🔍 Buscando pg_dump...');
  for (const testPath of commonPaths) {
    try {
      await fs.access(testPath);
      pgDumpPath = testPath;
      console.log(`   ✓ Encontrado: ${pgDumpPath}`);
      break;
    } catch (e) {
      // No encontrado en esta ruta
    }
  }

  if (!pgDumpPath) {
    // Intentar usar pg_dump desde PATH
    try {
      await execAsync('pg_dump --version', { timeout: 2000 });
      pgDumpPath = 'pg_dump';
      console.log('   ✓ pg_dump encontrado en PATH');
    } catch (e) {
      console.error('');
      console.error('❌ ERROR: pg_dump no está disponible');
      console.error('');
      console.error('💡 Soluciones:');
      console.error('   1. Instala PostgreSQL y agrega el bin al PATH');
      console.error('   2. O usa el script PowerShell: scripts\\backup-database-local.ps1');
      console.error('   3. O especifica la ruta completa de pg_dump');
      console.error('');
      console.error('Ubicaciones comunes:');
      commonPaths.forEach(p => console.error(`   - ${p}`));
      process.exit(1);
    }
  }

  console.log('');
  console.log('📦 Creando backup en formato SQL...');
  console.log(`   Archivo: ${backupFileNameSQL}`);

  const env = { ...process.env, PGPASSWORD: dbConfig.password };
  
  const pgDumpCommand = `"${pgDumpPath}" -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} --verbose --clean --create --if-exists --encoding=UTF8 --no-owner --no-privileges -F p -f "${backupPathSQL}"`;

  try {
    await execAsync(pgDumpCommand, { 
      env, 
      maxBuffer: 1024 * 1024 * 100,
      timeout: 600000 // 10 minutos
    });

    const stats = await fs.stat(backupPathSQL);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Verificar contenido
    const content = await fs.readFile(backupPathSQL, 'utf8');
    const productosMatch = content.match(/^COPY public\.productos/gm);
    const usuariosMatch = content.match(/^COPY public\.usuarios/gm);
    const tablasConDatos = (content.match(/^COPY public\./gm) || []).length;

    console.log('');
    console.log('✅ Backup creado exitosamente!');
    console.log(`   📊 Tamaño: ${fileSizeInMB} MB`);
    console.log(`   📁 Ubicación: ${backupPathSQL}`);
    console.log('');
    console.log('📋 Verificación:');
    console.log(`   ✓ Tablas con datos: ${tablasConDatos}`);
    console.log(`   ${productosMatch ? '✓' : '✗'} Tabla productos encontrada`);
    console.log(`   ${usuariosMatch ? '✓' : '✗'} Tabla usuarios encontrada`);
    console.log('');

    // Contar productos y usuarios en el backup
    const productosSection = content.match(/^COPY public\.productos[\s\S]*?^\\\.$/m);
    if (productosSection) {
      const productosLines = productosSection[0].split('\n').filter(l => /^\d/.test(l.trim()));
      console.log(`   📦 Productos en backup: ${productosLines.length}`);
    }

    const usuariosSection = content.match(/^COPY public\.usuarios[\s\S]*?^\\\.$/m);
    if (usuariosSection) {
      const usuariosLines = usuariosSection[0].split('\n').filter(l => /^\d/.test(l.trim()));
      console.log(`   👥 Usuarios en backup: ${usuariosLines.length}`);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ BACKUP COMPLETADO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📁 Archivo: ${backupPathSQL}`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error al crear backup:', error.message);
    console.error('');
    console.error('💡 Verifica:');
    console.error(`   1. Que PostgreSQL esté corriendo en el puerto ${dbConfig.port}`);
    console.error('   2. Que las credenciales en backend/.env sean correctas');
    console.error('   3. Que tengas permisos para acceder a la base de datos');
    process.exit(1);
  }
}

if (require.main === module) {
  generateBackupDirect();
}

module.exports = { generateBackupDirect };
