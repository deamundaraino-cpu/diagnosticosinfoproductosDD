import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import { enviarRoadmapPorEmail } from "@/lib/email";
import { sincronizarLeadConEsp } from "@/lib/esp";
import { generarToken } from "@/lib/token";
import { ipDePeticion, permitirPeticion } from "@/lib/ratelimit";
import type { FaseId } from "@/content/tipos";

const FASES: FaseId[] = ["A1", "A2", "A3", "B1", "B2", "B3"];

const bodySchema = z.object({
  id: z.string().min(1).max(100),
  nombre: z.string().min(1).max(120),
  email: z.email(),
  telefono: z.string().max(30).nullish(),
  consentimiento: z.literal(true),
  website: z.string().optional(), // honeypot
});

/**
 * Captura el email tras mostrar el resultado parcial. Actualiza el registro
 * (email, consentimiento, timestamps), envía el roadmap por email y devuelve
 * el token del resultado — el link a /resultado/[token] solo existe después
 * de este paso (el gate del lead magnet).
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

  // Bot detectado: éxito falso.
  if (body.website) {
    return NextResponse.json({ token: `demo-A1-${generarToken()}` });
  }

  const supabase = getSupabase();

  // Modo demo: el id codifica la fase (demo-A2). El token también, para
  // que /resultado/[token] pueda renderizar sin base de datos.
  // SOLO se acepta cuando Supabase NO está configurado (desarrollo local):
  // en producción, un id demo permitiría disparar emails de marca hacia
  // cualquier dirección sin haber completado un diagnóstico real (relé
  // de correo abierto).
  if (body.id.startsWith("demo-")) {
    if (supabase) {
      return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
    }
    const fase = body.id.slice(5) as FaseId;
    if (!FASES.includes(fase)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const token = `demo-${fase}-${generarToken()}`;
    await enviarRoadmapPorEmail({
      para: body.email,
      nombre: body.nombre,
      fase,
      token,
    });
    return NextResponse.json({ token });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 503 });
  }

  const ahora = new Date().toISOString();
  const { data, error } = await supabase
    .from("diagnosticos")
    .update({
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono ?? null,
      consentimiento: true,
      consentimiento_at: ahora,
      email_capturado_at: ahora,
    })
    .eq("id", body.id)
    .select("token_resultado, ruta, fase, score_numerico")
    .single();

  if (error || !data) {
    console.error("[api/capturar] Error actualizando:", error);
    return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
  }

  // Email y ESP son secundarios al flujo: si fallan, la persona igual ve su
  // resultado en pantalla y el lead ya está en Supabase (queda log).
  await Promise.all([
    enviarRoadmapPorEmail({
      para: body.email,
      nombre: body.nombre,
      fase: data.fase as FaseId,
      token: data.token_resultado,
    }),
    sincronizarLeadConEsp({
      email: body.email,
      nombre: body.nombre,
      telefono: body.telefono ?? null,
      ruta: data.ruta as "A" | "B",
      fase: data.fase as FaseId,
      score: data.score_numerico as number,
    }),
  ]);

  return NextResponse.json({ token: data.token_resultado });
}
