import { describe, expect, it } from "vitest";
import { COPY } from "./copy";
import { recomendacionProductoActiva } from "./roadmaps";

/**
 * Validaciones automáticas de marca del bloque final de investigación.
 *
 * El encuadre es investigación, no regalo ni venta: si alguien reescribe
 * el copy y mete "gratis", "asesoría" o "consultoría", el build falla.
 * Es la misma idea que las validaciones de precio de roadmaps.test.ts.
 */

const PALABRAS_PROHIBIDAS = ["gratis", "asesoría", "asesoria", "consultoría", "consultoria"];

function revelaPrecio(texto: string): boolean {
  return /\$\s?\d|(usd|cop)\s?\d/i.test(texto);
}

function prometeIngresoGarantizado(texto: string): boolean {
  return /garantizad/i.test(texto);
}

const TEXTOS_DEL_BLOQUE = Object.values(COPY.llamada);

describe("bloque final de llamada de investigación", () => {
  it("no usa las palabras que rompen el encuadre de investigación", () => {
    for (const texto of TEXTOS_DEL_BLOQUE) {
      for (const prohibida of PALABRAS_PROHIBIDAS) {
        expect(
          texto.toLowerCase().includes(prohibida),
          `"${prohibida}" aparece en: ${texto}`
        ).toBe(false);
      }
    }
  });

  it("no revela precios ni promete ingresos garantizados", () => {
    for (const texto of TEXTOS_DEL_BLOQUE) {
      expect(revelaPrecio(texto)).toBe(false);
      expect(prometeIngresoGarantizado(texto)).toBe(false);
    }
  });

  it("deja claro que no es una llamada de ventas y cuánto dura", () => {
    expect(COPY.llamada.cuerpo).toMatch(/30 minutos/);
    expect(COPY.llamada.cuerpo).toMatch(/no (es una llamada de ventas|tengo nada que ofrecerte)/i);
  });

  it("la recomendación de producto está desactivada por defecto", () => {
    // Durante la fase de investigación el diagnóstico no vende. El mapeo
    // fase/tag → producto sigue existiendo, solo apagado.
    expect(recomendacionProductoActiva()).toBe(false);
  });
});
