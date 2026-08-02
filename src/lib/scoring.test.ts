import { describe, expect, it } from "vitest";
import { calcularResultado, faseDeScore, RespuestasInvalidasError } from "./scoring";
import { PREGUNTAS_A, PREGUNTAS_B } from "@/content/preguntas";
import type { Pregunta } from "@/content/tipos";
import type { Respuestas } from "./scoring";

/**
 * Escalas del cuestionario v2: ruta A 9-27 (9 puntuadas),
 * ruta B 5-15 (5 puntuadas). Las preguntas abiertas no puntúan y son
 * opcionales, así que se excluyen al construir respuestas.
 */
function respuestasPorIndice(preguntas: Pregunta[], indice: number): Respuestas {
  const respuestas: Respuestas = {};
  for (const p of preguntas) {
    if (p.tipo === "abierta") continue;
    respuestas[p.id] = p.opciones[Math.min(indice, p.opciones.length - 1)].id;
  }
  return respuestas;
}

describe("Ruta A (rango 9-27)", () => {
  it("mínimo: todo 1 punto → score 9, fase A1", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 0));
    expect(r.score).toBe(9);
    expect(r.fase).toBe("A1");
  });

  it("máximo: todo 3 puntos → score 27, fase A3", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 2));
    expect(r.score).toBe(27);
    expect(r.fase).toBe("A3");
  });

  it("intermedio: todo 2 puntos → score 18, fase A2", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 1));
    expect(r.score).toBe(18);
    expect(r.fase).toBe("A2");
  });

  it("los umbrales caen donde dice la especificación", () => {
    expect(faseDeScore("A", 9)).toBe("A1");
    expect(faseDeScore("A", 15)).toBe("A1");
    expect(faseDeScore("A", 16)).toBe("A2");
    expect(faseDeScore("A", 21)).toBe("A2");
    expect(faseDeScore("A", 22)).toBe("A3");
    expect(faseDeScore("A", 27)).toBe("A3");
  });

  it("son 12 pantallas: 9 puntuadas, 2 de etiqueta y 1 abierta", () => {
    expect(PREGUNTAS_A).toHaveLength(12);
    expect(PREGUNTAS_A.filter((p) => p.tipo === "puntuada")).toHaveLength(9);
    expect(PREGUNTAS_A.filter((p) => p.tipo === "tag")).toHaveLength(2);
    expect(PREGUNTAS_A.filter((p) => p.tipo === "abierta")).toHaveLength(1);
  });
});

describe("Ruta B (rango 5-15)", () => {
  it("mínimo: todo 1 punto → score 5, fase B1", () => {
    const r = calcularResultado("B", respuestasPorIndice(PREGUNTAS_B, 0));
    expect(r.score).toBe(5);
    expect(r.fase).toBe("B1");
  });

  it("máximo: todo 3 puntos → score 15, fase B3", () => {
    const r = calcularResultado("B", respuestasPorIndice(PREGUNTAS_B, 2));
    expect(r.score).toBe(15);
    expect(r.fase).toBe("B3");
  });

  it("los umbrales caen donde dice la especificación", () => {
    expect(faseDeScore("B", 5)).toBe("B1");
    expect(faseDeScore("B", 8)).toBe("B1");
    expect(faseDeScore("B", 9)).toBe("B2");
    expect(faseDeScore("B", 12)).toBe("B2");
    expect(faseDeScore("B", 13)).toBe("B3");
    expect(faseDeScore("B", 15)).toBe("B3");
  });

  it("son 6 pantallas: 5 puntuadas y 1 abierta", () => {
    expect(PREGUNTAS_B).toHaveLength(6);
    expect(PREGUNTAS_B.filter((p) => p.tipo === "puntuada")).toHaveLength(5);
    expect(PREGUNTAS_B.filter((p) => p.tipo === "abierta")).toHaveLength(1);
  });

  it("ya no captura tag: la v2 retiró la pregunta de freno principal", () => {
    const r = calcularResultado("B", respuestasPorIndice(PREGUNTAS_B, 1));
    expect(r.tag).toBeNull();
  });
});

describe("preguntas de etiqueta (Ruta A)", () => {
  it("guarda el cuello de botella y el nivel de intención sin alterar el score", () => {
    const r = calcularResultado("A", {
      ...respuestasPorIndice(PREGUNTAS_A, 0),
      a10: "ticket_medio",
      a11: "compro_producto",
    });
    expect(r.tag).toBe("ticket_medio");
    expect(r.nivelIntencion).toBe("compro_producto");
    expect(r.score).toBe(9);
  });

  it('"Otra cosa" sin detalle escrito no deja completar', () => {
    const respuestas = { ...respuestasPorIndice(PREGUNTAS_A, 0), a10: "otro" };
    expect(() => calcularResultado("A", respuestas)).toThrow(RespuestasInvalidasError);
    expect(() => calcularResultado("A", respuestas, { a10: "   " })).toThrow(
      RespuestasInvalidasError
    );
  });

  it('"Otra cosa" con detalle lo guarda aparte del tag', () => {
    const respuestas = { ...respuestasPorIndice(PREGUNTAS_A, 0), a10: "otro" };
    const r = calcularResultado("A", respuestas, { a10: "  Mi socio se fue  " });
    expect(r.tag).toBe("otro");
    expect(r.cuelloDeBotellaOtro).toBe("Mi socio se fue");
    expect(r.detalle.find((d) => d.preguntaId === "a10")?.opcion).toContain(
      "Mi socio se fue"
    );
  });

  it("el detalle se recorta a 300 caracteres", () => {
    const respuestas = { ...respuestasPorIndice(PREGUNTAS_A, 0), a10: "otro" };
    const r = calcularResultado("A", respuestas, { a10: "x".repeat(500) });
    expect(r.cuelloDeBotellaOtro).toHaveLength(300);
  });
});

describe("pregunta abierta de investigación", () => {
  it("es opcional: no responderla no impide llegar al resultado", () => {
    for (const ruta of ["A", "B"] as const) {
      const preguntas = ruta === "A" ? PREGUNTAS_A : PREGUNTAS_B;
      const r = calcularResultado(ruta, respuestasPorIndice(preguntas, 0));
      expect(r.textoAbierto).toBeNull();
      expect(r.fase).toBeTruthy();
    }
  });

  it("se guarda cuando sí se escribe, en ambas rutas", () => {
    const a = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 0), {
      a12: "Creo que me falta sistema",
    });
    expect(a.textoAbierto).toBe("Creo que me falta sistema");

    const b = calcularResultado("B", respuestasPorIndice(PREGUNTAS_B, 0), {
      b6: "Me da miedo empezar",
    });
    expect(b.textoAbierto).toBe("Me da miedo empezar");
  });

  it("un texto en blanco cuenta como saltada", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 0), {
      a12: "    ",
    });
    expect(r.textoAbierto).toBeNull();
    expect(r.detalle.find((d) => d.preguntaId === "a12")).toBeUndefined();
  });

  it("se recorta a 500 caracteres", () => {
    const r = calcularResultado("A", respuestasPorIndice(PREGUNTAS_A, 0), {
      a12: "y".repeat(900),
    });
    expect(r.textoAbierto).toHaveLength(500);
  });
});

describe("validación de entradas", () => {
  it("rechaza si falta una pregunta puntuada", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_A, 0);
    delete respuestas["a5"];
    expect(() => calcularResultado("A", respuestas)).toThrow(RespuestasInvalidasError);
  });

  it("rechaza si falta una pregunta de etiqueta", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_A, 0);
    delete respuestas["a11"];
    expect(() => calcularResultado("A", respuestas)).toThrow(RespuestasInvalidasError);
  });

  it("rechaza una opción que no existe", () => {
    const respuestas = respuestasPorIndice(PREGUNTAS_A, 0);
    respuestas["a3"] = "opcion_falsa";
    expect(() => calcularResultado("A", respuestas)).toThrow(RespuestasInvalidasError);
  });
});

describe("integridad del catálogo", () => {
  it("todos los ids de pregunta y de opción son únicos", () => {
    for (const preguntas of [PREGUNTAS_A, PREGUNTAS_B]) {
      const idsPregunta = preguntas.map((p) => p.id);
      expect(new Set(idsPregunta).size).toBe(idsPregunta.length);

      for (const p of preguntas) {
        if (p.tipo === "abierta") continue;
        const idsOpcion = p.opciones.map((o) => o.id);
        expect(new Set(idsOpcion).size).toBe(idsOpcion.length);
      }
    }
  });

  it("las opciones puntuadas se muestran de menor a mayor puntaje", () => {
    for (const preguntas of [PREGUNTAS_A, PREGUNTAS_B]) {
      for (const p of preguntas) {
        if (p.tipo !== "puntuada") continue;
        const puntos = p.opciones.map((o) => o.puntos);
        expect(puntos).toEqual([...puntos].sort((a, b) => a - b));
      }
    }
  });

  it("la pregunta abierta es siempre la última de su ruta", () => {
    expect(PREGUNTAS_A.at(-1)?.tipo).toBe("abierta");
    expect(PREGUNTAS_B.at(-1)?.tipo).toBe("abierta");
  });
});
