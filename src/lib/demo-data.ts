import type { FaseId, Ruta } from "@/content/tipos";

/**
 * Dataset de ejemplo para poder visualizar el panel /admin sin tener
 * Supabase conectado todavía. Generado con una semilla fija (mulberry32)
 * para que los números sean siempre los mismos entre recargas — no es
 * aleatorio en cada request, así el panel se ve estable mientras lo
 * revisas o navegas entre filtros.
 *
 * NUNCA se usa si Supabase está configurado — solo es el fallback
 * cuando SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no existen.
 */

export interface DiagnosticoDemo {
  id: string;
  nombre: string | null;
  email: string | null;
  fecha_creacion: string;
  ruta: Ruta;
  fase: FaseId;
  score_numerico: number;
}

export interface ResumenFaseDemo {
  ruta: Ruta;
  fase: FaseId;
  total: number;
  con_email: number;
  score_promedio: number;
}

const RANGOS: Record<Ruta, [FaseId, number, number][]> = {
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

const NOMBRES = [
  "Ana", "Luis", "Marta", "Jorge", "Sofía", "Pedro", "Lucía", "Andrés",
  "Camila", "Diego", "Valentina", "Felipe", "Daniela", "Santiago", "Carolina",
  "Mateo", "Isabella", "Julián", "Paula", "Nicolás",
];

function mulberry32(semilla: number) {
  let a = semilla;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generarDataset(): DiagnosticoDemo[] {
  const azar = mulberry32(20260718);
  const filas: DiagnosticoDemo[] = [];

  for (let i = 0; i < 42; i++) {
    const ruta: Ruta = azar() < 0.6 ? "A" : "B";
    const opciones = RANGOS[ruta];
    const [fase, min, max] = opciones[Math.floor(azar() * opciones.length)];
    const score = min + Math.floor(azar() * (max - min + 1));
    const conEmail = azar() < 0.68;
    const nombre = NOMBRES[Math.floor(azar() * NOMBRES.length)];
    const diasAtras = Math.floor(azar() * 18);
    const horasAtras = Math.floor(azar() * 24);
    const fecha = new Date(
      Date.now() - diasAtras * 86_400_000 - horasAtras * 3_600_000
    ).toISOString();

    filas.push({
      id: `demo-fila-${i}`,
      nombre: conEmail ? nombre : null,
      email: conEmail
        ? `${nombre.toLowerCase()}${i}@ejemplo.com`
        : null,
      fecha_creacion: fecha,
      ruta,
      fase,
      score_numerico: score,
    });
  }

  return filas.sort((a, b) => b.fecha_creacion.localeCompare(a.fecha_creacion));
}

export const DIAGNOSTICOS_DEMO: DiagnosticoDemo[] = generarDataset();

export function resumenDemo(): ResumenFaseDemo[] {
  const mapa = new Map<
    string,
    { ruta: Ruta; fase: FaseId; total: number; conEmail: number; scores: number[] }
  >();

  for (const d of DIAGNOSTICOS_DEMO) {
    const clave = `${d.ruta}-${d.fase}`;
    const entrada = mapa.get(clave) ?? {
      ruta: d.ruta,
      fase: d.fase,
      total: 0,
      conEmail: 0,
      scores: [] as number[],
    };
    entrada.total += 1;
    if (d.email) entrada.conEmail += 1;
    entrada.scores.push(d.score_numerico);
    mapa.set(clave, entrada);
  }

  return Array.from(mapa.values()).map((e) => ({
    ruta: e.ruta,
    fase: e.fase,
    total: e.total,
    con_email: e.conEmail,
    score_promedio:
      Math.round((e.scores.reduce((s, x) => s + x, 0) / e.scores.length) * 10) / 10,
  }));
}
