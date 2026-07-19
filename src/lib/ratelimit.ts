/**
 * Rate limiting en memoria por IP (ventana deslizante), con ámbitos
 * separados (API pública vs login de admin).
 *
 * Limitación conocida: en Vercel cada instancia serverless tiene su propia
 * memoria, así que el límite es por instancia, no global. Sigue frenando
 * ráfagas del mismo cliente (que suele golpear la misma instancia caliente)
 * y bots simples. Si el tráfico crece o se necesita límite global estricto,
 * migrar a Upstash Ratelimit manteniendo esta misma interfaz.
 */

const ventanas = new Map<string, number[]>();

interface OpcionesLimite {
  /** peticiones permitidas por ventana */
  limite?: number;
  /** tamaño de la ventana en ms */
  ventanaMs?: number;
  /** separa contadores por endpoint/uso (ej. "api", "login") */
  ambito?: string;
}

export function permitirPeticion(
  ip: string,
  { limite = 10, ventanaMs = 60_000, ambito = "api" }: OpcionesLimite = {}
): boolean {
  const clave = `${ambito}:${ip}`;
  const ahora = Date.now();
  const marcas = (ventanas.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);

  if (marcas.length >= limite) {
    ventanas.set(clave, marcas);
    return false;
  }

  marcas.push(ahora);
  ventanas.set(clave, marcas);

  // Limpieza ocasional para no acumular claves viejas
  if (ventanas.size > 5000) {
    for (const [k, valores] of ventanas) {
      if (valores.every((t) => ahora - t >= ventanaMs)) ventanas.delete(k);
    }
  }

  return true;
}

/** Login de admin: mucho más estricto — 5 intentos por minuto por IP. */
export function permitirIntentoLogin(ip: string): boolean {
  return permitirPeticion(ip, { limite: 5, ventanaMs: 60_000, ambito: "login" });
}

export function ipDePeticion(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconocida";
}
