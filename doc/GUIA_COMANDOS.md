# 📜 Guía Maestra de Comandos - Ceveco

Esta guía recopila TODOS los comandos utilizados en el proyecto Ceveco, organizados por categoría. Úsala como referencia rápida para saber qué comando usar, cuándo y para qué sirve.

## 🚀 Desarrollo Diario (Backend y Frontend)

Estos son los comandos que usarás más frecuentemente mientras programas.

| Comando | Dónde ejecutarlo | Descripción | Cuándo usarlo |
| :--- | :--- | :--- | :--- |
| `npm run dev` | Carpeta `backend/` | Inicia el servidor backend en modo desarrollo con **recarga automática** (Nodemon). | **Siempre** que estés desarrollando el backend. Si cambias código, el servidor se reinicia solo. |
| `npm start` | Carpeta `backend/` | Inicia el servidor backend en modo producción (sin recarga automática). | Principalmente para probar cómo correrá en un servidor real, o si no necesitas que se reinicie al guardar. |
| `npm install` | Carpeta `backend/` | Instala todas las dependencias listadas en `package.json`. | La primera vez que descargas el proyecto o si se agregaron nuevas librerías. |

> **Nota sobre el Frontend:** El frontend es estático y no requiere comandos de compilación (como `npm run build`). Para ver los cambios, simplemente usa "Live Server" en VS Code o un comando como `npx http-server frontend` y recarga la página en el navegador.

## 🗄️ Base de Datos (PostgreSQL)

Comandos para gestionar la base de datos `ceveco_db`.

| Comando | Descripción | Cuándo usarlo |
| :--- | :--- | :--- |
| `psql -U postgres -f bd.sql` | Ejecuta el script SQL completo para crear/reiniciar la base de datos y sus tablas. | Cuando inicias el proyecto por primera vez o si necesitas **limpiar y restaurar** la base de datos a su estado original (¡Cuidado, borra datos!). |
| `psql -U postgres` | Entra a la consola interactiva de PostgreSQL. | Cuando quieres hacer consultas manuales (`SELECT`, `INSERT`, etc.) directamente en la DB. |
| `\c ceveco_db` | (Dentro de psql) Conecta a la base de datos del proyecto. | Inmediatamente después de entrar a `psql` para trabajar sobre la DB correcta. |


## 🌍 Despliegue en VPS (Producción)

Aquí están todos los comandos necesarios para administrar el servidor real (Linux/Ubuntu).

### 🔧 Mantenimiento del Sistema (Linux)

| Comando | Descripción | Cuándo usarlo |
| :--- | :--- | :--- |
| `ssh usuario@tu-ip` | Conectarse al servidor remoto. | Para entrar a administrar tu VPS desde tu computadora. |
| `sudo apt update && sudo apt upgrade -y` | Actualiza la lista de paquetes y el sistema operativo. | Siempre que entras al servidor para mantenerlo seguro. |
| `sudo apt install nodejs npm git nginx -y` | Instala lo básico: Node, NPM, Git y Nginx. | La primera vez que configuras un servidor vacío (Setup Manual). |

### 🚀 Despliegue Tradicional (PM2 + Nginx)

Si NO usas Docker y prefieres correr Node directamente, usarás **PM2** para que el servidor no se apague.

| Comando | Descripción | Cuándo usarlo |
| :--- | :--- | :--- |
| `npm install -g pm2` | Instala el gestor de procesos PM2 globalmente. | Solo una vez al configurar el servidor. |
| `pm2 start backend/index.js --name "ceveco-api"` | Inicia el backend y le pone un nombre. | La primera vez que arrancas la aplicación. |
| `pm2 restart ceveco-api` | Reinicia el backend. | **Cada vez que subes cambios** al código del backend (`git pull`). |
| `pm2 stop ceveco-api` | Detiene el backend. | Si necesitas apagar el servidor temporalmente. |
| `pm2 list` | Muestra qué procesos están corriendo. | Para verificar si tu API sigue viva. |
| `pm2 logs` | Muestra los logs en vivo. | Para ver errores en producción (lo que no ves en consola). |
| `pm2 startup` | Genera el script para iniciar automático al prender el PC. | Al terminar de configurar todo, para que sobreviva a reinicios. |
| `sudo systemctl restart nginx` | Reinicia el servidor web Nginx. | Si cambiaste la configuración de dominios o proxy. |

### 🔄 Flujo de Actualización Manual

Pasos para actualizar tu código en producción sin romper nada:

1.  `git pull origin main` (Trae el código nuevo)
2.  `npm install` (Instala nuevas dependencias si las hay)
3.  `pm2 restart ceveco-api` (Reinicia el servidor)

## 🐳 Docker y Despliegue (Contenedores)

La forma moderna y recomendada. El archivo `docker-compose.yml` hace todo el trabajo "sucio" por ti.

> **Nota:** Con este método, NO necesitas instalar Node ni PM2 en el servidor, solo Docker.

| Comando | Dónde ejecutarlo | Descripción | Cuándo usarlo |
| :--- | :--- | :--- | :--- |
| `docker-compose up --build -d` | Raíz del proyecto | **El Comando Maestro**. Construye (`--build`), crea y prende (`up`) los contenedores en segundo plano (`-d`). | Para iniciar el proyecto O para actualizarlo después de un `git pull`. |
| `docker-compose down` | Raíz del proyecto | Detiene y **borra** los contenedores y redes. | Para apagar todo por completo. |
| `docker-compose ps` | Raíz del proyecto | Lista los contenedores activos y su estado. | Para ver si el servidor (backend) y la BD están "Up". |
| `docker-compose logs -f app` | Raíz del proyecto | Muestra los logs en vivo del backend. | Vital para ver errores de la API en tiempo real. |
| `docker exec -t ceveco-db pg_dumpall -c -U postgres > backup.sql` | Raíz | Crea un **Backup** completo de la base de datos. | Antes de hacer cambios peligrosos o periódicamente por seguridad. |
| `docker exec -it ceveco-db psql -U postgres -d ceveco_db` | Raíz | Entra a la consola SQL dentro del contenedor. | Para consultas manuales rápidas. |

## 🧪 Pruebas (Testing)


Comandos para verificar que todo funciona correctamente (Quality Assurance).

| Comando | Dónde ejecutarlo | Descripción | Cuándo usarlo |
| :--- | :--- | :--- | :--- |
| `npx playwright test` | Raíz del proyecto | Ejecuta **todos** los tests End-to-End (E2E) en modo "headless" (sin abrir navegador). | Antes de subir cambios para asegurar que no rompiste nada importante. |
| `npx playwright test --ui` | Raíz del proyecto | Abre una **interfaz visual** interactiva para correr y depurar los tests. | Cuando estás creando nuevos tests o depurando uno que falla. Es muy visual y útil. |
| `npm test` | Carpeta `backend/` | Ejecuta los tests unitarios del backend (si los hay configurados con Jest). | Para probar lógica específica del servidor (funciones, API, etc.). |
| `npx playwright install` | Raíz del proyecto | Instala los navegadores necesarios para Playwright. | La primera vez que configuras el entorno de pruebas. |

## 🛠️ Utilidades y Mantenimiento

Comandos para tareas de mantenimiento, optimización y configuración de datos.

| Comando | Dónde ejecutarlo | Descripción | Cuándo usarlo |
| :--- | :--- | :--- | :--- |
| `node backend/scripts/optimize-images.js` | Raíz del proyecto | **Optimizador de Imágenes (Avanzado)**. Usa la librería `sharp` para redimensionar imágenes grandes (>1000px) y crear versiones `.webp` optimizadas en `frontend/assets/img`. | Recomendado. Ejecútalo después de agregar nuevas imágenes de producto o banners para mejorar el rendimiento del sitio. |
| `.\optimize_images.ps1` | Raíz del proyecto (PowerShell) | Script alternativo de PowerShell para optimización básica. | Si no tienes configurado `sharp` en el backend o prefieres usar herramientas nativas de Windows. |
| `node backend/seed_sedes.js` | Raíz del proyecto | **Semilla de Datos (Sedes)**. Inserta o actualiza la información de las sedes (tiendas) en la base de datos. | Si la tabla `sedes` está vacía o si necesitas resetear la información de las tiendas a los valores por defecto. |
| `python -m http.server 5500` | Carpeta `frontend/` | Inicia un servidor web simple con Python en el puerto 5500. | Si no tienes VS Code con Live Server y quieres probar el frontend localmente. |
| `npx http-server frontend -p 5500`| Raíz del proyecto | Inicia un servidor web simple con Node.js en el puerto 5500. | Alternativa a Python/Live Server para servir el frontend. |

## ⚠️ Solución de Problemas Comunes

*   **Error: "command not found" o "no se reconoce como un comando"**:
    *   Asegúrate de estar en la carpeta correcta (`cd backend` o `cd frontend`).
    *   Verifica que tienes instalado Node.js, Python o PostgreSQL según el comando.
    *   Si es un script `.ps1`, asegúrate de usar PowerShell y que las políticas de ejecución lo permitan (`Set-ExecutionPolicy RemoteSigned` si es necesario, aunque `powershell -ExecutionPolicy Bypass` suele funcionar).

*   **Error de conexión a DB**:
    *   Verifica que PostgreSQL esté corriendo (`services.msc` en Windows).
    *   Revisa que tus credenciales en `backend/.env` sean correctas.
