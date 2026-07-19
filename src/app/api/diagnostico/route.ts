import { NextResponse } from "next/server";
import { z } from "zod";
import { calcularResultado, RespuestasInvalidasError } from "@/lib/scoring";
import { generarToken } from "@/lib/token";
import { getSupabase } from "@/lib/supabase";
import { ipDePeticion, permitirPeticion } from "@/lib/ratelimit";

const bodySchema = z.object({
  ruta: z.enum(["A", "B"]),
  // Claves y valores acotados (los ids reales miden <15 chars) y máximo
  // 12 entradas (la ruta más larga tiene 9 preguntas) — evita payloads
  // basura de gran tamaño.
  respuestas: z
    .record(z.string().max(30), z.string().max(60))
    .refine((r) => Object.keys(r).length <= 12, "demasiadas respuestas"),
  utm: z
    .object({
      source: z.string().max(200).nullish(),
      medium: z.string().max(200).nullish(),
      campaign: z.string().max(200).nullish(),
      content: z.string().max(200).nullish(),
    })
    .nullish(),
  referrer: z.string().max(500).nullish(),
  // Honeypot: los humanos nunca ven este campo; si viene lleno, es un bot.
  website: z.string().optional(),
});

/**
 * Se llama al COMPLETAR el quiz (antes de capturar el email).
 * Crea el registro con email NULL — así la tasa de captura es medible.
 * Devuelve un id interno; el token del resultado solo se entrega al capturar.
 */
export async function POST(request: Request) {
  if (!permitirPeticion(ipDePeticion(request))) {
    return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Bot detectado: respuesta falsa de éxito para no delatar el honeypot.
  if (body.website) {
    return NextResponse.json({ id: "ok", fase: "A1", score: 8, demo: false });
  }

  let resultado;
  try {
    resultado = calcularResultado(body.ruta, body.respuestas);
  } catch (err) {
    if (err instanceof RespuestasInvalidasError) {
      return NextResponse.json({ error: "Respuestas incompletas" }, { status: 400 });
    }
    throw err;
  }

  const supabase = getSupabase();

  // Modo demo (sin Supabase): el flujo UI completo funciona sin persistir.
  if (!supabase) {
    return NextResponse.json({
      id: `demo-${resultado.fase}`,
      fase: resultado.fase,
      score: resultado.score,
      demo: true,
    });
  }

  const { data, error } = await supabase
    .from("diagnosticos")
    .insert({
      token_resultado: generarToken(),
      ruta: resultado.ruta,
      fase: resultado.fase,
      score_numerico: resultado.score,
      respuestas: resultado.detalle,
      cuello_de_botella: resultado.ruta === "A" ? resultado.tag : null,
      freno_principal: resultado.ruta === "B" ? resultado.tag : null,
      utm_source: body.utm?.source ?? null,
      utm_medium: body.utm?.medium ?? null,
      utm_campaign: body.utm?.campaign ?? null,
      utm_content: body.utm?.content ?? null,
      referrer: body.referrer ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[api/diagnostico] Error insertando:", error);
    return NextResponse.json({ error: "Error guardando" }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    fase: resultado.fase,
    score: resultado.score,
    demo: false,
  });
}
