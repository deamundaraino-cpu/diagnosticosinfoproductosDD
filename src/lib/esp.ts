import "server-only";

/**
 * Sincronización de leads con MailerLite (el ESP del nurture).
 *
 * Al capturar el email, el lead se agrega/actualiza como suscriptor con sus
 * datos del diagnóstico (ruta, fase, score) y se asigna al grupo de su ruta.
 * Las automatizaciones de MailerLite (secuencias de nurture, una por ruta)
 * se disparan cuando el suscriptor entra al grupo.
 *
 * Sin MAILERLITE_API_KEY → no-op con log (la app sigue funcionando).
 * El fallo del ESP nunca rompe el flujo del usuario: el lead ya quedó
 * guardado en Supabase, que es la fuente de verdad.
 */

interface LeadParaEsp {
  email: string;
  nombre: string;
  telefono: string | null;
  ruta: "A" | "B";
  fase: string;
  score: number;
}

export async function sincronizarLeadConEsp(
  lead: LeadParaEsp
): Promise<{ sincronizado: boolean }> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    console.warn(
      `[esp] MAILERLITE_API_KEY no configurada — lead ${lead.email} no sincronizado (queda solo en Supabase).`
    );
    return { sincronizado: false };
  }

  const grupoId =
    lead.ruta === "A"
      ? process.env.MAILERLITE_GROUP_A
      : process.env.MAILERLITE_GROUP_B;

  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: lead.email,
        fields: {
          name: lead.nombre,
          phone: lead.telefono ?? undefined,
          ruta: lead.ruta,
          fase: lead.fase,
          score: String(lead.score),
        },
        // El upsert de MailerLite AGREGA grupos, no reemplaza los existentes.
        groups: grupoId ? [grupoId] : [],
        status: "active",
      }),
    });

    if (!res.ok) {
      const detalle = await res.text();
      console.error(`[esp] MailerLite respondió ${res.status}: ${detalle.slice(0, 300)}`);
      return { sincronizado: false };
    }
    return { sincronizado: true };
  } catch (err) {
    console.error("[esp] Fallo sincronizando con MailerLite:", err);
    return { sincronizado: false };
  }
}
