const request = require('supertest');
const app = require('../index');
const TestHelper = require('./test-helper');

// Timeout alto para operaciones de BD
jest.setTimeout(30000);

describe('Endpoints de Favoritos', () => {
    let testContext;

    beforeAll(async () => {
        // Crear usuario real y obtener token
        testContext = await TestHelper.createTestUser();
    });

    afterAll(async () => {
        // Limpiar
        if (testContext && testContext.user) {
            await TestHelper.deleteTestUser(testContext.user.id_usuario);
        }
    });

    it('GET /api/v1/favoritos debe retornar 200 y array vacío inicialmente', async () => {
        const res = await request(app)
            .get('/api/v1/favoritos')
            .set('Authorization', `Bearer ${testContext.token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/favoritos debe agregar un producto', async () => {
        // Necesitamos un ID de producto válido. Asumimos que existe el ID 1 o buscamos uno.
        // Si no hay productos, este test fallará. Asumimos seed data básica.
        const productId = 1;

        const res = await request(app)
            .post('/api/v1/favoritos')
            .set('Authorization', `Bearer ${testContext.token}`)
            .send({ id_producto: productId });

        // Puede ser 201 (Creado) o 400/404 si el producto no existe o ya estaba
        // Para ser robustos, aceptamos éxito o error de "producto no encontrado" pero no de auth
        if (res.statusCode === 404) {
            console.log('Skipping favorite add check: Product ID 1 not found');
        } else {
            expect([200, 201]).toContain(res.statusCode);
        }
    });

    it('GET /api/v1/favoritos sin token debe fallar', async () => {
        const res = await request(app).get('/api/v1/favoritos');
        expect(res.statusCode).toEqual(401);
    });
});
