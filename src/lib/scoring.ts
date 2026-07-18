import { preguntasDeRuta, PREGUNTA_TAG_ID } from "@/content/preguntas";
import type { FaseId, Ruta } from "@/content/tipos";

/** Respuestas del usuario: { preguntaId: opcionId } */
export type Respuestas = Record<string, string>;

export interface RespuestaDetallada {
  preguntaId: string;
  pregunta: string;
  opcionId: string;
  opcion: string;
  puntos: number | null; // null en preguntas tag
}

export interface ResultadoScoring {
  ruta: Ruta;
  score: number;
  fase: FaseId;
  tag: string | null; // cuello_de_botella (A) o freno_principal (B)
  detalle: RespuestaDetallada[];
}

/** Umbrales v1 (PROJECT_PROMPT_v2). Ruta A: rango 8-24. Ruta B: rango real 5-14. */
const UMBRALES: Record<Ruta, Array<{ hasta: number; fase: FaseId }>> = {
  A: [
    { hasta: 13, fase: "A1" },
    { hasta: 19, fase: "A2" },
    { hasta: 24, fase: "A3" },
  ],
  B: [
    { hasta: 8, fase: "B1" },
    { hasta: 12, fase: "B2" },
    { hasta: 14, fase: "B3" },
  ],
};

export class RespuestasInvalidasError extends Error {}

/**
 * Valida respuestas contra el catálogo de preguntas y calcula score, fase y tag.
 * Lanza RespuestasInvalidasError si falta una pregunta o una opción no existe.
 */
export function calcularResultado(ruta: Ruta, respuestas: Respuestas): ResultadoScoring {
  const preguntas = preguntasDeRuta(ruta);
  const detalle: RespuestaDetallada[] = [];
  let score = 0;
  let tag: string | null = null;

  for (const pregunta of preguntas) {
    const opcionId = respuestas[pregunta.id];
    if (!opcionId) {
      throw new RespuestasInvalidasError(`Falta respuesta para ${pregunta.id}`);
    }

    if (pregunta.tipo === "puntuada") {
      const opcion = pregunta.opciones.find((o) => o.id === opcionId);
      if (!opcion) {
        throw new RespuestasInvalidasError(
          `Opción inválida "${opcionId}" para ${pregunta.id}`
        );
      }
      score += opcion.puntos;
      detalle.push({
        preguntaId: pregunta.id,
        pregunta: pregunta.texto,
        opcionId: opcion.id,
        opcion: opcion.texto,
        puntos: opcion.puntos,
      });
    } else {
      const opcion = pregunta.opciones.find((o) => o.id === opcionId);
      if (!opcion) {
        throw new RespuestasInvalidasError(
          `Opción inválida "${opcionId}" para ${pregunta.id}`
        );
      }
      if (pregunta.id === PREGUNTA_TAG_ID[ruta]) tag = opcion.id;
      detalle.push({
        preguntaId: pregunta.id,
        pregunta: pregunta.texto,
        opcionId: opcion.id,
        opcion: opcion.texto,
        puntos: null,
      });
    }
  }

  return { ruta, score, fase: faseDeScore(ruta, score), tag, detalle };
}

export function faseDeScore(ruta: Ruta, score: number): FaseId {
  for (const umbral of UMBRALES[ruta]) {
    if (score <= umbral.hasta) return umbral.fase;
  }
  // Score por encima del rango teórico: cae en la fase más alta.
  return UMBRALES[ruta][UMBRALES[ruta].length - 1].fase;
}
