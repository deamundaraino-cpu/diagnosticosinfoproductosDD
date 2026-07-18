import Link from "next/link";
import type { Viewport } from "next";
import { COPY } from "@/content/copy";
import { BrandBackdrop } from "@/components/brand/BrandBackdrop";

export const metadata = {
  title: "Política de privacidad | Daviddigital",
};

export const viewport: Viewport = { themeColor: "#0D1420" };

/**
 * PLACEHOLDER LEGAL — David debe revisarla (idealmente con un abogado)
 * antes de lanzar tráfico. Ajustar responsable, país y derechos aplicables.
 */
export default function Privacidad() {
  return (
    <BrandBackdrop outerClassName="flex-1" innerClassName="flex-1 px-5 py-14">
      <div className="brand-glass brand-pop-in mx-auto max-w-2xl rounded-3xl p-7 sm:p-9">
        <h1 className="font-display text-2xl font-bold text-white">
          Política de privacidad
        </h1>
        <p className="mt-3 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-lg px-3 py-2 inline-block">
          Texto provisional — pendiente de revisión legal antes del lanzamiento.
        </p>

        <div className="mt-6 space-y-5 text-sm text-white/75 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-white">1. Responsable</h2>
            <p>
              {COPY.marca.nombre} ({COPY.marca.instagram}) es responsable del
              tratamiento de los datos que nos facilitas a través del
              diagnóstico.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">2. Qué datos recogemos</h2>
            <p>
              Tus respuestas al diagnóstico, tu nombre, tu email y — si decides
              dárnoslo — tu número de WhatsApp. También datos de origen de la
              visita (parámetros UTM y página de referencia) para saber qué
              contenido te trajo hasta aquí.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">3. Para qué los usamos</h2>
            <p>
              Para generar tu diagnóstico, enviarte tu roadmap por email y —
              solo si diste tu consentimiento — enviarte contenido relacionado
              de {COPY.marca.nombre}. No vendemos ni cedemos tus datos a
              terceros.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">4. Tus derechos</h2>
            <p>
              Puedes darte de baja de nuestros emails en cualquier momento
              desde el enlace incluido en cada correo, y solicitar el acceso,
              corrección o eliminación de tus datos escribiéndonos por mensaje
              directo a {COPY.marca.instagram}.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">5. Dónde se guardan</h2>
            <p>
              Tus datos se almacenan de forma segura en Supabase (base de
              datos) y en nuestro proveedor de email, con acceso restringido.
            </p>
          </section>
        </div>

        <p className="mt-10">
          <Link href="/" className="text-[var(--brand-orange-light)] underline text-sm hover:text-white transition">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </BrandBackdrop>
  );
}
