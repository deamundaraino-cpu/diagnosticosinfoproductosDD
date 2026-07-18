import { describe, expect, it } from "vitest";
import { calcularResultado, faseDeScore, RespuestasInvalidasError } from "./scoring";
import { PREGUNTAS_A, PREGUNTAS_B } from "@/content/preguntas";
import type { Respuestas } from "./scoring";

/** Construye respuestas eligiendo la opción en el índice dado (clampeado) por pregunta. */
function respuestasPorIndice(
  preguntas: typeof PREGUNTAS_A,
  indice: number
): Respuestas {
  const respuestas: Respuestas = {};
  for (const p of preguntas) {
    const i = Math.min(indice, p.opciones.length - 1);
    respuestas[p.id] = p.opciones[i].id;
  }
  return respuestas;
}

describe("Ruta A (rango 8-24)", () => {
  it("mínimo: todo 1 punto → score 8, fase A1", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 0));
    expect(r.score).toBe(8);
    expect(r.fase).toBe("A1");
  });

  it("medio: todo 2 puntos → score 16, fase A2", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 1));
    expect(r.score).toBe(16);
    expect(r.fase).toBe("A2");
  });

  it("máximo: todo 3 puntos → score 24, fase A3", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 2));
    expect(r.score).toBe(24);
    expect(r.fase).toBe("A3");
  });

  it("borde A1/A2: score 13 → A1, score 14 → A2", () => {
    expect(faseDeScore("A", 13)).toBe("A1");
    expect(faseDeScore("A", 14)).toBe("A2");
  });

  it("borde A2/A3: score 19 → A2, score 20 → A3", () => {
    expect(faseDeScore("A", 19)).toBe("A2");
    expect(faseDeScore("A", 20)).toBe("A3");
  });

  it("mezcla realista: 5×1 + 3×3 = 14 → A2", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_A, 0);
    respuestas["a1"] = "a1_3";
    respuestas["a2"] = "a2_3";
    respuestas["a3"] = "a3_3";
    const r = calcularResultado("A", respuestas);
    expect(r.score).toBe(14);
    expect(r.fase).toBe("A2");
  });

  it("captura el tag de cuello de botella y no lo suma al score", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_A, 0);
    respuestas["a9"] = "conversion";
    const r = calcularResultado("A", respuestas);
    expect(r.tag).toBe("conversion");
    expect(r.score).toBe(8);
  });
});

describe("Ruta B (rango real 5-14: la pregunta 5 solo llega a 2 puntos)", () => {
  it("mínimo: todo 1 punto → score 5, fase B1", () => {
    const r = calcularResultado("B", respuestasPorIndice(PREGUNTAS_B, 0));
    expect(r.score).toBe(5);
    expect(r.fase).toBe("B1");
  });

  it("máximo real: score 14 (no 15), fase B3", () => {
    const r = calcularResultado("B", respuestasPorIndice(PREGUNTAS_B, 2));
    expect(r.score).toBe(14);
    expect(r.fase).toBe("B3");
  });

  it("borde B1/B2: score 8 → B1, score 9 → B2", () => {
    expect(faseDeScore("B", 8)).toBe("B1");
    expect(faseDeScore("B", 9)).toBe("B2");
  });

  it("borde B2/B3: score 12 → B2, score 13 → B3", () => {
    expect(faseDeScore("B", 12)).toBe("B2");
    expect(faseDeScore("B", 13)).toBe("B3");
  });

  it("mezcla realista: claridad alta sin audiencia → B2", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_B, 0);
    respuestas["b1"] = "b1_3"; // claro: 3
    respuestas["b2"] = "b2_3"; // ya vendió: 3
    // b3 = 1, b5 = 1, b6 = 1 → total 9
    const r = calcularResultado("B", respuestas);
    expect(r.score).toBe(9);
    expect(r.fase).toBe("B2");
  });

  it("captura el tag de freno principal", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_B, 0);
    respuestas["b4"] = "miedo";
    const r = calcularResultado("B", respuestas);
    expect(r.tag).toBe("miedo");
  });
});

describe("Validación de respuestas", () => {
  it("rechaza si falta una pregunta", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_A, 0);
    delete respuestas["a5"];
    expect(() => calcularResultado("A", respuestas)).toThrow(
      RespuestasInvalidasError
    );
  });

  it("rechaza una opción que no existe", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_A, 0);
    respuestas["a3"] = "opcion_falsa";
    expect(() => calcularResultado("A", respuestas)).toThrow(
      RespuestasInvalidasError
    );
  });

  it("el detalle incluye todas las preguntas con sus puntos", () => {
    const r = calcularResultado("B", respuestasPorIndice(PREGUNTAS_B, 0));
    expect(r.detalle).toHaveLength(6);
    expect(r.detalle.filter((d) => d.puntos === null)).toHaveLength(1);
  });
});
