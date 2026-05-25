const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');
const sharp = require('sharp');
const { pool } = require('../config/db');

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/images/products');
        
        // Crear directorio si no existe
        try {
            await fs.mkdir(uploadPath, { recursive: true });
        } catch (error) {
            console.error('Error creando directorio:', error);
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar nombre único: timestamp + nombre original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
        }
    }
});

class UploadController {
    /**
     * Subir imagen de producto
     * POST /api/v1/admin/upload/image
     */
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ningún archivo'
                });
            }

            // Generar URL relativa
            const imageUrl = `/images/products/${req.file.filename}`;

            res.json({
                success: true,
                data: {
                    url: imageUrl,
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size
                },
                message: 'Imagen subida exitosamente'
            });
        } catch (error) {
            console.error('Error en uploadImage:', error);
            res.status(500).json({
                success: false,
                message: 'Error al subir imagen',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

class ProductImageController {
    /**
     * Subir imagen de producto con sharp processing
     * POST /api/v1/admin/upload/producto/:id
     * Guarda: productos/{id}.webp + .jpg + _thumb.webp
     * Hace UPSERT en producto_imagenes (es_principal=true)
     */
    async uploadProductoImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ningún archivo'
                });
            }

            const { id } = req.params;
            const productoId = parseInt(id, 10);

            if (isNaN(productoId) || productoId < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            // Verificar que el producto existe
            const { rows: prod } = await pool.query(
                'SELECT id_producto FROM productos WHERE id_producto = $1',
                [productoId]
            );
            if (prod.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            const outputDir = path.join(__dirname, '../../public/images/productos');
            await fs.mkdir(outputDir, { recursive: true });

            const inputBuffer = req.file.buffer;

            // Generar webp principal (800x600 max, calidad 85)
            const webpPath = path.join(outputDir, `${productoId}.webp`);
            await sharp(inputBuffer)
                .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(webpPath);

            // Generar jpg principal
            const jpgPath = path.join(outputDir, `${productoId}.jpg`);
            await sharp(inputBuffer)
                .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toFile(jpgPath);

            // Generar thumbnail webp (200x200)
            const thumbPath = path.join(outputDir, `${productoId}_thumb.webp`);
            await sharp(inputBuffer)
                .resize(200, 200, { fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(thumbPath);

            const imageUrl = `/images/productos/${productoId}.webp`;

            // Actualizar producto_imagenes: desmarcar principal, luego insertar/actualizar
            await pool.query(
                'UPDATE producto_imagenes SET es_principal = FALSE WHERE id_producto = $1',
                [productoId]
            );

            // Verificar si ya existe una entrada con esta URL
            const { rows: existingImg } = await pool.query(
                'SELECT id_imagen FROM producto_imagenes WHERE id_producto = $1 AND url_imagen = $2',
                [productoId, imageUrl]
            );

            if (existingImg.length > 0) {
                await pool.query(
                    'UPDATE producto_imagenes SET es_principal = TRUE, orden = 0 WHERE id_imagen = $1',
                    [existingImg[0].id_imagen]
                );
            } else {
                await pool.query(
                    'INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden) VALUES ($1, $2, TRUE, 0)',
                    [productoId, imageUrl]
                );
            }

            res.json({
                success: true,
                data: {
                    url: imageUrl,
                    thumb: `/images/productos/${productoId}_thumb.webp`
                },
                message: 'Imagen de producto procesada y guardada exitosamente'
            });

        } catch (error) {
            console.error('Error en uploadProductoImage:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar imagen del producto',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

// Configurar multer en memoria para sharp processing
const memoryStorage = multer.memoryStorage();
const uploadProductoSingle = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
}).single('imagen');

// Middleware de multer (para el endpoint existente)
const uploadSingle = upload.single('image');

module.exports = {
    controller: new UploadController(),
    productoController: new ProductImageController(),
    uploadSingle,
    uploadProductoSingle
};
