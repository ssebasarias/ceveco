const { validationResult } = require('express-validator');
const ProductoModel = require('../models/producto.model');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');

const execAsync = promisify(exec);

class AdminController {
  /**
   * Generar backup de la base de datos
   * POST /api/v1/admin/backup
   */
  async generateBackup(req, res) {
    try {
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD
      };

      // Crear directorio de backups si no existe
      const backupsDir = path.join(__dirname, '../../../backups');
      await fs.mkdir(backupsDir, { recursive: true });

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `ceveco_backup_${timestamp}.sql`;
      const backupPath = path.join(backupsDir, backupFileName);

      // Comando pg_dump
      const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F c -f "${backupPath}"`;

      // Configurar variable de entorno para la contraseña
      const env = { ...process.env, PGPASSWORD: dbConfig.password };

      try {
        await execAsync(pgDumpCommand, { env, maxBuffer: 1024 * 1024 * 10 });
        
        // Obtener información del archivo
        const stats = await fs.stat(backupPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        res.json({
          success: true,
          message: 'Backup generado exitosamente',
          data: {
            filename: backupFileName,
            path: backupPath,
            size: `${fileSizeInMB} MB`,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error ejecutando pg_dump:', error);
        
        // Intentar método alternativo con formato SQL plano
        const sqlDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} > "${backupPath}"`;
        
        try {
          await execAsync(sqlDumpCommand, { env, maxBuffer: 1024 * 1024 * 10 });
          const stats = await fs.stat(backupPath);
          const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

          res.json({
            success: true,
            message: 'Backup generado exitosamente',
            data: {
              filename: backupFileName,
              path: backupPath,
              size: `${fileSizeInMB} MB`,
              timestamp: new Date().toISOString()
            }
          });
        } catch (sqlError) {
          throw new Error('No se pudo generar el backup. Verifica que pg_dump esté instalado y las credenciales sean correctas.');
        }
      }
    } catch (error) {
      console.error('Error en generateBackup:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar backup',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Listar backups disponibles
   * GET /api/v1/admin/backups
   */
  async listBackups(req, res) {
    try {
      const backupsDir = path.join(__dirname, '../../../backups');
      
      try {
        const files = await fs.readdir(backupsDir);
        const backupFiles = files.filter(file => file.endsWith('.sql'));

        const backups = await Promise.all(
          backupFiles.map(async (file) => {
            const filePath = path.join(backupsDir, file);
            const stats = await fs.stat(filePath);
            return {
              filename: file,
              size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
              created: stats.birthtime,
              modified: stats.mtime
            };
          })
        );

        // Ordenar por fecha de creación (más reciente primero)
        backups.sort((a, b) => b.created - a.created);

        res.json({
          success: true,
          data: backups,
          count: backups.length
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          return res.json({
            success: true,
            data: [],
            count: 0,
            message: 'No hay backups disponibles'
          });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error en listBackups:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar backups',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Marcar/desmarcar productos como destacados
   * PATCH /api/v1/admin/productos/:id/destacado
   */
  async toggleDestacado(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { destacado } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        });
      }

      if (typeof destacado !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'El campo destacado debe ser un booleano'
        });
      }

      // Actualizar directamente en la BD
      const { query } = require('../config/db');
      const updateQuery = `
        UPDATE productos
        SET destacado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_producto = $2
        RETURNING id_producto, nombre, destacado
      `;

      const result = await query(updateQuery, [destacado, parseInt(id)]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        message: `Producto ${destacado ? 'marcado' : 'desmarcado'} como destacado`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error en toggleDestacado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar producto destacado',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estadísticas del sistema
   * GET /api/v1/admin/stats
   */
  async getStats(req, res) {
    try {
      const { query } = require('../config/db');

      const [
        productosResult,
        bannersResult,
        pedidosResult,
        usuariosResult,
        categoriasResult,
        marcasResult,
        sedesResult,
        ultimosPedidosResult,
        productosSinStockResult
      ] = await Promise.all([
        // Productos stats
        query(`
          SELECT
            count(*) AS total,
            count(*) FILTER (WHERE activo) AS activos,
            count(*) FILTER (WHERE NOT activo) AS inactivos,
            count(*) FILTER (WHERE destacado) AS destacados,
            count(*) FILTER (WHERE stock = 0) AS sin_stock,
            count(*) FILTER (WHERE stock > 0 AND stock <= 5) AS stock_bajo_5
          FROM productos
        `).catch(() => ({ rows: [{ total: 0, activos: 0, inactivos: 0, destacados: 0, sin_stock: 0, stock_bajo_5: 0 }] })),

        // Banners stats
        query(`
          SELECT count(*) AS total, count(*) FILTER (WHERE activo) AS activos FROM banners
        `).catch(() => ({ rows: [{ total: 0, activos: 0 }] })),

        // Pedidos stats
        query(`
          SELECT
            count(*) FILTER (WHERE fecha_creacion::date = CURRENT_DATE) AS hoy,
            count(*) FILTER (WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '7 days') AS semana,
            count(*) FILTER (WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '30 days') AS mes,
            count(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
            count(*) AS total
          FROM pedidos
        `).catch(() => ({ rows: [{ hoy: 0, semana: 0, mes: 0, pendientes: 0, total: 0 }] })),

        // Usuarios stats
        query(`
          SELECT
            count(*) AS total,
            count(*) FILTER (WHERE rol = 'admin') AS admins,
            count(*) FILTER (WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '7 days') AS nuevos_semana
          FROM usuarios
        `).catch(() => ({ rows: [{ total: 0, admins: 0, nuevos_semana: 0 }] })),

        // Categorías activas
        query(`SELECT count(*) AS total FROM categorias WHERE activo`)
          .catch(() => query(`SELECT count(*) AS total FROM categorias`))
          .catch(() => ({ rows: [{ total: 0 }] })),

        // Marcas activas
        query(`SELECT count(*) AS total FROM marcas WHERE activo`)
          .catch(() => query(`SELECT count(*) AS total FROM marcas`))
          .catch(() => ({ rows: [{ total: 0 }] })),

        // Sedes (con o sin columna activo)
        query(`SELECT count(*) AS total FROM sedes WHERE activo`)
          .catch(() => query(`SELECT count(*) AS total FROM sedes`))
          .catch(() => ({ rows: [{ total: 0 }] })),

        // Últimos pedidos pendientes
        query(`
          SELECT id_pedido, numero_pedido, estado, total, fecha_creacion
          FROM pedidos
          WHERE estado = 'pendiente'
          ORDER BY fecha_creacion DESC LIMIT 5
        `).catch(() => ({ rows: [] })),

        // Productos sin stock o stock bajo
        query(`
          SELECT id_producto, sku, nombre, stock,
            (SELECT url_imagen FROM producto_imagenes WHERE id_producto = p.id_producto AND es_principal LIMIT 1) AS imagen
          FROM productos p
          WHERE activo AND stock <= 5
          ORDER BY stock ASC, id_producto DESC LIMIT 5
        `).catch(() => ({ rows: [] }))
      ]);

      const p = productosResult.rows[0];
      const b = bannersResult.rows[0];
      const ped = pedidosResult.rows[0];
      const u = usuariosResult.rows[0];

      res.json({
        success: true,
        data: {
          productos: {
            total: parseInt(p.total) || 0,
            activos: parseInt(p.activos) || 0,
            inactivos: parseInt(p.inactivos) || 0,
            destacados: parseInt(p.destacados) || 0,
            sin_stock: parseInt(p.sin_stock) || 0,
            stock_bajo_5: parseInt(p.stock_bajo_5) || 0
          },
          banners: {
            total: parseInt(b.total) || 0,
            activos: parseInt(b.activos) || 0
          },
          pedidos: {
            hoy: parseInt(ped.hoy) || 0,
            semana: parseInt(ped.semana) || 0,
            mes: parseInt(ped.mes) || 0,
            pendientes: parseInt(ped.pendientes) || 0,
            total: parseInt(ped.total) || 0
          },
          usuarios: {
            total: parseInt(u.total) || 0,
            admins: parseInt(u.admins) || 0,
            nuevos_semana: parseInt(u.nuevos_semana) || 0
          },
          categorias: parseInt(categoriasResult.rows[0].total) || 0,
          marcas: parseInt(marcasResult.rows[0].total) || 0,
          sedes: parseInt(sedesResult.rows[0].total) || 0,
          ultimos_pedidos_pendientes: ultimosPedidosResult.rows || [],
          productos_sin_stock: productosSinStockResult.rows || []
        }
      });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AdminController();
