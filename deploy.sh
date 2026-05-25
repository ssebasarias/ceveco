#!/usr/bin/env bash
# =============================================================================
# Ceveco — script de deploy / redeploy a producción
#
# Uso:
#   ./deploy.sh              # redeploy estándar (pull, deps, migrations, restart)
#   ./deploy.sh --first      # primera instalación: incluye crear BD y servicio systemd
#   ./deploy.sh --no-restart # actualiza código sin reiniciar el servicio
#
# Prerequisitos en el servidor (instalar UNA sola vez antes del primer deploy):
#   sudo apt update
#   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
#   sudo apt install -y nodejs postgresql nginx certbot python3-certbot-nginx git
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Configuración (ajustar antes del primer deploy o vía variables de entorno)
# -----------------------------------------------------------------------------
APP_DIR="${CEVECO_APP_DIR:-/var/www/ceveco}"
SERVICE_NAME="${CEVECO_SERVICE:-ceveco}"
DB_NAME="${DB_NAME:-ceveco_db}"
DB_USER="${DB_USER:-postgres}"
APP_USER="${CEVECO_APP_USER:-ceveco}"
NODE_PORT="${PORT:-3000}"

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
log()   { printf "\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()    { printf "\033[1;32m✓ %s\033[0m\n" "$*"; }
warn()  { printf "\033[1;33m⚠ %s\033[0m\n" "$*"; }
die()   { printf "\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

need() {
    command -v "$1" >/dev/null 2>&1 || die "Falta comando: $1. Instálalo y vuelve a ejecutar."
}

# -----------------------------------------------------------------------------
# Parse flags
# -----------------------------------------------------------------------------
FIRST_INSTALL=0
NO_RESTART=0
for arg in "$@"; do
    case "$arg" in
        --first)      FIRST_INSTALL=1 ;;
        --no-restart) NO_RESTART=1 ;;
        -h|--help)
            grep '^#' "$0" | head -30
            exit 0
            ;;
        *) die "Flag desconocida: $arg" ;;
    esac
done

# -----------------------------------------------------------------------------
# Validaciones
# -----------------------------------------------------------------------------
log "Validando entorno..."
need git
need node
need npm
need psql

[ -d "$APP_DIR" ] || die "No existe $APP_DIR. Cloná el repo ahí primero o ajustá CEVECO_APP_DIR."

cd "$APP_DIR"
[ -d "backend" ] && [ -d "frontend" ] || die "Estructura inesperada en $APP_DIR (faltan backend/ o frontend/)."

# Verificar .env del backend
if [ ! -f "backend/.env" ]; then
    die "Falta backend/.env. Copialo desde .env.example y configurá DB_*, JWT_SECRET, EMAIL_*."
fi

ok "Entorno OK"

# -----------------------------------------------------------------------------
# 1. First-install only: crear BD y restaurar backup
# -----------------------------------------------------------------------------
if [ "$FIRST_INSTALL" -eq 1 ]; then
    log "Primera instalación — preparando BD..."

    sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
        || sudo -u postgres createdb "$DB_NAME"

    # Si hay bd.sql en el repo, lo aplicamos (estructura inicial + datos seed)
    if [ -f "bd.sql" ]; then
        log "Aplicando bd.sql (estructura inicial)..."
        sudo -u postgres psql -d "$DB_NAME" -f bd.sql
    fi

    # Crear usuario del sistema si no existe
    if ! id "$APP_USER" >/dev/null 2>&1; then
        log "Creando usuario del sistema $APP_USER..."
        sudo useradd --system --shell /usr/sbin/nologin --home "$APP_DIR" "$APP_USER"
        sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    fi

    ok "BD y usuario preparados"
fi

# -----------------------------------------------------------------------------
# 2. Pull cambios
# -----------------------------------------------------------------------------
log "Pulling cambios desde main..."
git fetch --quiet
git checkout main
git pull --ff-only
ok "Repo actualizado a $(git log -1 --format='%h %s')"

# -----------------------------------------------------------------------------
# 3. Dependencias backend + frontend
# -----------------------------------------------------------------------------
log "Instalando dependencias backend..."
(cd backend && npm ci --omit=dev)
ok "Backend deps OK"

log "Instalando dependencias frontend + compilando Tailwind..."
(cd frontend && npm ci && npm run build:css)
ok "Frontend deps + CSS compilado"

# -----------------------------------------------------------------------------
# 4. Migraciones SQL (orden alfanumérico, idempotentes)
# -----------------------------------------------------------------------------
log "Aplicando migraciones..."
if [ -d "migrations" ]; then
    for f in migrations/*.sql; do
        [ -f "$f" ] || continue
        log "  → $f"
        sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$f" >/dev/null
    done
    ok "Migraciones aplicadas"
else
    warn "No hay carpeta migrations/, saltando."
fi

# -----------------------------------------------------------------------------
# 5. Permisos sobre uploads
# -----------------------------------------------------------------------------
if [ -d "backend/public/images" ]; then
    sudo chown -R "$APP_USER:$APP_USER" backend/public/images || true
fi

# -----------------------------------------------------------------------------
# 6. systemd service (solo en primera instalación)
# -----------------------------------------------------------------------------
if [ "$FIRST_INSTALL" -eq 1 ]; then
    log "Configurando systemd service..."
    sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" >/dev/null <<EOF
[Unit]
Description=Ceveco Node.js Backend
After=network.target postgresql.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}/backend
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=${NODE_PORT}

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    ok "Servicio $SERVICE_NAME registrado"
fi

# -----------------------------------------------------------------------------
# 7. Restart service
# -----------------------------------------------------------------------------
if [ "$NO_RESTART" -eq 0 ]; then
    log "Reiniciando servicio $SERVICE_NAME..."
    sudo systemctl restart "$SERVICE_NAME"
    sleep 2
    sudo systemctl is-active --quiet "$SERVICE_NAME" \
        && ok "Servicio activo" \
        || die "El servicio no quedó activo. Revisar: journalctl -u $SERVICE_NAME -n 50"
else
    warn "--no-restart pasado: NO reiniciamos $SERVICE_NAME"
fi

# -----------------------------------------------------------------------------
# 8. Health check
# -----------------------------------------------------------------------------
log "Health check..."
sleep 1
if curl -fsS "http://127.0.0.1:${NODE_PORT}/api/v1/productos?limit=1" >/dev/null; then
    ok "API responde 200"
else
    warn "API no responde en :${NODE_PORT}. Logs: journalctl -u $SERVICE_NAME -f"
fi

echo
ok "Deploy completado."
echo "  Commit:    $(git log -1 --format='%h %s')"
echo "  Logs:      sudo journalctl -u ${SERVICE_NAME} -f"
echo "  Reiniciar: sudo systemctl restart ${SERVICE_NAME}"
