import Link from "next/link";
import { COPY } from "@/content/copy";
import { CapturaUtm } from "@/components/CapturaUtm";
import { BadgePlaceholder } from "@/components/BadgePlaceholder";

export default function Landing() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 py-12">
      <CapturaUtm />
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase mb-4">
          {COPY.marca.nombre}
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-stone-900">
          {COPY.landing.titulo}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
          {COPY.landing.subtitulo}
        </p>

        <ul className="mt-8 space-y-3 text-left inline-block">
          {COPY.landing.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-stone-700">
              <span className="text-indigo-600 mt-0.5">✓</span>
              <span className="text-sm sm:text-base">{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/diagnostico"
            className="inline-block w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-white font-semibold text-base shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.99] transition"
          >
            {COPY.landing.botonEmpezar}
          </Link>
          <p className="mt-3 text-sm text-stone-500">{COPY.landing.notaTiempo}</p>
        </div>

        <div className="mt-10">
          <BadgePlaceholder visible={COPY.status === "placeholder"} />
        </div>
      </div>
    </main>
  );
}
