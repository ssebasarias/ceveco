const request = require('supertest');
const app = require('../index');
const UsuarioModel = require('../src/models/usuario.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ceveco_secret_key_change_in_production';

const TestHelper = {
    /**
     * Crea un usuario de prueba en la BD y retorna su token y datos
     */
    createTestUser: async () => {
        const uniqueSuffix = Date.now();
        const testUser = {
            email: `test_user_${uniqueSuffix}@example.com`,
            password: 'Password123!',
            nombre: 'Test User',
            apellido: 'Automation'
        };

        // Crear usuario usando el modelo real para asegurar que exista en BD
        // Ojo: Esto asume que UsuarioModel.create retorna el usuario creado
        try {
            const user = await UsuarioModel.create({
                ...testUser,
                celular: '1234567890',
                auth_method: 'local'
            });

            const token = jwt.sign(
                {
                    id: user.id_usuario,
                    email: user.email,
                    rol: user.rol
                },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            return {
                user,
                token,
                rawPassword: testUser.password
            };
        } catch (error) {
            console.error('Error creando usuario de test:', error);
            throw error;
        }
    },

    /**
     * Elimina el usuario de prueba por ID
     */
    deleteTestUser: async (userId) => {
        // SQL raw sería mejor para forzar delete cascade si hay relaciones, 
        // pero usaremos lo que haya. Si no hay delete físico en el modelo, 
        // intentaremos un query directo si fuera necesario, o simplemente lo dejamos (en dev está bien).
        // Asumiremos que no es crítico borrarlo si falla, pero intentaremos.
        try {
            // Mock de borrado si no existe método delete
            // const { pool } = require('../src/config/db');
            // await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [userId]);

            // Por seguridad y simplicidad, solo llamaremos a un método soft-delete o similar si existe,
            // o lo omitimos por ahora si no queremos importar 'pool' directamente.
            // Dado que es un test de integración rápido, usaremos pool si podemos.
            const db = require('../src/config/db');
            if (db.pool) {
                await db.pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [userId]);
            }
        } catch (e) {
            console.log('No se pudo borrar el usuario de test (puede ser normal si hay constraints):', e.message);
        }
    }
};

module.exports = TestHelper;
