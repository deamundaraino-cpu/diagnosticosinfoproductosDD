/**
 * Copy provisional de toda la plataforma (status: placeholder).
 * El copy definitivo se escribe en Fase 2 — reemplazar aquí sin tocar código.
 */

export const COPY = {
  status: "placeholder" as "placeholder" | "aprobado",

  marca: {
    nombre: "Daviddigital",
    instagram: "@daviddigital.co",
    instagramUrl: "https://instagram.com/daviddigital.co",
  },

  landing: {
    titulo: "¿En qué fase real está tu negocio digital?",
    subtitulo:
      "Descubre en 2 minutos dónde estás parado, cuál es tu verdadero cuello de botella y cuáles son tus 3 próximos pasos concretos — sin humo y sin fórmulas mágicas.",
    bullets: [
      "9 preguntas directas (6 si aún no has lanzado)",
      "Diagnóstico basado en sistema, no en motivación",
      "Roadmap con 3 pasos accionables para tu fase exacta",
    ],
    botonEmpezar: "Hacer mi diagnóstico gratis",
    notaTiempo: "⏱ Menos de 2 minutos · Sin registro previo",
  },

  quiz: {
    progresoDe: (actual: number, total: number) =>
      `Pregunta ${actual} de ${total}`,
    botonSiguiente: "Siguiente",
    botonVerResultado: "Ver mi resultado",
    botonContinuar: "Continuar",
    // La pregunta abierta es de investigación: nunca puede bloquear a
    // nadie, por eso saltarla es una opción visible y explícita.
    botonSaltar: "Saltar esta pregunta",
    placeholderOtro: "Cuéntame en una línea qué te tiene frenado…",
    ayudaOtro: "Escríbelo con tus palabras para poder seguir.",
    calculando: "Analizando tus respuestas…",
    // Pantalla de análisis entre el quiz y el resultado: simula el trabajo
    // de revisar el caso antes de entregar el diagnóstico, en vez de una
    // respuesta fría e inmediata.
    analisis: {
      A: [
        { icono: "🔍", texto: "Leyendo tus respuestas" },
        { icono: "📊", texto: "Revisando tu situación de negocio" },
        { icono: "🎯", texto: "Identificando tu cuello de botella" },
        { icono: "🗺", texto: "Armando cómo puedes escalar con sistema" },
      ],
      B: [
        { icono: "🔍", texto: "Leyendo tus respuestas" },
        { icono: "📊", texto: "Revisando tu punto de partida" },
        { icono: "🎯", texto: "Identificando tu principal freno" },
        { icono: "🗺", texto: "Armando tu camino para lanzar con claridad" },
      ],
    },
  },

  gate: {
    titulo: "Tu diagnóstico está listo",
    subtitulo:
      "Desbloquea tus 3 próximos pasos concretos y recibe tu roadmap completo en tu correo para volver a él cuando quieras.",
    labelNombre: "Tu nombre",
    labelEmail: "Tu mejor email",
    labelTelefono: "WhatsApp (opcional)",
    placeholderTelefono: "+57 300 123 4567",
    consentimiento:
      "Acepto recibir mi roadmap y contenido de Daviddigital por email. Puedo darme de baja cuando quiera.",
    boton: "Desbloquear mi roadmap completo",
    enviando: "Desbloqueando…",
    privacidad: "Tus datos están protegidos. Ver política de privacidad.",
  },

  resultado: {
    tusPasos: "Tus 3 próximos pasos",
    guardado:
      "📩 Te enviamos este roadmap a tu correo para que vuelvas a él cuando quieras.",
    ctaTitulo: "¿Quieres el paso a paso completo?",
    ctaBoton: "Seguir a @daviddigital.co",
  },

  /**
   * Bloque final durante la fase de investigación de mercado. Sustituye a
   * la recomendación de producto (ver recomendacionProductoActiva()).
   *
   * El encuadre es investigación, no regalo: por eso no aparecen las
   * palabras "gratis", "asesoría" ni "consultoría". Hay un test que falla
   * el build si alguna se cuela.
   */
  llamada: {
    titulo: "¿Quieres que revisemos tu caso en concreto?",
    cuerpo:
      "Estoy hablando con infoproductores para entender cómo trabajan de verdad. Son 30 minutos, es una conversación de investigación, no una llamada de ventas: no tengo nada que ofrecerte ahora mismo.",
    boton: "Agendar los 30 minutos",
    // Se muestra si todavía no hay URL de agendamiento configurada.
    sinAgenda: "Escríbeme por Instagram y coordinamos.",
  },

  email: {
    asunto: (nombre: string | null) =>
      nombre ? `${nombre}, aquí está tu roadmap 🗺` : "Aquí está tu roadmap 🗺",
    intro:
      "Gracias por hacer el diagnóstico. Aquí tienes tu resultado completo — guárdalo, y sobre todo: ejecútalo.",
    linkTexto: "Ver mi roadmap online",
    despedida: "Nos vemos en el contenido,\nDavid — Daviddigital",
  },

  errores: {
    generico: "Algo salió mal. Intenta de nuevo en unos segundos.",
    emailInvalido: "Revisa tu email — parece que tiene un error.",
    consentimientoRequerido: "Necesitas aceptar para recibir tu roadmap.",
    resultadoNoEncontrado: "No encontramos este resultado.",
    resultadoNoEncontradoDetalle:
      "El link puede estar incompleto o el diagnóstico ya no existe. Puedes hacer el diagnóstico de nuevo en menos de 2 minutos.",
    volverAlInicio: "Hacer mi diagnóstico",
  },

  demo: {
    aviso:
      "Modo demo: la base de datos no está conectada, este diagnóstico no se guardará.",
  },

  placeholderBadge: "Texto provisional — pendiente de aprobación",
} as const;
