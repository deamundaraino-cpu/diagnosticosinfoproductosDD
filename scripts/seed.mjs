// Datos de prueba para QA del panel /admin: npm run seed
// Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

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

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const FASES = {
  A: [
    ["A1", 8, 13],
    ["A2", 14, 19],
    ["A3", 20, 24],
  ],
  B: [
    ["B1", 5, 8],
    ["B2", 9, 12],
    ["B3", 13, 14],
  ],
};
const CUELLOS = ["leads", "conversion", "retencion", "tiempo"];
const FRENOS = ["que_vender", "estructura", "miedo", "herramientas"];
const NOMBRES = ["Ana", "Luis", "Marta", "Jorge", "Sofía", "Pedro", "Lucía", "Andrés"];
const FUENTES = ["instagram", "tiktok", null];

const azar = (arr) => arr[Math.floor(Math.random() * arr.length)];
const entre = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const filas = [];
for (let i = 0; i < 28; i++) {
  const ruta = Math.random() < 0.6 ? "A" : "B";
  const [fase, min, max] = azar(FASES[ruta]);
  const score = entre(min, max);
  const conEmail = Math.random() < 0.7;
  const nombre = azar(NOMBRES);
  const haceDias = entre(0, 14);
  const fecha = new Date(Date.now() - haceDias * 86400000).toISOString();

  filas.push({
    token_resultado: `seed-${randomUUID()}`,
    nombre: conEmail ? nombre : null,
    email: conEmail ? `${nombre.toLowerCase()}${i}@ejemplo.com` : null,
    email_capturado_at: conEmail ? fecha : null,
    consentimiento: conEmail,
    consentimiento_at: conEmail ? fecha : null,
    fecha_creacion: fecha,
    ruta,
    fase,
    score_numerico: score,
    respuestas: [{ seed: true, nota: "registro de prueba" }],
    cuello_de_botella: ruta === "A" ? azar(CUELLOS) : null,
    freno_principal: ruta === "B" ? azar(FRENOS) : null,
    utm_source: azar(FUENTES),
    utm_campaign: Math.random() < 0.5 ? "lanzamiento-1" : null,
  });
}

const { error } = await supabase.from("diagnosticos").insert(filas);
if (error) {
  console.error("Error insertando seed:", error.message);
  process.exit(1);
}
console.log(`✓ ${filas.length} diagnósticos de prueba insertados.`);
console.log('Para limpiarlos: DELETE FROM diagnosticos WHERE token_resultado LIKE \'seed-%\';');
