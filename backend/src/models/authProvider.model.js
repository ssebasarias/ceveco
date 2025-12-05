const { query } = require('../config/db');

/**
 * Modelo de Proveedores de Autenticación OAuth
 * Maneja las operaciones de proveedores externos (Google, Facebook, etc.)
 */
class AuthProviderModel {
    /**
     * Buscar proveedor por provider + uid
     * @param {string} provider - Nombre del proveedor ('google', 'facebook', etc.)
     * @param {string} providerUid - ID único del proveedor
     * @returns {Promise<Object|null>} Proveedor encontrado o null
     */
    static async findByProviderUid(provider, providerUid) {
        const queryText = `
            SELECT 
                ap.id_provider,
                ap.id_usuario,
                ap.provider,
                ap.provider_uid,
                ap.email,
                ap.nombre,
                ap.avatar_url,
                ap.fecha_creacion,
                ap.fecha_ultima_autenticacion,
                u.email as user_email,
                u.nombre as user_nombre,
                u.rol,
                u.activo
            FROM auth_providers ap
            INNER JOIN usuarios u ON ap.id_usuario = u.id_usuario
            WHERE ap.provider = $1 AND ap.provider_uid = $2
        `;

        const result = await query(queryText, [provider, providerUid]);
        return result.rows[0] || null;
    }

    /**
     * Buscar o crear usuario desde OAuth (wrapper para la función de BD)
     * Esta es la función principal para manejar login con Google/Facebook/etc.
     * @param {Object} oauthData - Datos del proveedor OAuth
     * @returns {Promise<Object>} Resultado con user_id, is_new_user, provider_id
     */
    static async findOrCreateUser(oauthData) {
        const {
            provider,
            providerUid,
            email,
            nombre,
            apellido = null,
            avatarUrl = null,
            rawData = null
        } = oauthData;

        // Usar la función de PostgreSQL que creamos
        const queryText = `
            SELECT * FROM find_or_create_oauth_user($1, $2, $3, $4, $5, $6, $7)
        `;

        const params = [
            provider,
            providerUid,
            email.toLowerCase(),
            nombre,
            apellido,
            avatarUrl,
            rawData ? JSON.stringify(rawData) : null
        ];

        const result = await query(queryText, params);
        return result.rows[0];
    }

    /**
     * Vincular proveedor OAuth a usuario existente
     * @param {number} userId - ID del usuario
     * @param {Object} providerData - Datos del proveedor
     * @returns {Promise<number>} ID del provider creado
     */
    static async linkProvider(userId, providerData) {
        const {
            provider,
            providerUid,
            email = null,
            nombre = null,
            avatarUrl = null,
            rawData = null
        } = providerData;

        const queryText = `
            SELECT link_oauth_provider($1, $2, $3, $4, $5, $6, $7) as provider_id
        `;

        const params = [
            userId,
            provider,
            providerUid,
            email,
            nombre,
            avatarUrl,
            rawData ? JSON.stringify(rawData) : null
        ];

        const result = await query(queryText, params);
        return result.rows[0].provider_id;
    }

    /**
     * Desvincular proveedor OAuth del usuario
     * @param {number} userId - ID del usuario
     * @param {string} provider - Nombre del proveedor
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    static async unlinkProvider(userId, provider) {
        const queryText = `
            SELECT unlink_oauth_provider($1, $2) as success
        `;

        const result = await query(queryText, [userId, provider]);
        return result.rows[0].success;
    }

    /**
     * Obtener todos los proveedores de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} Lista de proveedores
     */
    static async getByUserId(userId) {
        const queryText = `
            SELECT 
                provider,
                email,
                nombre,
                avatar_url,
                fecha_creacion,
                fecha_ultima_autenticacion
            FROM auth_providers
            WHERE id_usuario = $1
            ORDER BY fecha_creacion
        `;

        const result = await query(queryText, [userId]);
        return result.rows;
    }

    /**
     * Actualizar última autenticación del proveedor
     * @param {number} providerId - ID del proveedor
     */
    static async updateLastAuth(providerId) {
        const queryText = `
            UPDATE auth_providers 
            SET fecha_ultima_autenticacion = CURRENT_TIMESTAMP
            WHERE id_provider = $1
        `;

        await query(queryText, [providerId]);
    }

    /**
     * Actualizar tokens del proveedor (para refresh tokens)
     * @param {number} providerId - ID del proveedor
     * @param {Object} tokens - Tokens a actualizar
     */
    static async updateTokens(providerId, tokens) {
        const { accessToken, refreshToken, tokenExpiry } = tokens;

        const queryText = `
            UPDATE auth_providers 
            SET access_token = $1, refresh_token = $2, token_expiry = $3
            WHERE id_provider = $1
        `;

        await query(queryText, [accessToken, refreshToken, tokenExpiry, providerId]);
    }

    /**
     * Verificar si un email ya está vinculado a otro proveedor del mismo tipo
     * @param {string} provider - Tipo de proveedor
     * @param {string} email - Email a verificar
     * @param {number} excludeUserId - ID de usuario a excluir (opcional)
     * @returns {Promise<boolean>}
     */
    static async isEmailLinkedToProvider(provider, email, excludeUserId = null) {
        let queryText = `
            SELECT COUNT(*) as count
            FROM auth_providers
            WHERE provider = $1 AND email = $2
        `;

        const params = [provider, email.toLowerCase()];

        if (excludeUserId) {
            queryText += ` AND id_usuario != $3`;
            params.push(excludeUserId);
        }

        const result = await query(queryText, params);
        return parseInt(result.rows[0].count) > 0;
    }
}

module.exports = AuthProviderModel;
