import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { ROADMAPS } from "@/content/roadmaps";
import { COPY } from "@/content/copy";
import type { FaseId } from "@/content/tipos";
import { BadgePlaceholder } from "@/components/BadgePlaceholder";
import { TrackerResultado } from "@/components/TrackerResultado";

export const metadata = {
  title: "Tu roadmap | Daviddigital",
};

const FASES: FaseId[] = ["A1", "A2", "A3", "B1", "B2", "B3"];

async function faseDeToken(token: string): Promise<FaseId | null> {
  // Tokens demo (sin base de datos): demo-<fase>-<random>
  if (token.startsWith("demo-")) {
    const fase = token.split("-")[1] as FaseId;
    return FASES.includes(fase) ? fase : null;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("diagnosticos")
    .select("fase")
    .eq("token_resultado", token)
    .maybeSingle();

  if (!data || !FASES.includes(data.fase as FaseId)) return null;
  return data.fase as FaseId;
}

export default async function PaginaResultado({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const fase = await faseDeToken(token);
  if (!fase) notFound();

  const roadmap = ROADMAPS[fase];
  const esDemo = token.startsWith("demo-");

  return (
    <main className="flex-1 flex flex-col items-center px-5 py-10">
      <TrackerResultado fase={fase} />
      <div className="w-full max-w-xl">
        <p className="text-center text-sm font-semibold tracking-wide text-indigo-600 uppercase mb-8">
          {COPY.marca.nombre}
        </p>

        {esDemo && (
          <p className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2">
            {COPY.demo.aviso}
          </p>
        )}

        <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8">
          <BadgePlaceholder visible={roadmap.status === "placeholder"} />

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
            {roadmap.parteA.titulo}
          </h1>
          <p className="mt-4 text-stone-700 leading-relaxed">
            {roadmap.parteA.diagnostico}
          </p>

          <h2 className="mt-8 text-lg font-bold text-stone-900">
            {COPY.resultado.tusPasos}
          </h2>
          <ol className="mt-4 space-y-4">
            {roadmap.parteB.pasos.map((paso, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="flex-none h-7 w-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                  {paso}
                </p>
              </li>
            ))}
          </ol>

          {!esDemo && (
            <p className="mt-8 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 text-sm px-4 py-3">
              {COPY.resultado.guardado}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-indigo-600 text-white p-6 sm:p-8 text-center">
          <h2 className="text-xl font-bold">{COPY.resultado.ctaTitulo}</h2>
          <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
            {COPY.resultado.ctaTexto}
          </p>
          <a
            href={COPY.marca.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-xl bg-white text-indigo-700 font-semibold px-6 py-3.5 hover:bg-indigo-50 transition"
          >
            {COPY.resultado.ctaBoton}
          </a>
        </div>
      </div>
    </main>
  );
}
