const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UsuarioModel = require('../models/usuario.model');
const AuthProviderModel = require('../models/authProvider.model');

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'ceveco_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Controlador de Autenticación
 * Maneja registro, login, OAuth y gestión de sesiones
 */
class AuthController {
    /**
     * Generar token JWT
     * @param {Object} user - Datos del usuario
     * @returns {string} Token JWT
     */
    static generateToken(user) {
        return jwt.sign(
            {
                id: user.id_usuario,
                email: user.email,
                rol: user.rol
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    /**
     * Registro de usuario con email/contraseña
     */
    static async register(req, res) {
        try {
            const { email, password, nombre, apellido, telefono } = req.body;

            // Validaciones básicas
            if (!email || !password || !nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, contraseña y nombre son requeridos'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Verificar si el email ya existe
            const existingUser = await UsuarioModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Este email ya está registrado'
                });
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
            const token = AuthController.generateToken(newUser);

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: {
                        id: newUser.id_usuario,
                        email: newUser.email,
                        nombre: newUser.nombre,
                        apellido: newUser.apellido,
                        avatar_url: newUser.avatar_url,
                        rol: newUser.rol
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar usuario',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Login con email/contraseña
     */
    static async login(req, res) {
        try {
            const { email, password, remember } = req.body;

            // Validaciones
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            // Buscar usuario
            const user = await UsuarioModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar que esté activo
            if (!user.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Cuenta desactivada. Contacta a soporte.'
                });
            }

            // Verificar contraseña
            const isValidPassword = await UsuarioModel.verifyPassword(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Actualizar último acceso
            await UsuarioModel.updateLastAccess(user.id_usuario);

            // Generar token (más duración si remember está activo)
            const tokenExpiry = remember ? '30d' : JWT_EXPIRES_IN;
            const token = jwt.sign(
                { id: user.id_usuario, email: user.email, rol: user.rol },
                JWT_SECRET,
                { expiresIn: tokenExpiry }
            );

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: {
                        id: user.id_usuario,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        avatar_url: user.avatar_url,
                        rol: user.rol
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Login/Registro con OAuth (Google, Facebook, etc.)
     * El frontend envía los datos del usuario después de autenticar con el proveedor
     */
    static async oauthLogin(req, res) {
        try {
            const { provider, providerUid, email, nombre, apellido, avatarUrl, rawData } = req.body;

            // Validaciones
            if (!provider || !providerUid || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de OAuth incompletos'
                });
            }

            // Validar proveedor
            const validProviders = ['google', 'facebook', 'github', 'apple', 'microsoft'];
            if (!validProviders.includes(provider)) {
                return res.status(400).json({
                    success: false,
                    message: 'Proveedor de autenticación no válido'
                });
            }

            // Buscar o crear usuario usando la función de BD
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
                return res.status(403).json({
                    success: false,
                    message: 'Cuenta no disponible'
                });
            }

            // Generar token
            const token = AuthController.generateToken(user);

            res.json({
                success: true,
                message: result.is_new_user ? 'Cuenta creada exitosamente' : 'Login exitoso',
                data: {
                    user: {
                        id: user.id_usuario,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        avatar_url: user.avatar_url,
                        rol: user.rol,
                        auth_method: user.auth_method
                    },
                    token,
                    isNewUser: result.is_new_user
                }
            });

        } catch (error) {
            console.error('Error en OAuth login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en autenticación OAuth',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Obtener perfil del usuario autenticado
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;

            const user = await UsuarioModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Obtener proveedores vinculados
            const providers = await UsuarioModel.getLinkedProviders(userId);
            const hasPassword = await UsuarioModel.hasLocalPassword(userId);

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id_usuario,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        telefono: user.telefono,
                        celular: user.celular,
                        tipo_documento: user.tipo_documento,
                        numero_documento: user.numero_documento,
                        fecha_nacimiento: user.fecha_nacimiento,
                        genero: user.genero,
                        avatar_url: user.avatar_url,
                        rol: user.rol,
                        email_verificado: user.email_verificado,
                        auth_method: user.auth_method,
                        fecha_creacion: user.fecha_creacion
                    },
                    linkedProviders: providers.map(p => p.provider),
                    hasPassword
                }
            });

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil'
            });
        }
    }

    /**
     * Actualizar perfil del usuario
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updates = req.body;

            const updatedUser = await UsuarioModel.update(userId, updates);

            res.json({
                success: true,
                message: 'Perfil actualizado',
                data: {
                    user: {
                        id: updatedUser.id_usuario,
                        email: updatedUser.email,
                        nombre: updatedUser.nombre,
                        apellido: updatedUser.apellido,
                        telefono: updatedUser.telefono,
                        celular: updatedUser.celular,
                        avatar_url: updatedUser.avatar_url
                    }
                }
            });

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar perfil'
            });
        }
    }

    /**
     * Cambiar contraseña
     */
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }

            const user = await UsuarioModel.findByEmail(req.user.email);

            // Si tiene contraseña actual, verificarla
            if (user.password_hash) {
                if (!currentPassword) {
                    return res.status(400).json({
                        success: false,
                        message: 'Debes proporcionar tu contraseña actual'
                    });
                }

                const isValid = await UsuarioModel.verifyPassword(currentPassword, user.password_hash);
                if (!isValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Contraseña actual incorrecta'
                    });
                }
            }

            await UsuarioModel.updatePassword(userId, newPassword);

            res.json({
                success: true,
                message: 'Contraseña actualizada correctamente'
            });

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar contraseña'
            });
        }
    }

    /**
     * Solicitar recuperación de contraseña
     */
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email es requerido'
                });
            }

            const user = await UsuarioModel.findByEmail(email);

            // Siempre responder igual para no revelar si el email existe
            if (!user) {
                return res.json({
                    success: true,
                    message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
                });
            }

            // Generar token de recuperación
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 3600000); // 1 hora

            await UsuarioModel.setRecoveryToken(email, token, expiry);

            // TODO: Enviar email con el token
            // Por ahora solo log en desarrollo
            if (process.env.NODE_ENV === 'development') {
                console.log(`Token de recuperación para ${email}: ${token}`);
            }

            res.json({
                success: true,
                message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
            });

        } catch (error) {
            console.error('Error en forgot password:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar solicitud'
            });
        }
    }

    /**
     * Restablecer contraseña con token
     */
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Token y nueva contraseña son requeridos'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            const user = await UsuarioModel.findByRecoveryToken(token);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            await UsuarioModel.updatePassword(user.id_usuario, newPassword);
            await UsuarioModel.clearRecoveryToken(user.id_usuario);

            res.json({
                success: true,
                message: 'Contraseña restablecida correctamente'
            });

        } catch (error) {
            console.error('Error en reset password:', error);
            res.status(500).json({
                success: false,
                message: 'Error al restablecer contraseña'
            });
        }
    }

    /**
     * Vincular proveedor OAuth a cuenta existente
     */
    static async linkProvider(req, res) {
        try {
            const userId = req.user.id;
            const { provider, providerUid, email, nombre, avatarUrl } = req.body;

            if (!provider || !providerUid) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos del proveedor incompletos'
                });
            }

            const providerId = await AuthProviderModel.linkProvider(userId, {
                provider,
                providerUid,
                email,
                nombre,
                avatarUrl
            });

            res.json({
                success: true,
                message: `${provider} vinculado correctamente`,
                data: { providerId }
            });

        } catch (error) {
            console.error('Error al vincular proveedor:', error);

            // Manejar error específico de proveedor ya vinculado
            if (error.message.includes('ya está vinculado')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al vincular proveedor'
            });
        }
    }

    /**
     * Desvincular proveedor OAuth
     */
    static async unlinkProvider(req, res) {
        try {
            const userId = req.user.id;
            const { provider } = req.params;

            const success = await AuthProviderModel.unlinkProvider(userId, provider);

            if (success) {
                res.json({
                    success: true,
                    message: `${provider} desvinculado correctamente`
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

        } catch (error) {
            console.error('Error al desvincular proveedor:', error);

            // Manejar error de único método de autenticación
            if (error.message.includes('único método')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al desvincular proveedor'
            });
        }
    }

    /**
     * Obtener proveedores vinculados
     */
    static async getLinkedProviders(req, res) {
        try {
            const userId = req.user.id;
            const providers = await AuthProviderModel.getByUserId(userId);

            res.json({
                success: true,
                data: { providers }
            });

        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener proveedores'
            });
        }
    }

    /**
     * Verificar token JWT (para validar sesión desde frontend)
     */
    static async verifyToken(req, res) {
        try {
            // Si llegó aquí, el token es válido (pasó el middleware)
            const user = await UsuarioModel.findById(req.user.id);

            if (!user || !user.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Sesión inválida'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id_usuario,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        avatar_url: user.avatar_url,
                        rol: user.rol
                    }
                }
            });

        } catch (error) {
            console.error('Error al verificar token:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar sesión'
            });
        }
    }
}

module.exports = AuthController;
