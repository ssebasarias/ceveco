const request = require('supertest');
const app = require('../index');

// Aumentar el timeout
jest.setTimeout(10000);

describe('Endpoints de Autenticación', () => {

    describe('POST /api/v1/auth/login', () => {
        it('Debe rechazar credenciales incorrectas', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'correo_falso_que_no_existe@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBeOneOf([400, 401, 404]); // 400 (Bad Request) o 401 (Unauthorized) o 404 (User not found)
            expect(res.body.success).toBe(false);
        });

        it('Debe validar email inválido', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'no-es-un-email',
                    password: '123'
                });

            // Express-validator debe atrapar esto
            expect(res.statusCode).toEqual(400); // Bad Request por validación
        });
    });

    describe('Rutas Protegidas', () => {
        it('GET /api/v1/auth/profile sin token debe fallar', async () => {
            const res = await request(app).get('/api/v1/auth/profile');

            // Debería ser 401 Unauthorized o 403 Forbidden
            expect(res.statusCode).toBeOneOf([401, 403]);
        });
    });
});

// Helper para Jest para aceptar múltiples status codes
expect.extend({
    toBeOneOf(received, expected) {
        const pass = expected.includes(received);
        if (pass) {
            return {
                message: () => `expected ${received} to be one of ${expected}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be one of ${expected}`,
                pass: false,
            };
        }
    },
});
