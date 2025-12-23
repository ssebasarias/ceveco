# Proyecto Ceveco

Este repositorio contiene el sistema de gestión y tienda virtual de Ceveco.

## 📂 Estructura

- `backend/`: API Express y servidor de imágenes.
- `frontend/`: Aplicación web.
- `scripts/`: Herramientas de ingesta y mantenimiento.
  - `ingestion/`: Scripts para cargar productos desde Excel (Honda, Suzuki, etc).
  - `maintenance/`: Scripts para verificar y limpiar la BD.
  - `tests/`: Pruebas de integración.
- `docs/`: Documentación del proyecto.
- `raw_data/`: Archivos Excel fuente.

## 🚀 Uso Rápido

### Ingesta de Productos
```bash
# Cargar Honda
node scripts/ingestion/motos/ingest-motos.js "raw_data/HONDA.xlsx" "Honda"

# Cargar Suzuki
node scripts/ingestion/motos/ingest-motos.js "raw_data/SUZUKI.xlsx" "Suzuki"
```

### Mantenimiento
```bash
# Verificar estado del sistema
node scripts/maintenance/check-system.js
```
