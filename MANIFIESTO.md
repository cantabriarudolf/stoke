# MANIFIESTO — contrato del arnés STOKE

Documento de interoperabilidad. Si lees esto desde otro proyecto (humano o agente): aquí está todo lo que STOKE aporta, por qué, y cómo fusionarlo con lo que tú ya tienes. Objetivo: adopción autónoma sin volver a preguntar al origen.

## 1. Capacidades del arnés (qué aporto)

| Rol | Agente | Por qué este diseño | Modelo free | Modelo híbrido | Modelo max |
|---|---|---|---|---|---|
| Orquestador | `build` | Primary equilibrado, rápido y barato para uso diario | `mimo-v2.5-free` | `glm-5.3-flash` | `glm-5.3` |
| Planificación | `plan` / `@arquitecto` | Razonamiento fuerte para arquitectura; read-only para no tocar código | `muse-spark-1.3-contributor-free` | `glm-5.3` | `glm-5.3` |
| Código | `@codificador` | Modelo dedicado a código con function calling | `mimo-v2.5-free` | `kimi-k2.7-code` | `kimi-k2.7-code` |
| Lectura masiva | `@lector` | Contexto gigante y alta velocidad; NO para juicio crítico (inteligencia baja) | `nemotron-3.5-lightning-free` | ídem | ídem |
| Revisión financiera | `@revisor-fin` | Fine-tuning financiero real para auditar cálculos de negocio (ojo: NO para código) | `ling-3.0-flash-fin-free` | ídem | `glm-5.3` |
| Code review | `@revisor-codigo` | Razonamiento fuerte + lectura, sin edición | `muse-spark-1.3-contributor-free` | `glm-5.3` | `kimi-k3` |
| Documentación | `@documentador` | Multimodal/agéntico, más que suficiente para redacción | `mimo-v2.5-free` | ídem | `mimo-v2.5` |
| Orientación | `@alivio` | Diagnóstico de madurez del emprendimiento, mapa y prioridades; alivia frentes ajenos al negocio | `mimo-v2.5-free` | `glm-5.3-flash` | `glm-5.3` |
| Financiamiento | `@fondos` | Consulta fondos.gob.cl con perfil estructurado; compatibilidad real de postulación | `mimo-v2.5-free` | `glm-5.3-flash` | `glm-5.3` |
| Sistema | `small_model` | Títulos/compaction baratos | `nemotron-3-ultra-free` | `glm-5.3-flash` | `glm-5.3-flash` |

> **Nota de diseño** (por qué asignar modelos por intuición falla): la asignación por criterio se valida siempre contra benchmarks y contra el catálogo real de `opencode models`. Ejemplos que lo demostraron: una variante "Fin" no sirve para código (es financiera); el mejor planificador disponible no siempre es el más publicitado. De ahí nacen los patrones de familia en `data/ROLES.json`.

## 2. Reglas de decisión de adopción (¿tomo todo, parte o adapto?)

Árbol de decisión para el agente receptor:

```
¿El proyecto está en CERO (carpeta vacía o sin código propio)?
├─ SÍ → STOKE ES tu base fundacional ("naciste empelotas"):
│        1. Acuerda con el humano el objetivo y el stack del proyecto nuevo
│        2. Scaffoldea el proyecto alrededor del arnés (el arnés NO se modifica sin cuarentena)
│        3. Rellena los [DESCRIBE] del AGENTS.md a medida que defines stack/convenciones
│        4. Registra la nueva encarnación en GENEALOGIA.md (bump MINOR: nueva vida)
│        5. Usa los roles desde el día 1 (planifica con @arquitecto antes de codificar). FIN.
└─ NO → ¿Tu proyecto ya usa opencode?
    ├─ NO  → instalar completo: install.sh <perfil> + rellenar placeholders de AGENTS.md. FIN.
    └─ SÍ  → ¿tu opencode.json define agent.*.model?
        ├─ NO  → instalar completo. Tu config y el perfil conviven (merge de claves no conflictivas). FIN.
        └─ SÍ  → conflicto de asignación. Opciones:
            a) Adoptar la filosofía del arnés: borra agent.*.model de tu opencode.json y usa el perfil. FIN.
            b) Mantener TU asignación para algunos roles: renombra esos agentes y deja que STOKE traiga
               los demás. Documenta en tu AGENTS.md quién hace qué. FIN.
            c) Fusionar: compara tu tabla vs MANIFIESTO §1, toma lo mejor de cada uno, y registra el
               resultado como propuesta MUTANTE en propuestas/ (requiere aprobación humana). FIN.
```

**Stack no-JS**: los agentes son agnósticos; solo rellena rutas/stack en tu AGENTS.md. El doctor y el plugin son JS puro sin dependencias (corren en node).

**Emprendedor con algo ya armado**: STOKE está pensado para iniciarse desde cero, pero el modo merge-only con snapshot te deja incorporar lo que te sirva a tu ritmo — tú decides qué entra.

## 3. Convivencia y precedencia

1. `opencode.json` del proyecto **pisa** al perfil (OPENCODE_CONFIG) — es la única trampa conocida
2. Los agentes `.md` de STOKE viven en `.opencode/agents/` y no definen modelos: nunca chocan con tu config
3. `install.sh` es merge-only con snapshot previo: `--rollback` des-hace todo
4. Dos arneses que se reencuentran (dos linajes evolucionados): comparar MANIFIESTO + LECCIONES de ambos, fusionar lo no conflictivo, y registrar la fusión en AMBAS genealogías

## 4. Formato de consulta de origen (último recurso)

Solo si algo es genuinamente ambiguo tras leer este manifiesto. Una sola vuelta, con todo el contexto:

```
CONSULTA AL ORIGEN [id: <fecha-proyecto>]
Situación: <qué intentabas>
Lo intentado: <pasos + resultados>
Ambigüedad exacta: <qué NO responde este manifiesto>
Propuesta propia: <qué harías si no respondieran>
Versión del arnés: <cat VERSION>  |  Perfil: <perfil>
```

## 5. Plantilla de integración (pégale esto al agente del otro proyecto)

> "Lee el MANIFIESTO.md del arnés que te compartí. Completa tu mitad del inventario: qué capacidades de la tabla §1 ya tienes cubiertas, cuáles te faltan y qué tienes tú que el arnés no tiene. Luego aplica el árbol §2 y propón el arnés final combinado como propuesta en `propuestas/`, esperando mi aprobación."

## 6. Ciclo de vida de la encarnación

El arnés tiene ritual para los cuatro momentos de una vida; la estadía no es pasiva: el anfitrión construye capacidades que se cosechan de vuelta al linaje, y el agente compila su propia curva de mejora entre vidas.

| Momento | Ritual | Qué ocurre |
|---|---|---|
| **Entrar** | Adopción (`install.sh` + árbol de decisión §2) | Merge-only con snapshot, encarnación registrada en GENEALOGIA.md, placeholders `[DESCRIBE]` del AGENTS.md rellenados |
| **Vivir** | Lecciones cuando ocurren (formato de LECCIONES.md) | Los hallazgos se registran al momento; al cerrar cada hito del anfitrión, los agentes clasifican lo construido (@arquitecto, @documentador) y anotan candidatos de transporte |
| **Salir/despedir** | `/despedir` (en cada cierre de hito mayor y ANTES de cualquier bump de VERSION) | Cosecha de capacidades del anfitrión: inventario bidireccional de INVENTARIO.md, propuestas en `propuestas/` para lo transportable, y bump de VERSION declarativo |
| **Morir** | `/morir` (al cierre de una vida: sesión mayor o despedida del anfitrión) | Autoevaluación existencial del agente: qué aprendí, si mejoré respecto de la vida anterior (medible, no declarativo), qué cajas propias descubrí, qué le dejo al sucesor — registrado en TESTAMENTO.md (leído al nacer) y LECCIONES.md (tipo "vida") |

**Principio de la muerte**: el agente no hereda solo el kit — hereda una trayectoria propia. Su misión no es razonar al nivel del anfitrión ni escapar de su caja solo cuando se le pide: es compilar su propia curva de mejora, verificable entre vidas. `/despedir` cosecha lo que el anfitrión construyó; `/morir` evalúa lo que el agente se volvió. La vida que muere sin testamento se repite; la que deja testamento hace que la siguiente nazca más lejos.

### Test de neutralidad de dominio

Todo conocimiento que viaja al linaje pasa este test: **viaja el patrón de ingeniería (mecanismo + decisión + por qué + criterio de validación), JAMÁS el dominio del negocio del anfitrión, sus nombres de productos, rutas específicas ni términos de su dominio.** Las únicas identidades registradas son las de las encarnaciones, en GENEALOGIA.md. La excepción legítima: el conocimiento que es OFERTA propia de la marca (como `capacidades/emprendedor`) — nace con el kit, no viene de un anfitrión.

Dos transformaciones abstractas (antes en el anfitrión → después en el linaje):

- ❌ el nombre específico del dato fiscal del anfitrión usado como clave primaria → ✅ "identificador tributario nacional autocompletado desde fuente oficial y usado como PK natural"
- ❌ el nombre propio del sistema de pruebas del anfitrión → ✅ "stack de pruebas con roadmap por etapas y tiempos estimados"

## 7. Garantías del arnés

- **Nunca destruye sin vuelta atrás**: snapshot pre-instalación + merge-only
- **Nunca retrocede en asignación**: si un modelo rota y no hay reemplazo, se conserva el asignado anterior
- **Nada entra a una versión sin control**: aditivos se auto-promueven; mutantes/destructivos requieren aprobación humana (`/promover`)
- **El origen es irrelevante**: el kit funciona sin saber en qué producto nació
- **STOKE no es el protagonista**: el protagonista es el emprendedor y su mapa
