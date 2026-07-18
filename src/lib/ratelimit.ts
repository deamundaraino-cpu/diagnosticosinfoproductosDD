/**
 * Rate limiting en memoria por IP (ventana deslizante).
 * Suficiente para el MVP en Vercel (por instancia). Si el tráfico crece,
 * migrar a Upstash Ratelimit sin cambiar la interfaz.
 */

const ventanas = new Map<string, number[]>();

const LIMITE = 10; // peticiones
const VENTANA_MS = 60_000; // por minuto

export function permitirPeticion(ip: string): boolean {
  const ahora = Date.now();
  const marcas = (ventanas.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);

  if (marcas.length >= LIMITE) {
    ventanas.set(ip, marcas);
    return false;
  }

  marcas.push(ahora);
  ventanas.set(ip, marcas);

  // Limpieza ocasional para no acumular IPs viejas
  if (ventanas.size > 5000) {
    for (const [clave, valores] of ventanas) {
      if (valores.every((t) => ahora - t >= VENTANA_MS)) ventanas.delete(clave);
    }
  }

  return true;
}

export function ipDePeticion(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "desconocida";
}
