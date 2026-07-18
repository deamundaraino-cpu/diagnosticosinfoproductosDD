# Plataforma de Diagnóstico — Daviddigital

Lead magnet de diagnóstico para infoproductores: quiz bifurcado (Ruta A: ya vende / Ruta B: aún no lanza), scoring determinista, resultado parcial → captura de email → roadmap completo con URL permanente, email transaccional y panel interno.

Especificación completa: `../PROJECT_PROMPT_v2.md`.

## Correr en local (modo demo, 1 minuto)

```bash
npm install
npm run dev
```

Abre http://localhost:3000. **Sin configurar nada**, la app corre en modo demo: el quiz completo funciona (bifurcación → preguntas → resultado parcial → captura → roadmap), pero no persiste datos ni envía emails. Ideal para revisar textos y UX.

## Setup completo (~15 min)

### 1. Supabase (necesario para guardar diagnósticos)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com)
2. En el proyecto: **SQL Editor** → pega el contenido de `supabase/migrations/001_diagnosticos.sql` → **Run**
3. En **Settings → API** copia la *Project URL* y la *service_role key*
4. `cp .env.example .env.local` y completa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

> La tabla tiene RLS activado sin políticas públicas: nadie puede leerla con la anon key. Todo el acceso pasa por el servidor con la service role key. **Nunca pongas la service role key en una variable `NEXT_PUBLIC_`.**

### 2. Resend (opcional — envío del roadmap por email)

1. Cuenta gratis en [resend.com](https://resend.com) → verifica tu dominio → crea una API key
2. Completa `RESEND_API_KEY` y `EMAIL_FROM` (ej. `Daviddigital <hola@tudominio.com>`)

Sin esto la app funciona igual, solo no envía el email (queda registrado en logs).

### 3. PostHog (opcional — analytics del funnel)

1. Cuenta gratis en [posthog.com](https://posthog.com)
2. Completa `NEXT_PUBLIC_POSTHOG_KEY` (y `NEXT_PUBLIC_POSTHOG_HOST` si tu proyecto es de la región EU)

Eventos capturados: `quiz_iniciado`, `pregunta_respondida`, `quiz_completado`, `email_capturado`, `resultado_visitado`. **La Fase 4 (tasa de abandono por pregunta) depende de esta data — actívalo antes de lanzar tráfico.**

### 4. Panel interno

Define `ADMIN_PASSWORD` en `.env.local` y entra en http://localhost:3000/admin.

### 5. Datos de prueba

```bash
npm run seed   # inserta 28 diagnósticos de prueba para QA del panel
```

Para limpiarlos: `DELETE FROM diagnosticos WHERE token_resultado LIKE 'seed-%';`

## Deploy a Vercel

1. Sube el repo a GitHub y conéctalo en [vercel.com](https://vercel.com)
2. Copia todas las variables de `.env.local` a **Settings → Environment Variables**
3. Cambia `NEXT_PUBLIC_SITE_URL` a tu dominio real (los links del email lo usan)
4. Pon `NEXT_PUBLIC_SHOW_PLACEHOLDER_BADGE=false` cuando los textos estén aprobados

## Dónde viven los textos (para reemplazar los provisionales)

Todo el contenido está separado del código — cambiar textos **no requiere tocar lógica**:

| Archivo | Contenido |
|---|---|
| `src/content/roadmaps.ts` | Los 6 roadmaps (A1–B3), divididos en Parte A (visible) y Parte B (gateada). Al aprobar uno, cambiar `status` a `"aprobado"` |
| `src/content/preguntas.ts` | Preguntas, opciones y pesos de ambas rutas |
| `src/content/copy.ts` | Landing, formulario de captura, email, confirmación, errores |

Los umbrales de fase están en `src/lib/scoring.ts` (v1 — recalibrar con data real).

## Tests

```bash
npm test   # motor de scoring: umbrales, bordes, validación
```

## Estructura

```
src/
├── content/          # ← textos y preguntas (lo único que David edita)
├── lib/              # scoring, supabase (server-only), email, analytics, ratelimit
├── components/       # Quiz, badges, tracking
└── app/
    ├── page.tsx              # landing
    ├── diagnostico/          # quiz
    ├── resultado/[token]/    # roadmap completo (URL permanente)
    ├── privacidad/           # política (placeholder legal)
    ├── admin/                # panel interno V0
    └── api/diagnostico/      # crear diagnóstico + capturar email
supabase/migrations/  # schema SQL con RLS
scripts/seed.mjs      # datos de prueba
```
