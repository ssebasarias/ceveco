#!/usr/bin/env bash
# =============================================================================
# init-letsencrypt.sh
# Emite el certificado SSL inicial vía HTTP-01 challenge.
#
# Estrategia (chicken-and-egg):
#   1. Crea un certificado AUTO-FIRMADO temporal para que nginx arranque
#      con su config HTTPS sin fallar.
#   2. Levanta nginx (atiende /.well-known/acme-challenge/ por puerto 80).
#   3. Borra el cert dummy y pide el real a Let's Encrypt vía certbot.
#   4. Reload de nginx para que tome el cert real.
#
# Sólo se corre UNA vez (la primera). Las renovaciones las hace el contenedor
# `certbot` automáticamente cada 12h (renueva si <30 días para expirar).
#
# Variables esperadas:
#   DOMAIN          dominio principal (ej. ceveco.com.co)
#   CERTBOT_EMAIL   email de aviso de Let's Encrypt
#   STAGING         si =1, usa el staging de Let's Encrypt (sin rate-limits)
# =============================================================================

set -euo pipefail

# Cargar .env si existe
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    . .env
    set +a
fi

DOMAIN="${DOMAIN:?DOMAIN no seteado (ej: ceveco.com.co)}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:?CERTBOT_EMAIL no seteado}"
STAGING="${STAGING:-0}"

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "▶ Init Let's Encrypt para $DOMAIN (staging=$STAGING)"

# ---------------------------------------------------------------------------
# 1) Si ya existe el cert real, salir
# ---------------------------------------------------------------------------
if $COMPOSE run --rm --entrypoint sh certbot \
        -c "[ -d /etc/letsencrypt/live/$DOMAIN ] && [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]" \
        2>/dev/null; then
    echo "✓ Certificado para $DOMAIN ya existe. No hago nada."
    exit 0
fi

# ---------------------------------------------------------------------------
# 2) Cert DUMMY (self-signed) para que nginx arranque
# ---------------------------------------------------------------------------
echo "▶ Generando cert temporal self-signed (1 día)..."
$COMPOSE run --rm --entrypoint sh certbot -c "
    mkdir -p /etc/letsencrypt/live/$DOMAIN &&
    apk add --no-cache openssl >/dev/null 2>&1 || true &&
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out    /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj  '/CN=$DOMAIN' &&
    echo 'cert dummy listo'
"

# Si el dominio en nginx config no coincide, sustituirlo (un único punto de cambio)
if ! grep -q "$DOMAIN" nginx/conf.d/ceveco.conf; then
    echo "▶ Sustituyendo dominio en nginx/conf.d/ceveco.conf → $DOMAIN"
    sed -i "s/ceveco\.com\.co/$DOMAIN/g" nginx/conf.d/ceveco.conf
fi

# ---------------------------------------------------------------------------
# 3) Levantar nginx (con cert dummy) y db, app
# ---------------------------------------------------------------------------
echo "▶ Levantando stack (db + app + nginx) ..."
$COMPOSE up -d db app nginx
sleep 5

# ---------------------------------------------------------------------------
# 4) Pedir cert real a Let's Encrypt
# ---------------------------------------------------------------------------
echo "▶ Solicitando certificado real a Let's Encrypt..."

STAGING_ARG=""
if [ "$STAGING" = "1" ]; then
    STAGING_ARG="--staging"
    echo "  (usando staging — el cert NO será confiable en navegadores)"
fi

# Borrar el dummy primero (certbot rechaza overwrite sin --force-renewal)
$COMPOSE run --rm --entrypoint sh certbot -c "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf"

$COMPOSE run --rm --entrypoint certbot certbot \
    certonly --webroot -w /var/www/certbot \
    --email "$CERTBOT_EMAIL" \
    --agree-tos --no-eff-email \
    $STAGING_ARG \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --rsa-key-size 4096 \
    --force-renewal

# ---------------------------------------------------------------------------
# 5) Reload nginx para que tome el cert nuevo
# ---------------------------------------------------------------------------
echo "▶ Recargando nginx..."
$COMPOSE exec nginx nginx -s reload

# ---------------------------------------------------------------------------
# 6) Levantar certbot (loop de renovación)
# ---------------------------------------------------------------------------
$COMPOSE up -d certbot

echo "✓ Listo. https://$DOMAIN debería estar activo en ~30 segundos."
echo "  Logs nginx:  docker compose -f docker-compose.prod.yml logs -f nginx"
echo "  Logs cert:   docker compose -f docker-compose.prod.yml logs -f certbot"
