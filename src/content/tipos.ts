export type Ruta = "A" | "B";

export type FaseId = "A1" | "A2" | "A3" | "B1" | "B2" | "B3";

export interface OpcionPuntuada {
  id: string;
  texto: string;
  puntos: 1 | 2 | 3;
}

export interface OpcionTag {
  id: string;
  texto: string;
  /**
   * Al elegirla se despliega un campo de texto obligatorio en la misma
   * pantalla (caso "Otra cosa"). El detalle se guarda aparte del tag.
   */
  requiereDetalle?: boolean;
}

export interface PreguntaPuntuada {
  id: string;
  tipo: "puntuada";
  texto: string;
  opciones: OpcionPuntuada[];
}

/** Campo de la base donde aterriza la respuesta de una pregunta no puntuada. */
export type CampoTag = "cuello_de_botella" | "nivel_intencion";

export interface PreguntaTag {
  id: string;
  tipo: "tag";
  texto: string;
  campo: CampoTag;
  opciones: OpcionTag[];
}

/**
 * Pregunta de investigación: texto libre, siempre opcional y siempre la
 * última de su ruta. No puntúa y no puede bloquear el avance al resultado.
 */
export interface PreguntaAbierta {
  id: string;
  tipo: "abierta";
  texto: string;
  ayuda: string;
  placeholder: string;
  maxLargo: number;
}

export type Pregunta = PreguntaPuntuada | PreguntaTag | PreguntaAbierta;

/**
 * Cuello de botella de Ruta A.
 *
 * `retencion` y `tiempo` se retiraron del formulario en la v2 del
 * cuestionario, pero siguen declarados: hay registros históricos que los
 * tienen guardados y el panel debe poder mostrarlos sin romperse.
 */
export type TagCuelloDeBotella =
  | "leads"
  | "conversion"
  | "ticket_medio"
  | "previsibilidad"
  | "operacion"
  | "otro"
  | "retencion"
  | "tiempo";

/** Qué ha intentado ya la persona para resolver su cuello de botella. */
export type NivelIntencion =
  | "nada"
  | "contenido_gratis"
  | "compro_producto"
  | "contrato_servicio";

export interface Roadmap {
  fase: FaseId;
  /** Visible antes de capturar el email: valida el diagnóstico y genera curiosidad. */
  parteA: {
    titulo: string;
    diagnostico: string;
  };
  /** Gateada: se desbloquea al dejar el email. */
  parteB: {
    pasos: [string, string, string];
    cta: string;
    /**
     * CTA alternativo según el cuello de botella (solo Ruta A). Si el tag
     * de esta persona tiene entrada aquí, reemplaza a `cta`; si no, se usa
     * el genérico. Permite ofrecer productos/servicios específicos (ej. la
     * asesoría 1:1) solo a quien tiene el problema que resuelven.
     */
    ctaPorTag?: Partial<Record<TagCuelloDeBotella, string>>;
  };
  status: "placeholder" | "aprobado";
}
