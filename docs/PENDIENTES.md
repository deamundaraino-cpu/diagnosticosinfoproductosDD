# Pendientes del sistema — qué falta, cómo entregarlo y qué debe decir

> Actualizado: 19 de julio de 2026. El sistema está EN LÍNEA y operativo en
> https://diagnostico.daviddigital.co — estos pendientes son lo que falta
> para pasar de "funciona" a "lanzado con contenido propio y nurture activo".

---

## 1. Los 6 textos de roadmap definitivos ⭐ (lo más importante)

**Qué es:** el corazón del lead magnet. Hoy hay textos provisionales escritos
por IA siguiendo tus reglas — funcionan, pero no son tu voz ni tu experiencia real.

**Cómo entregarlo:** NO escribas desde cero. Los borradores están en
`src/content/roadmaps.ts` (o pídeme que te los pase en limpio). Edítalos en
cualquier formato (Google Doc, WhatsApp, notas de voz transcritas) y me los
mandas. Yo los cargo, cambio el status a "aprobado" y apago el badge
"texto provisional". Cambiar textos no toca código.

**Estructura obligatoria de cada uno (6 en total: A1, A2, A3, B1, B2, B3):**

- **Parte A (visible ANTES del email — vende la curiosidad):**
  - Título: "Estás en fase de..." (nombre memorable de la fase)
  - Diagnóstico: 2-3 líneas de "qué significa estar acá" — la persona debe
    sentirse retratada ("es exactamente lo que me pasa")
- **Parte B (se desbloquea CON el email — el premio):**
  - 3 pasos concretos y accionables — específicos de esa fase, no genéricos.
    El test: si un paso sirve igual para las 6 fases, está mal.
  - Cierre con CTA suave a @daviddigital.co (invitar a seguir contenido, sin venta)

**Qué deben decir (tono):**
- A1-A3: técnico + mentor. Números, sistema, funnels. Habla de ejecución real.
- B1-B3: mentor cercano. "Yo estuve ahí". Validar la emoción, bajar la fricción.
- Reglas inquebrantables: nunca prometer ingresos · nunca atacar a nadie ·
  nunca mencionar precios · cero "hazte rico rápido".

---

## 2. API key de MailerLite (enciende el nurture)

**Qué es:** el código ya sincroniza cada lead con MailerLite automáticamente —
solo falta la llave de tu cuenta.

**Cómo resolverlo:**
1. Cuenta gratis en mailerlite.com (usa comunidad@daviddigital.co)
2. Dentro: Integrations → MailerLite API → Generate new token
3. Me pegas la key → yo corro `npm run setup:mailerlite` (crea campos y
   grupos solos), configuro las variables en Vercel y pruebo con un lead real.

**Después, tu única tarea dentro de MailerLite (~15 min):** montar las 2
automatizaciones pegando los emails del punto 3. La guía paso a paso está
al inicio de `docs/nurture-secuencias.md`.

---

## 3. Aprobar/ajustar las secuencias de nurture

**Qué es:** los 8 emails (4 por ruta) que reciben los leads en los ~10 días
posteriores al diagnóstico. YA ESTÁN REDACTADOS como borrador en
`docs/nurture-secuencias.md`, con asuntos, tiempos de espera y objetivos.

**Cómo entregarlo:** léelos, ajusta lo que no suene a ti (sobre todo las
anécdotas — pon las tuyas reales), y pégalos en las automatizaciones de
MailerLite. No pasan por mí ni por código: viven en MailerLite.

**Qué deben decir:** ya siguen la estructura correcta (activar ejecución →
valor específico → reencuadre/emoción → cierre con compromiso). Mantén los
"responde este correo": las respuestas mejoran la entregabilidad y abren
conversaciones de venta futura.

---

## 4. Copy definitivo de landing y captura

**Qué es:** el texto de la página de inicio (título, subtítulo, 3 bullets,
botón) y del formulario de email (promesa del gate). Hoy es provisional.

**Cómo entregarlo:** mándame los textos nuevos en cualquier formato (son
~10 frases en total; te paso la lista exacta de strings cuando quieras).
Yo los cargo en `src/content/copy.ts`.

**Qué debe decir:** la landing vende UNA cosa: "descubre tu fase real + 3
pasos, en 2 minutos, gratis, sin humo". El gate vende el desbloqueo: "tus
3 próximos pasos + roadmap a tu correo". Prohibido prometer resultados.

---

## 5. Naming/branding de la herramienta (opcional pero recomendado)

**Qué es:** decidir si el diagnóstico tiene nombre propio (ej. "Radar
Evergreen", "El Diagnóstico DD") o sigue genérico como "el diagnóstico de
@daviddigital.co".

**Cómo entregarlo:** solo la decisión + el nombre. Yo actualizo títulos,
metadatos y el email. Impacta en cómo lo mencionas en tus Reels ("hice una
herramienta que te dice en qué fase estás → link en bio").

---

## 6. Revisión final de la política de privacidad

**Qué es:** ya está publicada conforme a la Ley 1581/2012 (Colombia) con
comunidad@daviddigital.co como contacto. Falta TU lectura final (y de un
abogado si quieres blindaje total) antes de campañas grandes.

**Cómo resolverlo:** léela en https://diagnostico.daviddigital.co/privacidad
y mándame cualquier corrección (ej. si operas con NIT/razón social, se agrega).

---

## 7. Contenido Pilar 1 de lanzamiento (3-5 piezas para Instagram)

**Qué es:** las piezas que llevarán el primer tráfico real al diagnóstico.
Esto es 100% tuyo (tu cara, tu voz) — de mi lado ya está listo el tracking.

**Cómo resolverlo:** cada pieza lleva el link con UTMs distintos para saber
cuál convierte. Formato del link (cambia solo `utm_content`):

```
https://diagnostico.daviddigital.co?utm_source=instagram&utm_campaign=lanzamiento-1&utm_content=reel-1
```

**Qué deberían decir (ángulos sugeridos, uno por pieza):**
1. El problema: "Trabajas más y facturas igual — no te falta esfuerzo, te falta sistema"
2. La herramienta: "Hice un diagnóstico que te dice en qué fase real está tu negocio (2 min, gratis)"
3. Las fases: "Las 3 fases de todo infoproductor estancado — ¿en cuál estás tú?"
4. Para los que no han lanzado: "Si llevas meses 'a punto de empezar', esto es para ti"
5. Prueba social (cuando haya data): "X personas ya saben su fase — esto es lo que más se repite"

---

## 8. Seguridad — acciones inmediatas tuyas

- [ ] **Revocar el token de Vercel** (`vcp_32m...`) en vercel.com/account/settings/tokens — ya no lo necesito
- [ ] Guardar la password del admin (`/admin`) en un gestor de contraseñas
- [ ] (Ya hecho: token de Supabase revocado ✓)

---

## Después del lanzamiento (no bloquean, alto retorno)

| Mejora | Qué necesita de ti |
|---|---|
| Imagen OG por fase (compartir resultado en stories → viralidad) | Solo aprobar el diseño |
| WhatsApp nurture (ya capturamos teléfono) | Decidir canal (manual vs API) |
| Panel de tendencias (Fase 4) | Nada — se activa con 30-50 diagnósticos |
| IA que personaliza por nicho (Fase 3) | Tu criterio de qué nichos escalan (bloqueante por diseño) |
| Rate limiting global (Upstash) | Nada — se hace cuando haya campañas de pago |

---

## Resumen: el orden que recomiendo

1. **MailerLite API key** (10 min tuyos) → nurture encendido esta semana
2. **Editar los 6 roadmaps** (1-2 horas tuyas sobre mis borradores) → plataforma 100% en tu voz
3. **Montar las automatizaciones** en MailerLite con los emails ajustados
4. **Grabar las piezas de lanzamiento** con sus links UTM
5. Lanzar 🚀
