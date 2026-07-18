import "server-only";
import { Resend } from "resend";
import { roadmapDeFase } from "@/content/roadmaps";
import { COPY } from "@/content/copy";
import type { FaseId } from "@/content/tipos";

/**
 * Envío del roadmap por email vía Resend.
 * Sin RESEND_API_KEY → no-op con log visible (la app sigue funcionando).
 */

interface EnvioRoadmap {
  para: string;
  nombre: string | null;
  fase: FaseId;
  token: string;
}

export async function enviarRoadmapPorEmail({
  para,
  nombre,
  fase,
  token,
}: EnvioRoadmap): Promise<{ enviado: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[email] RESEND_API_KEY/EMAIL_FROM no configuradas — no se envió el roadmap a ${para} (fase ${fase}).`
    );
    return { enviado: false };
  }

  const roadmap = roadmapDeFase(fase);
  const urlResultado = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/resultado/${token}`;

  const html = `
  <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b;">
    <p style="font-size: 15px;">${nombre ? `Hola ${escaparHtml(nombre)},` : "Hola,"}</p>
    <p style="font-size: 15px;">${COPY.email.intro}</p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h1 style="font-size: 20px; margin: 0 0 8px;">${roadmap.parteA.titulo}</h1>
      <p style="font-size: 14px; color: #475569; margin: 0;">${roadmap.parteA.diagnostico}</p>
    </div>

    <h2 style="font-size: 16px;">${COPY.resultado.tusPasos}</h2>
    <ol style="font-size: 14px; color: #334155; padding-left: 20px;">
      ${roadmap.parteB.pasos.map((p) => `<li style="margin-bottom: 12px;">${p}</li>`).join("")}
    </ol>

    <p style="font-size: 14px; color: #475569;">${roadmap.parteB.cta}</p>

    <p style="margin: 28px 0;">
      <a href="${urlResultado}" style="background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; display: inline-block;">
        ${COPY.email.linkTexto}
      </a>
    </p>

    <p style="font-size: 13px; color: #64748b; white-space: pre-line;">${COPY.email.despedida}</p>
  </div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: para,
      subject: COPY.email.asunto(nombre),
      html,
    });
    if (error) {
      console.error("[email] Error de Resend:", error);
      return { enviado: false };
    }
    return { enviado: true };
  } catch (err) {
    console.error("[email] Fallo enviando el roadmap:", err);
    return { enviado: false };
  }
}

function escaparHtml(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
