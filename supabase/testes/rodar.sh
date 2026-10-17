#!/usr/bin/env bash
# Roda as regras de acesso de supabase/schema.sql num Postgres local descartável.
# Uso: supabase/testes/rodar.sh   (precisa de postgres 16 instalado; roda como o usuário "postgres")
set -euo pipefail
cd "$(dirname "$0")"
BIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)
DIR=$(mktemp -d); chmod 777 "$DIR"
trap 'su postgres -c "$BIN/pg_ctl -D $DIR/d stop -m immediate" >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
su postgres -c "$BIN/initdb -D $DIR/d -A trust" >/dev/null
su postgres -c "$BIN/pg_ctl -D $DIR/d -o '-p 5499 -k $DIR' -l $DIR/log -w start" >/dev/null
PSQL="psql -h $DIR -p 5499 -U postgres -q -v ON_ERROR_STOP=1"
$PSQL -d postgres -c "create database mesa" >/dev/null
$PSQL -d mesa -f stub-auth.sql >/dev/null
$PSQL -d mesa -f ../schema.sql >/dev/null
SAIDA=$(psql -h "$DIR" -p 5499 -U postgres -d mesa -q -f permissoes.sql 2>&1 | grep -E "^(OK|FALHA|RESUMO)|ERROR" || true)
echo "$SAIDA"
if grep -qE "^FALHA|ERROR" <<<"$SAIDA" || ! grep -q "^RESUMO" <<<"$SAIDA"; then exit 1; fi
