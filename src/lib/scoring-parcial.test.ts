import { describe, expect, it } from "vitest";
import { detallarParcial, faseEstimada, faseEstimadaDeDetalle } from "./scoring";
import { PREGUNTAS_A, PREGUNTAS_B } from "@/content/preguntas";
import type { Pregunta } from "@/content/tipos";
import type { Respuestas } from "./scoring";

/**
 * Scoring de diagnósticos a medias — es lo que sostiene el guardado
 * progresivo y el perfil de quien abandona en el panel.
 */

/** Responde las primeras `cuantas` preguntas eligiendo la opción `indice`. */
function primeras(preguntas: Pregunta[], cuantas: number, indice: number): Respuestas {
  const respuestas: Respuestas = {};
  for (const p of preguntas.slice(0, cuantas)) {
    if (p.tipo === "abierta") continue;
    respuestas[p.id] = p.opciones[Math.min(indice, p.opciones.length - 1)].id;
  }
  return respuestas;
}

describe("detallarParcial", () => {
  it("no lanza cuando faltan respuestas (a diferencia de calcularResultado)", () => {
    const parcial = detallarParcial("A", primeras(PREGUNTAS_A, 3, 0));
    expect(parcial.preguntasRespondidas).toBe(3);
    expect(parcial.totalPreguntas).toBe(12);
    expect(parcial.scoreParcial).toBe(3); // 3 preguntas × 1 punto
  });

  it("conserva el orden del catálogo aunque lleguen desordenadas", () => {
    const parcial = detallarParcial("A", { a3: "a3_1", a1: "a1_1" });
    expect(parcial.detalle.map((d) => d.preguntaId)).toEqual(["a1", "a3"]);
  });

  it("descarta ids de pregunta inventados", () => {
    const parcial = detallarParcial("A", {
      a1: "a1_2",
      pregunta_falsa: "loquesea",
    });
    expect(parcial.preguntasRespondidas).toBe(1);
    expect(parcial.scoreParcial).toBe(2);
  });

  it("descarta opciones que no existen para esa pregunta", () => {
    const parcial = detallarParcial("A", { a1: "a1_2", a2: "opcion_falsa" });
    expect(parcial.detalle.map((d) => d.preguntaId)).toEqual(["a1"]);
  });

  it("la pregunta de cuello de botella no suma pero sí queda registrada", () => {
    const parcial = detallarParcial("A", {
      ...primeras(PREGUNTAS_A, 9, 0),
      a10: "operacion",
    });
    expect(parcial.scoreParcial).toBe(9);
    expect(parcial.tag).toBe("operacion");
    expect(parcial.detalle.at(-1)?.puntos).toBeNull();
  });

  it('adjunta el detalle de "Otra cosa" a la respuesta guardada', () => {
    const parcial = detallarParcial(
      "A",
      { a1: "a1_1", a10: "otro" },
      { a10: "Se me fue el equipo" }
    );
    expect(parcial.tag).toBe("otro");
    expect(parcial.detalle.at(-1)?.opcion).toContain("Se me fue el equipo");
  });

  it("ruta B ya no tiene pregunta de etiqueta en la v2", () => {
    const parcial = detallarParcial("B", { b1: "b1_3", b2: "b2_2" });
    expect(parcial.tag).toBeNull();
    expect(parcial.totalPreguntas).toBe(6);
  });

  it("guarda el texto abierto cuando ya se escribió, en ambas rutas", () => {
    const a = detallarParcial("A", { a1: "a1_1" }, { a12: "Me falta sistema" });
    expect(a.detalle.at(-1)?.opcion).toBe("Me falta sistema");
    expect(a.detalle.at(-1)?.puntos).toBeNull();

    const b = detallarParcial("B", { b1: "b1_1" }, { b6: "Me da miedo" });
    expect(b.detalle.at(-1)?.opcion).toBe("Me da miedo");
  });

  it("un texto abierto en blanco no genera respuesta guardada", () => {
    const parcial = detallarParcial("A", { a1: "a1_1" }, { a12: "   " });
    expect(parcial.preguntasRespondidas).toBe(1);
  });

  it("sin ninguna respuesta válida devuelve cero", () => {
    expect(detallarParcial("A", {}).preguntasRespondidas).toBe(0);
    expect(detallarParcial("A", { xx: "yy" }).preguntasRespondidas).toBe(0);
  });
});

describe("faseEstimada (perfil de quien abandonó)", () => {
  it("quien responde todo en la opción baja se proyecta a la fase baja", () => {
    const parcial = detallarParcial("A", primeras(PREGUNTAS_A, 4, 0));
    expect(faseEstimada(parcial)).toBe("A1");
  });

  it("quien responde todo en la opción alta se proyecta a la fase alta", () => {
    const parcial = detallarParcial("A", primeras(PREGUNTAS_A, 4, 2));
    expect(faseEstimada(parcial)).toBe("A3");
  });

  it("con menos de 2 respuestas puntuadas no se arriesga una estimación", () => {
    expect(faseEstimada(detallarParcial("A", primeras(PREGUNTAS_A, 1, 0)))).toBeNull();
    expect(faseEstimada(detallarParcial("A", {}))).toBeNull();
  });

  it("la estimación cae siempre dentro de las fases de su ruta", () => {
    for (let cuantas = 2; cuantas <= 5; cuantas++) {
      for (const indice of [0, 1, 2]) {
        const fase = faseEstimada(
          detallarParcial("B", primeras(PREGUNTAS_B, cuantas, indice))
        );
        if (fase) expect(fase.startsWith("B")).toBe(true);
      }
    }
  });

  it("las etiquetas y el texto abierto no distorsionan la estimación", () => {
    const soloPuntuadas = detallarParcial("A", primeras(PREGUNTAS_A, 9, 1));
    const conEtiquetas = detallarParcial(
      "A",
      { ...primeras(PREGUNTAS_A, 9, 1), a10: "leads", a11: "nada" },
      { a12: "algo que escribí" }
    );
    expect(faseEstimada(conEtiquetas)).toBe(faseEstimada(soloPuntuadas));
  });

  it("faseEstimadaDeDetalle parte del detalle guardado y da el mismo resultado", () => {
    const parcial = detallarParcial("A", primeras(PREGUNTAS_A, 5, 1));
    expect(faseEstimadaDeDetalle("A", parcial.detalle)).toBe(faseEstimada(parcial));
  });
});
