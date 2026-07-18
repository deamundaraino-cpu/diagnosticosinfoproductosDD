import Link from "next/link";
import type { Viewport } from "next";
import { COPY } from "@/content/copy";
import { CapturaUtm } from "@/components/CapturaUtm";
import { BadgePlaceholder } from "@/components/BadgePlaceholder";
import { BrandBackdrop } from "@/components/brand/BrandBackdrop";

export const viewport: Viewport = { themeColor: "#0D1420" };

export default function Landing() {
  return (
    <BrandBackdrop
      outerClassName="flex-1"
      innerClassName="flex-1 flex items-center justify-center px-5 py-14 sm:py-20"
    >
      <CapturaUtm />
      <div className="w-full max-w-lg text-center brand-pop-in">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/70 uppercase backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)] shadow-[0_0_10px_var(--brand-orange)]" />
          {COPY.marca.nombre}
        </span>

        <h1 className="font-display mt-6 text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight">
          <span className="brand-text-gradient">{COPY.landing.titulo}</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[var(--brand-text-muted)] leading-relaxed">
          {COPY.landing.subtitulo}
        </p>

        <ul className="mt-9 space-y-2.5 text-left inline-block">
          {COPY.landing.bullets.map((bullet, i) => (
            <li
              key={bullet}
              className="brand-glass brand-pop-in flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <span className="flex-none h-6 w-6 rounded-full bg-[var(--brand-orange)]/15 border border-[var(--brand-orange)]/40 flex items-center justify-center text-[var(--brand-orange-light)] text-xs font-bold">
                ✓
              </span>
              <span className="text-sm sm:text-base text-white/85">{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 relative inline-block w-full sm:w-auto">
          <Link
            href="/diagnostico"
            className="brand-btn-cta font-display relative inline-block w-full sm:w-auto rounded-2xl px-9 py-4 text-white font-bold text-base tracking-tight"
          >
            {COPY.landing.botonEmpezar} →
          </Link>
          <p className="mt-4 text-sm text-[var(--brand-text-muted)]">
            {COPY.landing.notaTiempo}
          </p>
        </div>

        <div className="mt-10">
          <BadgePlaceholder visible={COPY.status === "placeholder"} />
        </div>
      </div>
    </BrandBackdrop>
  );
}
