import Link from "next/link";
import { redirect } from "next/navigation";
import { esAdmin } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase";
import { logoutAdmin } from "./actions";
import type { FaseId, Ruta } from "@/content/tipos";

export const metadata = { title: "Panel | Daviddigital" };
export const dynamic = "force-dynamic";

const POR_PAGINA = 20;
const FASES: FaseId[] = ["A1", "A2", "A3", "B1", "B2", "B3"];

const COLOR_FASE: Record<FaseId, string> = {
  A1: "bg-red-100 text-red-800",
  A2: "bg-amber-100 text-amber-800",
  A3: "bg-emerald-100 text-emerald-800",
  B1: "bg-sky-100 text-sky-800",
  B2: "bg-violet-100 text-violet-800",
  B3: "bg-teal-100 text-teal-800",
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
  if (!supabase) {
    return (
      <Marco>
        <p className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
          Supabase no está configurado. Completa SUPABASE_URL y
          SUPABASE_SERVICE_ROLE_KEY en .env.local para ver los diagnósticos.
        </p>
      </Marco>
    );
  }

  // Agregados siempre desde la vista SQL — nunca sumando filas en frontend
  const { data: resumenCrudo } = await supabase
    .from("resumen_fases")
    .select("*");
  const resumen = (resumenCrudo ?? []) as FilaResumen[];

  const total = resumen.reduce((s, r) => s + Number(r.total), 0);
  const conEmail = resumen.reduce((s, r) => s + Number(r.con_email), 0);
  const tasaCaptura = total > 0 ? Math.round((conEmail / total) * 100) : 0;

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
  const filas = (filasCrudas ?? []) as FilaDiagnostico[];
  const totalFiltrado = count ?? 0;
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
    <Marco>
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
        <span className="text-stone-500">Ruta:</span>
        <Filtro href={urlCon({ ruta: null, fase: null })} activo={!filtroRuta}>
          Todas
        </Filtro>
        {(["A", "B"] as Ruta[]).map((r) => (
          <Filtro key={r} href={urlCon({ ruta: r, fase: null })} activo={filtroRuta === r}>
            {r}
          </Filtro>
        ))}
        <span className="text-stone-500 ml-3">Fase:</span>
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
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs text-stone-500 uppercase">
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
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Sin diagnósticos todavía.
                </td>
              </tr>
            )}
            {filas.map((fila) => (
              <tr key={fila.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3">{fila.nombre ?? "—"}</td>
                <td className="px-4 py-3">
                  {fila.email ?? (
                    <span className="text-stone-400 italic">sin capturar</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-stone-500">
                  {new Date(fila.fecha_creacion).toLocaleDateString("es", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">{fila.ruta}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_FASE[fila.fase]}`}
                  >
                    {fila.fase}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {fila.score_numerico}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-stone-500">
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

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-stone-900">
            Diagnósticos — panel interno
          </h1>
          <form action={logoutAdmin}>
            <button className="text-sm text-stone-500 underline hover:text-stone-700">
              Salir
            </button>
          </form>
        </div>
        {children}
      </div>
    </main>
  );
}

function Contador({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl bg-white border border-stone-200 p-4">
      <p className="text-xs text-stone-500">{etiqueta}</p>
      <p className="text-2xl font-bold text-stone-900 mt-1">{valor}</p>
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
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-stone-200 bg-white text-stone-600 hover:border-indigo-300"
      }`}
    >
      {children}
    </Link>
  );
}
