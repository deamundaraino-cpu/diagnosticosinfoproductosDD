import { describe, expect, it } from "vitest";
import { ctaEfectivo, ROADMAPS } from "./roadmaps";

describe("ctaEfectivo — oferta condicional de asesoría 1:1", () => {
  it("usa el CTA genérico cuando no hay tag", () => {
    const cta = ctaEfectivo(ROADMAPS.A1, null);
    expect(cta).toBe(ROADMAPS.A1.parteB.cta);
  });

  it("usa el CTA genérico para tags sin oferta específica (leads, conversion)", () => {
    expect(ctaEfectivo(ROADMAPS.A1, "leads")).toBe(ROADMAPS.A1.parteB.cta);
    expect(ctaEfectivo(ROADMAPS.A2, "conversion")).toBe(ROADMAPS.A2.parteB.cta);
  });

  it("ofrece la asesoría 1:1 para el tag retencion, en las 3 fases de Ruta A", () => {
    for (const fase of ["A1", "A2", "A3"] as const) {
      const cta = ctaEfectivo(ROADMAPS[fase], "retencion");
      expect(cta).not.toBe(ROADMAPS[fase].parteB.cta);
      expect(cta).toContain("asesoría 1:1");
      expect(cta.toLowerCase()).not.toMatch(/\$|precio|usd|cop/);
    }
  });

  it("ofrece la asesoría 1:1 para el tag tiempo, en las 3 fases de Ruta A", () => {
    for (const fase of ["A1", "A2", "A3"] as const) {
      const cta = ctaEfectivo(ROADMAPS[fase], "tiempo");
      expect(cta).not.toBe(ROADMAPS[fase].parteB.cta);
      expect(cta).toContain("asesoría 1:1");
    }
  });

  it("Ruta B no tiene ctaPorTag (el tag de B4 no aplica aquí)", () => {
    expect(ROADMAPS.B1.parteB.ctaPorTag).toBeUndefined();
    expect(ctaEfectivo(ROADMAPS.B1, "miedo")).toBe(ROADMAPS.B1.parteB.cta);
  });
});
