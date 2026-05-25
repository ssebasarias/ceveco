#!/usr/bin/env bash
# =============================================================================
# Ceveco — deploy / redeploy a producción usando Docker
#
# Uso:
#   ./deploy.sh              # redeploy estándar: git pull, rebuild, restart
#   ./deploy.sh --first      # primera vez: levanta stack y emite cert HTTPS
#   ./deploy.sh --no-restart # actualizar imágenes sin tumbar la app
#   ./deploy.sh --logs       # ver logs en vivo del stack
#   ./deploy.sh --down       # parar todo (sin borrar volúmenes/datos)
#
# Prerequisitos en el servidor (instalar UNA sola vez):
#   - Docker Engine 24+ y Docker Compose v2
#       curl -fsSL https://get.docker.com | sh
#       sudo usermod -aG docker $USER  # logout/login después
#   - Git
#       sudo apt install -y git
#   - El dominio (DOMAIN en .env) debe apuntar al IP del servidor (DNS A record)
#     antes de correr --first (si no, certbot fallará el ACME challenge).
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Constantes
# -----------------------------------------------------------------------------
COMPOSE_FILE="docker-compose.prod.yml"
COMPOSE="docker compose -f $COMPOSE_FILE"

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
log()   { printf "\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()    { printf "\033[1;32m✓ %s\033[0m\n" "$*"; }
warn()  { printf "\033[1;33m⚠ %s\033[0m\n" "$*"; }
die()   { printf "\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

need() {
    command -v "$1" >/dev/null 2>&1 || die "Falta comando: $1"
}

# -----------------------------------------------------------------------------
# Parse flags
# -----------------------------------------------------------------------------
FIRST_INSTALL=0
NO_RESTART=0
SHOW_LOGS=0
DOWN=0
for arg in "$@"; do
    case "$arg" in
        --first)      FIRST_INSTALL=1 ;;
        --no-restart) NO_RESTART=1 ;;
        --logs)       SHOW_LOGS=1 ;;
        --down)       DOWN=1 ;;
        -h|--help)
            grep '^#' "$0" | head -25
            exit 0
            ;;
        *) die "Flag desconocida: $arg" ;;
    esac
done

# -----------------------------------------------------------------------------
# Modos cortos: --logs y --down
# -----------------------------------------------------------------------------
if [ "$SHOW_LOGS" -eq 1 ]; then
    exec $COMPOSE logs -f --tail=100
fi

if [ "$DOWN" -eq 1 ]; then
    log "Parando stack (datos preservados en volúmenes)..."
    $COMPOSE down
    ok "Stack detenido. Para borrar también volúmenes: $COMPOSE down -v"
    exit 0
fi

# -----------------------------------------------------------------------------
# Validaciones
# -----------------------------------------------------------------------------
log "Validando entorno..."
need docker
need git

# Comprobación de Docker Compose v2 (subcomando "compose")
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 no disponible. Reinstalá Docker."

[ -f "$COMPOSE_FILE" ] || die "No se encuentra $COMPOSE_FILE en el directorio actual."

# .env en la raíz: requerido para credenciales de prod
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        die "Falta .env. Copialo de .env.example y configurá DB_PASSWORD, JWT_SECRET, DOMAIN, CERTBOT_EMAIL, EMAIL_USER, EMAIL_PASS."
    fi
    die "Falta .env y .env.example no existe."
fi

# Cargar .env para validar variables críticas
set -a
# shellcheck disable=SC1091
. .env
set +a

: "${DB_PASSWORD:?Falta DB_PASSWORD en .env}"
: "${JWT_SECRET:?Falta JWT_SECRET en .env}"
: "${DOMAIN:?Falta DOMAIN en .env (ej: ceveco.com.co)}"

ok "Entorno OK (dominio: $DOMAIN)"

# -----------------------------------------------------------------------------
# Pull cambios
# -----------------------------------------------------------------------------
if [ -d ".git" ]; then
    log "Pulling cambios desde main..."
    git fetch --quiet
    git checkout main
    git pull --ff-only
    ok "Repo a $(git log -1 --format='%h %s')"
fi

# -----------------------------------------------------------------------------
# Primera instalación: cert HTTPS + carga BD
# -----------------------------------------------------------------------------
if [ "$FIRST_INSTALL" -eq 1 ]; then
    log "Primera instalación — build + cert SSL"

    : "${CERTBOT_EMAIL:?Falta CERTBOT_EMAIL en .env para emisión de cert}"

    # Construir imagen del app
    log "Build imagen Docker del app..."
    $COMPOSE build app

    # Bootstrap del cert (esto a su vez levanta db + app + nginx + certbot)
    log "Bootstrap SSL via Let's Encrypt..."
    bash nginx/init-letsencrypt.sh

    ok "Primera instalación completa."
else
    # ---------------------------------------------------------------------------
    # Redeploy normal
    # ---------------------------------------------------------------------------
    log "Build imagen del app..."
    $COMPOSE build app

    log "Aplicando migraciones (si las hay) contra la BD existente..."
    # Espera a que db esté arriba
    $COMPOSE up -d db
    # Esperar pg_isready
    for i in 1 2 3 4 5 6 7 8 9 10; do
        if $COMPOSE exec -T db pg_isready -U "${DB_USER:-postgres}" -d "${DB_NAME:-ceveco_db}" >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    # Aplicar migraciones idempotentes en orden alfabético
    if [ -d "migrations" ]; then
        for f in migrations/*.sql; do
            [ -f "$f" ] || continue
            log "  → migrations/$(basename "$f")"
            $COMPOSE exec -T db psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-ceveco_db}" -v ON_ERROR_STOP=1 < "$f" >/dev/null
        done
        ok "Migraciones aplicadas"
    fi

    if [ "$NO_RESTART" -eq 1 ]; then
        warn "--no-restart: imagen reconstruida pero NO se reinicia el stack"
        exit 0
    fi

    log "Recreando servicios con la imagen nueva..."
    $COMPOSE up -d
fi

# -----------------------------------------------------------------------------
# Health check final
# -----------------------------------------------------------------------------
log "Health check (esperando hasta 60s)..."
HEALTH_OK=0
for i in $(seq 1 30); do
    sleep 2
    if curl -fsSk "https://${DOMAIN}/api/v1/productos?limit=1" >/dev/null 2>&1 \
       || curl -fsS "http://localhost/api/v1/productos?limit=1" >/dev/null 2>&1; then
        HEALTH_OK=1
        break
    fi
done

if [ "$HEALTH_OK" = "1" ]; then
    ok "API responde. Deploy OK."
else
    warn "API no respondió en 60s. Revisar: ./deploy.sh --logs"
fi

echo
ok "Deploy completado."
echo "  URL:       https://$DOMAIN"
echo "  Logs:      ./deploy.sh --logs"
echo "  Parar:     ./deploy.sh --down"
echo "  Servicios: $COMPOSE ps"
