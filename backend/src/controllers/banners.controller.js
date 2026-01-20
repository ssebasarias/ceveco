const BannersService = require('../services/banners.service');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class BannersController {
  /**
   * Obtener todos los banners
   * GET /api/v1/admin/banners
   */
  async getAll(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const result = await BannersService.getBanners(req.query);
      res.json(result);
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener banners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener un banner por ID
   * GET /api/v1/admin/banners/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de banner inválido'
        });
      }

      const result = await BannersService.getBannerById(parseInt(id));

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener banner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear un nuevo banner
   * POST /api/v1/admin/banners
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const result = await BannersService.createBanner(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error en create:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear banner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Actualizar un banner
   * PUT /api/v1/admin/banners/:id
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de banner inválido'
        });
      }

      const result = await BannersService.updateBanner(parseInt(id), req.body);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar banner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar un banner
   * DELETE /api/v1/admin/banners/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { permanent } = req.query;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de banner inválido'
        });
      }

      const result = await BannersService.deleteBanner(parseInt(id), permanent === 'true');

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar banner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener banners activos por posición (público)
   * GET /api/v1/banners/:posicion
   */
  async getActiveByPosition(req, res) {
    try {
      const { posicion } = req.params;

      const allowedPositions = ['hero', 'sidebar', 'footer', 'popup'];
      if (!allowedPositions.includes(posicion)) {
        return res.status(400).json({
          success: false,
          message: 'Posición inválida'
        });
      }

      const result = await BannersService.getActiveBannersByPosition(posicion);
      res.json(result);
    } catch (error) {
      console.error('Error en getActiveByPosition:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener banners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener lista de imágenes de banner-hero
   * GET /api/v1/admin/banners/images
   */
  async getBannerImages(req, res) {
    try {
      const bannerImagesPath = path.join(__dirname, '../../../frontend/assets/img/banner-hero');
      console.log('📂 Buscando imágenes en:', bannerImagesPath);
      console.log('   __dirname:', __dirname);

      // Verificar que el directorio existe, si no, crearlo
      const fsSync = require('fs');
      try {
        await fs.access(bannerImagesPath);
        console.log('✅ Directorio existe y es accesible');
      } catch (error) {
        console.log('⚠️ Directorio no encontrado, intentando crear...');
        try {
          fsSync.mkdirSync(bannerImagesPath, { recursive: true });
          console.log('✅ Directorio creado exitosamente');
          // Verificar que se creó correctamente
          await fs.access(bannerImagesPath);
        } catch (createError) {
          console.error('❌ Error al crear directorio:', createError);
          console.error('   Ruta intentada:', bannerImagesPath);
          return res.json({
            success: true,
            data: [],
            message: 'No se encontró el directorio de imágenes y no se pudo crear. Verifica los permisos.'
          });
        }
      }

      // Leer directorio
      let files;
      try {
        files = await fs.readdir(bannerImagesPath);
        console.log(`📸 Encontradas ${files.length} archivos en el directorio`);
      } catch (error) {
        console.error('❌ Error leyendo directorio:', error);
        console.error('   Ruta:', bannerImagesPath);
        return res.status(500).json({
          success: false,
          message: 'Error al leer el directorio de imágenes',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      // Filtrar solo archivos de imagen
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const images = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map(file => ({
          filename: file,
          url: `/assets/img/banner-hero/${file}`
        }));

      res.json({
        success: true,
        data: images,
        message: 'Imágenes obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error en getBannerImages:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener imágenes de banner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Subir imagen a banner-hero
   * POST /api/v1/admin/banners/images/upload
   */
  async uploadBannerImage(req, res) {
    try {
      console.log('📤 Intento de subida de imagen de banner');
      console.log('📁 Archivo recibido:', req.file ? 'SÍ' : 'NO');

      if (!req.file) {
        console.log('❌ No se proporcionó archivo');
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      console.log('✅ Archivo recibido de multer (memory):', {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        bufferSize: req.file.buffer ? req.file.buffer.length : 0
      });

      // Verificar que tenemos el buffer
      if (!req.file.buffer) {
        console.error('❌ No hay buffer en el archivo');
        return res.status(400).json({
          success: false,
          message: 'El archivo no se recibió correctamente'
        });
      }

      // Asegurar que el directorio existe antes de escribir (usar la misma instancia de fsSync)
      const fsSync = require('fs');
      // Construir la ruta directamente desde __dirname usando path.join para mejor compatibilidad con Windows
      const resolvedUploadPath = path.join(__dirname, '../../../frontend/assets/img/banner-hero');
      // Normalizar la ruta para Windows (convierte / a \ y resuelve ..)
      const normalizedUploadPath = path.normalize(resolvedUploadPath);
      
      console.log('📁 Verificando directorio antes de escribir:');
      console.log('   Ruta original:', resolvedUploadPath);
      console.log('   Ruta normalizada:', normalizedUploadPath);
      console.log('   __dirname:', __dirname);
      
      try {
        // Crear directorio si no existe (con recursive para crear toda la estructura)
        // Usar la ruta normalizada
        if (!fsSync.existsSync(normalizedUploadPath)) {
          console.log('📁 Directorio no existe, creando:', normalizedUploadPath);
          fsSync.mkdirSync(normalizedUploadPath, { recursive: true });
          console.log('✅ Directorio creado');
          
          // Verificar que realmente se creó
          if (!fsSync.existsSync(normalizedUploadPath)) {
            throw new Error('El directorio no se pudo crear');
          }
        }
        
        // Verificar que el directorio existe y es un directorio
        const dirStats = fsSync.statSync(normalizedUploadPath);
        if (!dirStats.isDirectory()) {
          throw new Error('La ruta existe pero no es un directorio');
        }
        
        // Verificar permisos de escritura
        fsSync.accessSync(normalizedUploadPath, fsSync.constants.W_OK);
        console.log('✅ Directorio verificado y accesible para escritura');
      } catch (dirError) {
        console.error('❌ Error con el directorio:', dirError);
        console.error('   Ruta intentada:', normalizedUploadPath);
        console.error('   Código:', dirError.code);
        console.error('   Errno:', dirError.errno);
        console.error('   Stack:', dirError.stack);
        return res.status(500).json({
          success: false,
          message: 'Error al acceder al directorio de imágenes. Verifica los permisos.',
          error: process.env.NODE_ENV === 'development' ? dirError.message : undefined
        });
      }

      // Generar nombre único para el archivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
      const name = path.basename(req.file.originalname, path.extname(req.file.originalname)).replace(/[^a-zA-Z0-9]/g, '-') || 'banner';
      const filename = `${name}-${uniqueSuffix}${ext}`;
      
      // Asegurar que el directorio existe justo antes de escribir (más robusto)
      try {
        if (!fsSync.existsSync(normalizedUploadPath)) {
          console.log('⚠️ Directorio no existe, creando...');
          fsSync.mkdirSync(normalizedUploadPath, { recursive: true });
        }
        // Verificar que realmente existe después de crearlo
        if (!fsSync.existsSync(normalizedUploadPath)) {
          throw new Error('No se pudo crear o verificar el directorio');
        }
      } catch (dirError) {
        console.error('❌ Error asegurando directorio:', dirError);
        return res.status(500).json({
          success: false,
          message: 'Error al preparar el directorio de imágenes',
          error: process.env.NODE_ENV === 'development' ? dirError.message : undefined
        });
      }
      
      // Usar path.resolve para obtener la ruta absoluta completa del archivo
      const filePath = path.resolve(normalizedUploadPath, filename);

      console.log('💾 Preparando para guardar archivo:');
      console.log('   Ruta completa:', filePath);
      console.log('   Directorio base:', normalizedUploadPath);
      console.log('   Nombre archivo:', filename);
      console.log('   Tamaño buffer:', req.file.buffer.length, 'bytes');

      // Escribir el archivo manualmente desde el buffer
      try {
        // Verificar que el buffer es válido
        if (!Buffer.isBuffer(req.file.buffer)) {
          throw new Error('El buffer del archivo no es válido');
        }
        
        console.log('💾 Escribiendo archivo...');
        console.log('   Tipo de buffer:', Buffer.isBuffer(req.file.buffer) ? 'Buffer' : typeof req.file.buffer);
        console.log('   Tamaño buffer:', req.file.buffer.length);
        console.log('   Ruta final:', filePath);
        
        // Asegurar que el directorio existe una vez más justo antes de escribir
        // Esto es crítico en Windows donde puede haber problemas de timing
        const dirToCheck = path.dirname(filePath);
        if (!fsSync.existsSync(dirToCheck)) {
          console.log('⚠️ Directorio del archivo no existe, creando:', dirToCheck);
          fsSync.mkdirSync(dirToCheck, { recursive: true });
        }
        
        // Verificar que el directorio padre existe y es accesible
        try {
          fsSync.accessSync(dirToCheck, fsSync.constants.W_OK);
        } catch (accessError) {
          throw new Error(`No se puede escribir en el directorio: ${accessError.message}`);
        }
        
        // En Windows, usar fs.promises.writeFile en lugar de writeFileSync
        // Esto puede manejar mejor algunos casos edge en Windows
        // filePath ya está resuelto con path.resolve, pero lo resolvemos una vez más para estar seguros
        const finalPath = path.resolve(filePath);
        console.log('   Ruta final resuelta:', finalPath);
        
        // Usar fs.promises.writeFile que puede manejar mejor Windows
        await fs.writeFile(finalPath, req.file.buffer, { flag: 'w', mode: 0o666 });
        console.log('✅ Archivo escrito exitosamente');

        // Verificar que se guardó correctamente usando la ruta final
        try {
          await fs.access(finalPath);
          const stats = await fs.stat(finalPath);
          console.log('✅ Archivo verificado en disco:', {
            path: finalPath,
            size: stats.size,
            exists: true
          });
        } catch (verifyError) {
          throw new Error('El archivo no existe después de escribirlo: ' + verifyError.message);
        }
      } catch (writeError) {
        console.error('❌ Error escribiendo archivo:', writeError);
        console.error('   Ruta intentada:', filePath);
        console.error('   Ruta resuelta:', path.resolve(filePath));
        console.error('   Directorio padre:', path.dirname(filePath));
        console.error('   Directorio padre existe:', fsSync.existsSync(path.dirname(filePath)));
        console.error('   Código:', writeError.code);
        console.error('   Errno:', writeError.errno);
        console.error('   Stack:', writeError.stack);
        
        // Verificar el estado del directorio y la ruta
        try {
          const dirExists = fsSync.existsSync(normalizedUploadPath);
          let dirWritable = false;
          if (dirExists) {
            try {
              fsSync.accessSync(normalizedUploadPath, fsSync.constants.W_OK);
              dirWritable = true;
            } catch (accessError) {
              dirWritable = false;
            }
          }
          const dirStats = dirExists ? fsSync.statSync(normalizedUploadPath) : null;
          
          // Verificar si el problema es con la ruta del archivo
          const parentDir = path.dirname(filePath);
          const parentExists = fsSync.existsSync(parentDir);
          
          console.error('   Estado del directorio:', { 
            exists: dirExists, 
            writable: dirWritable,
            isDirectory: dirStats ? dirStats.isDirectory() : false,
            mode: dirStats ? dirStats.mode : null
          });
          console.error('   Estado del directorio padre del archivo:', {
            path: parentDir,
            exists: parentExists,
            matchesUploadPath: parentDir === normalizedUploadPath
          });
        } catch (checkError) {
          console.error('   Error verificando directorio:', checkError.message);
        }
        
        return res.status(500).json({
          success: false,
          message: 'Error al guardar el archivo en el servidor',
          error: process.env.NODE_ENV === 'development' ? writeError.message : undefined
        });
      }

      const imageUrl = `/assets/img/banner-hero/${filename}`;

      console.log('✅ Imagen guardada exitosamente en:', imageUrl);
      console.log('   Ruta física:', filePath);
      console.log('   URL pública:', imageUrl);

      res.json({
        success: true,
        data: {
          url: imageUrl,
          filename: filename,
          originalName: req.file.originalname,
          size: req.file.size
        },
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      console.error('❌ Error en uploadBannerImage:', error);
      console.error('   Stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error al subir imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar imagen de banner-hero
   * DELETE /api/v1/admin/banners/images/:filename
   */
  async deleteBannerImage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { filename } = req.params;

      // Validar que el filename no contenga rutas relativas (seguridad)
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de archivo inválido'
        });
      }

      const filePath = path.join(__dirname, '../../../frontend/assets/img/banner-hero', filename);

      // Verificar que el archivo existe
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      // Eliminar archivo
      await fs.unlink(filePath);

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en deleteBannerImage:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Configurar multer para subir imágenes de banner usando memoryStorage
// Esto evita problemas con el sistema de archivos de Windows
const fsSync = require('fs');
// Usar path.join y normalizar para mejor compatibilidad con Windows
const uploadPath = path.normalize(path.join(__dirname, '../../../frontend/assets/img/banner-hero'));

console.log('📁 Ruta de upload configurada:', uploadPath);
console.log('   __dirname:', __dirname);

// Crear directorio si no existe (hacerlo una vez al cargar el módulo)
try {
  if (!fsSync.existsSync(uploadPath)) {
    console.log('📁 Creando directorio de banners:', uploadPath);
    fsSync.mkdirSync(uploadPath, { recursive: true });
    console.log('✅ Directorio creado exitosamente');
    
    // Verificar que realmente se creó
    if (!fsSync.existsSync(uploadPath)) {
      throw new Error('El directorio no se pudo crear después de mkdirSync');
    }
  }
  
  // Verificar que es un directorio
  const stats = fsSync.statSync(uploadPath);
  if (!stats.isDirectory()) {
    throw new Error('La ruta existe pero no es un directorio');
  }
  
  // Verificar permisos
  fsSync.accessSync(uploadPath, fsSync.constants.W_OK);
  console.log('✅ Directorio de banners listo:', uploadPath);
} catch (error) {
  console.error('❌ Error preparando directorio de banners:', error);
  console.error('   Ruta:', uploadPath);
  console.error('   Código:', error.code);
  console.error('   Stack:', error.stack);
}

// Usar memoryStorage para evitar problemas con diskStorage en Windows
const bannerStorage = multer.memoryStorage();

const bannerUpload = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 Multer fileFilter:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      console.log('✅ Archivo aceptado por fileFilter');
      return cb(null, true);
    } else {
      console.error('❌ Archivo rechazado por fileFilter:', { extname, mimetype });
      cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
  },
  // Agregar manejo de errores adicional
  onError: (err, next) => {
    console.error('❌ Error en multer:', err);
    next(err);
  }
});

// Middleware de multer para banner images
const uploadBannerImageMiddleware = bannerUpload.single('image');

module.exports = {
  controller: new BannersController(),
  uploadBannerImageMiddleware
};
