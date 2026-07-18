import { notFound } from "next/navigation";
import type { Viewport } from "next";
import { getSupabase } from "@/lib/supabase";
import { ROADMAPS } from "@/content/roadmaps";
import { COPY } from "@/content/copy";
import type { FaseId } from "@/content/tipos";
import { BadgePlaceholder } from "@/components/BadgePlaceholder";
import { TrackerResultado } from "@/components/TrackerResultado";
import { BrandBackdrop } from "@/components/brand/BrandBackdrop";

export const metadata = {
  title: "Tu roadmap | Daviddigital",
};

export const viewport: Viewport = { themeColor: "#0D1420" };

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
    <BrandBackdrop
      outerClassName="flex-1"
      innerClassName="flex-1 flex flex-col items-center px-5 py-10"
    >
      <TrackerResultado fase={fase} />
      <div className="w-full max-w-xl">
        <span className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/70 uppercase backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)] shadow-[0_0_10px_var(--brand-orange)]" />
          {COPY.marca.nombre}
        </span>

        {esDemo && (
          <p className="mb-4 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs px-3 py-2">
            {COPY.demo.aviso}
          </p>
        )}

        <div className="brand-glass brand-pop-in relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(235,78,39,0.3), transparent 70%)" }}
          />

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-orange)]/15 border border-[var(--brand-orange)]/40 px-3 py-1 text-[11px] font-bold tracking-wide text-[var(--brand-orange-light)] uppercase">
            Tu fase: {fase}
          </span>
          <BadgePlaceholder visible={roadmap.status === "placeholder"} />

          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-3">
            <span className="brand-text-gradient">{roadmap.parteA.titulo}</span>
          </h1>
          <p className="mt-4 text-white/75 leading-relaxed">
            {roadmap.parteA.diagnostico}
          </p>

          <h2 className="font-display mt-8 text-lg font-bold text-white">
            {COPY.resultado.tusPasos}
          </h2>
          <ol className="mt-4 space-y-4">
            {roadmap.parteB.pasos.map((paso, i) => (
              <li
                key={i}
                className="brand-pop-in flex gap-3.5"
                style={{ animationDelay: `${0.15 + i * 0.12}s` }}
              >
                <span className="brand-btn-cta flex-none flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed pt-1">
                  {paso}
                </p>
              </li>
            ))}
          </ol>

          {!esDemo && (
            <p className="mt-8 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm px-4 py-3">
              {COPY.resultado.guardado}
            </p>
          )}
        </div>

        <div className="brand-glass brand-pop-in relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center mt-6" style={{ animationDelay: "0.4s" }}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 0%, rgba(235,78,39,0.22), transparent 65%)" }}
          />
          <div className="relative z-10">
            <h2 className="font-display text-xl font-bold">{COPY.resultado.ctaTitulo}</h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
              {COPY.resultado.ctaTexto}
            </p>
            <a
              href={COPY.marca.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-btn-cta font-display mt-5 inline-block rounded-2xl px-7 py-3.5 text-white font-bold"
            >
              {COPY.resultado.ctaBoton}
            </a>
          </div>
        </div>
      </div>
    </BrandBackdrop>
  );
}
