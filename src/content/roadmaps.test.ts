import { describe, expect, it } from "vitest";
import { ctaEfectivo, ROADMAPS } from "./roadmaps";

// Revela precio = cifra concreta de dinero (ej. "$500", "USD 30", "300.000 COP").
// La palabra "precio" sola es válida como consejo de negocio (ej. "precio fijo").
function revelaPrecio(texto: string): boolean {
  return /\$\s?\d|(usd|cop)\s?\d/i.test(texto);
}

function prometeIngresoGarantizado(texto: string): boolean {
  return /garantizad/i.test(texto);
}

describe("ctaEfectivo — mapeo de escalera de productos por fase/tag", () => {
  it("Ruta A1: leads y conversión recomiendan productos distintos entre sí", () => {
    const leads = ctaEfectivo(ROADMAPS.A1, "leads");
    const conversion = ctaEfectivo(ROADMAPS.A1, "conversion");
    expect(leads).toContain("leadmagnets");
    expect(conversion).toContain("anuncios");
    expect(leads).not.toBe(conversion);
  });

  it("Ruta A1/A2/A3: retención y tiempo siempre ofrecen la asesoría 1:1", () => {
    for (const fase of ["A1", "A2", "A3"] as const) {
      const retencion = ctaEfectivo(ROADMAPS[fase], "retencion");
      const tiempo = ctaEfectivo(ROADMAPS[fase], "tiempo");
      expect(retencion).toContain("asesoría 1:1");
      expect(tiempo).toContain("asesoría 1:1");
    }
  });

  it("Ruta A2/A3: leads y conversión caen al CTA base (Fórmula 7X), no distinguen entre sí", () => {
    const a2Leads = ctaEfectivo(ROADMAPS.A2, "leads");
    const a2Conversion = ctaEfectivo(ROADMAPS.A2, "conversion");
    expect(a2Leads).toBe(a2Conversion);
    expect(a2Leads).toBe(ROADMAPS.A2.parteB.cta);
    expect(a2Leads).toContain("Fórmula 7X");

    expect(ctaEfectivo(ROADMAPS.A3, "leads")).toContain("Fórmula 7X");
  });

  it("Ruta B: cada fase recomienda su producto de entrada correspondiente", () => {
    expect(ctaEfectivo(ROADMAPS.B1, null)).toMatch(/primer producto digital/);
    expect(ctaEfectivo(ROADMAPS.B2, null)).toMatch(/ruta más rápida/);
    expect(ctaEfectivo(ROADMAPS.B3, null)).toMatch(/empaquetar/);
  });

  it("sin tag (null) usa siempre el CTA genérico de la fase", () => {
    for (const fase of Object.keys(ROADMAPS) as Array<keyof typeof ROADMAPS>) {
      expect(ctaEfectivo(ROADMAPS[fase], null)).toBe(ROADMAPS[fase].parteB.cta);
    }
  });

  it("ningún CTA (base ni por tag) promete ingresos garantizados ni revela precio", () => {
    for (const fase of Object.values(ROADMAPS)) {
      expect(revelaPrecio(fase.parteB.cta)).toBe(false);
      expect(prometeIngresoGarantizado(fase.parteB.cta)).toBe(false);
      for (const cta of Object.values(fase.parteB.ctaPorTag ?? {})) {
        expect(revelaPrecio(cta)).toBe(false);
        expect(prometeIngresoGarantizado(cta)).toBe(false);
      }
    }
  });
});
