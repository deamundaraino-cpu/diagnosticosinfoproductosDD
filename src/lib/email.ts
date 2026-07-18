import "server-only";
import { Resend } from "resend";
import { roadmapDeFase } from "@/content/roadmaps";
import { COPY } from "@/content/copy";
import type { FaseId } from "@/content/tipos";

/**
 * Envío del roadmap por email vía Resend.
 * Sin RESEND_API_KEY → no-op con log visible (la app sigue funcionando).
 *
 * La plantilla replica la identidad de marca del resultado web (navy +
 * naranja) pero con layout de tablas y colores sólidos (sin blur, sin
 * gradientes, sin fuentes custom) porque esos efectos no son fiables en
 * clientes de correo — Outlook en particular los ignora o los rompe.
 */

// Paleta email-safe: mismos tonos que globals.css pero en hex sólido,
// nunca rgba() — Outlook de escritorio no soporta transparencias.
const COLOR = {
  fondo: "#0d1420",
  tarjeta: "#141b2c",
  borde: "#232f42",
  naranja: "#eb4e27",
  naranjaClaro: "#ff7a4d",
  naranjaTinte: "#2a1c14", // fondo del badge de fase, aprox. naranja/12% sobre navy
  texto: "#f1eee9",
  textoMuted: "#93a1b8",
} as const;

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
  const saludo = nombre ? `Hola ${escaparHtml(nombre)},` : "Hola,";

  const filasPasos = roadmap.parteB.pasos
    .map(
      (paso, i) => `
      <tr>
        <td width="36" valign="top" style="padding: 0 12px 18px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="28" height="28" style="background-color:${COLOR.naranja}; border-radius:50%;">
            <tr><td align="center" valign="middle" style="color:#ffffff; font-size:13px; font-weight:700; font-family: Helvetica, Arial, sans-serif;">${i + 1}</td></tr>
          </table>
        </td>
        <td valign="top" style="padding: 0 0 18px 0; color:${COLOR.texto}; font-size:14px; line-height:1.6; font-family: Helvetica, Arial, sans-serif;">
          ${paso}
        </td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>${COPY.email.asunto(nombre)}</title>
</head>
<body style="margin:0; padding:0; background-color:${COLOR.fondo};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.fondo};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">

          <!-- Badge de marca -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${COLOR.tarjeta}; border:1px solid ${COLOR.borde}; border-radius:999px;">
                <tr>
                  <td style="padding:8px 16px; font-family: Helvetica, Arial, sans-serif; font-size:11px; font-weight:700; letter-spacing:1px; color:${COLOR.textoMuted}; text-transform:uppercase;">
                    ● ${COPY.marca.nombre}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding-bottom:20px; font-family: Helvetica, Arial, sans-serif; font-size:15px; line-height:1.6; color:${COLOR.texto};">
              <p style="margin:0 0 12px 0;">${saludo}</p>
              <p style="margin:0; color:${COLOR.textoMuted};">${COPY.email.intro}</p>
            </td>
          </tr>

          <!-- Tarjeta: fase + diagnóstico -->
          <tr>
            <td style="background-color:${COLOR.tarjeta}; border:1px solid ${COLOR.borde}; border-radius:16px; padding:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${COLOR.naranjaTinte}; border:1px solid ${COLOR.naranja}; border-radius:999px; padding:6px 14px; font-family: Helvetica, Arial, sans-serif; font-size:11px; font-weight:700; letter-spacing:0.5px; color:${COLOR.naranjaClaro}; text-transform:uppercase;">
                    Fase ${fase}
                  </td>
                </tr>
              </table>

              <h1 style="margin:16px 0 0 0; font-family: Helvetica, Arial, sans-serif; font-size:22px; font-weight:700; color:#ffffff;">
                ${roadmap.parteA.titulo}
              </h1>
              <p style="margin:12px 0 0 0; font-family: Helvetica, Arial, sans-serif; font-size:14px; line-height:1.65; color:${COLOR.textoMuted};">
                ${roadmap.parteA.diagnostico}
              </p>

              <h2 style="margin:28px 0 16px 0; font-family: Helvetica, Arial, sans-serif; font-size:16px; font-weight:700; color:#ffffff;">
                ${COPY.resultado.tusPasos}
              </h2>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${filasPasos}
              </table>

              <p style="margin:4px 0 0 0; font-family: Helvetica, Arial, sans-serif; font-size:14px; line-height:1.6; color:${COLOR.textoMuted};">
                ${roadmap.parteB.cta}
              </p>
            </td>
          </tr>

          <!-- CTA: ver roadmap online -->
          <tr>
            <td align="center" style="padding:28px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${COLOR.naranja}; border-radius:12px;">
                    <a href="${urlResultado}" style="display:inline-block; padding:15px 28px; font-family: Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">
                      ${COPY.email.linkTexto} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tarjeta secundaria: seguir en Instagram -->
          <tr>
            <td align="center" style="background-color:${COLOR.tarjeta}; border:1px solid ${COLOR.borde}; border-radius:16px; padding:28px;">
              <p style="margin:0 0 6px 0; font-family: Helvetica, Arial, sans-serif; font-size:16px; font-weight:700; color:#ffffff;">
                ${COPY.resultado.ctaTitulo}
              </p>
              <p style="margin:0 0 20px 0; font-family: Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; color:${COLOR.textoMuted};">
                ${COPY.resultado.ctaTexto}
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${COLOR.naranja}; border-radius:10px;">
                    <a href="${COPY.marca.instagramUrl}" style="display:inline-block; padding:12px 22px; font-family: Helvetica, Arial, sans-serif; font-size:13px; font-weight:700; color:#ffffff; text-decoration:none;">
                      ${COPY.resultado.ctaBoton}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 0 0; font-family: Helvetica, Arial, sans-serif; font-size:12px; line-height:1.6; color:${COLOR.textoMuted}; white-space:pre-line;">
              ${COPY.email.despedida}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
