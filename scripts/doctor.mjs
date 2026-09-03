#!/usr/bin/env node
/**
 * STOKE — doctor
 * Escanea los modelos disponibles, asigna roles por perfil y gestiona la
 * promocion controlada de propuestas (anti-retroceso).
 *
 * Uso:
 *   node scripts/doctor.mjs                       # escaneo + reporte (sin escribir)
 *   node scripts/doctor.mjs --scan --perfil hibrido
 *   node scripts/doctor.mjs --auto  --perfil free # repara perfiles con lo disponible
 *   node scripts/doctor.mjs promover              # lista propuestas pendientes
 *   node scripts/doctor.mjs promover --mantener  <id>   # aplica (mutantes: requiere cambios[])
 *   node scripts/doctor.mjs promover --descartar <id> "<motivo>"
 */
import { execFileSync } from "node:child_process";
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, renameSync,
  readdirSync, statSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const hoy = () => new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
const sub = args[0] && !args[0].startsWith("--") ? args[0] : null;
const flag = (n) => args.includes(n);
const valorDe = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

const leerJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const escribirJson = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + "\n");

function version() {
  return readFileSync(join(RAIZ, "VERSION"), "utf8").trim();
}

// ---------- descubrimiento de modelos ----------
function listarModelos() {
  try {
    const out = execFileSync("opencode", ["models"], { encoding: "utf8", timeout: 60000 });
    return out.split("\n")
      .map((l) => l.trim())
      .filter((l) => /^[a-z0-9][a-z0-9-]*\/[A-Za-z0-9._:-]+$/.test(l));
  } catch (e) {
    process.stderr.write("[doctor] No pude ejecutar `opencode models`: " + e.message + "\n");
    return [];
  }
}

const esFree = (id) => /(:free|-free|free)$/i.test(id);

// ---------- resolucion de roles ----------
function resolverRol(rol, perfil, modelos) {
  const def = ROLES.roles[rol];
  if (!def) return { rol, modelo: null, estado: "sin-definicion", fuente: null };
  for (const cand of def.candidatos || []) {
    if (!(cand.perfiles || []).includes(perfil)) continue;
    for (const id of cand.exacto || []) {
      if (modelos.includes(id)) return { rol, modelo: id, estado: "ok", fuente: "exacto" };
    }
    for (const re of cand.patron || []) {
      const hit = modelos.find((m) => new RegExp(re).test(m));
      if (hit) return { rol, modelo: hit, estado: "ok", fuente: `patron:${re}` };
    }
  }
  return { rol, modelo: null, estado: "sin-candidato", fuente: null };
}

// ---------- escaneo / asignamiento ----------
function perfilActual(perfil) {
  const p = join(RAIZ, "perfiles", `${perfil}.json`);
  return existsSync(p) ? leerJson(p) : {};
}

function escanear(perfil, auto) {
  const modelos = listarModelos();
  if (!modelos.length) {
    console.error("[doctor] 0 modelos detectados — revisa `opencode auth login` o tu instalacion.");
    process.exit(2);
  }
  const roles = Object.keys(ROLES.roles);
  const resueltos = roles.map((r) => resolverRol(r, perfil, modelos));
  const actuales = perfilActual(perfil);
  const rotaciones = [];
  const faltantes = [];

  for (const r of resueltos) {
    const antes = r.rol === "build"
      ? actuales?.model
      : r.rol === "small_model"
        ? actuales?.small_model
        : actuales?.agent?.[r.rol]?.model;
    if (r.estado === "ok") {
      if (antes && antes !== r.modelo && !modelos.includes(antes)) {
        rotaciones.push({ rol: r.rol, antes, ahora: r.modelo });
      }
    } else {
      faltantes.push(r.rol);
      if (antes) r.modelo = antes; // anti-retroceso: conservar asignacion previa
      r.estado = antes ? "conservado-anterior" : "sin-candidato";
    }
  }

  // reporte
  const lineas = [];
  lineas.push(`STOKE doctor — perfil: ${perfil} — version: ${version()} — ${hoy()}`);
  lineas.push(`Modelos detectados: ${modelos.length} (free: ${modelos.filter(esFree).length})`);
  lineas.push("");
  for (const r of resueltos) {
    const marca = r.estado === "ok" ? "OK " : r.estado === "conservado-anterior" ? "!  " : "X  ";
    lineas.push(`${marca} ${r.rol.padEnd(16)} ${r.modelo || "(sin candidato)"}  [${r.fuente || "-"}]`);
  }
  if (rotaciones.length) {
    lineas.push("", "Rotaciones detectadas (modelo free reemplazado):");
    for (const t of rotaciones) lineas.push(`  - ${t.rol}: ${t.antes} -> ${t.ahora}`);
  }
  if (faltantes.length) {
    lineas.push("", `Roles sin candidato disponible en este perfil: ${faltantes.join(", ")}`);
    lineas.push(auto ? "Se CONSERVO la asignacion anterior (anti-retroceso)." : "Corre con --auto para reasignar lo que se pueda.");
  }
  const reporte = lineas.join("\n");
  console.log(reporte);

  if (auto) {
    // reconstruir perfil conservando claves ajenas ($comment, etc.)
    const nuevo = { ...actuales };
    nuevo.$schema = "https://opencode.ai/config.json";
    nuevo.model = resueltos.find((r) => r.rol === "build")?.modelo || actuales.model;
    nuevo.small_model = resueltos.find((r) => r.rol === "small_model")?.modelo || actuales.small_model;
    nuevo.agent = { ...(actuales.agent || {}) };
    for (const r of resueltos) {
      if (["build", "small_model"].includes(r.rol)) continue;
      if (r.modelo) nuevo.agent[r.rol] = { model: r.modelo };
    }
    escribirJson(join(RAIZ, "perfiles", `${perfil}.json`), nuevo);
    regenerarInventario(perfil, modelos, resueltos);
    if (rotaciones.length) registrarLecciones(rotaciones, perfil);
    console.log(`\n[doctor] Perfil ${perfil}.json actualizado e INVENTARIO.md regenerado.`);
    if (faltantes.length) console.log("[doctor] ATENCION: hubo roles sin candidato (conservados). Revisa el reporte.");
  }
  process.exit(faltantes.length ? 1 : 0);
}

function regenerarInventario(perfil, modelos, resueltos) {
  const libres = modelos.filter(esFree);
  const cuerpo = [
    `# INVENTARIO — snapshot de modelos free activos`,
    "",
    `- Fecha: ${hoy()}  |  Version stoke: ${version()}  |  Perfil activo: ${perfil}`,
    `- Total modelos detectados: ${modelos.length} (free: ${libres.length})`,
    "",
    "## Free disponibles ahora",
    ...libres.map((m) => `- \`${m}\``),
    "",
    "## Asignamiento vigente",
    ...resueltos.map((r) => `- ${r.rol}: \`${r.modelo || "-"}\` (${r.fuente || r.estado})`),
    "",
  ];
  writeFileSync(join(RAIZ, "INVENTARIO.md"), cuerpo.join("\n"));
}

function registrarLecciones(rotaciones, perfil) {
  const filas = rotaciones.map((t) =>
    `| ${hoy()} | rotacion-modelo | Perfil \`${perfil}\`: \`${t.antes}\` ya no existe; \`${t.rol}\` reasignado a \`${t.ahora}\` | Patrón de familia en ROLES.json absorbió el cambio sin intervención |`
  );
  appendFileSync(join(RAIZ, "LECCIONES.md"), filas.join("\n") + "\n");
}

// ---------- promocion de propuestas (anti-retroceso) ----------
const dirProp = () => join(RAIZ, "propuestas");

function propuestasPendientes() {
  const d = dirProp();
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ archivo: f, ...leerJson(join(d, f)) }))
    .filter((p) => p.estado === "pendiente");
}

function promover(argv) {
  const pend = propuestasPendientes();
  const mantener = valorDe("--mantener");
  const descartar = valorDe("--descartar");

  if (descartar) {
    const p = pend.find((x) => x.id === descartar);
    if (!p) return salir(`No hay propuesta pendiente con id ${descartar}`, 1);
    p.estado = "rechazada";
    p.motivo_rechazo = argv[argv.indexOf(descartar) + 1] || "sin motivo registrado";
    p.fecha_rechazo = hoy();
    escribirJson(join(dirProp(), p.archivo), p);
    renameSync(join(dirProp(), p.archivo), join(dirProp(), "rechazadas", p.archivo));
    return salir(`Propuesta ${descartar} ARCHIVADA en rechazadas/ con motivo: "${p.motivo_rechazo}"`, 0);
  }

  if (mantener) {
    const p = pend.find((x) => x.id === mantener);
    if (!p) return salir(`No hay propuesta pendiente con id ${mantener}`, 1);
    // verificacion anti-retroceso: contra la version base declarada
    if (p.baseVersion && p.baseVersion !== version()) {
      console.log(`[promover] ATENCION: propuesta declarada sobre base ${p.baseVersion}, actual es ${version()}. Revisa el diff antes de aplicar.`);
    }
    const cambios = p.cambios || [];
    if (!cambios.length) {
      p.estado = "mantiene";
      p.fecha_mantenimiento = hoy();
      p.nota = "registrada sin cambios de archivo (criterio/leccion)";
      escribirJson(join(dirProp(), p.archivo), p);
      bumpPatch(`propuesta ${p.id} mantenida: ${p.titulo || p.situacion || ""}`);
      return salir(`Propuesta ${mantener} registrada como mantenida.`, 0);
    }
    for (const c of cambios) {
      const ruta = join(RAIZ, c.archivo);
      const txt = readFileSync(ruta, "utf8");
      const oc = txt.split(c.buscar).length - 1;
      if (oc !== 1) return salir(`Cambio ambiguo en ${c.archivo} (ocurrencias de 'buscar': ${oc}). Ajusta la propuesta.`, 1);
      writeFileSync(ruta + ".bak-promover", txt); // backup
      writeFileSync(ruta, txt.replace(c.buscar, c.reemplazar));
    }
    p.estado = "mantiene";
    p.fecha_mantenimiento = hoy();
    escribirJson(join(dirProp(), p.archivo), p);
    bumpPatch(`propuesta ${p.id} aplicada: ${p.titulo || p.situacion || ""}`);
    return salir(`Propuesta ${mantener} APLICADA (backups .bak-promover junto a cada archivo).`, 0);
  }

  // listado
  if (!pend.length) return salir("No hay propuestas pendientes. Nada en cuarentena.", 0);
  console.log(`Propuestas pendientes (version actual: ${version()}):\n`);
  for (const p of pend) {
    console.log(`[${p.tipo || "aditivo"}] ${p.id}`);
    console.log(`  base: ${p.baseVersion || "?"} | origen: ${p.origen || "?"} | fecha: ${p.fecha || "?"}`);
    console.log(`  situacion: ${p.situacion || "-"}`);
    if (p.propuesta) console.log(`  propuesta: ${p.propuesta}`);
    if (p.cambios?.length) console.log(`  archivos afectados: ${p.cambios.map((c) => c.archivo).join(", ")}`);
    console.log("");
  }
  console.log("Aplicar:  node scripts/doctor.mjs promover --mantener <id>");
  console.log("Rechazar: node scripts/doctor.mjs promover --descartar <id> \"motivo\"");
}

function bumpPatch(nota) {
  const [a, b, c] = version().split(".").map(Number);
  const nv = `${a}.${b}.${c + 1}`;
  writeFileSync(join(RAIZ, "VERSION"), nv + "\n");
  appendFileSync(
    join(RAIZ, "GENEALOGIA.md"),
    `| ${hoy()} | ${nv} | ${nota} | encarnación actual |\n`
  );
  console.log(`[promover] VERSION -> ${nv}; GENEALOGIA.md actualizada.`);
}

function salir(msg, code) { console.log(msg); process.exit(code); }

// ---------- principal ----------
const ROLES = leerJson(join(RAIZ, "data", "ROLES.json"));
const perfil = valorDe("--perfil") || "hibrido";

if (sub === "promover") promover(args);
else escanear(perfil, flag("--auto"));
