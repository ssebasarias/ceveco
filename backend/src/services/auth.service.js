/**
 * Auth Service
 * Lógica de negocio para autenticación y autorización
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const UsuarioModel = require('../models/usuario.model');
const AuthProviderModel = require('../models/authProvider.model');
const { config } = require('../config');

const JWT_SECRET = config.auth.jwtSecret;
const JWT_EXPIRES_IN = config.auth.jwtExpiresIn;

class AuthService {
    /**
     * Generar token JWT
     */
    static generateToken(user, expiresIn = JWT_EXPIRES_IN) {
        return jwt.sign(
            {
                id: user.id_usuario,
                email: user.email,
                rol: user.rol
            },
            JWT_SECRET,
            { expiresIn }
        );
    }

    /**
     * Registrar nuevo usuario con email/contraseña
     */
    static async register(userData) {
        const { email, password, nombre, apellido, telefono } = userData;

        // Validaciones
        if (!email || !password || !nombre) {
            throw new Error('Email, contraseña y nombre son requeridos');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Verificar si el email ya existe
        const existingUser = await UsuarioModel.findByEmail(email);
        if (existingUser) {
            throw new Error('Este email ya está registrado');
        }

        // Crear usuario
        const newUser = await UsuarioModel.create({
            email,
            password,
            nombre,
            apellido,
            celular: telefono,
            auth_method: 'local'
        });

        // Generar token
        const token = this.generateToken(newUser);

        return { user: newUser, token };
    }

    /**
     * Login con email/contraseña
     */
    static async login(email, password, remember = false) {
        // Validaciones
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }

        // Buscar usuario
        const user = await UsuarioModel.findByEmail(email);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        // Verificar que esté activo
        if (!user.activo) {
            throw new Error('Cuenta desactivada. Contacta a soporte.');
        }

        // Verificar contraseña
        const isValidPassword = await UsuarioModel.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Credenciales inválidas');
        }

        // Actualizar último acceso
        await UsuarioModel.updateLastAccess(user.id_usuario);

        // Generar token (más duración si remember está activo)
        const tokenExpiry = remember ? '30d' : JWT_EXPIRES_IN;
        const token = this.generateToken(user, tokenExpiry);

        return { user, token, expiryDays: remember ? 30 : 7 };
    }

    /**
     * Login/Registro con OAuth
     */
    static async oauthLogin(oauthData) {
        const { provider, providerUid, email, nombre, apellido, avatarUrl, rawData, idToken } = oauthData;

        // Validaciones
        if (!provider || !providerUid || !email) {
            throw new Error('Datos de OAuth incompletos');
        }

        const validProviders = ['google', 'facebook', 'github', 'apple', 'microsoft'];
        if (!validProviders.includes(provider)) {
            throw new Error('Proveedor de autenticación no válido');
        }

        // Verificar token de Google
        if (provider === 'google' && idToken && !idToken.startsWith('mock_')) {
            await this.verifyGoogleToken(idToken, email);
        }

        // Buscar o crear usuario
        const result = await AuthProviderModel.findOrCreateUser({
            provider,
            providerUid,
            email,
            nombre,
            apellido,
            avatarUrl,
            rawData
        });

        // Obtener usuario completo
        const user = await UsuarioModel.findById(result.user_id);

        if (!user || !user.activo) {
            throw new Error('Cuenta no disponible');
        }

        // Generar token
        const token = this.generateToken(user);

        return { user, token, isNewUser: result.is_new_user };
    }

    /**
     * Verificar token de Google
     */
    static async verifyGoogleToken(idToken, email) {
        try {
            const client = new OAuth2Client(config.auth.googleClientId);
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: config.auth.googleClientId
            });
            const payload = ticket.getPayload();

            // Verificar que el email coincida
            if (payload.email !== email) {
                throw new Error('Inconsistencia de identidad');
            }

            return payload;
        } catch (error) {
            console.error('Fallo verificación Google:', error.message);
            throw new Error('Token de Google inválido o manipulado');
        }
    }

    /**
     * Solicitar recuperación de contraseña
     */
    static async forgotPassword(email) {
        const user = await UsuarioModel.findByEmail(email);

        // Siempre responder igual para no revelar si el email existe
        if (!user) {
            return { success: true };
        }

        // Generar token de recuperación
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hora

        await UsuarioModel.setRecoveryToken(email, token, expiry);

        // TODO: Enviar email con el token
        if (config.server.isDevelopment) {
            console.log(`Token de recuperación para ${email}: ${token}`);
        }

        return { success: true, token: config.server.isDevelopment ? token : undefined };
    }

    /**
     * Restablecer contraseña con token
     */
    static async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new Error('Token y nueva contraseña son requeridos');
        }

        if (newPassword.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const user = await UsuarioModel.findByRecoveryToken(token);
        if (!user) {
            throw new Error('Token inválido o expirado');
        }

        await UsuarioModel.updatePassword(user.id_usuario, newPassword);
        await UsuarioModel.clearRecoveryToken(user.id_usuario);

        return { success: true };
    }

    /**
     * Cambiar contraseña
     */
    static async changePassword(userId, currentPassword, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }

        const user = await UsuarioModel.findById(userId);

        // Si tiene contraseña actual, verificarla
        if (user.password_hash) {
            if (!currentPassword) {
                throw new Error('Debes proporcionar tu contraseña actual');
            }

            const isValid = await UsuarioModel.verifyPassword(currentPassword, user.password_hash);
            if (!isValid) {
                throw new Error('Contraseña actual incorrecta');
            }
        }

        await UsuarioModel.updatePassword(userId, newPassword);

        return { success: true };
    }
}

module.exports = AuthService;
