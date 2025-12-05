const { query, getClient } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Modelo de Usuario
 * Maneja todas las operaciones de base de datos relacionadas con usuarios
 */
class UsuarioModel {
    /**
     * Buscar usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    static async findById(id) {
        const queryText = `
            SELECT 
                id_usuario,
                email,
                nombre,
                apellido,
                telefono,
                celular,
                tipo_documento,
                numero_documento,
                fecha_nacimiento,
                genero,
                avatar_url,
                rol,
                activo,
                email_verificado,
                auth_method,
                fecha_ultimo_acceso,
                fecha_creacion,
                fecha_actualizacion
            FROM usuarios
            WHERE id_usuario = $1 AND activo = TRUE
        `;

        const result = await query(queryText, [id]);
        return result.rows[0] || null;
    }

    /**
     * Buscar usuario por email
     * @param {string} email - Email del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    static async findByEmail(email) {
        const queryText = `
            SELECT 
                id_usuario,
                email,
                password_hash,
                nombre,
                apellido,
                telefono,
                celular,
                avatar_url,
                rol,
                activo,
                email_verificado,
                auth_method,
                fecha_ultimo_acceso,
                fecha_creacion
            FROM usuarios
            WHERE email = $1
        `;

        const result = await query(queryText, [email.toLowerCase()]);
        return result.rows[0] || null;
    }

    /**
     * Crear nuevo usuario con autenticación local
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} Usuario creado
     */
    static async create(userData) {
        const {
            email,
            password,
            nombre,
            apellido = null,
            telefono = null,
            celular = null,
            tipo_documento = 'CC',
            numero_documento = null,
            fecha_nacimiento = null,
            genero = null,
            avatar_url = null,
            rol = 'cliente',
            auth_method = 'local'
        } = userData;

        // Hash de contraseña si se proporciona
        let password_hash = null;
        if (password) {
            password_hash = await bcrypt.hash(password, 12);
        }

        const queryText = `
            INSERT INTO usuarios (
                email, password_hash, nombre, apellido, telefono, celular,
                tipo_documento, numero_documento, fecha_nacimiento, genero,
                avatar_url, rol, auth_method, email_verificado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING 
                id_usuario, email, nombre, apellido, telefono, celular,
                avatar_url, rol, activo, email_verificado, auth_method,
                fecha_creacion
        `;

        const params = [
            email.toLowerCase(),
            password_hash,
            nombre,
            apellido,
            telefono,
            celular,
            tipo_documento,
            numero_documento,
            fecha_nacimiento,
            genero,
            avatar_url,
            rol,
            auth_method,
            auth_method !== 'local' // email_verificado es TRUE si viene de OAuth
        ];

        const result = await query(queryText, params);
        return result.rows[0];
    }

    /**
     * Verificar contraseña de usuario
     * @param {string} password - Contraseña en texto plano
     * @param {string} hash - Hash almacenado
     * @returns {Promise<boolean>} True si coincide
     */
    static async verifyPassword(password, hash) {
        if (!hash) return false;
        return bcrypt.compare(password, hash);
    }

    /**
     * Actualizar último acceso del usuario
     * @param {number} id - ID del usuario
     */
    static async updateLastAccess(id) {
        const queryText = `
            UPDATE usuarios 
            SET fecha_ultimo_acceso = CURRENT_TIMESTAMP
            WHERE id_usuario = $1
        `;
        await query(queryText, [id]);
    }

    /**
     * Actualizar perfil de usuario
     * @param {number} id - ID del usuario
     * @param {Object} updates - Campos a actualizar
     * @returns {Promise<Object>} Usuario actualizado
     */
    static async update(id, updates) {
        const allowedFields = [
            'nombre', 'apellido', 'telefono', 'celular',
            'tipo_documento', 'numero_documento', 'fecha_nacimiento',
            'genero', 'avatar_url'
        ];

        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);

        const queryText = `
            UPDATE usuarios 
            SET ${fields.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_usuario = $${paramIndex}
            RETURNING 
                id_usuario, email, nombre, apellido, telefono, celular,
                tipo_documento, numero_documento, fecha_nacimiento, genero,
                avatar_url, rol, activo, email_verificado, auth_method,
                fecha_creacion, fecha_actualizacion
        `;

        const result = await query(queryText, values);
        return result.rows[0];
    }

    /**
     * Cambiar contraseña del usuario
     * @param {number} id - ID del usuario
     * @param {string} newPassword - Nueva contraseña
     */
    static async updatePassword(id, newPassword) {
        const password_hash = await bcrypt.hash(newPassword, 12);

        const queryText = `
            UPDATE usuarios 
            SET password_hash = $1, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_usuario = $2
        `;

        await query(queryText, [password_hash, id]);
    }

    /**
     * Establecer token de recuperación de contraseña
     * @param {string} email - Email del usuario
     * @param {string} token - Token de recuperación
     * @param {Date} expiry - Fecha de expiración
     */
    static async setRecoveryToken(email, token, expiry) {
        const queryText = `
            UPDATE usuarios 
            SET token_recuperacion = $1, fecha_recuperacion_expira = $2
            WHERE email = $3
        `;

        await query(queryText, [token, expiry, email.toLowerCase()]);
    }

    /**
     * Verificar token de recuperación
     * @param {string} token - Token de recuperación
     * @returns {Promise<Object|null>} Usuario si el token es válido
     */
    static async findByRecoveryToken(token) {
        const queryText = `
            SELECT id_usuario, email, nombre
            FROM usuarios
            WHERE token_recuperacion = $1 
              AND fecha_recuperacion_expira > CURRENT_TIMESTAMP
              AND activo = TRUE
        `;

        const result = await query(queryText, [token]);
        return result.rows[0] || null;
    }

    /**
     * Limpiar token de recuperación
     * @param {number} id - ID del usuario
     */
    static async clearRecoveryToken(id) {
        const queryText = `
            UPDATE usuarios 
            SET token_recuperacion = NULL, fecha_recuperacion_expira = NULL
            WHERE id_usuario = $1
        `;

        await query(queryText, [id]);
    }

    /**
     * Verificar email del usuario
     * @param {string} token - Token de verificación
     * @returns {Promise<boolean>} True si se verificó correctamente
     */
    static async verifyEmail(token) {
        const queryText = `
            UPDATE usuarios 
            SET email_verificado = TRUE, token_verificacion = NULL
            WHERE token_verificacion = $1
            RETURNING id_usuario
        `;

        const result = await query(queryText, [token]);
        return result.rowCount > 0;
    }

    /**
     * Obtener proveedores OAuth vinculados al usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Array>} Lista de proveedores
     */
    static async getLinkedProviders(id) {
        const queryText = `
            SELECT provider, email, nombre, avatar_url, fecha_creacion, fecha_ultima_autenticacion
            FROM auth_providers
            WHERE id_usuario = $1
            ORDER BY fecha_creacion
        `;

        const result = await query(queryText, [id]);
        return result.rows;
    }

    /**
     * Verificar si el usuario tiene contraseña local
     * @param {number} id - ID del usuario
     * @returns {Promise<boolean>}
     */
    static async hasLocalPassword(id) {
        const queryText = `
            SELECT password_hash IS NOT NULL as has_password
            FROM usuarios
            WHERE id_usuario = $1
        `;

        const result = await query(queryText, [id]);
        return result.rows[0]?.has_password || false;
    }

    /**
     * Desactivar usuario (soft delete)
     * @param {number} id - ID del usuario
     */
    static async deactivate(id) {
        const queryText = `
            UPDATE usuarios 
            SET activo = FALSE, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_usuario = $1
        `;

        await query(queryText, [id]);
    }
}

module.exports = UsuarioModel;
