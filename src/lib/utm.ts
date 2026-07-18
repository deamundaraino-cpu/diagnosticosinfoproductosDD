"use client";

/**
 * Captura UTMs + referrer en la landing y los conserva en sessionStorage
 * hasta que el diagnóstico se guarda (viajan en el POST a /api/diagnostico).
 */

const CLAVE = "dd_utm";

export interface DatosUtm {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  referrer: string | null;
}

export function capturarUtm(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const existente = leerUtm();
    const datos: DatosUtm = {
      source: params.get("utm_source") ?? existente?.source ?? null,
      medium: params.get("utm_medium") ?? existente?.medium ?? null,
      campaign: params.get("utm_campaign") ?? existente?.campaign ?? null,
      content: params.get("utm_content") ?? existente?.content ?? null,
      referrer: existente?.referrer ?? (document.referrer || null),
    };
    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // sessionStorage no disponible (modo privado extremo): seguir sin UTMs
  }
}

export function leerUtm(): DatosUtm | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as DatosUtm) : null;
  } catch {
    return null;
  }
}
