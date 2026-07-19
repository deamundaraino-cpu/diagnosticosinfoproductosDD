// Prepara la cuenta de MailerLite para el nurture del diagnóstico:
// crea los campos custom (ruta, fase, score) y los 2 grupos (uno por ruta),
// e imprime los IDs de grupo para pegar en las variables de entorno.
//
// Uso: MAILERLITE_API_KEY=xxx node scripts/setup-mailerlite.mjs
//      (o con la key ya en .env.local: npm run setup:mailerlite)
import { readFileSync } from "node:fs";

function cargarEnv() {
  try {
    const contenido = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const linea of contenido.split("\n")) {
      const match = linea.match(/^([A-Z_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  } catch {
    // sin .env.local: usar variables del entorno
  }
}

cargarEnv();

const API_KEY = process.env.MAILERLITE_API_KEY;
if (!API_KEY) {
  console.error("Falta MAILERLITE_API_KEY (en .env.local o como variable de entorno)");
  process.exit(1);
}

const BASE = "https://connect.mailerlite.com/api";
const cabeceras = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function api(ruta, opciones = {}) {
  const res = await fetch(`${BASE}${ruta}`, { headers: cabeceras, ...opciones });
  const cuerpo = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, cuerpo };
}

// --- Campos custom (para segmentar y personalizar en MailerLite) ---
const CAMPOS = [
  { name: "ruta", type: "text" },
  { name: "fase", type: "text" },
  { name: "score", type: "text" },
];

const { cuerpo: camposExistentes } = await api("/fields?limit=100");
const nombresExistentes = new Set(
  (camposExistentes.data ?? []).map((c) => c.key ?? c.name?.toLowerCase())
);

for (const campo of CAMPOS) {
  if (nombresExistentes.has(campo.name)) {
    console.log(`✓ Campo "${campo.name}" ya existe`);
    continue;
  }
  const { ok, status, cuerpo } = await api("/fields", {
    method: "POST",
    body: JSON.stringify(campo),
  });
  if (ok) console.log(`✓ Campo "${campo.name}" creado`);
  else console.error(`✗ Campo "${campo.name}": HTTP ${status}`, cuerpo.message ?? "");
}

// --- Grupos por ruta (disparan las automatizaciones de nurture) ---
const GRUPOS = [
  { nombre: "Diagnóstico — Ruta A (ya vende)", env: "MAILERLITE_GROUP_A" },
  { nombre: "Diagnóstico — Ruta B (aún no lanza)", env: "MAILERLITE_GROUP_B" },
];

const { cuerpo: gruposExistentes } = await api("/groups?limit=100");
const porNombre = new Map((gruposExistentes.data ?? []).map((g) => [g.name, g.id]));

const resultado = [];
for (const grupo of GRUPOS) {
  let id = porNombre.get(grupo.nombre);
  if (id) {
    console.log(`✓ Grupo "${grupo.nombre}" ya existe (id ${id})`);
  } else {
    const { ok, status, cuerpo } = await api("/groups", {
      method: "POST",
      body: JSON.stringify({ name: grupo.nombre }),
    });
    if (!ok) {
      console.error(`✗ Grupo "${grupo.nombre}": HTTP ${status}`, cuerpo.message ?? "");
      continue;
    }
    id = cuerpo.data.id;
    console.log(`✓ Grupo "${grupo.nombre}" creado (id ${id})`);
  }
  resultado.push(`${grupo.env}=${id}`);
}

console.log("\n=== Pegar en .env.local y en Vercel (Production) ===");
for (const linea of resultado) console.log(linea);
