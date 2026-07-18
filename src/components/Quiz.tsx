"use client";

import { useMemo, useState } from "react";
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

type Etapa = "bifurcacion" | "preguntas" | "calculando" | "gate";

interface ResultadoParcial {
  id: string;
  fase: FaseId;
  score: number;
  demo: boolean;
}

export function Quiz() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("bifurcacion");
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoParcial | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preguntas = useMemo(
    () => (ruta ? preguntasDeRuta(ruta) : []),
    [ruta]
  );

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
    try {
      const utm = leerUtm();
      const res = await fetch("/api/diagnostico", {
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
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ResultadoParcial;
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
    <main className="flex-1 flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-xl">
        <p className="text-center text-sm font-semibold tracking-wide text-indigo-600 uppercase mb-8">
          {COPY.marca.nombre}
        </p>

        {etapa === "bifurcacion" && (
          <Pantalla>
            <h1 className="text-2xl font-bold text-stone-900 mb-6">
              {PREGUNTA_BIFURCACION.texto}
            </h1>
            <div className="space-y-3">
              {PREGUNTA_BIFURCACION.opciones.map((opcion) => (
                <BotonOpcion
                  key={opcion.ruta}
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
              <div className="flex justify-between text-xs text-stone-500 mb-2">
                <span>{COPY.quiz.progresoDe(indice + 1, preguntas.length)}</span>
                <button
                  onClick={retroceder}
                  className="underline hover:text-stone-700"
                >
                  ← Atrás
                </button>
              </div>
              <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((indice + 1) / preguntas.length) * 100}%` }}
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mb-6">
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
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </Pantalla>
        )}

        {etapa === "calculando" && (
          <Pantalla>
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-stone-600">{COPY.quiz.calculando}</p>
            </div>
          </Pantalla>
        )}

        {etapa === "gate" && resultado && (
          <GateResultado resultado={resultado} onExito={(token) => router.push(`/resultado/${token}`)} />
        )}
      </div>
    </main>
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
        <p className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2">
          {COPY.demo.aviso}
        </p>
      )}

      {/* Parte A: visible — valida el diagnóstico y genera curiosidad */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5 mb-6">
        <BadgePlaceholder visible={roadmap.status === "placeholder"} />
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-2">
          {roadmap.parteA.titulo}
        </h1>
        <p className="mt-3 text-stone-700 leading-relaxed text-sm sm:text-base">
          {roadmap.parteA.diagnostico}
        </p>
      </div>

      {/* Gate: los 3 pasos se desbloquean con el email */}
      <h2 className="text-lg font-bold text-stone-900">{COPY.gate.titulo}</h2>
      <p className="mt-1 text-sm text-stone-600">{COPY.gate.subtitulo}</p>

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

        <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer">
          <input
            type="checkbox"
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-indigo-600"
          />
          <span>{COPY.gate.consentimiento}</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-60 transition"
        >
          {enviando ? COPY.gate.enviando : COPY.gate.boton}
        </button>

        <p className="text-center text-xs text-stone-400">
          <Link href="/privacidad" className="underline">
            {COPY.gate.privacidad}
          </Link>
        </p>
      </form>
    </Pantalla>
  );
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8">
      {children}
    </div>
  );
}

function BotonOpcion({
  children,
  onClick,
  seleccionada,
}: {
  children: React.ReactNode;
  onClick: () => void;
  seleccionada?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3.5 text-sm sm:text-base transition active:scale-[0.99] ${
        seleccionada
          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
          : "border-stone-200 bg-white text-stone-800 hover:border-indigo-300 hover:bg-indigo-50/50"
      }`}
    >
      {children}
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
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={requerido}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
    </label>
  );
}
