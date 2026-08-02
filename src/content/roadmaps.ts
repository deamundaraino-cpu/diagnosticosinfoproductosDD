import type { FaseId, Roadmap, TagCuelloDeBotella } from "./tipos";

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

/**
 * Mapeo de escalera de productos (activado 2026-07-30): cada fase/tag
 * recomienda el producto real del catálogo de David que mejor calza con
 * ese avatar y nivel de consciencia — nunca el genérico "sígueme". Nunca
 * revela precio ni cita textualmente títulos con cifras de ingreso (regla
 * de marca: no prometer ingresos garantizados), aunque el producto se
 * mencione descriptivamente.
 *
 * Ruta A: el tag de cuello de botella importa más que la fase para decidir
 * qué ofrecer — por eso vive en `ctaPorTag`, no en el `cta` genérico.
 */
const CTA_ASESORIA_RETENCION =
  "Este cuello de botella casi nunca se resuelve con una fórmula genérica — cada negocio pierde clientes por razones distintas, y ahí es donde una mirada externa vale más que otro curso. Tengo una asesoría 1:1 de auditoría de retención para revisar tu caso puntual, sin plantillas. Escríbeme por @daviddigital.co si quieres explorarla.";

const CTA_ASESORIA_TIEMPO =
  "Cuando el cuello de botella es tu propio tiempo, ningún contenido te lo devuelve solo — hace falta rediseñar tu operación con alguien que vea lo que tú, desde adentro, no ves. Ofrezco una asesoría 1:1 de auditoría de sistema para casos así. Escríbeme por @daviddigital.co si quieres explorarla.";

const CTA_LEADMAGNETS_IA =
  "Si tu cuello de botella es conseguir leads, tengo un workshop corto sobre cómo crear leadmagnets efectivos apoyándote en IA para atraer a las personas correctas, no a cualquiera. Escríbeme por @daviddigital.co si quieres verlo.";

const CTA_CREADOR_ANUNCIOS =
  "Si tienes audiencia pero no convierte, casi siempre el problema está en cómo comunicas tu oferta en el anuncio, no en el producto. Tengo un ebook con la metodología completa para crear anuncios que sí venden. Escríbeme por @daviddigital.co si quieres conocerlo.";

/** Ruta A, fases A2/A3: aplica igual sin importar leads/conversión — solo cambia con retención/tiempo. */
const CTA_POR_TAG_ASESORIA: Partial<Record<TagCuelloDeBotella, string>> = {
  retencion: CTA_ASESORIA_RETENCION,
  tiempo: CTA_ASESORIA_TIEMPO,
};

/** Ruta A, fase A1: leads y conversión sí necesitan productos distintos entre sí. */
const CTA_POR_TAG_A1: Partial<Record<TagCuelloDeBotella, string>> = {
  leads: CTA_LEADMAGNETS_IA,
  conversion: CTA_CREADOR_ANUNCIOS,
  ...CTA_POR_TAG_ASESORIA,
};

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
      ctaPorTag: CTA_POR_TAG_A1,
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
      cta: "Conectar esas piezas en un sistema evergreen real es exactamente lo que trabajo en Fórmula 7X, mi programa completo de tráfico perpetuo con Meta Ads. Escríbeme por @daviddigital.co si quieres saber si es para ti.",
      ctaPorTag: CTA_POR_TAG_ASESORIA,
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
      cta: "En este punto tengo dos recursos que te sirven: Fórmula 7X, el sistema completo de tráfico perpetuo, y un ebook enfocado en optimizar y rentabilizar las campañas que ya corres. Escríbeme por @daviddigital.co para ver cuál calza con tu caso.",
      ctaPorTag: CTA_POR_TAG_ASESORIA,
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
      cta: "Para dar este primer paso con guía en vez de a ciegas, tengo un ebook que te lleva de la mano: definir tu cliente ideal y construir tu primer producto digital con ayuda de IA y Canva. Escríbeme por @daviddigital.co si quieres que te cuente más.",
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
      cta: "Ya sabes qué quieres construir — lo que necesitas es la ruta más rápida para estructurarlo y lanzarlo sin complicarte. Tengo un ebook diseñado exactamente para eso, sin herramientas costosas ni experiencia previa. Escríbeme por @daviddigital.co si quieres conocerlo.",
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
      cta: "Ya validaste que hay demanda real — el paso que sigue es empaquetar eso en un producto formal, con estructura y precio fijo, en vez de cotizar cada vez. Tengo un ebook que te lleva paso a paso en ese salto. Escríbeme por @daviddigital.co si quieres el mapa completo.",
    },
  },
};

export function roadmapDeFase(fase: FaseId): Roadmap {
  return ROADMAPS[fase];
}

/**
 * Interruptor de la escalera de productos.
 *
 * Durante la fase de investigación de mercado el diagnóstico no vende: el
 * bloque final invita a una llamada de investigación en vez de recomendar
 * un producto. El mapeo fase/tag → producto NO se borra, solo queda
 * inactivo, para poder reactivarlo con textos nuevos sin rehacerlo.
 *
 * Para reactivarlo: RECOMENDACION_PRODUCTO_ACTIVA=true en el entorno.
 */
export function recomendacionProductoActiva(): boolean {
  return process.env.NEXT_PUBLIC_RECOMENDACION_PRODUCTO === "true";
}

/**
 * CTA a mostrar: el específico del tag si existe, si no el genérico de la
 * fase. Solo se usa cuando la recomendación de producto está activa.
 */
export function ctaEfectivo(roadmap: Roadmap, tag: string | null): string {
  const especifico = tag ? roadmap.parteB.ctaPorTag?.[tag as TagCuelloDeBotella] : undefined;
  return especifico ?? roadmap.parteB.cta;
}
