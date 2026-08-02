import Link from "next/link";
import { BrandBackdrop } from "@/components/brand/BrandBackdrop";
import { logoutAdmin } from "./actions";
import type { FaseId } from "@/content/tipos";

/**
 * Piezas compartidas por las tres vistas del panel (/admin, /admin/abandonos,
 * /admin/utm). Server components: no hay estado de cliente en el panel.
 */

// Progresión de un solo acento (naranja de marca) para la ruta A y una
// escala de neutros (navy/blanco) para la ruta B — sin salir de la
// paleta de marca, cada fase se distingue por intensidad, no por un
// color nuevo.
export const COLOR_FASE: Record<FaseId, string> = {
  A1: "bg-[var(--brand-orange)]/10 text-[var(--brand-orange-light)] border border-[var(--brand-orange)]/25",
  A2: "bg-[var(--brand-orange)]/25 text-white border border-[var(--brand-orange)]/45",
  A3: "bg-[var(--brand-orange)] text-white border border-[var(--brand-orange)]",
  B1: "bg-white/5 text-white/55 border border-white/15",
  B2: "bg-white/12 text-white/80 border border-white/25",
  B3: "bg-white/20 text-white border border-white/35",
};

export const FASES: FaseId[] = ["A1", "A2", "A3", "B1", "B2", "B3"];

const PESTANAS = [
  { href: "/admin", texto: "Embudo" },
  { href: "/admin/abandonos", texto: "Abandonos" },
  { href: "/admin/utm", texto: "Atribución" },
];

export function Marco({
  children,
  usandoDemo,
  activa,
}: {
  children: React.ReactNode;
  usandoDemo: boolean;
  activa: string;
}) {
  return (
    <BrandBackdrop outerClassName="flex-1" innerClassName="flex-1 px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/60 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)] shadow-[0_0_8px_var(--brand-orange)]" />
              Sesión: superadmin
            </span>
            <h1 className="font-display text-xl font-bold text-white mt-2">
              Diagnósticos — panel interno
            </h1>
          </div>
          <form action={logoutAdmin}>
            <button className="text-sm text-white/50 underline hover:text-white transition">
              Salir
            </button>
          </form>
        </div>

        <nav className="flex flex-wrap gap-2 mt-5">
          {PESTANAS.map((p) => (
            <Filtro key={p.href} href={p.href} activo={activa === p.href}>
              {p.texto}
            </Filtro>
          ))}
        </nav>

        {usandoDemo && (
          <p className="brand-pop-in mt-4 mb-2 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs px-4 py-3">
            <strong className="font-semibold">Modo demo:</strong> estos son
            datos de ejemplo para que veas cómo se ve el panel. Conecta Supabase
            en <code>.env.local</code> para ver tus leads reales.
          </p>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </BrandBackdrop>
  );
}

export function Contador({
  etiqueta,
  valor,
  matiz,
  nota,
}: {
  etiqueta: string;
  valor: string;
  matiz?: "normal" | "alerta" | "bueno";
  nota?: string;
}) {
  const color =
    matiz === "alerta"
      ? "text-[var(--brand-orange-light)]"
      : matiz === "bueno"
        ? "text-emerald-300"
        : "text-white";

  return (
    <div className="brand-glass rounded-2xl p-4">
      <p className="text-xs text-white/45 uppercase tracking-wide">{etiqueta}</p>
      <p className={`font-display text-2xl font-bold mt-1.5 ${color}`}>{valor}</p>
      {nota && <p className="text-[11px] text-white/35 mt-1">{nota}</p>}
    </div>
  );
}

export function Filtro({
  href,
  activo,
  children,
}: {
  href: string;
  activo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm border transition ${
        activo
          ? "border-transparent bg-[var(--brand-orange)] text-white shadow-[0_4px_16px_-4px_rgba(235,78,39,0.6)]"
          : "border-white/10 bg-white/5 text-white/60 hover:border-[var(--brand-orange)]/40 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

/** Barra horizontal proporcional — usada en el embudo y en el histograma. */
export function Barra({
  etiqueta,
  valor,
  maximo,
  detalle,
  acento = "naranja",
}: {
  etiqueta: string;
  valor: number;
  maximo: number;
  detalle?: string;
  acento?: "naranja" | "neutro";
}) {
  const pct = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1.5">
        <span className="text-white/70">{etiqueta}</span>
        <span className="text-white/45">
          <span className="font-mono text-white/85">{valor}</span>
          {detalle && ` · ${detalle}`}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            acento === "naranja"
              ? "bg-[var(--brand-orange)]"
              : "bg-white/30"
          }`}
          style={{ width: `${Math.max(pct, valor > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}

export function TablaVacia({ columnas, texto }: { columnas: number; texto: string }) {
  return (
    <tr>
      <td colSpan={columnas} className="px-4 py-8 text-center text-white/35">
        {texto}
      </td>
    </tr>
  );
}

export function porcentaje(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
