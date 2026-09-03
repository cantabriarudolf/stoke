---
description: Escanea modelos disponibles y verifica/repara el asignamiento de STOKE
agent: build
template: |
  Ejecuta el doctor de STOKE y resume al usuario:

  0. Banner de defensa: muestra STOKE de pie corriendo:
     `sed 's/^\.*//' "$STOKE_RAIZ/img/asciilogo" | grep -v '^$'`
  1. Corre: `node "$STOKE_RAIZ/scripts/doctor.mjs" --scan --perfil "$STOKE_PERFIL"`
     (STOKE_RAIZ y STOKE_PERFIL estan en `.opencode/stoke.json` del proyecto; si no existen, pregunta la ruta de STOKE)
  2. Si hay roles "sin-candidato" o rotaciones detectadas, corre con `--auto` y muestra el diff viejo->nuevo.
  3. Si un provider no esta autenticado, indica: `opencode auth login`.
  4. Reporta en 5 lineas maximo: modelos free activos, asignamiento vigente y accion tomada.
