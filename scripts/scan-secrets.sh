#!/usr/bin/env sh
# Escaner de secretos para CI (ver AGENTS.md §11).
# Uso: sh scripts/scan-secrets.sh
# Sale con codigo distinto de 0 si encuentra un patron de secreto real.
# No reemplaza un escaner dedicado (p.ej. gitleaks) si el repo crece.

set -u

# Excluimos .env.example: sus valores son placeholders de documentacion,
# no credenciales reales (--exclude compara el nombre base del archivo).
FAIL=0

pipe_scan() {
  pattern="$1"
  description="$2"
  results="$(grep -nIE "$pattern" -r \
    --exclude=.env.example \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=.next \
    --exclude-dir=out \
    --exclude='*.tsbuildinfo' \
    . 2>/dev/null)"
  if [ -n "$results" ]; then
    echo "==> Posible secreto (${description}):"
    echo "$results" | head -n 20
    FAIL=1
  fi
}

# URL de proyecto Supabase real (ref de 20+ caracteres alfanumericos)
pipe_scan 'https://[a-z0-9]{20,}\.supabase\.(co|in)' "URL de proyecto Supabase"

# JWT real (anon/service-role de Supabase o cualquier JWT con header codificado)
pipe_scan 'eyJhbGciOi[A-Za-z0-9_-]{10,}' "JWT"

# Claves comunes de servicios
pipe_scan '(AKIA[0-9A-Z]{16})' "AWS Access Key ID"
pipe_scan '(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,})' "GitHub token"
pipe_scan '(sk_live_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})' "Stripe secret"
pipe_scan '(service_role|service_rol)[=:][A-Za-z0-9._-]{20,}' "service_role hardcodeada"
pipe_scan '(BEGIN (RSA|EC|OPENSSH )?PRIVATE KEY)' "bloque de clave privada"

if [ "$FAIL" -eq 0 ]; then
  echo "scan-secrets: OK, sin patrones de secretos."
else
  echo "scan-secrets: ENCONTRADOS patrones (revisar si son reales o falsos positivos)."
  exit 1
fi