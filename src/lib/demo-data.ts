import type { FaseId, Ruta } from "@/content/tipos";
import { preguntasDeRuta } from "@/content/preguntas";
import type { RespuestaDetallada } from "@/lib/scoring";

/**
 * Dataset de ejemplo para poder visualizar el panel /admin sin tener
 * Supabase conectado todavía. Generado con una semilla fija (mulberry32)
 * para que los números sean siempre los mismos entre recargas — no es
 * aleatorio en cada request, así el panel se ve estable mientras lo
 * revisas o navegas entre filtros.
 *
 * Incluye diagnósticos abandonados a mitad del quiz, para que las vistas
 * de embudo y de abandonos tengan algo que mostrar en modo demo.
 *
 * NUNCA se usa si Supabase está configurado — solo es el fallback
 * cuando SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no existen.
 */

export type EstadoDiagnostico = "iniciado" | "completado" | "capturado";
export type EstadoEfectivo =
  | "en_curso"
  | "abandono_preguntas"
  | "abandono_gate"
  | "capturado";

export interface DiagnosticoDemo {
  id: string;
  nombre: string | null;
  email: string | null;
  fecha_creacion: string;
  ruta: Ruta;
  fase: FaseId | null;
  score_numerico: number | null;
  estado: EstadoDiagnostico;
  estado_efectivo: EstadoEfectivo;
  preguntas_respondidas: number;
  total_preguntas: number;
  ultima_pregunta_id: string | null;
  ultima_actividad_at: string;
  respuestas: RespuestaDetallada[];
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

export interface ResumenFaseDemo {
  ruta: Ruta;
  fase: FaseId;
  total: number;
  con_email: number;
  score_promedio: number;
}

export interface EmbudoDemo {
  ruta: Ruta;
  iniciados: number;
  completados: number;
  capturados: number;
  abandono_preguntas: number;
  abandono_gate: number;
  en_curso: number;
}

export interface AbandonoPreguntaDemo {
  ruta: Ruta;
  pregunta_id: string;
  preguntas_respondidas: number;
  abandonos: number;
}

export interface ResumenUtmDemo {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  iniciados: number;
  completados: number;
  capturados: number;
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

const ORIGENES: Array<[string, string, string, string]> = [
  ["instagram", "social", "lanzamiento-1", "reel-1"],
  ["instagram", "social", "lanzamiento-1", "reel-2"],
  ["instagram", "social", "lanzamiento-1", "stories"],
  ["instagram", "bio", "perfil", "link-bio"],
  ["facebook", "paid", "trafico-frio", "video-dolor"],
  ["(directo)", "(ninguno)", "(ninguna)", "(ninguno)"],
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

/** Construye respuestas reales del catálogo hasta la pregunta `cuantas`. */
function respuestasHasta(
  ruta: Ruta,
  cuantas: number,
  azar: () => number
): RespuestaDetallada[] {
  return preguntasDeRuta(ruta)
    .slice(0, cuantas)
    .map((pregunta): RespuestaDetallada => {
      const indice = Math.floor(azar() * pregunta.opciones.length);
      const base = { preguntaId: pregunta.id, pregunta: pregunta.texto };

      if (pregunta.tipo === "puntuada") {
        const opcion = pregunta.opciones[indice];
        return { ...base, opcionId: opcion.id, opcion: opcion.texto, puntos: opcion.puntos };
      }

      const opcion = pregunta.opciones[indice];
      return { ...base, opcionId: opcion.id, opcion: opcion.texto, puntos: null };
    });
}

function generarDataset(): DiagnosticoDemo[] {
  const azar = mulberry32(20260718);
  const filas: DiagnosticoDemo[] = [];

  for (let i = 0; i < 96; i++) {
    const ruta: Ruta = azar() < 0.6 ? "A" : "B";
    const totalPreguntas = ruta === "A" ? 9 : 6;
    const nombre = NOMBRES[Math.floor(azar() * NOMBRES.length)];
    const [utmSource, utmMedium, utmCampaign, utmContent] =
      ORIGENES[Math.floor(azar() * ORIGENES.length)];

    const diasAtras = Math.floor(azar() * 18);
    const horasAtras = Math.floor(azar() * 24);
    const fecha = new Date(
      Date.now() - diasAtras * 86_400_000 - horasAtras * 3_600_000
    ).toISOString();

    // Reparto realista: casi la mitad se cae dentro del quiz, una parte
    // llega al gate y no deja el correo, y el resto convierte.
    const dado = azar();
    let estado: EstadoDiagnostico;
    let estadoEfectivo: EstadoEfectivo;
    let respondidas: number;

    if (dado < 0.42) {
      estado = "iniciado";
      estadoEfectivo = "abandono_preguntas";
      respondidas = 1 + Math.floor(azar() * (totalPreguntas - 1));
    } else if (dado < 0.6) {
      estado = "completado";
      estadoEfectivo = "abandono_gate";
      respondidas = totalPreguntas;
    } else {
      estado = "capturado";
      estadoEfectivo = "capturado";
      respondidas = totalPreguntas;
    }

    const respuestas = respuestasHasta(ruta, respondidas, azar);
    const completo = respondidas === totalPreguntas;
    const opciones = RANGOS[ruta];
    const [fase, min, max] = opciones[Math.floor(azar() * opciones.length)];

    filas.push({
      id: `demo-fila-${i}`,
      nombre: estado === "capturado" ? nombre : null,
      email: estado === "capturado" ? `${nombre.toLowerCase()}${i}@ejemplo.com` : null,
      fecha_creacion: fecha,
      ruta,
      fase: completo ? fase : null,
      score_numerico: completo ? min + Math.floor(azar() * (max - min + 1)) : null,
      estado,
      estado_efectivo: estadoEfectivo,
      preguntas_respondidas: respondidas,
      total_preguntas: totalPreguntas,
      ultima_pregunta_id: respuestas.at(-1)?.preguntaId ?? null,
      ultima_actividad_at: fecha,
      respuestas,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
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
    if (!d.fase || d.score_numerico === null) continue;
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

export function embudoDemo(): EmbudoDemo[] {
  const mapa = new Map<Ruta, EmbudoDemo>();

  for (const d of DIAGNOSTICOS_DEMO) {
    const entrada = mapa.get(d.ruta) ?? {
      ruta: d.ruta,
      iniciados: 0,
      completados: 0,
      capturados: 0,
      abandono_preguntas: 0,
      abandono_gate: 0,
      en_curso: 0,
    };
    entrada.iniciados += 1;
    if (d.estado !== "iniciado") entrada.completados += 1;
    if (d.estado === "capturado") entrada.capturados += 1;
    if (d.estado_efectivo === "abandono_preguntas") entrada.abandono_preguntas += 1;
    if (d.estado_efectivo === "abandono_gate") entrada.abandono_gate += 1;
    if (d.estado_efectivo === "en_curso") entrada.en_curso += 1;
    mapa.set(d.ruta, entrada);
  }

  return Array.from(mapa.values());
}

export function abandonoPorPreguntaDemo(): AbandonoPreguntaDemo[] {
  const mapa = new Map<string, AbandonoPreguntaDemo>();

  for (const d of DIAGNOSTICOS_DEMO) {
    if (d.estado_efectivo !== "abandono_preguntas" || !d.ultima_pregunta_id) continue;
    const clave = `${d.ruta}-${d.ultima_pregunta_id}`;
    const entrada = mapa.get(clave) ?? {
      ruta: d.ruta,
      pregunta_id: d.ultima_pregunta_id,
      preguntas_respondidas: d.preguntas_respondidas,
      abandonos: 0,
    };
    entrada.abandonos += 1;
    mapa.set(clave, entrada);
  }

  return Array.from(mapa.values());
}

export function utmDemo(): ResumenUtmDemo[] {
  const mapa = new Map<string, ResumenUtmDemo>();

  for (const d of DIAGNOSTICOS_DEMO) {
    const clave = [d.utm_source, d.utm_medium, d.utm_campaign, d.utm_content].join("|");
    const entrada = mapa.get(clave) ?? {
      utm_source: d.utm_source ?? "(directo)",
      utm_medium: d.utm_medium ?? "(ninguno)",
      utm_campaign: d.utm_campaign ?? "(ninguna)",
      utm_content: d.utm_content ?? "(ninguno)",
      iniciados: 0,
      completados: 0,
      capturados: 0,
    };
    entrada.iniciados += 1;
    if (d.estado !== "iniciado") entrada.completados += 1;
    if (d.estado === "capturado") entrada.capturados += 1;
    mapa.set(clave, entrada);
  }

  return Array.from(mapa.values()).sort((a, b) => b.iniciados - a.iniciados);
}
