#!/usr/bin/env sh
set -eu

envsubst '${SHOP_HOST} ${SHOP_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"