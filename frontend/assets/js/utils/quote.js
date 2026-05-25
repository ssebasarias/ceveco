/**
 * Ceveco - WhatsApp Quote Utility
 * Abre un link wa.me con mensaje pre-llenado para cotizar un producto
 */

window.cotizarProducto = function (producto) {
    const wa = '573216453672';
    const precio = producto.precio_actual
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(producto.precio_actual)
        : 'consultar';
    const url = `${location.origin}/pages/detalle-producto.html?id=${producto.id_producto}`;
    const msg = `Hola Ceveco, quiero cotizar:\n\n*${producto.nombre}*\nSKU: ${producto.sku || '-'}\nPrecio listado: ${precio}\n\n${url}\n\n¿Está disponible y cuáles son los métodos de pago?`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
};
