import type { Pregunta, Ruta } from "./tipos";

/**
 * Única fuente de verdad del quiz (v2).
 *
 * La v2 reorienta el diagnóstico de funnel de venta a herramienta de
 * investigación de mercado: entran preguntas de ticket medio, estructura
 * de oferta, tráfico pagado y recuperación de checkout, más dos preguntas
 * de etiqueta y una abierta.
 *
 * Si se ajustan preguntas o pesos, ajustar también los umbrales en
 * lib/scoring.ts, los tests, y subir VERSION_CUESTIONARIO — el score
 * crudo de escalas distintas no se puede promediar entre sí.
 */

/**
 * Escala del score. v1: ruta A 8-24, ruta B 5-14. v2: A 9-27, B 5-15.
 * Se guarda en cada diagnóstico para poder analizar cada escala aparte.
 */
export const VERSION_CUESTIONARIO = 2;

export const PREGUNTA_BIFURCACION = {
  texto: "¿En qué punto estás hoy con tu negocio digital?",
  opciones: [
    {
      ruta: "A" as Ruta,
      texto: "Ya vendo infoproductos, pero estoy estancado o quiero escalar",
    },
    {
      ruta: "B" as Ruta,
      texto: "Todavía no lanzo mi infoproducto (o apenas estoy empezando)",
    },
  ],
};

/** Ruta A: 12 pantallas — 9 puntuadas (score 9-27), 2 de etiqueta, 1 abierta. */
export const PREGUNTAS_A: Pregunta[] = [
  {
    id: "a1",
    tipo: "puntuada",
    texto: "¿Cuánto facturas al mes en promedio, en los últimos 3 meses?",
    opciones: [
      { id: "a1_1", texto: "Menos de 1.000 USD", puntos: 1 },
      { id: "a1_2", texto: "Entre 1.000 y 3.000 USD", puntos: 2 },
      { id: "a1_3", texto: "Más de 3.000 USD", puntos: 3 },
    ],
  },
  {
    id: "a2",
    tipo: "puntuada",
    texto: "¿Qué tan parejos son tus meses?",
    opciones: [
      { id: "a2_1", texto: "Varían muchísimo, es impredecible", puntos: 1 },
      { id: "a2_2", texto: "Unos buenos y otros flojos", puntos: 2 },
      { id: "a2_3", texto: "Bastante parejos, ya sé qué esperar", puntos: 3 },
    ],
  },
  {
    id: "a3",
    tipo: "puntuada",
    texto: "¿De dónde vienen tus ventas?",
    opciones: [
      { id: "a3_1", texto: "De lanzamientos o campañas puntuales", puntos: 1 },
      { id: "a3_2", texto: "De una mezcla de ambos", puntos: 2 },
      { id: "a3_3", texto: "Vende solo, todos los días", puntos: 3 },
    ],
  },
  {
    id: "a4",
    tipo: "puntuada",
    texto:
      "Si dejaras de publicar y de aparecer durante 30 días, ¿cuánto venderías?",
    opciones: [
      { id: "a4_1", texto: "Casi nada", puntos: 1 },
      { id: "a4_2", texto: "Bajaría bastante, pero algo entra", puntos: 2 },
      { id: "a4_3", texto: "Seguiría vendiendo parecido", puntos: 3 },
    ],
  },
  {
    id: "a5",
    tipo: "puntuada",
    texto:
      "¿Cuál es tu ticket medio real? No el precio de tu producto — el promedio de lo que te deja cada comprador.",
    opciones: [
      { id: "a5_1", texto: "No lo sé", puntos: 1 },
      {
        id: "a5_2",
        texto: "Es prácticamente igual al precio de mi producto",
        puntos: 2,
      },
      {
        id: "a5_3",
        texto: "Es bastante mayor que mi producto de entrada",
        puntos: 3,
      },
    ],
  },
  {
    id: "a6",
    tipo: "puntuada",
    texto: "¿Cómo está armada tu oferta?",
    opciones: [
      { id: "a6_1", texto: "Un solo producto", puntos: 1 },
      {
        id: "a6_2",
        texto: "Producto principal + algo extra en el checkout",
        puntos: 2,
      },
      { id: "a6_3", texto: "Entrada + order bump + upsell conectados", puntos: 3 },
    ],
  },
  {
    id: "a7",
    tipo: "puntuada",
    texto: "¿Compras tráfico?",
    opciones: [
      { id: "a7_1", texto: "No invierto, o probé y no funcionó", puntos: 1 },
      { id: "a7_2", texto: "Invierto pero apenas empata", puntos: 2 },
      {
        id: "a7_3",
        texto: "Invierto, es rentable, y sé mi costo por venta",
        puntos: 3,
      },
    ],
  },
  {
    id: "a8",
    tipo: "puntuada",
    texto: "¿Qué haces hoy con quien entra al checkout y no compra?",
    opciones: [
      { id: "a8_1", texto: "Nada", puntos: 1 },
      { id: "a8_2", texto: "A veces le escribo o le mando un correo", puntos: 2 },
      { id: "a8_3", texto: "Tengo secuencia automática y remarketing", puntos: 3 },
    ],
  },
  {
    id: "a9",
    tipo: "puntuada",
    texto: "¿Conoces tus números?",
    opciones: [
      { id: "a9_1", texto: "No los tengo medidos", puntos: 1 },
      { id: "a9_2", texto: "Los reviso de vez en cuando", puntos: 2 },
      { id: "a9_3", texto: "Los mido todos los meses", puntos: 3 },
    ],
  },
  {
    id: "a10",
    tipo: "tag",
    campo: "cuello_de_botella",
    texto:
      "Si tuvieras que señalar UNA sola cosa que te tiene frenado, ¿cuál es?",
    opciones: [
      { id: "leads", texto: "No me llega suficiente gente" },
      { id: "conversion", texto: "Me llega gente pero no compra" },
      { id: "ticket_medio", texto: "Vendo, pero muy poco por cliente" },
      {
        id: "previsibilidad",
        texto: "Facturo distinto cada mes, no puedo planear",
      },
      { id: "operacion", texto: "No me da el tiempo, hago todo yo" },
      { id: "otro", texto: "Otra cosa", requiereDetalle: true },
    ],
  },
  {
    id: "a11",
    tipo: "tag",
    campo: "nivel_intencion",
    texto: "¿Qué has intentado ya para resolverlo?",
    opciones: [
      { id: "nada", texto: "Nada todavía" },
      { id: "contenido_gratis", texto: "He visto contenido gratis" },
      { id: "compro_producto", texto: "Compré un curso o programa" },
      { id: "contrato_servicio", texto: "Contraté a alguien" },
    ],
  },
  {
    id: "a12",
    tipo: "abierta",
    texto: "En tus propias palabras: ¿por qué crees que estás estancado?",
    ayuda: "Opcional — puedes saltarla y ver tu resultado ya mismo.",
    placeholder: "Escribe lo que se te venga a la cabeza…",
    maxLargo: 500,
  },
];

/** Ruta B: 6 pantallas — 5 puntuadas (score 5-15) y 1 abierta. */
export const PREGUNTAS_B: Pregunta[] = [
  {
    id: "b1",
    tipo: "puntuada",
    texto: "¿Tienes claro qué vas a vender?",
    opciones: [
      { id: "b1_1", texto: "Ni idea", puntos: 1 },
      { id: "b1_2", texto: "Tengo una idea, no la tengo aterrizada", puntos: 2 },
      { id: "b1_3", texto: "Sé exactamente qué", puntos: 3 },
    ],
  },
  {
    id: "b2",
    tipo: "puntuada",
    texto: "¿Alguien te lo ha pedido?",
    opciones: [
      { id: "b2_1", texto: "Nadie me lo ha pedido nunca", puntos: 1 },
      { id: "b2_2", texto: "Me han preguntado, pero no he cobrado", puntos: 2 },
      { id: "b2_3", texto: "Ya me pagaron por algo parecido", puntos: 3 },
    ],
  },
  {
    id: "b3",
    tipo: "puntuada",
    texto: "¿Tienes audiencia?",
    opciones: [
      { id: "b3_1", texto: "Prácticamente cero", puntos: 1 },
      { id: "b3_2", texto: "Algo pequeño", puntos: 2 },
      { id: "b3_3", texto: "Comunidad que me responde", puntos: 3 },
    ],
  },
  {
    id: "b4",
    tipo: "puntuada",
    texto: "¿Lo has intentado antes?",
    opciones: [
      { id: "b4_1", texto: "Nunca", puntos: 1 },
      { id: "b4_2", texto: "Empecé y lo dejé", puntos: 2 },
      { id: "b4_3", texto: "Ya vendí, pero informal por chat", puntos: 3 },
    ],
  },
  {
    id: "b5",
    tipo: "puntuada",
    texto: "¿Cuánto tiempo real le puedes dedicar?",
    opciones: [
      { id: "b5_1", texto: "Casi nada", puntos: 1 },
      { id: "b5_2", texto: "Unas horas a la semana", puntos: 2 },
      { id: "b5_3", texto: "Dedicación seria", puntos: 3 },
    ],
  },
  {
    id: "b6",
    tipo: "abierta",
    texto: "¿Qué es lo que más te frena para empezar?",
    ayuda: "Opcional — puedes saltarla y ver tu resultado ya mismo.",
    placeholder: "Escribe lo que se te venga a la cabeza…",
    maxLargo: 500,
  },
];

export function preguntasDeRuta(ruta: Ruta): Pregunta[] {
  return ruta === "A" ? PREGUNTAS_A : PREGUNTAS_B;
}

/** Pregunta abierta de cada ruta (la última). Ruta B no tiene tags. */
export const PREGUNTA_ABIERTA_ID: Record<Ruta, string> = { A: "a12", B: "b6" };

/**
 * Id de la pregunta que alimenta cada campo de etiqueta, por ruta.
 * Ruta B dejó de tener pregunta de etiqueta en la v2 del cuestionario
 * (antes capturaba `freno_principal`).
 */
export const PREGUNTAS_TAG: Record<Ruta, { cuello?: string; intencion?: string }> = {
  A: { cuello: "a10", intencion: "a11" },
  B: {},
};
