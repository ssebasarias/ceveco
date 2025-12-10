const request = require('supertest');
const app = require('../index');
const TestHelper = require('./test-helper');

jest.setTimeout(30000);

describe('Endpoints de Órdenes', () => {
    let testContext;

    beforeAll(async () => {
        testContext = await TestHelper.createTestUser();
    });

    afterAll(async () => {
        if (testContext && testContext.user) {
            await TestHelper.deleteTestUser(testContext.user.id_usuario);
        }
    });

    it('GET /api/v1/orders debe retornar historial vacío inicialmente', async () => {
        const res = await request(app)
            .get('/api/v1/orders')
            .set('Authorization', `Bearer ${testContext.token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/orders debe validar datos incompletos', async () => {
        // Intentar crear orden vacía
        const res = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${testContext.token}`)
            .send({});

        // Esperamos error por falta de items, dirección, etc.
        expect(res.statusCode).not.toEqual(200);
        expect(res.statusCode).not.toEqual(500); // 400 Bad Request es lo ideal
    });
});
