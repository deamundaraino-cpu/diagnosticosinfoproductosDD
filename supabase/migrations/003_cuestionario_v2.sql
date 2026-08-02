-- ============================================================
-- 003 — Cuestionario v2 (investigación de mercado)
--
-- El diagnóstico deja de ser funnel de venta y pasa a ser herramienta
-- de investigación: entran dos preguntas de etiqueta nuevas y una
-- pregunta abierta por ruta.
--
-- Ojo con el score: la v2 cambia la escala (ruta A de 8-24 a 9-27,
-- ruta B de 5-14 a 5-15). Por eso se versiona cada registro — promediar
-- scores de escalas distintas no significa nada.
--
-- Las vistas se DESTRUYEN y se recrean en vez de usar CREATE OR REPLACE:
-- diagnosticos_embudo hace SELECT d.*, así que al añadir columnas cambia
-- el orden posicional y Postgres rechaza el reemplazo en sitio.
--
-- Correr en Supabase: SQL Editor → pegar todo → Run. Es idempotente.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Fuera las vistas (dependen de la tabla que vamos a alterar)
-- ------------------------------------------------------------
DROP VIEW IF EXISTS resumen_embudo;
DROP VIEW IF EXISTS abandono_por_pregunta;
DROP VIEW IF EXISTS resumen_utm;
DROP VIEW IF EXISTS resumen_fases;
DROP VIEW IF EXISTS diagnosticos_embudo;

-- ------------------------------------------------------------
-- 2. Campos nuevos del cuestionario v2
-- ------------------------------------------------------------
ALTER TABLE diagnosticos
  -- Detalle escrito cuando el cuello de botella es "otro"
  ADD COLUMN IF NOT EXISTS cuello_botella_otro TEXT,
  -- Q11 ruta A: qué ha intentado ya para resolverlo
  ADD COLUMN IF NOT EXISTS nivel_intencion TEXT,
  -- Pregunta abierta de investigación (Q12 ruta A / Q6 ruta B)
  ADD COLUMN IF NOT EXISTS texto_abierto TEXT,
  -- Q1 ruta A, desnormalizada para poder filtrar y exportar sin
  -- tener que abrir el JSON de respuestas en cada consulta
  ADD COLUMN IF NOT EXISTS facturacion TEXT,
  -- Escala del cuestionario con la que se calculó el score
  ADD COLUMN IF NOT EXISTS version_cuestionario SMALLINT NOT NULL DEFAULT 1;

DO $$ BEGIN
  ALTER TABLE diagnosticos ADD CONSTRAINT diagnosticos_nivel_intencion_check
    CHECK (nivel_intencion IS NULL OR nivel_intencion IN
      ('nada', 'contenido_gratis', 'compro_producto', 'contrato_servicio'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Los registros que ya existían se calcularon con la escala v1.
UPDATE diagnosticos SET version_cuestionario = 1 WHERE version_cuestionario IS NULL;

CREATE INDEX IF NOT EXISTS idx_diagnosticos_intencion ON diagnosticos (nivel_intencion);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_version ON diagnosticos (version_cuestionario);

-- ============================================================
-- 3. Vistas, recreadas
--
-- security_invoker = on en todas: sin esto una vista corre con los
-- permisos de su dueño y PostgREST la deja leer con la anon key,
-- saltándose el RLS de la tabla.
-- ============================================================

CREATE VIEW diagnosticos_embudo
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

CREATE VIEW resumen_embudo
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

CREATE VIEW abandono_por_pregunta
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

CREATE VIEW resumen_utm
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

-- El score promedio se separa por escala: mezclar v1 y v2 no significa nada.
CREATE VIEW resumen_fases
WITH (security_invoker = on) AS
SELECT
  ruta,
  fase,
  version_cuestionario,
  COUNT(*)                       AS total,
  COUNT(email)                   AS con_email,
  ROUND(AVG(score_numerico), 1)  AS score_promedio
FROM diagnosticos
WHERE fase IS NOT NULL
GROUP BY ruta, fase, version_cuestionario;

REVOKE ALL ON diagnosticos_embudo    FROM anon, authenticated;
REVOKE ALL ON resumen_embudo         FROM anon, authenticated;
REVOKE ALL ON abandono_por_pregunta  FROM anon, authenticated;
REVOKE ALL ON resumen_utm            FROM anon, authenticated;
REVOKE ALL ON resumen_fases          FROM anon, authenticated;
