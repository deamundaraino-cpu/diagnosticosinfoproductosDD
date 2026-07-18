import type { Pregunta, Ruta } from "./tipos";

/**
 * Única fuente de verdad del quiz. Los pesos y umbrales vienen de
 * PROJECT_PROMPT_v2.md — si se ajustan preguntas, ajustar también
 * los umbrales en lib/scoring.ts y los tests.
 */

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

export const PREGUNTAS_A: Pregunta[] = [
  {
    id: "a1",
    tipo: "puntuada",
    texto: "¿Cuánto factura tu negocio al mes actualmente? (USD)",
    opciones: [
      { id: "a1_1", texto: "Menos de 1.000", puntos: 1 },
      { id: "a1_2", texto: "Entre 1.000 y 3.000", puntos: 2 },
      { id: "a1_3", texto: "Más de 3.000", puntos: 3 },
    ],
  },
  {
    id: "a2",
    tipo: "puntuada",
    texto: "¿De dónde vienen principalmente tus ventas?",
    opciones: [
      { id: "a2_1", texto: "De lanzamientos: si no lanzo, no vendo", puntos: 1 },
      { id: "a2_2", texto: "Una mezcla de lanzamientos y ventas sueltas", puntos: 2 },
      { id: "a2_3", texto: "Tengo un sistema evergreen que vende todos los días", puntos: 3 },
    ],
  },
  {
    id: "a3",
    tipo: "puntuada",
    texto: "¿Cómo está estructurada tu oferta?",
    opciones: [
      { id: "a3_1", texto: "Tengo un solo producto", puntos: 1 },
      { id: "a3_2", texto: "Tengo 2-3 productos, pero sueltos, sin conexión", puntos: 2 },
      { id: "a3_3", texto: "Tengo una escalera de valor diseñada (low → high ticket)", puntos: 3 },
    ],
  },
  {
    id: "a4",
    tipo: "puntuada",
    texto: "¿Cuánto depende el negocio de ti personalmente?",
    opciones: [
      { id: "a4_1", texto: "Casi todo depende de mí: si paro, se para todo", puntos: 1 },
      { id: "a4_2", texto: "Mitad y mitad: hay cosas automatizadas, otras no", puntos: 2 },
      { id: "a4_3", texto: "La mayoría está automatizado o delegado", puntos: 3 },
    ],
  },
  {
    id: "a5",
    tipo: "puntuada",
    texto: "¿Qué tan consistentes son tus resultados mes a mes?",
    opciones: [
      { id: "a5_1", texto: "Varían muchísimo: un mes bien, otro casi nada", puntos: 1 },
      { id: "a5_2", texto: "Medianamente estables, con altibajos", puntos: 2 },
      { id: "a5_3", texto: "Consistentes y predecibles", puntos: 3 },
    ],
  },
  {
    id: "a6",
    tipo: "puntuada",
    texto: "¿Conoces tus números? (CAC, conversión, LTV)",
    opciones: [
      { id: "a6_1", texto: "No tengo idea de esas métricas", puntos: 1 },
      { id: "a6_2", texto: "Las reviso a veces, sin sistema", puntos: 2 },
      { id: "a6_3", texto: "Las tengo controladas y decido con ellas", puntos: 3 },
    ],
  },
  {
    id: "a7",
    tipo: "puntuada",
    texto: "¿Cómo está tu posicionamiento y autoridad en tu nicho?",
    opciones: [
      { id: "a7_1", texto: "No tengo un nicho claro todavía", puntos: 1 },
      { id: "a7_2", texto: "Tengo nicho, pero poca autoridad reconocida", puntos: 2 },
      { id: "a7_3", texto: "Soy reconocido en mi nicho", puntos: 3 },
    ],
  },
  {
    id: "a8",
    tipo: "puntuada",
    texto: "¿Con qué equipo o apoyo cuentas?",
    opciones: [
      { id: "a8_1", texto: "Estoy completamente solo", puntos: 1 },
      { id: "a8_2", texto: "Tengo una persona que me apoya", puntos: 2 },
      { id: "a8_3", texto: "Tengo un equipo (aunque sea pequeño)", puntos: 3 },
    ],
  },
  {
    id: "a9",
    tipo: "tag",
    texto: "¿Cuál sientes que es tu principal cuello de botella hoy?",
    opciones: [
      { id: "leads", texto: "Conseguir leads / audiencia" },
      { id: "conversion", texto: "Convertir: tengo audiencia pero no compra" },
      { id: "retencion", texto: "Retención y recompra: venden una vez y se van" },
      { id: "tiempo", texto: "Tiempo y operación: vivo apagando incendios" },
    ],
  },
];

export const PREGUNTAS_B: Pregunta[] = [
  {
    id: "b1",
    tipo: "puntuada",
    texto: "¿Qué tan claro tienes el tema y la oferta de tu infoproducto?",
    opciones: [
      { id: "b1_1", texto: "Sin claridad: no sé de qué hacerlo", puntos: 1 },
      { id: "b1_2", texto: "Tengo 2-3 ideas dando vueltas", puntos: 2 },
      { id: "b1_3", texto: "Lo tengo claro: sé qué quiero vender y a quién", puntos: 3 },
    ],
  },
  {
    id: "b2",
    tipo: "puntuada",
    texto: "¿Has validado tu idea con personas reales?",
    opciones: [
      { id: "b2_1", texto: "Nunca la he validado", puntos: 1 },
      { id: "b2_2", texto: "He preguntado informalmente a conocidos", puntos: 2 },
      { id: "b2_3", texto: "Ya vendí algo relacionado (aunque sea informal)", puntos: 3 },
    ],
  },
  {
    id: "b3",
    tipo: "puntuada",
    texto: "¿Cómo está tu audiencia hoy?",
    opciones: [
      { id: "b3_1", texto: "No tengo audiencia", puntos: 1 },
      { id: "b3_2", texto: "Tengo una audiencia pequeña", puntos: 2 },
      { id: "b3_3", texto: "Tengo una audiencia consistente que me sigue", puntos: 3 },
    ],
  },
  {
    id: "b4",
    tipo: "tag",
    texto: "¿Cuál es tu principal freno para lanzar?",
    opciones: [
      { id: "que_vender", texto: "No sé qué vender" },
      { id: "estructura", texto: "No sé cómo estructurar el producto" },
      { id: "miedo", texto: "Miedo a mostrarme o a vender" },
      { id: "herramientas", texto: "No sé qué herramientas usar" },
    ],
  },
  {
    id: "b5",
    tipo: "puntuada",
    texto: "¿Has intentado lanzar antes?",
    opciones: [
      { id: "b5_1", texto: "Este sería mi primer intento", puntos: 1 },
      { id: "b5_2", texto: "Ya intenté y no funcionó como esperaba", puntos: 2 },
    ],
  },
  {
    id: "b6",
    tipo: "puntuada",
    texto: "¿Cuánto tiempo real puedes dedicarle por semana?",
    opciones: [
      { id: "b6_1", texto: "Menos de 3 horas", puntos: 1 },
      { id: "b6_2", texto: "Entre 3 y 8 horas", puntos: 2 },
      { id: "b6_3", texto: "Más de 8 horas", puntos: 3 },
    ],
  },
];

export function preguntasDeRuta(ruta: Ruta): Pregunta[] {
  return ruta === "A" ? PREGUNTAS_A : PREGUNTAS_B;
}

/** id de la pregunta tag por ruta (a9 → cuello_de_botella, b4 → freno_principal) */
export const PREGUNTA_TAG_ID: Record<Ruta, string> = { A: "a9", B: "b4" };
