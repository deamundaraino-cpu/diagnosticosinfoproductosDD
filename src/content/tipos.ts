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
  };
  status: "placeholder" | "aprobado";
}
