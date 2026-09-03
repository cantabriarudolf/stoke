<h1 align="center">STOKE</h1>

<p align="center">
  <img src="img/stokea.png" alt="STOKE — la herramienta de campo" width="260"/>
</p>

<p align="center"><strong>Construir. Adaptar. Defender.</strong></p>

<p align="center">Arnés táctico de agentes para emprendedores que construyen, se adaptan y compiten con IA.</p>

<p align="center"><em>Tu filo en la frontera de la IA.</em></p>

<p align="center"><strong>No elegante. Ingenierizada.</strong> · <strong>Nada de magia. Ingeniería.</strong></p>

---

## La idea central

El mundo de la IA cambió las reglas. Las grandes empresas tienen equipos, presupuesto y acceso a herramientas sofisticadas. El emprendedor muchas veces se enfrenta a ese cambio con recursos limitados.

STOKE es su **herramienta de campo**.

No promete magia. No pretende ser elegante. No oculta la complejidad. La mascota lo dice todo: **un cuchillo hecho con una regla** — la *choreza ingenierística*: ingenio + ingeniería + pragmatismo + capacidad de adaptación. No necesitas tener la herramienta perfecta. Necesitas saber construir una que funcione.

**STOKE no es el protagonista.** El protagonista es el emprendedor y su mapa. STOKE es la herramienta que lleva en el cinturón: mientras tú vendes, defiende lo que nadie mira — tu contexto, tus modelos, tu configuración y tus frentes ajenos al negocio.

---

## Construir

Instalación en 30 segundos, con snapshot previo (nunca destruye sin vuelta atrás):

```bash
# 1. Obtener el kit
git clone <URL-DE-STOKE> stoke

# 2. Instalar en tu proyecto
cd tu-proyecto
bash /ruta/stoke/install.sh free

# 3. Iniciar sesión (preflight + STOKE a tu defensa)
bash /ruta/stoke/start.sh free
```

- **Proyecto en cero**: STOKE detecta greenfield y se convierte en tu base fundacional (crea tu `AGENTS.md` para que lo rellenes)
- **Proyecto existente**: instala en modo *merge* — nunca sobrescribe lo que ya tienes; si ya tienes algo armado, tú decides qué incorporar
- **Equipo de 8 roles**: cada agente con el modelo correcto para su tarea

| Rol | Agente | Para qué |
|---|---|---|
| Orquestación diaria | `build` / `plan` | Primary con todo acceso / planificación rápida |
| Planificación | `@arquitecto` | Planifica y desglosa; nunca implementa (read-only) |
| Código | `@codificador` | Implementa y valida |
| Lectura masiva | `@lector` | Archivos enormes, dumps, HTML: extracción mecánica |
| Revisión financiera | `@revisor-fin` | Audita cálculos y lógica de negocio |
| Code review | `@revisor-codigo` | Hallazgos priorizados, sin editar |
| Documentación | `@documentador` | Docs y bitácoras |
| Orientación | `@alivio` | "¿Dónde estoy?": diagnóstico de madurez, mapa y prioridades del emprendimiento |
| Financiamiento | `@fondos` | Consulta fondos.gob.cl y responde con qué fondo te conviene y qué te falta |

## Adaptar

Los modelos free **rotan** (versiones nuevas reemplazan a las viejas). STOKE lo absorbe solo:

- **Preflight** en cada `start.sh`: repara el perfil si un modelo desapareció (los roles sin reemplazo **conservan su asignación anterior** — nunca retroceden a algo peor)
- **En sesión**: el plugin escucha `session.error`; si es rotación → corre el doctor solo y prepara el reintento; si es cuota/auth → te avisa que NO es rotación
- **Manual**: `/doctor` en sesión, o `node <raiz>/scripts/doctor.mjs --scan --perfil free`

**Perfiles de costo** — cambia entre sesiones con `start.sh <perfil>`:

| Perfil | Qué usa | Para quién |
|---|---|---|
| `free` | Solo modelos free (rate-limited, aviso de privacidad) | Emprender sin gastar |
| `hibrido` **(default)** | Roles críticos de pago; lectura/docs/free en free | Uso diario |
| `max` | Máxima calidad en cada rol | Trabajo crítico |

Los modelos **no** viven en los agentes sino en los perfiles (`perfiles/*.json`), definidos por **patrones de familia** que sobreviven rotaciones de versiones.

## Defender

- **Cuarentena anti-retroceso**: los cambios aditivos se auto-promueven; los mutantes/destructivos quedan aislados en `propuestas/` esperando tu aprobación (`/promover`)
- **Snapshot / rollback**: `install.sh` guarda el estado pre-existente; `--rollback` des-hace todo
- **Aviso de privacidad (free)**: los endpoints free pueden registrar prompts — el plugin te lo muestra una vez por sesión. Regla de oro: nada de datos de clientes, secretos ni datos de negocio no publicables
- **Neutralidad de dominio**: lo que viaja entre proyectos es el patrón de ingeniería (mecanismo + decisión + por qué), jamás el dominio de tu negocio

## Ciclo de vida (rituales)

| Momento | Ritual | Qué ocurre |
|---|---|---|
| **Entrar** | `install.sh` | Snapshot, inventario cruzado, encarnación registrada en GENEALOGIA.md |
| **Vivir** | Lecciones al momento | `LECCIONES.md` acumula lo aprendido; cada hito clasifica candidatos de transporte |
| **Salir** | `/despedir` | Cosecha: lo que construyó el anfitrión vuelve al linaje (pasando el test de neutralidad) |
| **Morir** | `/morir` | Autoevaluación existencial del agente → carta en `TESTAMENTO.md` (se lee al nacer: *naces sabiendo*) |

## Capacidades transportables

Conocimiento empaquetado que viaja entre proyectos:

```bash
bash install.sh free . --capacidad qa           # QA en 3 capas con recorrido narrativo
bash install.sh free . --capacidad emprendedor  # primera línea de defensa del emprendedor
```

- **`qa`** — metodología de pruebas en 3 capas (unit/e2e/recorrido narrativo con estimados)
- **`emprendedor`** — el sistema de orientación: diagnóstico de madurez (¿sobrevives, operas o escalas?), mapa de 7 zonas (formalización, presencia, venta, captación, operación, automatización, financiamiento), checklist brutal de formalización (SII, RUT, DTE, IVA, patente), stack *rata emprendedor* (cuánto puedes construir sin gastar) y copiloto de fondos públicos (🟢🟡🔴 compatibilidad real, no una lista de 147 convocatorias)

## FAQ — los modos de fallo

| Síntoma | Causa | Solución |
|---|---|---|
| Subagente falla "model not found" | Modelo free rotado | El plugin lo repara solo; si no: `/doctor` |
| Respuestas se cuelgan / errores 429 | Cuota del free tier agotada | Esperar o cambiar de perfil (`start.sh hibrido`) |
| Errores de autenticación | Provider sin login | `opencode auth login` |
| El perfil no se aplica | El proyecto tiene `opencode.json` con `agent.*.model` | Precedencia: project config > perfil. Ver MANIFIESTO > Convivencia |

## Requisitos

- [opencode](https://opencode.ai) instalado
- `opencode auth login` (al menos el provider del modelo primary de tu perfil)
- `node` en PATH (el doctor y el preflight lo usan)

## Reencarnación (cadena de favores)

Este kit **mejora en cada proyecto donde vive**: las lecciones se acumulan en `LECCIONES.md`, cada snapshot de modelos queda en `INVENTARIO.md`, cada vida se registra en `GENEALOGIA.md` y cada agente muere dejando carta en `TESTAMENTO.md`. Cuando tu versión acumule aprendizajes: bump de versión, push, y comparte tu link — la próxima persona nace sabiendo lo que tú viviste.

**Adoptante nuevo**: lee `MANIFIESTO.md` — reglas de decisión para tomar todo o parte, convivencia con tu config existente, y el formato de consulta si algo es genuinamente ambiguo.
