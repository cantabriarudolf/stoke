# CAPACIDAD QA — metodología de pruebas en 3 capas con recorrido narrativo

Módulo transportable: primer caso de uso del mecanismo de cosecha `/despedir` (v0.3.0).
Este módulo habla de "el anfitrión" y "sus módulos": los nombres concretos los aterriza
CADA anfitrión en SU `qa-config.json` (el kit no conoce ningún dominio).

## Qué aporta

Metodología QA en 3 capas:

1. **Unit/integración** — sin navegador, rápidas, primera línea de detección.
2. **E2E** — navegador real, multi-cuenta (sesiones simultáneas de usuarios distintos).
3. **Recorrido narrativo del run** — la corrida como viaje por etapas: plan de etapas con
   estimados (minutosBase × factor de carga de máquina), pausas para observar, notas
   persistentes del humano, chispas de intuición por etapa con línea histórica de fallos,
   y roadmap visual con estados y progreso en vivo.

## Las 3 memorias (diseño del sistema)

| Memoria | Qué guarda | Quién la alimenta |
|---|---|---|
| Baselines por etapa | duración esperada por etapa, recalibrada con cada corrida real | la máquina |
| Notas por etapa | observaciones persistentes sobre cada etapa | el humano |
| Chispas curadas + histórico | intuiciones por etapa + línea histórica de fallos | la experiencia destilada |

## Cómo se configura en un anfitrión nuevo

Cada anfitrión rellena SU `.opencode/qa-config.json` con SUS módulos: etapas, nombres,
chispas, comandos, globs de specs y estimados base. La plantilla completa está en
[SKILL-pruebas.md](SKILL-pruebas.md) — la skill la ofrece automáticamente si no existe.

## Qué NO transporta este módulo

Las vistas web del anfitrión que lo originó (dashboards de estado, roadmap visual en vivo)
y sus reporters de navegador: quedan como implementación de referencia de ese anfitrión.
El módulo transporta el **método** + la **skill** + el **formato de config**.

## Requisitos del anfitrión

- Corredor de pruebas con modo **navegador real** (e2e) además de unit/integración
- Capacidad de **reporter custom** (opcional: solo para el modo en vivo / recorrido narrativo)
