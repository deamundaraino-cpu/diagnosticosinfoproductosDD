-- ============================================================
-- Plataforma de Diagnóstico Daviddigital — schema Fase 1
-- Correr en Supabase: SQL Editor → pegar todo → Run
-- ============================================================

CREATE TABLE diagnosticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_resultado TEXT UNIQUE NOT NULL,
  -- NULL hasta que la persona deja su email (el registro se crea al completar el quiz)
  email TEXT,
  email_capturado_at TIMESTAMPTZ,
  nombre TEXT,
  telefono TEXT,
  consentimiento BOOLEAN NOT NULL DEFAULT false,
  consentimiento_at TIMESTAMPTZ,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  ruta TEXT NOT NULL CHECK (ruta IN ('A', 'B')),
  fase TEXT NOT NULL CHECK (fase IN ('A1', 'A2', 'A3', 'B1', 'B2', 'B3')),
  score_numerico INT NOT NULL,
  respuestas JSONB NOT NULL,
  cuello_de_botella TEXT,  -- tag ruta A (pregunta 9), no suma al score
  freno_principal TEXT,    -- tag ruta B (pregunta 4), no suma al score
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  referrer TEXT
);

CREATE INDEX idx_diagnosticos_fecha ON diagnosticos (fecha_creacion DESC);
CREATE INDEX idx_diagnosticos_ruta_fase ON diagnosticos (ruta, fase);
CREATE INDEX idx_diagnosticos_token ON diagnosticos (token_resultado);

-- Vista agregada para el panel /admin: nunca calcular esto en frontend
CREATE VIEW resumen_fases AS
SELECT
  ruta,
  fase,
  COUNT(*) AS total,
  COUNT(email) AS con_email,
  ROUND(AVG(score_numerico), 1) AS score_promedio
FROM diagnosticos
GROUP BY ruta, fase;

-- ============================================================
-- Seguridad: RLS activado SIN políticas para anon/authenticated.
-- Nadie puede leer ni escribir esta tabla con la anon key.
-- Todo el acceso pasa por las API routes de Next.js con la
-- service role key (que ignora RLS), solo en servidor.
-- ============================================================
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
