const { validationResult } = require('express-validator');
const ProductoModel = require('../models/producto.model');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { promisify } = require('util');
const multer = require('multer');
const { pool, query, getClient } = require('../config/db');

const execAsync = promisify(exec);

// ============================================
// Multer setup para subida de imágenes de producto
// ============================================
const productImageStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/images/products');
        try {
            await fs.mkdir(uploadPath, { recursive: true });
        } catch (error) {
            console.error('Error creando directorio:', error);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '-')
            .slice(0, 40);
        cb(null, `producto-${req.params.id}-${base}-${uniqueSuffix}${ext}`);
    }
});

const productImageUpload = multer({
    storage: productImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowedExt = /jpeg|jpg|png|webp/;
        const okExt = allowedExt.test(path.extname(file.originalname).toLowerCase());
        const okMime = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
        if (okExt && okMime) return cb(null, true);
        cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'));
    }
});

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
   * Listar imágenes de un producto (admin)
   * GET /api/v1/admin/productos/:id/imagenes
   */
  async listImagenes(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }
      const result = await query(
        `SELECT id_imagen, id_producto, url_imagen, alt_text, orden, es_principal, fecha_creacion
         FROM producto_imagenes
         WHERE id_producto = $1
         ORDER BY es_principal DESC, orden ASC, id_imagen ASC`,
        [parseInt(id, 10)]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error en listImagenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener imágenes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Subir una imagen para un producto (multipart/form-data, campo: imagen)
   * POST /api/v1/admin/productos/:id/imagenes
   */
  async uploadImagen(req, res) {
    try {
      const { id } = req.params;
      const idProducto = parseInt(id, 10);
      if (isNaN(idProducto)) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo. Asegúrate de adjuntar la imagen en el campo "imagen".'
        });
      }
      // URL pública relativa
      const urlImagen = `/images/products/${req.file.filename}`;

      // Calcular si es la primera imagen del producto → es_principal=true
      const existing = await query(
        'SELECT COUNT(*)::int AS total FROM producto_imagenes WHERE id_producto = $1',
        [idProducto]
      );
      const esPrincipal = existing.rows[0].total === 0;

      // Calcular siguiente orden
      const nextOrden = await query(
        'SELECT COALESCE(MAX(orden), -1) + 1 AS next_orden FROM producto_imagenes WHERE id_producto = $1',
        [idProducto]
      );
      const orden = nextOrden.rows[0].next_orden;

      const insert = await query(
        `INSERT INTO producto_imagenes (id_producto, url_imagen, alt_text, es_principal, orden)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id_imagen, id_producto, url_imagen, alt_text, orden, es_principal`,
        [idProducto, urlImagen, req.file.originalname || null, esPrincipal, orden]
      );

      res.status(201).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: insert.rows[0]
      });
    } catch (error) {
      console.error('Error en uploadImagen:', error);
      // Limpiar archivo subido si la inserción falló
      if (req.file && req.file.path) {
        try { fsSync.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
      }
      res.status(500).json({
        success: false,
        message: 'Error al guardar la imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar una imagen de un producto
   * DELETE /api/v1/admin/productos/:id/imagenes/:imageId
   */
  async deleteImagen(req, res) {
    const client = await getClient();
    try {
      const { id, imageId } = req.params;
      const idProducto = parseInt(id, 10);
      const idImagen = parseInt(imageId, 10);
      if (isNaN(idProducto) || isNaN(idImagen)) {
        client.release();
        return res.status(400).json({ success: false, message: 'IDs inválidos' });
      }

      await client.query('BEGIN');
      // Localizar imagen para borrar archivo del disco
      const sel = await client.query(
        'SELECT id_imagen, url_imagen, es_principal FROM producto_imagenes WHERE id_imagen = $1 AND id_producto = $2',
        [idImagen, idProducto]
      );
      if (!sel.rowCount) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Imagen no encontrada para este producto' });
      }
      const img = sel.rows[0];

      const del = await client.query(
        'DELETE FROM producto_imagenes WHERE id_imagen = $1 AND id_producto = $2 RETURNING id_imagen',
        [idImagen, idProducto]
      );

      // Si era la principal, promover otra automáticamente (la de menor orden)
      if (img.es_principal) {
        const next = await client.query(
          `SELECT id_imagen FROM producto_imagenes
           WHERE id_producto = $1
           ORDER BY orden ASC, id_imagen ASC
           LIMIT 1`,
          [idProducto]
        );
        if (next.rowCount) {
          await client.query(
            'UPDATE producto_imagenes SET es_principal = TRUE WHERE id_imagen = $1',
            [next.rows[0].id_imagen]
          );
        }
      }

      await client.query('COMMIT');

      // Best-effort: eliminar archivo físico solo si está en /images/products/
      if (img.url_imagen && img.url_imagen.startsWith('/images/products/')) {
        const filePath = path.join(__dirname, '../../public', img.url_imagen);
        fsSync.unlink(filePath, () => { /* ignore */ });
      }

      res.json({ success: true, message: 'Imagen eliminada', data: { id_imagen: del.rows[0].id_imagen } });
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch (e) { /* noop */ }
      console.error('Error en deleteImagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  }

  /**
   * Marcar una imagen como principal
   * PATCH /api/v1/admin/productos/:id/imagen-principal
   * Body: { imagen_id }
   */
  async setImagenPrincipal(req, res) {
    const client = await getClient();
    try {
      const { id } = req.params;
      const idProducto = parseInt(id, 10);
      const idImagen = parseInt(req.body?.imagen_id, 10);
      if (isNaN(idProducto) || isNaN(idImagen)) {
        client.release();
        return res.status(400).json({ success: false, message: 'IDs inválidos' });
      }

      await client.query('BEGIN');
      // Validar que la imagen pertenece al producto
      const check = await client.query(
        'SELECT id_imagen FROM producto_imagenes WHERE id_imagen = $1 AND id_producto = $2',
        [idImagen, idProducto]
      );
      if (!check.rowCount) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'La imagen no pertenece a este producto'
        });
      }

      await client.query(
        'UPDATE producto_imagenes SET es_principal = FALSE WHERE id_producto = $1',
        [idProducto]
      );
      const upd = await client.query(
        `UPDATE producto_imagenes SET es_principal = TRUE
         WHERE id_imagen = $1 AND id_producto = $2
         RETURNING id_imagen, id_producto, url_imagen, alt_text, orden, es_principal`,
        [idImagen, idProducto]
      );
      await client.query('COMMIT');

      res.json({ success: true, message: 'Imagen marcada como principal', data: upd.rows[0] });
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch (e) { /* noop */ }
      console.error('Error en setImagenPrincipal:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar imagen principal',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  }

  /**
   * Reordenar la galería de imágenes de un producto
   * PATCH /api/v1/admin/productos/:id/imagenes/orden
   * Body: { orden: [id_imagen, id_imagen, ...] }  (array de id_imagen en el nuevo orden)
   */
  async reordenarImagenes(req, res) {
    const client = await getClient();
    try {
      const { id } = req.params;
      const idProducto = parseInt(id, 10);
      const orden = req.body?.orden;
      if (isNaN(idProducto)) {
        client.release();
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }
      if (!Array.isArray(orden) || orden.length === 0) {
        client.release();
        return res.status(400).json({
          success: false,
          message: 'El campo "orden" debe ser un array con los IDs de imagen en el nuevo orden'
        });
      }

      // Validar que todos los IDs pertenecen al producto
      const ids = orden.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
      if (ids.length !== orden.length) {
        client.release();
        return res.status(400).json({ success: false, message: 'El array de orden contiene IDs inválidos' });
      }
      const check = await client.query(
        `SELECT id_imagen FROM producto_imagenes
         WHERE id_producto = $1 AND id_imagen = ANY($2::int[])`,
        [idProducto, ids]
      );
      if (check.rowCount !== ids.length) {
        client.release();
        return res.status(400).json({
          success: false,
          message: 'Uno o más IDs de imagen no pertenecen a este producto'
        });
      }

      await client.query('BEGIN');
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          'UPDATE producto_imagenes SET orden = $1 WHERE id_imagen = $2 AND id_producto = $3',
          [i, ids[i], idProducto]
        );
      }
      await client.query('COMMIT');

      res.json({ success: true, message: 'Orden actualizado' });
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch (e) { /* noop */ }
      console.error('Error en reordenarImagenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al reordenar imágenes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  }

  /**
   * Disparar scraping de un producto específico (asíncrono, en background)
   * POST /api/v1/admin/productos/:id/scrape
   */
  async scrapeProducto(req, res) {
    try {
      const { id } = req.params;
      const idProducto = parseInt(id, 10);
      if (isNaN(idProducto)) {
        return res.status(400).json({ success: false, message: 'ID de producto inválido' });
      }

      // Validar que el producto existe (defensa básica)
      const exists = await query('SELECT id_producto FROM productos WHERE id_producto = $1', [idProducto]);
      if (!exists.rowCount) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      // Lanzar spawn en background.
      // El script "scripts/scraping/fetch-product-data.js" es responsabilidad de la Pista A.
      // Asumimos que existirá (o existirá pronto) — solo lanzamos el proceso y respondemos 202.
      const scriptPath = path.join(__dirname, '../../../scripts/scraping/fetch-product-data.js');
      const args = [scriptPath, '--only', String(idProducto)];

      let child;
      try {
        child = spawn(process.execPath, args, {
          detached: true,
          stdio: 'ignore',
          windowsHide: true
        });
        child.on('error', (err) => {
          console.error(`[scrapeProducto] spawn error para producto ${idProducto}:`, err.message);
        });
        // unref para que el server no espere al proceso hijo
        if (typeof child.unref === 'function') child.unref();
      } catch (spawnErr) {
        console.error('[scrapeProducto] No se pudo lanzar el scraper:', spawnErr);
        return res.status(500).json({
          success: false,
          message: 'No se pudo iniciar el scraping. Verifica que el script esté disponible.',
          error: process.env.NODE_ENV === 'development' ? spawnErr.message : undefined
        });
      }

      // Responder 202 inmediatamente (el scraping corre en background)
      return res.status(202).json({
        success: true,
        message: 'Scraping iniciado en background. Recarga las imágenes en 30-60 segundos.',
        data: {
          id_producto: idProducto,
          pid: child.pid || null
        }
      });
    } catch (error) {
      console.error('Error en scrapeProducto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar el scraping',
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
      // Aquí puedes agregar consultas para obtener estadísticas
      // Por ahora retornamos un objeto básico
      res.json({
        success: true,
        data: {
          message: 'Estadísticas del sistema',
          // Agregar más estadísticas según necesites
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

const adminControllerInstance = new AdminController();
adminControllerInstance.productImageUpload = productImageUpload;

module.exports = adminControllerInstance;
