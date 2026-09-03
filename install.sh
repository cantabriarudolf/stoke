#!/usr/bin/env bash
# STOKE — install.sh
# Instala el arnes en un proyecto anfitrion con snapshot previo (rollback garantizado).
# Uso:
#   ./install.sh [perfil] [raiz-proyecto]     # default: hibrido, directorio actual
#   ./install.sh [perfil] [raiz] --capacidad qa        # instala tambien capacidades transportables
#   ./install.sh --rollback                   # restaura el snapshot mas reciente
set -euo pipefail

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERFIL="${1:-hibrido}"
DEST="${2:-$PWD}"

if [[ "$PERFIL" == "--rollback" ]]; then
  BACKUP="$(ls -1d "$DEST"/.opencode/backup-pre-stoke/* 2>/dev/null | sort | tail -1)"
  [[ -z "$BACKUP" ]] && { echo "No hay snapshots en $DEST/.opencode/backup-pre-stoke/"; exit 1; }
  cp -a "$BACKUP/." "$DEST/"
  echo "[stoke] Restaurado snapshot: $BACKUP (des-encarnacion completa)"
  exit 0
fi

[[ -f "$KIT/perfiles/$PERFIL.json" ]] || { echo "Perfil inexistente: $PERFIL (usa: free | hibrido | max)"; exit 1; }
[[ "$DEST" != "$KIT" ]] || { echo "ERROR: no puedes instalar STOKE sobre si mismo (DEST == KIT)"; exit 1; }
echo "[stoke] Instalando en: $DEST (perfil: $PERFIL, arnes v$(cat "$KIT/VERSION"))"

# Capacidades opcionales transportables: ./install.sh <perfil> [raiz] --capacidad <nombre>
CAPACIDADES=()
extra=("$@")
if [[ ${#extra[@]} -ge 2 ]]; then extra=("${extra[@]:2}"); else extra=(); fi
i=0
while [[ $i -lt ${#extra[@]} ]]; do
  case "${extra[$i]}" in
    --capacidad)
      val="${extra[$((i+1))]:-}"
      [[ -n "$val" ]] || { echo "ERROR: --capacidad requiere un nombre (ej: --capacidad qa)"; exit 1; }
      DISP="$(ls -1 "$KIT/capacidades" 2>/dev/null | paste -sd ' ' - || true)"
      [[ -d "$KIT/capacidades/$val" ]] || { echo "Capacidad inexistente: $val (disponibles: ${DISP:-ninguna})"; exit 1; }
      CAPACIDADES+=("$val")
      i=$((i+2));;
    *) echo "Argumento no reconocido: ${extra[$i]} (uso: --capacidad <nombre>)"; exit 1;;
  esac
done

# Deteccion de proyecto en cero: STOKE sera la base fundacional
EN_CERO=0
[[ ! -f "$DEST/AGENTS.md" && ! -f "$DEST/package.json" && ! -d "$DEST/src" && ! -d "$DEST/app" && ! -d "$DEST/lib" ]] && EN_CERO=1
if [[ $EN_CERO -eq 1 ]]; then
  echo "[stoke] PROYECTO EN CERO detectado: STOKE sera tu BASE FUNDACIONAL."
  echo "        Scaffoldea el proyecto alrededor del arnes y rellena el AGENTS.md a medida que definas stack/convenciones."
  echo "        (Arbol de decision completo: MANIFIESTO.md §2, rama 'proyecto en cero')"
fi

# 1) SNAPSHOT del estado pre-existente (nunca destruir sin vuelta atras)
FECHA=$(date +%Y%m%d-%H%M%S)
BACKUP="$DEST/.opencode/backup-pre-stoke/$FECHA"
mkdir -p "$BACKUP"
for item in opencode.json opencode.jsonc AGENTS.md .opencode/agents .opencode/plugins .opencode/commands; do
  [[ -e "$DEST/$item" ]] && mkdir -p "$BACKUP/$(dirname "$item")" && cp -a "$DEST/$item" "$BACKUP/$item" && echo "  snapshot: $item"
done
echo "[stoke] Snapshot en: $BACKUP (rollback: ./install.sh --rollback)"

# 2) Instalacion en modo merge: NO sobrescribe agentes/comandos existentes
mkdir -p "$DEST/.opencode/agents" "$DEST/.opencode/plugins" "$DEST/.opencode/commands"
instalar_si_falta() {
  local src="$1" dst="$2"
  if [[ -e "$dst" ]]; then
    echo "  ya existe (intacto): ${dst#$DEST/}"
  else
    cp -a "$src" "$dst" && echo "  instalado: ${dst#$DEST/}"
  fi
}
for a in "$KIT"/agents/*.md;   do instalar_si_falta "$a" "$DEST/.opencode/agents/$(basename "$a")"; done
instalar_si_falta "$KIT/plugins/stoke-doctor.js" "$DEST/.opencode/plugins/stoke-doctor.js"
for c in "$KIT"/commands/*.md; do instalar_si_falta "$c" "$DEST/.opencode/commands/$(basename "$c")"; done
instalar_si_falta "$KIT/perfiles/$PERFIL.json" "$DEST/.opencode/perfil-stoke.json"
for cap in "${CAPACIDADES[@]:-}"; do
  [[ -z "$cap" ]] && continue
  mkdir -p "$DEST/.opencode/capacidades"
  cp -a "$KIT/capacidades/$cap" "$DEST/.opencode/capacidades/"
  echo "  instalada capacidad: $cap"
done

# 3) Identidad de la encarnacion (el plugin y los comandos la leen)
cat > "$DEST/.opencode/stoke.json" <<EOF
{
  "raiz": "$KIT",
  "perfil": "$PERFIL",
  "version": "$(cat "$KIT/VERSION")",
  "instalado": "$(date +%F)"
}
EOF
echo "  instalado: .opencode/stoke.json"

# 4) Bloque plantilla para el AGENTS.md del anfitrion (idempotente)
AGENTS="$DEST/AGENTS.md"
if [[ ! -f "$AGENTS" ]]; then
  printf '# AGENTS.md — %s\n\nGenerado por STOKE. Proyecto en cero: este arnes es la base fundacional;\nscaffoldea el proyecto y documenta aqui el stack, convenciones y datos sensibles.\n' "$(basename "$DEST")" > "$AGENTS"
  echo "  creado: AGENTS.md (base fundacional del proyecto en cero)"
fi
if ! grep -q "stoke:inicio" "$AGENTS" 2>/dev/null; then
  cat >> "$AGENTS" <<'EOF'

<!-- stoke:inicio -->
## STOKE (arnes tactico de agentes)

- Arranque recomendado: `bash <RAIZ_DE_STOKE>/start.sh <perfil>` (preflight + perfil activo)
- Roles disponibles: @arquitecto @codificador @lector @revisor-fin @revisor-codigo @documentador @alivio @fondos
- Si un subagente falla con errores de modelo: NO reintentar a ciegas; correr el doctor (`/doctor`)
- STOKE no es el protagonista: el emprendedor y su mapa lo son
- Contexto de ESTE proyecto (rellenar):
  - Stack y rutas de código: [DESCRIBE]
  - Convenciones críticas: [DESCRIBE o referencia a secciones superiores]
  - Rutas de documentación: [DESCRIBE]
  - Datos que NUNCA deben salir a modelos free: [DESCRIBE]
<!-- stoke:fin -->
EOF
  echo "  actualizado: AGENTS.md (bloque plantilla agregado — rellena los [DESCRIBE])"
fi

if [[ $EN_CERO -eq 1 ]]; then
  sed -i 's/- Contexto de ESTE proyecto (rellenar):/- Contexto de ESTE proyecto (proyecto EN CERO: defínelo tú a medida que scaffoldeas):/' "$AGENTS"
fi

# 5) STOKE a tu defensa
if [[ -f "$KIT/img/asciilogo" ]]; then
  sed 's/^\.*//' "$KIT/img/asciilogo" | grep -v '^$' || true
fi
DISP="$(ls -1 "$KIT/capacidades" 2>/dev/null | paste -sd ' ' - || true)"
echo ""
echo "[stoke] Listo. Iniciar sesion con:"
echo "  bash \"$KIT/start.sh\" $PERFIL"
echo "Capacidades transportables disponibles: ${DISP:-ninguna} (--capacidad <nombre>)"
echo "Verificacion posterior: /doctor  |  Cuarentena: /promover"
