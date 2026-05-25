(function () {
  const WHATSAPP = '573216453672';
  function formatCOP(n) {
    if (n == null) return 'consultar';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  }
  window.cotizarProducto = function (producto) {
    if (!producto) return;
    const precio = formatCOP(producto.precio_actual);
    const url = `${location.origin}/pages/detalle-producto.html?id=${producto.id_producto}`;
    const sku = producto.sku ? `\nSKU: ${producto.sku}` : '';
    const marca = producto.marca ? `\nMarca: ${producto.marca}` : '';
    const msg =
`Hola Ceveco, quiero cotizar:

*${producto.nombre}*${marca}${sku}
Precio listado: ${precio}

${url}

¿Está disponible? ¿Cuáles son los métodos de pago?`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };
})();
