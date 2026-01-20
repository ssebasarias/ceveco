const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');

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

// Middleware de multer
const uploadSingle = upload.single('image');

module.exports = {
    controller: new UploadController(),
    uploadSingle
};
