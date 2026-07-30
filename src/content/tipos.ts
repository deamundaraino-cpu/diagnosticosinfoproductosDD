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
}

export interface PreguntaPuntuada {
  id: string;
  tipo: "puntuada";
  texto: string;
  opciones: OpcionPuntuada[];
}

export interface PreguntaTag {
  id: string;
  tipo: "tag";
  texto: string;
  opciones: OpcionTag[];
}

export type Pregunta = PreguntaPuntuada | PreguntaTag;

/** Tags de cuello de botella de Ruta A (pregunta 9) — usados para ofertas condicionales. */
export type TagCuelloDeBotella = "leads" | "conversion" | "retencion" | "tiempo";

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
