/**
 * Enlace de agendamiento del bloque final de investigación.
 *
 * Lleva el identificador del diagnóstico como parámetro para poder cruzar
 * cada llamada agendada con las respuestas de esa persona en el panel.
 *
 * Sin NEXT_PUBLIC_URL_AGENDAMIENTO configurada devuelve null y el bloque
 * cae en su variante sin botón — nunca muestra un enlace roto.
 */
export function urlAgendamiento(identificador: string): string | null {
  const base = process.env.NEXT_PUBLIC_URL_AGENDAMIENTO?.trim();
  if (!base) return null;

  try {
    const url = new URL(base);
    // Se respetan los parámetros que ya traiga la URL de agendamiento.
    url.searchParams.set("diagnostico", identificador);
    return url.toString();
  } catch {
    console.warn(
      "[agenda] NEXT_PUBLIC_URL_AGENDAMIENTO no es una URL válida — se oculta el botón."
    );
    return null;
  }
}
