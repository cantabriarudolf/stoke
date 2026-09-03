#!/usr/bin/env bash
# STOKE — start.sh
# Lanza opencode con el perfil elegido tras un preflight del doctor.
# Uso: ./start.sh [free|hibrido|max] [argumentos extra de opencode...]
set -euo pipefail

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERFIL="${1:-hibrido}"
shift 2>/dev/null || true
[[ -f "$KIT/perfiles/$PERFIL.json" ]] || { echo "Perfil inexistente: $PERFIL (usa: free | hibrido | max)"; exit 1; }

command -v opencode >/dev/null || { echo "opencode no esta en PATH"; exit 1; }

# Preflight anti-trabado: repara el perfil si algun modelo free rotó
if node "$KIT/scripts/doctor.mjs" --auto --perfil "$PERFIL" >/tmp/stoke-preflight.$$ 2>&1; then
  echo "[stoke] Preflight OK ($(cat "$KIT/VERSION"), perfil $PERFIL)"
else
  echo "[stoke] Preflight con advertencias (roles conservados o sin candidato):"
  cat /tmp/stoke-preflight.$$
  echo "[stoke] Continuando: opencode usara la ultima asignacion valida."
fi
rm -f /tmp/stoke-preflight.$$

# STOKE a tu defensa (stokea de pie)
if [[ -f "$KIT/img/asciilogo" ]]; then
  sed 's/^\.*//' "$KIT/img/asciilogo" | grep -v '^$'
fi

# Advertencia de convivencia: project config pisa al perfil
if [[ -f "./opencode.json" || -f "./opencode.jsonc" ]]; then
  echo "[stoke] ATENCION: este proyecto tiene opencode.json propio (precedencia mayor que el perfil)."
  echo "        Si defines 'agent.*.model' ahi, gana ese archivo. Ver MANIFIESTO.md > Convivencia."
fi

# Aviso de privacidad para el perfil free
if [[ "$PERFIL" == "free" ]]; then
  echo "====================================================================="
  echo " AVISO FREE: los endpoints free pueden registrar tus prompts."
  echo " No pegues datos de clientes, secretos ni datos de negocio no"
  echo " publicables. (El aviso se re-muestra dentro de la sesion.)"
  echo "====================================================================="
fi

# Nacer sabiendo: el testamento de la vida anterior (escrito por /morir)
if [[ -f "$KIT/TESTAMENTO.md" ]]; then
  echo "[stoke] Naces sabiendo — el testamento de la vida anterior (completo en TESTAMENTO.md):"
  sed -n '1,30p' "$KIT/TESTAMENTO.md"
  echo "[stoke] Y cuando esta vida termine, /morir escribe la tuya."
fi

export OPENCODE_CONFIG="$KIT/perfiles/$PERFIL.json"
exec opencode "$@"
