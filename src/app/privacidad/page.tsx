import Link from "next/link";
import type { Viewport } from "next";
import { COPY } from "@/content/copy";
import { BrandBackdrop } from "@/components/brand/BrandBackdrop";

export const metadata = {
  title: "Política de privacidad | Daviddigital",
};

export const viewport: Viewport = { themeColor: "#0D1420" };

/**
 * Redactada conforme a la Ley 1581 de 2012 (Colombia) y el Decreto 1377
 * de 2013. PENDIENTE de revisión final por David (idealmente con abogado)
 * antes de campañas de tráfico a gran escala. Verificar: nombre/identificación
 * del responsable y correo de contacto.
 */

const FECHA_ACTUALIZACION = "19 de julio de 2026";
const EMAIL_CONTACTO = "hola@daviddigital.co";

export default function Privacidad() {
  return (
    <BrandBackdrop outerClassName="flex-1" innerClassName="flex-1 px-5 py-14">
      <div className="brand-glass brand-pop-in mx-auto max-w-2xl rounded-3xl p-7 sm:p-9">
        <h1 className="font-display text-2xl font-bold text-white">
          Política de privacidad y tratamiento de datos personales
        </h1>
        <p className="mt-2 text-xs text-white/40">
          Última actualización: {FECHA_ACTUALIZACION}
        </p>

        <div className="mt-6 space-y-6 text-sm text-white/75 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-white">1. Responsable del tratamiento</h2>
            <p>
              {COPY.marca.nombre} ({COPY.marca.instagram}) es el responsable del
              tratamiento de los datos personales recogidos a través de esta
              plataforma de diagnóstico. Contacto para todo lo relacionado con
              tus datos: <strong>{EMAIL_CONTACTO}</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">2. Datos que recogemos</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Datos que nos das tú:</strong> tus respuestas al
                diagnóstico, tu nombre, tu correo electrónico y — solo si
                decides dárnoslo — tu número de WhatsApp.
              </li>
              <li>
                <strong>Datos de contexto de la visita:</strong> parámetros de
                origen (UTM), página de referencia y eventos de uso de la
                plataforma (por ejemplo, en qué pregunta abandonas el
                cuestionario), recogidos mediante la herramienta de analítica
                PostHog.
              </li>
            </ul>
            <p className="mt-2">
              No recogemos datos sensibles (salud, orientación, creencias,
              biometría) ni datos de menores de edad. Esta plataforma está
              dirigida a mayores de 18 años.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">3. Para qué los usamos (finalidades)</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Calcular y entregarte tu diagnóstico y roadmap personalizado.</li>
              <li>Enviarte tu roadmap por correo electrónico y darte acceso permanente a tu resultado.</li>
              <li>
                Con tu autorización expresa (casilla de consentimiento),
                enviarte contenido educativo y comunicaciones de {COPY.marca.nombre} por
                email y/o WhatsApp.
              </li>
              <li>
                Analizar de forma agregada el uso de la plataforma para
                mejorarla (estadísticas por fase, tasas de abandono).
              </li>
            </ul>
            <p className="mt-2">
              <strong>No vendemos ni cedemos tus datos a terceros.</strong> Nunca.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">4. Base legal y autorización</h2>
            <p>
              El tratamiento se realiza conforme a la <strong>Ley 1581 de 2012</strong> y
              el Decreto 1377 de 2013 (Colombia). Al marcar la casilla de
              consentimiento antes de enviar tus datos, otorgas tu autorización
              previa, expresa e informada para las finalidades descritas.
              Guardamos constancia de la fecha y hora de tu autorización.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">5. Tus derechos (habeas data)</h2>
            <p className="mt-2">Como titular de los datos, tienes derecho a:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Conocer, actualizar y rectificar tus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se les ha dado.</li>
              <li>Revocar la autorización y/o solicitar la supresión de tus datos.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
            </ul>
            <p className="mt-2">
              Para ejercerlos, escribe a <strong>{EMAIL_CONTACTO}</strong> o por
              mensaje directo a {COPY.marca.instagram}. Respondemos consultas en
              máximo 10 días hábiles y reclamos en máximo 15 días hábiles,
              conforme a la ley. Además, todos nuestros correos comerciales
              incluyen un enlace de baja inmediata (unsubscribe).
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">6. Dónde se guardan y quién los procesa</h2>
            <p>
              Usamos proveedores tecnológicos que actúan como encargados del
              tratamiento, con acceso restringido y cifrado en tránsito:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase</strong> (base de datos) y <strong>Vercel</strong> (alojamiento web).</li>
              <li><strong>Resend</strong> (envío del roadmap por correo).</li>
              <li><strong>MailerLite</strong> (gestión de suscriptores y envío de contenido, si diste tu autorización).</li>
              <li><strong>PostHog</strong> (analítica de uso).</li>
            </ul>
            <p className="mt-2">
              Estos proveedores pueden almacenar datos en servidores fuera de
              Colombia (principalmente Estados Unidos y la Unión Europea), bajo
              sus propias garantías contractuales de protección de datos. Al
              autorizar el tratamiento, autorizas también esta transmisión
              internacional necesaria para prestar el servicio.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">7. Cuánto tiempo los conservamos</h2>
            <p>
              Conservamos tus datos mientras exista una relación activa contigo
              (mientras no te des de baja ni solicites su supresión) y durante
              el tiempo razonable necesario para las finalidades descritas. Si
              revocas tu autorización, eliminamos tus datos de nuestros
              sistemas y de los de nuestros encargados en un plazo máximo de 15
              días hábiles, salvo obligación legal de conservación.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white">8. Cambios a esta política</h2>
            <p>
              Si modificamos esta política, publicaremos la versión actualizada
              en esta misma página con su nueva fecha. Si el cambio afecta
              sustancialmente las finalidades del tratamiento, te lo
              comunicaremos por correo antes de aplicarlo.
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
