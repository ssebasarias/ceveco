/**
 * Models Central Export
 * Punto único de importación para todos los modelos
 */

const UsuarioModel = require('./usuario.model');
const ProductoModel = require('./producto.model');
const OrderModel = require('./order.model');
const AuthProviderModel = require('./authProvider.model');

module.exports = {
    UsuarioModel,
    ProductoModel,
    OrderModel,
    AuthProviderModel
};
