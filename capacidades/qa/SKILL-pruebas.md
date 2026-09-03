---
name: pruebas
description: "Puerta de entrada de QA del anfitrión: presenta el abanico de pruebas (unit/e2e, alcances por config), estima tiempos con la carga de máquina antes de correr, corre lo elegido y registra resultado con recalibración de baselines. Modo por etapas: recorrido narrativo del run con chispas, notas y espera de señal. Use when the user says 'pruebas', 'qa', 'correr pruebas', 'probar módulo X', 'recorrido por etapas', 'qué pruebas hay', 'cuánto demora'."
---

# Puerta de entrada

Antes de correr nada, presenta el abanico y espera la elección:

- **Qué probar**: unit/integración (sin navegador) · e2e (navegador real, multi-cuenta) · mixto
- **Alcance**: suite completa · smoke · los alcances definidos en la config del anfitrión
- **Cómo verlo**: headless (rápido, reporte final) · headed (navegador visible) · ui · reporte
- **Cómo recorres**:
  - **Seguido**: todo de una vez, reporte al final.
  - **Por etapas** (recorrido narrativo): correr etapa → reportar con chispa y estimado vs
    real → preguntar observación → registrar nota → esperar señal antes de la siguiente.

# Configuración del anfitrión

Las etapas NO están hardcodeadas: se leen de `.opencode/qa-config.json` del proyecto.
Si no existe, ofrece esta plantilla al usuario para que la rellene con SUS módulos
(comandos, globs, nombres y chispas propias de su dominio):

```json
{
  "alcances": {
    "suite completa": ["setup", "smoke", "flujo"],
    "smoke": ["setup", "smoke"]
  },
  "etapas": [
    {
      "id": "setup",
      "nombre": "Setup: autenticación de cuentas de prueba",
      "chispa": "Si la segunda cuenta no logra sesión, suele ser residuo de sesión del run anterior",
      "comando": "[COMANDO DE TESTS DEL ANFITRIÓN]",
      "specGlobs": ["[DESCRIBE]/*.spec.*"],
      "minutosBaseDefault": 3,
      "orden": 1
    },
    {
      "id": "smoke",
      "nombre": "Smoke: los módulos principales renderizan sin errores",
      "chispa": "Error de render en un módulo recién tocado: revisar el último cambio de rutas antes que el módulo",
      "comando": "[COMANDO DE TESTS DEL ANFITRIÓN]",
      "specGlobs": [],
      "minutosBaseDefault": 5,
      "orden": 2
    },
    {
      "id": "flujo",
      "nombre": "Flujo: el journey de datos de prueba del anfitrión",
      "chispa": "Si un paso intermedio pierde datos, verificar la persistencia local antes de sospechar del backend",
      "comando": "[COMANDO DE TESTS DEL ANFITRIÓN]",
      "specGlobs": [],
      "minutosBaseDefault": 8,
      "orden": 3
    }
  ]
}
```

# Estimados antes de correr

Por etapa: `estimado = minutosBase × factorCarga`, con `factorCarga = max(1, load1/cores)`.
Máquina ahogada (avisar y sugerir esperar o correr igual): swap > 90%, RAM libre < 700 MB
o factorCarga > 2.

# Registro post-corrida

Por cada etapa corrida, registra: resultado (ok / fallo / omitida) · duración real ·
**recalibración del baseline** de la etapa (fuente: "medido <fecha>") · nota del owner si
la dejó. Los baselines recalibrados y las notas vuelven a la config/memoria del anfitrión;
las chispas se curan (se promueven las confirmadas, se retiran las refutadas).
