/**
 * Services Central Export
 * Punto único de importación para todos los servicios
 */

const AuthService = require('./auth.service');
const ProductosService = require('./productos.service');
const FavoritosService = require('./favoritos.service');
const OrdersService = require('./orders.service');

module.exports = {
    AuthService,
    ProductosService,
    FavoritosService,
    OrdersService
};
