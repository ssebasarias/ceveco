const request = require('supertest');
const app = require('../index');

describe('API Health Check', () => {
    it('GET /health debe retornar status 200 y mensaje de éxito', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'API Ceveco funcionando correctamente');
    });

    it('GET /ruta-inexistente debe retornar 404', async () => {
        const res = await request(app).get('/api/v1/ruta-inexistente');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('success', false);
    });
});
