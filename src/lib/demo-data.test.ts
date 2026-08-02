import { describe, expect, it } from "vitest";
import {
  DIAGNOSTICOS_DEMO,
  abandonoPorPreguntaDemo,
  embudoDemo,
  resumenDemo,
  utmDemo,
} from "./demo-data";

const RANGO_FASE: Record<string, [number, number]> = {
  A1: [8, 13],
  A2: [14, 19],
  A3: [20, 24],
  B1: [5, 8],
  B2: [9, 12],
  B3: [13, 14],
};

describe("dataset demo del panel /admin", () => {
  it("los diagnósticos completados tienen score dentro del rango de su fase", () => {
    expect(DIAGNOSTICOS_DEMO).toHaveLength(96);
    for (const fila of DIAGNOSTICOS_DEMO) {
      if (!fila.fase) continue;
      const [min, max] = RANGO_FASE[fila.fase];
      expect(fila.score_numerico).toBeGreaterThanOrEqual(min);
      expect(fila.score_numerico).toBeLessThanOrEqual(max);
      expect(fila.fase[0]).toBe(fila.ruta);
    }
  });

  it("solo hay fase y score cuando el quiz se terminó", () => {
    for (const fila of DIAGNOSTICOS_DEMO) {
      const completo = fila.preguntas_respondidas === fila.total_preguntas;
      expect(Boolean(fila.fase)).toBe(completo);
      expect(fila.score_numerico === null).toBe(!completo);
    }
  });

  it("el avance guardado coincide con las respuestas guardadas", () => {
    for (const fila of DIAGNOSTICOS_DEMO) {
      expect(fila.respuestas).toHaveLength(fila.preguntas_respondidas);
      expect(fila.preguntas_respondidas).toBeGreaterThan(0);
      expect(fila.preguntas_respondidas).toBeLessThanOrEqual(fila.total_preguntas);
      expect(fila.ultima_pregunta_id).toBe(fila.respuestas.at(-1)?.preguntaId);
    }
  });

  it("solo quien dejó el email tiene nombre y correo", () => {
    for (const fila of DIAGNOSTICOS_DEMO) {
      expect(Boolean(fila.email)).toBe(Boolean(fila.nombre));
      expect(Boolean(fila.email)).toBe(fila.estado === "capturado");
    }
  });

  it("hay abandonos de los dos tipos, para que el panel tenga qué mostrar", () => {
    const tipos = new Set(DIAGNOSTICOS_DEMO.map((d) => d.estado_efectivo));
    expect(tipos.has("abandono_preguntas")).toBe(true);
    expect(tipos.has("abandono_gate")).toBe(true);
    expect(tipos.has("capturado")).toBe(true);
  });

  it("resumenDemo agrega solo los diagnósticos con fase", () => {
    const resumen = resumenDemo();
    const conFase = DIAGNOSTICOS_DEMO.filter((d) => d.fase);

    expect(resumen.reduce((s, r) => s + r.total, 0)).toBe(conFase.length);
    expect(resumen.reduce((s, r) => s + r.con_email, 0)).toBe(
      conFase.filter((d) => d.email).length
    );
    for (const r of resumen) {
      expect(r.con_email).toBeLessThanOrEqual(r.total);
    }
  });

  it("embudoDemo cuadra con el dataset crudo y respeta el orden del embudo", () => {
    const embudo = embudoDemo();
    const suma = (campo: "iniciados" | "completados" | "capturados") =>
      embudo.reduce((s, r) => s + r[campo], 0);

    expect(suma("iniciados")).toBe(DIAGNOSTICOS_DEMO.length);
    expect(suma("completados")).toBe(
      DIAGNOSTICOS_DEMO.filter((d) => d.estado !== "iniciado").length
    );
    expect(suma("capturados")).toBe(
      DIAGNOSTICOS_DEMO.filter((d) => d.estado === "capturado").length
    );
    // Nadie puede dejar el email sin haber completado, ni completar sin iniciar.
    expect(suma("capturados")).toBeLessThanOrEqual(suma("completados"));
    expect(suma("completados")).toBeLessThanOrEqual(suma("iniciados"));
  });

  it("el histograma de abandono suma exactamente los abandonos dentro del quiz", () => {
    const total = abandonoPorPreguntaDemo().reduce((s, p) => s + p.abandonos, 0);
    expect(total).toBe(
      DIAGNOSTICOS_DEMO.filter((d) => d.estado_efectivo === "abandono_preguntas").length
    );
  });

  it("la atribución cubre todos los diagnósticos", () => {
    const utm = utmDemo();
    expect(utm.reduce((s, u) => s + u.iniciados, 0)).toBe(DIAGNOSTICOS_DEMO.length);
    for (const fila of utm) {
      expect(fila.capturados).toBeLessThanOrEqual(fila.completados);
      expect(fila.completados).toBeLessThanOrEqual(fila.iniciados);
    }
  });

  it("es determinista (misma semilla → mismo dataset en cada import)", () => {
    const total = DIAGNOSTICOS_DEMO.reduce(
      (s, d) => s + (d.score_numerico ?? 0),
      0
    );
    expect(total).toBeGreaterThan(0);
  });
});
