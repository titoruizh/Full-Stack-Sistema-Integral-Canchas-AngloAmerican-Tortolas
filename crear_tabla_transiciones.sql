-- =====================================================
-- SQL #2: COPIAR Y PEGAR EN SUPABASE SQL EDITOR
-- =====================================================

CREATE TABLE IF NOT EXISTS transiciones_estado (
  id BIGSERIAL PRIMARY KEY,
  cancha_id BIGINT NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
  estado_anterior_id INT REFERENCES estados_cancha(id),
  estado_nuevo_id INT NOT NULL REFERENCES estados_cancha(id),
  empresa_anterior_id INT REFERENCES empresas(id),
  empresa_nueva_id INT REFERENCES empresas(id),
  accion VARCHAR(100) NOT NULL,
  observaciones TEXT,
  usuario_id INT REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transiciones_cancha_id ON transiciones_estado(cancha_id);
CREATE INDEX IF NOT EXISTS idx_transiciones_created_at ON transiciones_estado(created_at DESC);

CREATE OR REPLACE VIEW vista_transiciones_completa AS
SELECT 
  t.id,
  t.cancha_id,
  c.nombre AS cancha_nombre,
  ea.nombre AS estado_anterior,
  en.nombre AS estado_nuevo,
  emp_ant.nombre AS empresa_anterior,
  emp_new.nombre AS empresa_nueva,
  t.accion,
  t.observaciones,
  u.nombre_completo AS usuario_nombre,
  t.created_at AS fecha_transicion
FROM transiciones_estado t
LEFT JOIN canchas c ON t.cancha_id = c.id
LEFT JOIN estados_cancha ea ON t.estado_anterior_id = ea.id
LEFT JOIN estados_cancha en ON t.estado_nuevo_id = en.id
LEFT JOIN empresas emp_ant ON t.empresa_anterior_id = emp_ant.id
LEFT JOIN empresas emp_new ON t.empresa_nueva_id = emp_new.id
LEFT JOIN usuarios u ON t.usuario_id = u.id
ORDER BY t.created_at DESC;

ALTER TABLE transiciones_estado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de transiciones" ON transiciones_estado
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de transiciones" ON transiciones_estado
  FOR INSERT WITH CHECK (true);
