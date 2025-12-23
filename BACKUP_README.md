# 📦 Gestión de Productos - Ceveco

Este documento explica cómo usar los scripts de backup, limpieza y restauración de productos.

## 📋 Resumen del Último Backup

**Fecha:** 22 de diciembre de 2025, 14:38:17
**Productos respaldados:** 132
**Imágenes:** 10
**Atributos:** 279
**Favoritos:** 14
**Items en pedidos:** 6

**Archivo de backup:** `backups/ceveco_backup_2025-12-22T14-38-17.sql` (161.6 KB)

---

## 🔧 Scripts Disponibles

### 1. `backup-and-clean.js` - Backup y Limpieza

Este script crea un backup completo de todos los productos y luego los elimina de la base de datos.

**Uso:**
```bash
node backup-and-clean.js
```

**¿Qué hace?**
1. ✅ Verifica la conexión a la base de datos
2. 📊 Muestra estadísticas actuales de productos
3. 💾 Crea un backup completo en formato SQL
4. 📝 Guarda las estadísticas en formato JSON
5. ⚠️ Solicita confirmación (debes escribir "SI")
6. 🗑️ Limpia todas las tablas de productos
7. ✅ Muestra estadísticas finales

**Tablas que se limpian:**
- `productos` - Todos los productos
- `producto_imagenes` - Imágenes de productos
- `producto_atributos` - Atributos/especificaciones
- `carrito_items` - Items en carritos de compra
- `favoritos` - Productos marcados como favoritos
- `pedido_items` - Items en pedidos (histórico)
- `resenas` - Reseñas de productos
- `sede_inventario` - Inventario por sede

---

### 2. `restore-backup.js` - Restaurar Backup

Este script restaura productos desde un archivo de backup.

**Uso:**
```bash
node restore-backup.js <nombre_archivo.sql>
```

**Ejemplo:**
```bash
node restore-backup.js ceveco_backup_2025-12-22T14-38-17.sql
```

**¿Qué hace?**
1. ✅ Verifica que el archivo de backup existe
2. ⚠️ Solicita confirmación
3. 📥 Lee el archivo SQL
4. 🔄 Ejecuta todos los INSERT statements
5. ✅ Muestra resumen de la restauración

**IMPORTANTE:** Este script NO elimina los productos actuales. Si quieres reemplazar completamente los productos:
1. Primero ejecuta `backup-and-clean.js`
2. Luego ejecuta `restore-backup.js`

---

## 📁 Estructura de Archivos

```
ceveco/
├── backup-and-clean.js          # Script de backup y limpieza
├── restore-backup.js            # Script de restauración
├── backups/                     # Carpeta de backups
│   ├── ceveco_backup_YYYY-MM-DDTHH-MM-SS.sql
│   └── estadisticas_YYYY-MM-DDTHH-MM-SS.json
└── BACKUP_README.md            # Este archivo
```

---

## 🚀 Flujo de Trabajo Recomendado

### Para Limpiar y Empezar de Cero

```bash
# 1. Crear backup y limpiar productos actuales
node backup-and-clean.js

# 2. Ahora la base de datos está limpia
# Tu equipo puede comenzar a cargar nuevos productos
```

### Para Restaurar un Backup Anterior

```bash
# 1. Ver backups disponibles
ls backups/

# 2. Restaurar un backup específico
node restore-backup.js ceveco_backup_2025-12-22T14-38-17.sql
```

### Para Hacer un Backup Sin Limpiar

Si solo quieres hacer un backup sin eliminar nada, puedes usar este comando directo:

```bash
# Backup manual usando pg_dump (si tienes PostgreSQL instalado)
pg_dump -h localhost -p 5433 -U postgres -d ceveco_db > backup_manual.sql

# O ejecuta backup-and-clean.js y cancela cuando te pida confirmación
node backup-and-clean.js
# (escribe cualquier cosa diferente a "SI" cuando te pregunte)
```

---

## ⚙️ Configuración de Base de Datos

Los scripts usan la siguiente configuración (desde `backend/.env`):

```
Host: localhost
Puerto: 5433
Base de datos: ceveco_db
Usuario: postgres
Password: postgres
```

Si necesitas cambiar la configuración, edita las líneas al inicio de cada script:

```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'ceveco_db',
  user: 'postgres',
  password: 'postgres'
});
```

---

## 🔒 Seguridad

- ✅ Los backups se guardan localmente en la carpeta `backups/`
- ✅ Los backups NO se suben a Git (están en `.gitignore`)
- ✅ Siempre se solicita confirmación antes de eliminar datos
- ✅ Se usa transacciones SQL (ROLLBACK en caso de error)

---

## 📊 Formato de Backup

Los backups se guardan en dos archivos:

### 1. Archivo SQL (`ceveco_backup_*.sql`)
Contiene todos los INSERT statements para restaurar los productos:
```sql
-- Backup de Productos - Ceveco
-- Fecha: 22/12/2025 14:38:17
-- ============================================

-- Tabla: productos (132 registros)
INSERT INTO productos (id_producto, sku, nombre, ...) VALUES (...);
INSERT INTO productos (id_producto, sku, nombre, ...) VALUES (...);
...
```

### 2. Archivo JSON (`estadisticas_*.json`)
Contiene un resumen de lo que se respaldó:
```json
{
  "total_productos": "132",
  "total_imagenes": "10",
  "total_atributos": "279",
  "items_en_carrito": "0",
  "productos_favoritos": "14",
  "total_resenas": "0",
  "inventario_sedes": "0",
  "items_pedidos": "6"
}
```

---

## ❓ Preguntas Frecuentes

### ¿Puedo ejecutar estos scripts en producción?

Sí, pero con precaución:
1. Siempre haz un backup primero
2. Ejecuta en horarios de bajo tráfico
3. Notifica a tu equipo
4. Ten un plan de rollback

### ¿Qué pasa si hay un error durante la limpieza?

Los scripts usan transacciones SQL. Si hay un error:
- Se hace ROLLBACK automático
- No se pierden datos
- Puedes revisar el error y volver a intentar

### ¿Los backups incluyen las imágenes de productos?

No, los backups solo incluyen las **URLs** de las imágenes, no los archivos físicos. Las imágenes deben estar respaldadas por separado en tu servidor de archivos.

### ¿Puedo automatizar los backups?

Sí, puedes crear un cron job o tarea programada:

**Windows (Task Scheduler):**
```powershell
# Crear tarea que ejecute diariamente a las 2 AM
schtasks /create /tn "Ceveco Backup" /tr "node C:\path\to\ceveco\backup-and-clean.js" /sc daily /st 02:00
```

**Linux/Mac (crontab):**
```bash
# Ejecutar diariamente a las 2 AM
0 2 * * * cd /path/to/ceveco && node backup-and-clean.js
```

---

## 📞 Soporte

Si tienes problemas con los scripts:

1. Verifica que la base de datos esté corriendo
2. Verifica las credenciales en `backend/.env`
3. Revisa los logs de error
4. Contacta al equipo de desarrollo

---

## 📝 Changelog

### 2025-12-22
- ✅ Creación inicial de scripts de backup y restauración
- ✅ Backup exitoso de 132 productos
- ✅ Limpieza exitosa de base de datos
- ✅ Base de datos lista para nuevos productos

---

**¡La base de datos está limpia y lista para que tu equipo comience a cargar productos nuevos!** 🎉
