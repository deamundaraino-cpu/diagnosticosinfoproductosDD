import Link from "next/link";
import { redirect } from "next/navigation";
import type { Viewport } from "next";
import { esAdmin } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase";
import { DIAGNOSTICOS_DEMO, resumenDemo } from "@/lib/demo-data";
import { BrandBackdrop } from "@/components/brand/BrandBackdrop";
import { logoutAdmin } from "./actions";
import type { FaseId, Ruta } from "@/content/tipos";

export const metadata = { title: "Panel | Daviddigital" };
export const viewport: Viewport = { themeColor: "#0D1420" };
export const dynamic = "force-dynamic";

const POR_PAGINA = 20;
const FASES: FaseId[] = ["A1", "A2", "A3", "B1", "B2", "B3"];

// Progresión de un solo acento (naranja de marca) para la ruta A y una
// escala de neutros (navy/blanco) para la ruta B — sin salir de la
// paleta de marca, cada fase se distingue por intensidad, no por un
// color nuevo.
const COLOR_FASE: Record<FaseId, string> = {
  A1: "bg-[var(--brand-orange)]/10 text-[var(--brand-orange-light)] border border-[var(--brand-orange)]/25",
  A2: "bg-[var(--brand-orange)]/25 text-white border border-[var(--brand-orange)]/45",
  A3: "bg-[var(--brand-orange)] text-white border border-[var(--brand-orange)]",
  B1: "bg-white/5 text-white/55 border border-white/15",
  B2: "bg-white/12 text-white/80 border border-white/25",
  B3: "bg-white/20 text-white border border-white/35",
};

interface FilaResumen {
  ruta: Ruta;
  fase: FaseId;
  total: number;
  con_email: number;
  score_promedio: number;
}

interface FilaDiagnostico {
  id: string;
  nombre: string | null;
  email: string | null;
  fecha_creacion: string;
  ruta: Ruta;
  fase: FaseId;
  score_numerico: number;
}

export default async function PanelAdmin({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; ruta?: string; fase?: string }>;
}) {
  if (!(await esAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const pagina = Math.max(1, parseInt(params.pagina ?? "1", 10) || 1);
  const filtroRuta = params.ruta === "A" || params.ruta === "B" ? params.ruta : null;
  const filtroFase = FASES.includes(params.fase as FaseId)
    ? (params.fase as FaseId)
    : null;

  const supabase = getSupabase();
  const usandoDemo = !supabase;

  let resumen: FilaResumen[];
  let filas: FilaDiagnostico[];
  let totalFiltrado: number;

  if (supabase) {
    // Agregados siempre desde la vista SQL — nunca sumando filas en frontend
    const { data: resumenCrudo } = await supabase.from("resumen_fases").select("*");
    resumen = (resumenCrudo ?? []) as FilaResumen[];

    let consulta = supabase
      .from("diagnosticos")
      .select("id, nombre, email, fecha_creacion, ruta, fase, score_numerico", {
        count: "exact",
      })
      .order("fecha_creacion", { ascending: false })
      .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

    if (filtroRuta) consulta = consulta.eq("ruta", filtroRuta);
    if (filtroFase) consulta = consulta.eq("fase", filtroFase);

    const { data: filasCrudas, count } = await consulta;
    filas = (filasCrudas ?? []) as FilaDiagnostico[];
    totalFiltrado = count ?? 0;
  } else {
    // Sin Supabase configurado: dataset de ejemplo (semilla fija, ver
    // src/lib/demo-data.ts) para poder visualizar el panel ya mismo.
    resumen = resumenDemo();
    const todas = DIAGNOSTICOS_DEMO.filter(
      (d) => (!filtroRuta || d.ruta === filtroRuta) && (!filtroFase || d.fase === filtroFase)
    );
    totalFiltrado = todas.length;
    filas = todas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  }

  const total = resumen.reduce((s, r) => s + Number(r.total), 0);
  const conEmail = resumen.reduce((s, r) => s + Number(r.con_email), 0);
  const tasaCaptura = total > 0 ? Math.round((conEmail / total) * 100) : 0;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / POR_PAGINA));

  const urlCon = (cambios: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const estado: Record<string, string | null> = {
      ruta: filtroRuta,
      fase: filtroFase,
      pagina: null, // los cambios de filtro resetean la página
      ...cambios,
    };
    for (const [k, v] of Object.entries(estado)) if (v) p.set(k, v);
    const qs = p.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <Marco usandoDemo={usandoDemo}>
      {/* Contadores */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Contador etiqueta="Diagnósticos" valor={String(total)} />
        <Contador etiqueta="Con email" valor={String(conEmail)} />
        <Contador etiqueta="Tasa de captura" valor={`${tasaCaptura}%`} />
      </div>

      {/* Distribución por fase */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FASES.map((fase) => {
          const fila = resumen.find((r) => r.fase === fase);
          const cantidad = fila ? Number(fila.total) : 0;
          const pct = total > 0 ? Math.round((cantidad / total) * 100) : 0;
          return (
            <span
              key={fase}
              className={`rounded-full px-3 py-1 text-xs font-medium ${COLOR_FASE[fase]}`}
            >
              {fase}: {cantidad} ({pct}%)
            </span>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <span className="text-white/40">Ruta:</span>
        <Filtro href={urlCon({ ruta: null, fase: null })} activo={!filtroRuta}>
          Todas
        </Filtro>
        {(["A", "B"] as Ruta[]).map((r) => (
          <Filtro key={r} href={urlCon({ ruta: r, fase: null })} activo={filtroRuta === r}>
            {r}
          </Filtro>
        ))}
        <span className="text-white/40 ml-3">Fase:</span>
        <Filtro href={urlCon({ fase: null })} activo={!filtroFase}>
          Todas
        </Filtro>
        {FASES.filter((f) => !filtroRuta || f.startsWith(filtroRuta)).map((f) => (
          <Filtro key={f} href={urlCon({ fase: f })} activo={filtroFase === f}>
            {f}
          </Filtro>
        ))}
      </div>

      {/* Tabla */}
      <div className="brand-glass overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/45 uppercase tracking-wide">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Ruta</th>
              <th className="px-4 py-3">Fase</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/35">
                  Sin diagnósticos todavía.
                </td>
              </tr>
            )}
            {filas.map((fila) => (
              <tr
                key={fila.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3 text-white/85">{fila.nombre ?? "—"}</td>
                <td className="px-4 py-3 text-white/70">
                  {fila.email ?? (
                    <span className="text-white/30 italic">sin capturar</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/45">
                  {new Date(fila.fecha_creacion).toLocaleDateString("es", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-white/70">{fila.ruta}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_FASE[fila.fase]}`}
                  >
                    {fila.fase}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-white/85">
                  {fila.score_numerico}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-white/40">
          {totalFiltrado} resultado{totalFiltrado === 1 ? "" : "s"} · página{" "}
          {pagina} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          {pagina > 1 && (
            <Filtro href={urlCon({ pagina: String(pagina - 1) })} activo={false}>
              ← Anterior
            </Filtro>
          )}
          {pagina < totalPaginas && (
            <Filtro href={urlCon({ pagina: String(pagina + 1) })} activo={false}>
              Siguiente →
            </Filtro>
          )}
        </div>
      </div>
    </Marco>
  );
}

function Marco({
  children,
  usandoDemo,
}: {
  children: React.ReactNode;
  usandoDemo: boolean;
}) {
  return (
    <BrandBackdrop outerClassName="flex-1" innerClassName="flex-1 px-5 py-8">
      <div className="mx-auto max-w-4xl">
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

        {usandoDemo && (
          <p className="brand-pop-in mt-4 mb-2 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs px-4 py-3">
            <strong className="font-semibold">Modo demo:</strong> estos son
            datos de ejemplo (42 diagnósticos simulados) para que veas cómo se
            ve el panel. Conecta Supabase en <code>.env.local</code> para ver
            tus leads reales — ver <code>README.md</code>.
          </p>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </BrandBackdrop>
  );
}

function Contador({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="brand-glass rounded-2xl p-4">
      <p className="text-xs text-white/45 uppercase tracking-wide">{etiqueta}</p>
      <p className="font-display text-2xl font-bold text-white mt-1.5">{valor}</p>
    </div>
  );
}

function Filtro({
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
      className={`rounded-full px-3 py-1 border transition ${
        activo
          ? "border-transparent bg-[var(--brand-orange)] text-white shadow-[0_4px_16px_-4px_rgba(235,78,39,0.6)]"
          : "border-white/10 bg-white/5 text-white/60 hover:border-[var(--brand-orange)]/40 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
