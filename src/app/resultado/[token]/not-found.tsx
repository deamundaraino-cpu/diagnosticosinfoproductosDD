import Link from "next/link";
import { COPY } from "@/content/copy";

export default function ResultadoNoEncontrado() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-stone-900">
          {COPY.errores.resultadoNoEncontrado}
        </h1>
        <p className="mt-3 text-stone-600">
          {COPY.errores.resultadoNoEncontradoDetalle}
        </p>
        <Link
          href="/diagnostico"
          className="mt-8 inline-block rounded-xl bg-indigo-600 px-7 py-3.5 text-white font-semibold hover:bg-indigo-700 transition"
        >
          {COPY.errores.volverAlInicio}
        </Link>
      </div>
    </main>
  );
}
