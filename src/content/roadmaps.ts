import type { FaseId, Roadmap } from "./tipos";

/**
 * TEXTOS PROVISIONALES (status: "placeholder").
 *
 * Redactados siguiendo las reglas de marca de Daviddigital:
 * - Nunca prometer ingresos garantizados
 * - Nunca atacar/nombrar a terceros
 * - Nunca revelar precios
 * - Cero lenguaje "hazte rico rápido"
 *
 * Cuando David apruebe los definitivos: reemplazar el texto y cambiar
 * status a "aprobado". No hace falta tocar ningún otro archivo.
 */

export const ROADMAPS: Record<FaseId, Roadmap> = {
  A1: {
    fase: "A1",
    status: "placeholder",
    parteA: {
      titulo: "Estás en fase de estancamiento sin sistema",
      diagnostico:
        "Vendes, pero cada venta te cuesta esfuerzo manual: dependes de lanzamientos, de tu energía y de estar presente en todo. No es un problema de talento ni de producto — es que tu negocio todavía no tiene un sistema debajo. Y sin sistema, más esfuerzo no se traduce en más resultados.",
    },
    parteB: {
      pasos: [
        "Mide tus 3 números base durante 30 días: cuánta gente te descubre, cuánta te deja su contacto y cuánta te compra. Sin esos números, cualquier decisión es una apuesta a ciegas.",
        "Elige UNA fuente de tráfico y UNA oferta, y córtale el oxígeno a todo lo demás durante 60 días. El estancamiento casi siempre viene de dispersión, no de falta de trabajo.",
        "Documenta tu proceso de venta actual de punta a punta (de dónde llega la gente hasta que paga). Lo que no está escrito no se puede automatizar — y ese documento es el plano de tu futuro sistema.",
      ],
      cta: "En @daviddigital.co comparto cómo pasar de vender con esfuerzo a vender con sistema, con números reales y sin humo. Sígueme para ver el paso a paso.",
    },
  },
  A2: {
    fase: "A2",
    status: "placeholder",
    parteA: {
      titulo: "Estás en fase de piezas sueltas",
      diagnostico:
        "Tienes cosas que funcionan: productos, algo de audiencia, ventas que entran. Pero funcionan como piezas sueltas, no como una máquina. El resultado: meses buenos y meses flojos, y la sensación de que trabajas más de lo que el negocio te devuelve.",
    },
    parteB: {
      pasos: [
        "Dibuja tu escalera de valor en una hoja: qué producto de entrada lleva a cuál siguiente, y a qué precio relativo. Si tus productos no se conectan entre sí, cada venta muere en sí misma en vez de alimentar la siguiente.",
        "Instala un embudo evergreen mínimo para tu producto de entrada: contenido → captura → secuencia de emails → oferta. Uno solo, simple, midiendo conversión en cada paso.",
        "Define tus métricas de control semanales (CAC, conversión por etapa, LTV) y revísalas cada lunes. En esta fase el problema ya no es hacer más — es saber qué pieza mover.",
      ],
      cta: "En @daviddigital.co muestro cómo conectar esas piezas en un sistema evergreen que vende sin depender de lanzamientos. Sígueme y te enseño el proceso con data real.",
    },
  },
  A3: {
    fase: "A3",
    status: "placeholder",
    parteA: {
      titulo: "Estás casi listo para escalar",
      diagnostico:
        "Tienes sistema, números y consistencia — estás en el punto donde la mayoría se equivoca: intentar escalar haciendo más de lo mismo. Escalar no es multiplicar esfuerzo, es subir de nivel la oferta y proteger los márgenes mientras creces.",
    },
    parteB: {
      pasos: [
        "Diseña (o refina) tu oferta high ticket: la transformación más profunda que puedes entregar a tu mejor cliente. Escalar solo con low ticket te obliga a perseguir volumen infinito; el high ticket escala margen, no horas.",
        "Audita tu CAC por canal y duplica presupuesto solo donde el retorno está probado. En esta fase, escalar tráfico sin datos es la forma más rápida de quemar caja.",
        "Saca tu operación de tu cabeza: procesos documentados, al menos una contratación clave y un tablero de métricas que puedas leer en 10 minutos. El cuello de botella de esta fase eres tú.",
      ],
      cta: "En @daviddigital.co hablo de escalar de low ticket a high ticket con estrategia evergreen — desde ejecución real, no teoría. Sígueme para el siguiente nivel.",
    },
  },
  B1: {
    fase: "B1",
    status: "placeholder",
    parteA: {
      titulo: "Estás en fase de exploración: aún sin claridad",
      diagnostico:
        "Quieres construir algo digital, pero todavía no tienes claro qué. Y déjame decirte algo: eso no es estar atrás — es el punto de partida de todos. Yo también estuve ahí. El error sería quedarte dando vueltas en tu cabeza en vez de salir a buscar claridad afuera.",
    },
    parteB: {
      pasos: [
        "Haz el inventario de tu ventaja: escribe 10 cosas que sabes hacer o que has vivido, por las que alguien alguna vez te pidió ayuda. Tu infoproducto casi siempre está en esa lista, no en una idea 'de moda'.",
        "Elige las 2 ideas más fuertes y habla con 5 personas reales de cada una: qué les duele, qué han intentado, qué pagarían por resolver. Conversaciones, no encuestas.",
        "Decide con fecha: en máximo 2 semanas, elige UNA idea y aparca las demás sin culpa. La claridad no llega pensando — llega eligiendo y probando.",
      ],
      cta: "En @daviddigital.co comparto cómo pasar de 'tengo una idea' a un negocio digital real, paso a paso y sin humo. Sígueme — este camino es más simple cuando alguien ya lo recorrió.",
    },
  },
  B2: {
    fase: "B2",
    status: "placeholder",
    parteA: {
      titulo: "Estás en fase de idea sin validar",
      diagnostico:
        "Ya sabes qué quieres hacer — y eso te pone por delante de la mayoría. Pero ojo: una idea clara sin validación sigue siendo una hipótesis. El riesgo de esta fase es pasar meses construyendo el curso 'perfecto' que nadie pidió. Primero se vende la promesa, después se construye el producto.",
    },
    parteB: {
      pasos: [
        "Escribe tu promesa en una frase: 'Ayudo a [quién] a lograr [resultado] sin [dolor]'. Si no cabe en una frase, todavía no está clara.",
        "Ofrécela en pequeño antes de construirla en grande: una asesoría, un taller en vivo, una versión beta a un grupo reducido. Que alguien pague (aunque sea poco) es la única validación que cuenta.",
        "Empieza a publicar contenido sobre tu tema 2-3 veces por semana, aunque tu audiencia sea pequeña. La audiencia no se junta cuando lanzas — se construye antes de lanzar.",
      ],
      cta: "En @daviddigital.co enseño cómo validar y lanzar tu primer infoproducto sin gastarte meses construyendo a ciegas. Sígueme y hagamos esa validación bien hecha.",
    },
  },
  B3: {
    fase: "B3",
    status: "placeholder",
    parteA: {
      titulo: "Estás en fase de primeras ventas informales",
      diagnostico:
        "Ya vendiste algo — por chat, de palabra, sin estructura — y eso vale oro: significa que hay demanda real por lo que sabes. Lo que tienes no es un problema de idea, es una oportunidad de formalización. Es el momento de convertir esas ventas sueltas en un producto de verdad.",
    },
    parteB: {
      pasos: [
        "Empaqueta lo que ya vendes: dale nombre, estructura clara (módulos o sesiones), un resultado concreto y un precio fijo. Deja de cotizar a medida cada vez.",
        "Monta tu sistema mínimo de venta: una página simple que explique la oferta, un medio de pago automático y una forma de entrega ordenada. Nada sofisticado — que funcione sin ti en el chat.",
        "Documenta los resultados de tus primeros clientes desde ya (con su permiso). Esos casos son el activo que te va a permitir subir el nivel de tu oferta después.",
      ],
      cta: "En @daviddigital.co muestro cómo pasar de ventas informales a un sistema que vende de forma constante. Sígueme — el salto que viene es el más divertido.",
    },
  },
};

export function roadmapDeFase(fase: FaseId): Roadmap {
  return ROADMAPS[fase];
}
