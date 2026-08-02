-- ============================================================
-- 002 — Medición del embudo completo
--
-- Antes: la fila se creaba SOLO al completar el quiz, así que quien
-- abandonaba a mitad no dejaba ningún rastro.
--
-- Ahora: la fila nace al responder la primera pregunta y avanza por
-- estados (iniciado → completado → capturado). Eso hace medible la
-- tasa de abandono real y el perfil de quien abandona.
--
-- Correr en Supabase: SQL Editor → pegar todo → Run. Es idempotente.
-- ============================================================

-- ------------------------------------------------------------
-- 1. La fase y el score ya no se conocen al crear la fila
-- ------------------------------------------------------------
ALTER TABLE diagnosticos ALTER COLUMN fase DROP NOT NULL;
ALTER TABLE diagnosticos ALTER COLUMN score_numerico DROP NOT NULL;
ALTER TABLE diagnosticos ALTER COLUMN respuestas SET DEFAULT '[]'::jsonb;

-- ------------------------------------------------------------
-- 2. Ciclo de vida y avance dentro del quiz
-- ------------------------------------------------------------
ALTER TABLE diagnosticos
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'iniciado',
  ADD COLUMN IF NOT EXISTS iniciado_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS completado_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ultima_actividad_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS preguntas_respondidas INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_preguntas INT,
  ADD COLUMN IF NOT EXISTS ultima_pregunta_id TEXT;

DO $$ BEGIN
  ALTER TABLE diagnosticos ADD CONSTRAINT diagnosticos_estado_check
    CHECK (estado IN ('iniciado', 'completado', 'capturado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 3. Atribución ampliada
--    fbclid/gclid/ttclid son los click-id de cada plataforma: sin
--    ellos la conversión no se puede atribuir al anuncio exacto.
--    fbp/fbc son las cookies del pixel — la API de Conversiones las
--    necesita para hacer match con la persona que vio el anuncio.
-- ------------------------------------------------------------
ALTER TABLE diagnosticos
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS fbclid TEXT,
  ADD COLUMN IF NOT EXISTS gclid TEXT,
  ADD COLUMN IF NOT EXISTS ttclid TEXT,
  ADD COLUMN IF NOT EXISTS landing_path TEXT,
  ADD COLUMN IF NOT EXISTS fbp TEXT,
  ADD COLUMN IF NOT EXISTS fbc TEXT;

-- ------------------------------------------------------------
-- 4. Datos necesarios para enviar el evento de abandono DESPUÉS
--    (el navegador ya no está, así que IP y user-agent se guardan
--    al iniciar y se reutilizan en el barrido diferido).
--    evento_id es la clave que deduplica pixel ↔ API de Conversiones.
-- ------------------------------------------------------------
ALTER TABLE diagnosticos
  ADD COLUMN IF NOT EXISTS client_ip TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS evento_id TEXT,
  ADD COLUMN IF NOT EXISTS capi_abandono_at TIMESTAMPTZ;

-- ------------------------------------------------------------
-- 5. Backfill de los diagnósticos que ya existen: todos llegaron
--    al final (antes no había forma de guardar uno a medias).
-- ------------------------------------------------------------
UPDATE diagnosticos
SET
  estado = CASE WHEN email IS NOT NULL THEN 'capturado' ELSE 'completado' END,
  iniciado_at = fecha_creacion,
  completado_at = fecha_creacion,
  ultima_actividad_at = COALESCE(email_capturado_at, fecha_creacion),
  total_preguntas = CASE WHEN ruta = 'A' THEN 9 ELSE 6 END,
  preguntas_respondidas = CASE WHEN ruta = 'A' THEN 9 ELSE 6 END
WHERE total_preguntas IS NULL;

-- ------------------------------------------------------------
-- 6. Índices para el panel
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_diagnosticos_estado ON diagnosticos (estado);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_actividad ON diagnosticos (ultima_actividad_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_utm ON diagnosticos (utm_source, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_capi_abandono
  ON diagnosticos (capi_abandono_at) WHERE capi_abandono_at IS NULL;

-- ============================================================
-- VISTAS
--
-- Todas con security_invoker = on: sin esto una vista corre con los
-- permisos de su dueño (postgres) y PostgREST la deja leer con la
-- anon key, saltándose el RLS de la tabla. Con security_invoker el
-- RLS sí aplica y nadie puede leerlas sin la service role key.
-- ============================================================

-- Un diagnóstico se considera ABANDONADO si lleva 30 minutos sin
-- actividad y no llegó a dejar el email. Se calcula al leer, así que
-- la métrica es correcta sin depender de ningún job programado.
CREATE OR REPLACE VIEW diagnosticos_embudo
WITH (security_invoker = on) AS
SELECT
  d.*,
  CASE
    WHEN d.estado = 'capturado' THEN 'capturado'
    WHEN d.ultima_actividad_at >= now() - interval '30 minutes' THEN 'en_curso'
    WHEN d.estado = 'completado' THEN 'abandono_gate'
    ELSE 'abandono_preguntas'
  END AS estado_efectivo
FROM diagnosticos d;

-- Embudo global y por ruta.
CREATE OR REPLACE VIEW resumen_embudo
WITH (security_invoker = on) AS
SELECT
  ruta,
  COUNT(*)                                                          AS iniciados,
  COUNT(*) FILTER (WHERE estado IN ('completado', 'capturado'))      AS completados,
  COUNT(*) FILTER (WHERE estado = 'capturado')                       AS capturados,
  COUNT(*) FILTER (WHERE estado_efectivo = 'abandono_preguntas')     AS abandono_preguntas,
  COUNT(*) FILTER (WHERE estado_efectivo = 'abandono_gate')          AS abandono_gate,
  COUNT(*) FILTER (WHERE estado_efectivo = 'en_curso')               AS en_curso
FROM diagnosticos_embudo
GROUP BY ruta;

-- En qué pregunta exacta se cae la gente.
CREATE OR REPLACE VIEW abandono_por_pregunta
WITH (security_invoker = on) AS
SELECT
  ruta,
  ultima_pregunta_id AS pregunta_id,
  preguntas_respondidas,
  COUNT(*) AS abandonos
FROM diagnosticos_embudo
WHERE estado_efectivo = 'abandono_preguntas'
  AND ultima_pregunta_id IS NOT NULL
GROUP BY ruta, ultima_pregunta_id, preguntas_respondidas;

-- Atribución: qué campaña trae gente que termina y cuál solo curiosos.
CREATE OR REPLACE VIEW resumen_utm
WITH (security_invoker = on) AS
SELECT
  COALESCE(utm_source, '(directo)')     AS utm_source,
  COALESCE(utm_medium, '(ninguno)')     AS utm_medium,
  COALESCE(utm_campaign, '(ninguna)')   AS utm_campaign,
  COALESCE(utm_content, '(ninguno)')    AS utm_content,
  COUNT(*)                                                     AS iniciados,
  COUNT(*) FILTER (WHERE estado IN ('completado', 'capturado')) AS completados,
  COUNT(*) FILTER (WHERE estado = 'capturado')                  AS capturados
FROM diagnosticos_embudo
GROUP BY 1, 2, 3, 4;

-- Recreada: ahora hay filas sin fase (las que abandonaron a mitad).
DROP VIEW IF EXISTS resumen_fases;
CREATE VIEW resumen_fases
WITH (security_invoker = on) AS
SELECT
  ruta,
  fase,
  COUNT(*)                       AS total,
  COUNT(email)                   AS con_email,
  ROUND(AVG(score_numerico), 1)  AS score_promedio
FROM diagnosticos
WHERE fase IS NOT NULL
GROUP BY ruta, fase;

-- Cinturón y tirantes: aunque security_invoker ya lo cubre, ninguna
-- de estas vistas tiene por qué ser alcanzable con la anon key.
REVOKE ALL ON diagnosticos_embudo    FROM anon, authenticated;
REVOKE ALL ON resumen_embudo         FROM anon, authenticated;
REVOKE ALL ON abandono_por_pregunta  FROM anon, authenticated;
REVOKE ALL ON resumen_utm            FROM anon, authenticated;
REVOKE ALL ON resumen_fases          FROM anon, authenticated;
