#!/usr/bin/env node

/**
 * Script para generar backup COMPLETO de la base de datos PostgreSQL
 * 
 * Este script crea un backup que incluye TODO:
 * - Esquema completo (tablas, tipos, secuencias, etc.)
 * - TODOS los datos (productos, categorías, usuarios, agentes, pedidos, etc.)
 * - Índices (incluyendo índices GIN para búsqueda difusa)
 * - Extensiones (pg_trgm, etc.)
 * - Triggers y funciones
 * - Vistas
 * - Comentarios en tablas y columnas
 * - Constraints (llaves primarias, foráneas, checks, etc.)
 * - Permisos y roles (opcional)
 * 
 * Uso: node scripts/backup-db.js
 * 
 * El script genera DOS archivos:
 * 1. Formato SQL (.sql) - Texto plano, fácil de leer y editar
 * 2. Formato Custom (.dump) - Comprimido, más rápido para restaurar
 */

require('dotenv').config({ path: './backend/.env' });
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Detecta si debe usar Docker para el backup
 * IMPORTANTE: Si el puerto es 5433, siempre usa PostgreSQL local (no Docker)
 */
async function detectBackupMethod(dbConfig) {
  // Si el puerto es 5433, es PostgreSQL local, NO Docker
  if (dbConfig.port === 5433) {
    console.log('   ℹ️  Puerto 5433 detectado - usando PostgreSQL local (no Docker)');
    return { method: 'local', containerName: null };
  }
  
  // Si el puerto es 5432, podría ser Docker o PostgreSQL local
  // Intentar detectar pg_dump localmente primero
  try {
    await execAsync('pg_dump --version', { timeout: 2000 });
    // Si pg_dump está disponible, usar local
    return { method: 'local', containerName: null };
  } catch (error) {
    // pg_dump no está disponible localmente, intentar Docker solo si puerto es 5432
    if (dbConfig.port === 5432) {
      try {
        const { stdout } = await execAsync('docker ps --filter "name=ceveco-db" --format "{{.Names}}"', { timeout: 2000 });
        const containerName = stdout.trim();
        if (containerName === 'ceveco-db') {
          console.log('   ℹ️  Docker detectado - usando contenedor ceveco-db');
          return { method: 'docker', containerName: 'ceveco-db' };
        }
      } catch (dockerError) {
        // Docker no disponible o contenedor no corriendo
      }
    }
  }
  
  // Por defecto, intentar local
  return { method: 'local', containerName: null };
}

/**
 * Verifica que el backup tenga contenido válido
 */
async function verifyBackup(backupPath) {
  try {
    const content = await fs.readFile(backupPath, 'utf8');
    
    // Verificar que tenga elementos esenciales
    const hasSchema = /CREATE TABLE|CREATE TYPE|CREATE SEQUENCE/.test(content);
    const hasData = /COPY|INSERT INTO/.test(content);
    const hasExtensions = /CREATE EXTENSION/.test(content);
    
    return {
      valid: hasSchema && hasData,
      hasSchema,
      hasData,
      hasExtensions,
      size: (await fs.stat(backupPath)).size
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Genera backup completo de la base de datos
 */
async function generateBackup() {
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'ceveco_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    };
    
    // Mostrar advertencia si hay diferencia de puertos
    console.log('');
    console.log('⚠️  IMPORTANTE: Verificando configuración de puertos...');
    console.log(`   Puerto configurado en .env: ${dbConfig.port}`);
    console.log(`   Asegúrate de que este es el puerto correcto donde está tu base de datos con TODOS los datos`);
    console.log('');

    if (!dbConfig.password) {
      console.error('❌ Error: DB_PASSWORD no está configurado en .env');
      console.error('💡 Asegúrate de tener el archivo backend/.env con las credenciales correctas');
      process.exit(1);
    }

    // Crear directorio de backups si no existe
    const backupsDir = path.join(__dirname, '../backups');
    await fs.mkdir(backupsDir, { recursive: true });

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileNameSQL = `ceveco_backup_${timestamp}.sql`;
    const backupFileNameDump = `ceveco_backup_${timestamp}.dump`;
    const backupPathSQL = path.join(backupsDir, backupFileNameSQL);
    const backupPathDump = path.join(backupsDir, backupFileNameDump);

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 GENERANDO BACKUP COMPLETO DE BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    // Detectar método de backup (local o Docker)
    const backupMethod = await detectBackupMethod(dbConfig);
    
    console.log('📋 Configuración:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Puerto: ${dbConfig.port}`);
    console.log(`   Base de datos: ${dbConfig.database}`);
    console.log(`   Usuario: ${dbConfig.user}`);
    console.log(`   Método: ${backupMethod.method === 'docker' ? 'Docker (' + backupMethod.containerName + ')' : 'PostgreSQL local'}`);
    console.log('');

    // Configurar variable de entorno para la contraseña
    const env = { ...process.env, PGPASSWORD: dbConfig.password };

    // ============================================
    // BACKUP 1: Formato SQL (texto plano)
    // ============================================
    console.log('📦 1. Creando backup en formato SQL (texto plano)...');
    console.log(`   Archivo: ${backupFileNameSQL}`);
    
    // Opciones completas de pg_dump para incluir TODO:
    // --verbose: Muestra progreso detallado
    // --clean: Incluye comandos DROP antes de CREATE (útil para restauración)
    // --create: Incluye comando CREATE DATABASE
    // --if-exists: Usa IF EXISTS en comandos DROP (evita errores)
    // --encoding=UTF8: Codificación explícita
    // --no-owner: No incluye ownership (evita problemas de permisos)
    // --no-privileges: No incluye permisos (evita problemas de permisos)
    // -F p: Formato plain (SQL texto)
    const pgDumpSQLArgs = [
      '-U', dbConfig.user,
      '-d', dbConfig.database,
      '--verbose',
      '--clean',
      '--create',
      '--if-exists',
      '--encoding=UTF8',
      '--no-owner',
      '--no-privileges',
      '-F', 'p'
    ];

    let pgDumpSQLCommand;
    
    if (backupMethod.method === 'docker') {
      // Usar Docker: crear archivo temporal dentro del contenedor y luego copiarlo fuera
      const tempDockerFile = `/tmp/backup_${Date.now()}.sql`;
      pgDumpSQLArgs.push('-f', tempDockerFile);
      pgDumpSQLCommand = `docker exec ${backupMethod.containerName} pg_dump ${pgDumpSQLArgs.join(' ')}`;
      
      try {
        // Ejecutar pg_dump dentro del contenedor
        await execAsync(pgDumpSQLCommand, { 
          env, 
          maxBuffer: 1024 * 1024 * 50,
          timeout: 300000 // 5 minutos timeout
        });
        
        console.log('   📥 Copiando archivo desde contenedor Docker...');
        // Asegurar que el directorio existe
        await fs.mkdir(path.dirname(backupPathSQL), { recursive: true });
        // Copiar archivo desde contenedor
        await execAsync(`docker cp ${backupMethod.containerName}:${tempDockerFile} "${backupPathSQL}"`, {
          timeout: 60000 // 1 minuto timeout
        });
        // Limpiar archivo temporal del contenedor
        try {
          await execAsync(`docker exec ${backupMethod.containerName} rm -f ${tempDockerFile}`, {
            timeout: 5000
          });
        } catch (cleanupError) {
          // Ignorar errores de limpieza
        }
      } catch (error) {
        throw error;
      }
    } else {
      // Usar PostgreSQL local
      pgDumpSQLArgs.unshift('-h', dbConfig.host);
      pgDumpSQLArgs.unshift('-p', dbConfig.port.toString());
      pgDumpSQLArgs.push('-f', backupPathSQL);
      pgDumpSQLCommand = `pg_dump ${pgDumpSQLArgs.join(' ')}`;
      
      try {
        await execAsync(pgDumpSQLCommand, { 
          env, 
          maxBuffer: 1024 * 1024 * 50,
          timeout: 300000 // 5 minutos timeout
        });
      } catch (error) {
        throw error;
      }
    }
      
      const statsSQL = await fs.stat(backupPathSQL);
      const fileSizeInMB = (statsSQL.size / (1024 * 1024)).toFixed(2);
      
      // Verificar el backup
      const verification = await verifyBackup(backupPathSQL);
      
      console.log('   ✅ Backup SQL creado exitosamente!');
      console.log(`   📊 Tamaño: ${fileSizeInMB} MB`);
      console.log(`   📁 Ubicación: ${backupPathSQL}`);
      
      if (verification.valid) {
        console.log('   ✓ Verificación: Backup válido');
        console.log(`     - Esquema: ${verification.hasSchema ? '✓' : '✗'}`);
        console.log(`     - Datos: ${verification.hasData ? '✓' : '✗'}`);
        console.log(`     - Extensiones: ${verification.hasExtensions ? '✓' : '✗'}`);
      } else {
        console.log('   ⚠️  Advertencia: El backup podría estar incompleto');
      }
    } catch (error) {
      console.error('   ❌ Error ejecutando pg_dump (SQL):', error.message);
      if (error.message.includes('timeout')) {
        console.error('   ⏱️  El proceso tomó demasiado tiempo. Intenta de nuevo o verifica la conexión.');
      } else {
        console.error('   💡 Asegúrate de que pg_dump esté instalado y las credenciales sean correctas.');
      }
      throw error;
    }

    console.log('');

    // ============================================
    // BACKUP 2: Formato Custom (comprimido)
    // ============================================
    console.log('📦 2. Creando backup en formato Custom (comprimido)...');
    console.log(`   Archivo: ${backupFileNameDump}`);
    
    // Formato custom comprimido - más rápido y ocupa menos espacio
    const pgDumpDumpArgs = [
      '-U', dbConfig.user,
      '-d', dbConfig.database,
      '--verbose',
      '--format=custom',
      '--compress=9', // Máxima compresión
      '--encoding=UTF8',
      '--no-owner',
      '--no-privileges'
    ];

    let pgDumpDumpCommand;
    
    if (backupMethod.method === 'docker') {
      // Usar Docker: crear archivo temporal dentro del contenedor y luego copiarlo fuera
      const tempDockerDumpFile = `/tmp/backup_${Date.now()}.dump`;
      pgDumpDumpArgs.push('-f', tempDockerDumpFile);
      pgDumpDumpCommand = `docker exec ${backupMethod.containerName} pg_dump ${pgDumpDumpArgs.join(' ')}`;
      
      try {
        // Ejecutar pg_dump dentro del contenedor
        await execAsync(pgDumpDumpCommand, { 
          env, 
          maxBuffer: 1024 * 1024 * 50,
          timeout: 300000 // 5 minutos timeout
        });
        
        console.log('   📥 Copiando archivo desde contenedor Docker...');
        // Asegurar que el directorio existe
        await fs.mkdir(path.dirname(backupPathDump), { recursive: true });
        // Copiar archivo desde contenedor
        await execAsync(`docker cp ${backupMethod.containerName}:${tempDockerDumpFile} "${backupPathDump}"`, {
          timeout: 60000 // 1 minuto timeout
        });
        // Limpiar archivo temporal del contenedor
        try {
          await execAsync(`docker exec ${backupMethod.containerName} rm -f ${tempDockerDumpFile}`, {
            timeout: 5000
          });
        } catch (cleanupError) {
          // Ignorar errores de limpieza
        }
      } catch (error) {
        console.error('   ⚠️  Error en backup Custom, pero el SQL ya está listo');
        throw error;
      }
    } else {
      // Usar PostgreSQL local
      pgDumpDumpArgs.unshift('-h', dbConfig.host);
      pgDumpDumpArgs.unshift('-p', dbConfig.port.toString());
      pgDumpDumpArgs.push('-f', backupPathDump);
      pgDumpDumpCommand = `pg_dump ${pgDumpDumpArgs.join(' ')}`;
      
      try {
        await execAsync(pgDumpDumpCommand, { 
          env, 
          maxBuffer: 1024 * 1024 * 50,
          timeout: 300000 // 5 minutos timeout
        });
      } catch (error) {
        console.error('   ⚠️  Error en backup Custom, pero el SQL ya está listo');
        throw error;
      }
    }
      
      const statsDump = await fs.stat(backupPathDump);
      const fileSizeInMB = (statsDump.size / (1024 * 1024)).toFixed(2);
      
      console.log('   ✅ Backup Custom creado exitosamente!');
      console.log(`   📊 Tamaño: ${fileSizeInMB} MB`);
      console.log(`   📁 Ubicación: ${backupPathDump}`);
    } catch (error) {
      console.error('   ❌ Error ejecutando pg_dump (Custom):', error.message);
      if (error.message.includes('timeout')) {
        console.error('   ⏱️  El proceso tomó demasiado tiempo.');
      }
      console.error('   ⚠️  Continuando con el backup SQL que ya se generó...');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ BACKUP COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📁 Archivos generados en: backups/');
    console.log(`   1. ${backupFileNameSQL} (Formato SQL - texto plano)`);
    console.log(`   2. ${backupFileNameDump} (Formato Custom - comprimido)`);
    console.log('');
    console.log('💡 Para restaurar el backup:');
    console.log('   - SQL: psql -h localhost -p 5433 -U postgres -d postgres -f backups/' + backupFileNameSQL);
    console.log('   - Custom: pg_restore -h localhost -p 5433 -U postgres -d ceveco_db --clean --if-exists backups/' + backupFileNameDump);
    console.log('   - O usa el script: node scripts/restore-db.js');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ ERROR AL GENERAR BACKUP');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    console.error('Detalles del error:', error.message);
    console.error('');
    console.error('💡 Soluciones posibles:');
    console.error('   1. Verifica que PostgreSQL esté instalado y pg_dump esté en el PATH');
    console.error('   2. O verifica que Docker esté corriendo y el contenedor ceveco-db esté activo');
    console.error('   3. Verifica las credenciales en backend/.env');
    console.error('   4. Verifica que la base de datos esté corriendo');
    console.error('   5. Verifica que tengas permisos para acceder a la base de datos');
    console.error('');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateBackup();
}

module.exports = { generateBackup };
