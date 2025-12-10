# 🚀 Guía de Despliegue en Servidor (Docker)

Esta guía detalla cómo montar el proyecto **Ceveco** en un servidor de producción utilizando Docker y Docker Compose. Este es el método recomendado por su facilidad y robustez.

## 📋 Prerrequisitos del Servidor

El servidor (Ubuntu/Debian/CentOS/Windows Server) debe tener instalado:

1.  **Docker Engine:** [Guía oficial de instalación](https://docs.docker.com/engine/install/)
2.  **Docker Compose:** (Generalmente incluido con Docker Desktop o Docker Engine modernos).
3.  **Git:** Para clonar el repositorio.

## 🛠️ Paso a Paso para Desplegar

### 1. Clonar el Repositorio
Accede a tu servidor vía SSH y clona el proyecto:

```bash
git clone https://github.com/tu-usuario/ceveco.git
cd ceveco
```

### 2. Configurar Variables de Entorno (`.env`)
Docker necesita saber las contraseñas y configuraciones. Crea el archivo `.env` basándote en el ejemplo:

```bash
cp .env.example .env
nano .env  # O usa tu editor favorito
```

**Importante:** Asegúrate de cambiar `DB_HOST=db` en este archivo para producción, y usa contraseñas seguras.

### 3. Levantar los Servicios
Ejecuta el siguiente comando para construir la imagen y arrancar los contenedores en segundo plano:

```bash
docker-compose up --build -d
```

*   `--build`: Asegura que se compile la última versión del código.
*   `-d`: "Detached mode", corre en segundo plano para que no se cierre si cierras la terminal.

### 4. Verificar Estado
Comprueba que todo esté corriendo correctamente:

```bash
docker-compose ps
```
Deberías ver dos servicios (`ceveco-app` y `ceveco-db`) con estado "Up" o "Healthy".

Si necesitas ver los logs en tiempo real:
```bash
docker-compose logs -f
```

---

## 🔄 Actualizar el Proyecto
Cuando hagas cambios en el código y quieras subirlos al servidor:

1.  Descarga los cambios:
    ```bash
    git pull origin main
    ```
2.  Reconstruye y reinicia (sin tiempo de inactividad para la BD):
    ```bash
    docker-compose up --build -d
    ```

---

## 🗄️ Gestión de Base de Datos
La base de datos se inicializa automáticamente con `bd.sql` la primera vez. Los datos persisten en un volumen de Docker llamado `ceveco_pgdata`.

Si necesitas hacer un backup:
```bash
docker exec -t ceveco-db pg_dumpall -c -U postgres > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

Si necesitas entrar a la consola SQL:
```bash
docker exec -it ceveco-db psql -U postgres -d ceveco_db
```
