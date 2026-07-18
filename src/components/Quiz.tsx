"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PREGUNTA_BIFURCACION,
  preguntasDeRuta,
} from "@/content/preguntas";
import { ROADMAPS } from "@/content/roadmaps";
import { COPY } from "@/content/copy";
import type { FaseId, Ruta } from "@/content/tipos";
import { leerUtm } from "@/lib/utm";
import { trackEvento } from "@/lib/analytics";
import { BadgePlaceholder } from "@/components/BadgePlaceholder";
import { BrandBackdrop } from "@/components/brand/BrandBackdrop";

type Etapa = "bifurcacion" | "preguntas" | "calculando" | "gate";

interface ResultadoParcial {
  id: string;
  fase: FaseId;
  score: number;
  demo: boolean;
}

const ICONO_RUTA: Record<Ruta, string> = { A: "🚀", B: "🌱" };

// Duración de la pantalla de análisis: aunque el servidor responda al
// instante, se mantiene visible este mínimo para que se sienta como un
// análisis real del caso, no una respuesta fría e inmediata.
const INTERVALO_PASO_MS = 900;
const PASOS_ANALISIS = COPY.quiz.analisis.A.length;
const DURACION_MINIMA_MS = PASOS_ANALISIS * INTERVALO_PASO_MS + 500;

function esperarRestante(inicio: number, minimoMs: number): Promise<void> {
  const restante = minimoMs - (Date.now() - inicio);
  return new Promise((resolve) => setTimeout(resolve, Math.max(restante, 0)));
}

export function Quiz() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("bifurcacion");
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoParcial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasoAnalisis, setPasoAnalisis] = useState(0);

  const preguntas = useMemo(
    () => (ruta ? preguntasDeRuta(ruta) : []),
    [ruta]
  );

  // Avanza los pasos de la pantalla de análisis mientras está activa.
  useEffect(() => {
    if (etapa !== "calculando") return;
    setPasoAnalisis(0);
    const id = setInterval(() => {
      setPasoAnalisis((p) => Math.min(p + 1, PASOS_ANALISIS - 1));
    }, INTERVALO_PASO_MS);
    return () => clearInterval(id);
  }, [etapa]);

  function elegirRuta(rutaElegida: Ruta) {
    setRuta(rutaElegida);
    setEtapa("preguntas");
    trackEvento("quiz_iniciado", { ruta: rutaElegida });
  }

  async function responder(preguntaId: string, opcionId: string) {
    const nuevas = { ...respuestas, [preguntaId]: opcionId };
    setRespuestas(nuevas);
    trackEvento("pregunta_respondida", {
      ruta,
      pregunta: preguntaId,
      opcion: opcionId,
    });

    if (indice < preguntas.length - 1) {
      setIndice(indice + 1);
      return;
    }
    await completarQuiz(nuevas);
  }

  async function completarQuiz(todas: Record<string, string>) {
    setEtapa("calculando");
    setError(null);
    const inicio = Date.now();
    try {
      const utm = leerUtm();
      const peticion = fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruta,
          respuestas: todas,
          utm: utm
            ? {
                source: utm.source,
                medium: utm.medium,
                campaign: utm.campaign,
                content: utm.content,
              }
            : null,
          referrer: utm?.referrer ?? null,
        }),
      }).then(async (res) => {
        if (!res.ok) throw new Error();
        return (await res.json()) as ResultadoParcial;
      });

      const [data] = await Promise.all([
        peticion,
        esperarRestante(inicio, DURACION_MINIMA_MS),
      ]);

      setResultado(data);
      setEtapa("gate");
      trackEvento("quiz_completado", {
        ruta,
        fase: data.fase,
        score: data.score,
      });
    } catch {
      setError(COPY.errores.generico);
      setEtapa("preguntas");
    }
  }

  function retroceder() {
    if (indice > 0) {
      setIndice(indice - 1);
    } else {
      setRuta(null);
      setEtapa("bifurcacion");
    }
  }

  return (
    <BrandBackdrop
      outerClassName="flex-1"
      innerClassName="flex-1 flex flex-col items-center px-5 py-10"
    >
      <div className="w-full max-w-xl">
        <span className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/70 uppercase backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)] shadow-[0_0_10px_var(--brand-orange)]" />
          {COPY.marca.nombre}
        </span>

        {etapa === "bifurcacion" && (
          <Pantalla>
            <h1 className="font-display text-2xl font-bold leading-tight mb-6">
              {PREGUNTA_BIFURCACION.texto}
            </h1>
            <div className="space-y-3">
              {PREGUNTA_BIFURCACION.opciones.map((opcion) => (
                <BotonOpcion
                  key={opcion.ruta}
                  icono={ICONO_RUTA[opcion.ruta]}
                  onClick={() => elegirRuta(opcion.ruta)}
                >
                  {opcion.texto}
                </BotonOpcion>
              ))}
            </div>
          </Pantalla>
        )}

        {etapa === "preguntas" && ruta && (
          <Pantalla>
            <div className="mb-6">
              <div className="flex justify-between text-xs text-[var(--brand-text-muted)] mb-2.5">
                <span className="font-medium tracking-wide">
                  {COPY.quiz.progresoDe(indice + 1, preguntas.length)}
                </span>
                <button
                  onClick={retroceder}
                  className="text-white/60 hover:text-white transition"
                >
                  ← Atrás
                </button>
              </div>
              <div className="brand-progress-track">
                <div
                  className="brand-progress-fill"
                  style={{ width: `${((indice + 1) / preguntas.length) * 100}%` }}
                />
              </div>
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-bold leading-snug mb-6">
              {preguntas[indice].texto}
            </h1>
            <div className="space-y-3">
              {preguntas[indice].opciones.map((opcion) => (
                <BotonOpcion
                  key={opcion.id}
                  seleccionada={respuestas[preguntas[indice].id] === opcion.id}
                  onClick={() => responder(preguntas[indice].id, opcion.id)}
                >
                  {opcion.texto}
                </BotonOpcion>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </Pantalla>
        )}

        {etapa === "calculando" && ruta && (
          <PantallaAnalisis ruta={ruta} paso={pasoAnalisis} />
        )}

        {etapa === "gate" && resultado && (
          <GateResultado resultado={resultado} onExito={(token) => router.push(`/resultado/${token}`)} />
        )}
      </div>
    </BrandBackdrop>
  );
}

function GateResultado({
  resultado,
  onExito,
}: {
  resultado: ResultadoParcial;
  onExito: (token: string) => void;
}) {
  const roadmap = ROADMAPS[resultado.fase];
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consentimiento) {
      setError(COPY.errores.consentimientoRequerido);
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/diagnostico/capturar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resultado.id,
          nombre,
          email,
          telefono: telefono || null,
          consentimiento,
          website: honeypot || undefined,
        }),
      });
      if (res.status === 400) {
        setError(COPY.errores.emailInvalido);
        setEnviando(false);
        return;
      }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { token: string };
      trackEvento("email_capturado", { fase: resultado.fase });
      onExito(data.token);
    } catch {
      setError(COPY.errores.generico);
      setEnviando(false);
    }
  }

  return (
    <Pantalla>
      {resultado.demo && (
        <p className="mb-4 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs px-3 py-2">
          {COPY.demo.aviso}
        </p>
      )}

      {/* Parte A: visible — valida el diagnóstico y genera curiosidad */}
      <div className="brand-glass relative overflow-hidden rounded-2xl p-5 mb-6 brand-pop-in">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(235,78,39,0.35), transparent 70%)" }}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-orange)]/15 border border-[var(--brand-orange)]/40 px-3 py-1 text-[11px] font-bold tracking-wide text-[var(--brand-orange-light)] uppercase">
          Fase {resultado.fase}
        </span>
        <BadgePlaceholder visible={roadmap.status === "placeholder"} />
        <h1 className="font-display text-xl sm:text-2xl font-bold mt-3">
          {roadmap.parteA.titulo}
        </h1>
        <p className="mt-3 text-white/75 leading-relaxed text-sm sm:text-base">
          {roadmap.parteA.diagnostico}
        </p>
      </div>

      {/* Gate: los 3 pasos se desbloquean con el email */}
      <h2 className="font-display text-lg font-bold">{COPY.gate.titulo}</h2>
      <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
        {COPY.gate.subtitulo}
      </p>

      <form onSubmit={enviar} className="mt-5 space-y-4">
        {/* Honeypot: invisible para humanos */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <Campo
          label={COPY.gate.labelNombre}
          type="text"
          value={nombre}
          onChange={setNombre}
          requerido
        />
        <Campo
          label={COPY.gate.labelEmail}
          type="email"
          value={email}
          onChange={setEmail}
          requerido
        />
        <Campo
          label={COPY.gate.labelTelefono}
          type="tel"
          value={telefono}
          onChange={setTelefono}
          placeholder={COPY.gate.placeholderTelefono}
        />

        <label className="flex items-start gap-2.5 text-xs text-white/60 cursor-pointer">
          <input
            type="checkbox"
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--brand-orange)]"
          />
          <span>{COPY.gate.consentimiento}</span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="brand-btn-cta font-display w-full rounded-2xl px-6 py-4 text-white font-bold"
        >
          {enviando ? COPY.gate.enviando : COPY.gate.boton}
        </button>

        <p className="text-center text-xs text-white/40">
          <Link href="/privacidad" className="underline hover:text-white/60">
            {COPY.gate.privacidad}
          </Link>
        </p>
      </form>
    </Pantalla>
  );
}

function PantallaAnalisis({ ruta, paso }: { ruta: Ruta; paso: number }) {
  const pasos = COPY.quiz.analisis[ruta];

  return (
    <Pantalla>
      <div className="py-4">
        <p className="text-center text-sm text-[var(--brand-text-muted)] mb-7">
          Un momento — estamos revisando tu caso con calma.
        </p>

        <div className="space-y-4">
          {pasos.map((p, i) => {
            const completado = i < paso;
            const actual = i === paso;
            return (
              <div
                key={p.texto}
                className={`flex items-center gap-3.5 transition-opacity duration-300 ${
                  i > paso ? "opacity-30" : "opacity-100"
                }`}
              >
                <span
                  className={`brand-step-icon ${actual ? "brand-step-icon--active" : ""} flex-none h-10 w-10 rounded-full flex items-center justify-center text-base border transition-colors duration-300 ${
                    completado
                      ? "bg-[var(--brand-orange)] border-[var(--brand-orange)]"
                      : actual
                        ? "bg-[var(--brand-orange)]/15 border-[var(--brand-orange)]/60"
                        : "bg-white/5 border-white/10"
                  }`}
                >
                  {completado ? (
                    <span className="text-white font-bold">✓</span>
                  ) : (
                    p.icono
                  )}
                </span>
                <span
                  className={`text-sm sm:text-base ${
                    completado
                      ? "text-white/40"
                      : actual
                        ? "text-white font-medium"
                        : "text-white/40"
                  }`}
                >
                  {p.texto}
                </span>
                {actual && (
                  <span className="ml-auto flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)] animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)] animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)] animate-bounce" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="brand-progress-track mt-8">
          <div
            className="brand-progress-fill"
            style={{ width: `${((paso + 1) / pasos.length) * 100}%` }}
          />
        </div>
      </div>
    </Pantalla>
  );
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <div className="brand-glass brand-pop-in relative rounded-3xl p-6 sm:p-8">
      {children}
    </div>
  );
}

interface Chispa {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

function BotonOpcion({
  children,
  onClick,
  seleccionada,
  icono,
}: {
  children: React.ReactNode;
  onClick: () => void;
  seleccionada?: boolean;
  icono?: string;
}) {
  const [chispas, setChispas] = useState<Chispa[]>([]);

  function manejarClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nuevas: Chispa[] = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      dx: (Math.random() - 0.5) * 70,
      dy: -(Math.random() * 50 + 20),
    }));
    setChispas((prev) => [...prev, ...nuevas]);
    setTimeout(() => {
      setChispas((prev) => prev.filter((c) => !nuevas.some((n) => n.id === c.id)));
    }, 700);
    onClick();
  }

  return (
    <button
      onClick={manejarClick}
      className={`brand-option ${seleccionada ? "brand-option--selected" : ""} w-full text-left rounded-2xl px-4 py-4 text-sm sm:text-base flex items-center gap-3 active:scale-[0.99]`}
    >
      {icono && <span className="text-xl flex-none">{icono}</span>}
      <span className={seleccionada ? "text-white font-medium" : "text-white/85"}>
        {children}
      </span>
      {chispas.map((c) => (
        <span
          key={c.id}
          className="brand-spark"
          style={
            {
              left: c.x,
              top: c.y,
              width: 5,
              height: 5,
              "--sx": `${c.dx}px`,
              "--sy": `${c.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </button>
  );
}

function Campo({
  label,
  type,
  value,
  onChange,
  requerido,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  requerido?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={requerido}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[var(--brand-orange)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/25 transition"
      />
    </label>
  );
}
