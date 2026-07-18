import { describe, expect, it } from "vitest";
import { DIAGNOSTICOS_DEMO, resumenDemo } from "./demo-data";

const RANGO_FASE: Record<string, [number, number]> = {
  A1: [8, 13],
  A2: [14, 19],
  A3: [20, 24],
  B1: [5, 8],
  B2: [9, 12],
  B3: [13, 14],
};

describe("dataset demo del panel /admin", () => {
  it("genera 42 filas con score dentro del rango de su fase", () => {
    expect(DIAGNOSTICOS_DEMO).toHaveLength(42);
    for (const fila of DIAGNOSTICOS_DEMO) {
      const [min, max] = RANGO_FASE[fila.fase];
      expect(fila.score_numerico).toBeGreaterThanOrEqual(min);
      expect(fila.score_numerico).toBeLessThanOrEqual(max);
      expect(fila.fase[0]).toBe(fila.ruta);
    }
  });

  it("email y nombre están ambos presentes o ambos ausentes", () => {
    for (const fila of DIAGNOSTICOS_DEMO) {
      expect(Boolean(fila.email)).toBe(Boolean(fila.nombre));
    }
  });

  it("resumenDemo agrega totales consistentes con el dataset crudo", () => {
    const resumen = resumenDemo();
    const totalResumen = resumen.reduce((s, r) => s + r.total, 0);
    const conEmailResumen = resumen.reduce((s, r) => s + r.con_email, 0);

    expect(totalResumen).toBe(DIAGNOSTICOS_DEMO.length);
    expect(conEmailResumen).toBe(DIAGNOSTICOS_DEMO.filter((d) => d.email).length);
    for (const r of resumen) {
      expect(r.con_email).toBeLessThanOrEqual(r.total);
    }
  });

  it("es determinista (misma semilla → mismo dataset en cada import)", () => {
    expect(DIAGNOSTICOS_DEMO[0].score_numerico).toBe(DIAGNOSTICOS_DEMO[0].score_numerico);
    const total = DIAGNOSTICOS_DEMO.reduce((s, d) => s + d.score_numerico, 0);
    expect(total).toBeGreaterThan(0);
  });
});
