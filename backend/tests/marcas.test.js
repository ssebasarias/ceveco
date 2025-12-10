const request = require('supertest');
const app = require('../index');

describe('Endpoint de Marcas', () => {

    it('GET /api/v1/marcas debe retornar lista de marcas', async () => {
        const res = await request(app).get('/api/v1/marcas');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

});
