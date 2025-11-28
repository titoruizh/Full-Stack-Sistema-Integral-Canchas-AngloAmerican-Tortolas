-- =====================================================
-- SQL #1: COPIAR Y PEGAR EN SUPABASE SQL EDITOR
-- ESTADOS CORRECTOS (SIN DEPRECADOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS estados_cancha (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOLO ESTADOS VÁLIDOS (sin 3 y 5 que son deprecados)
INSERT INTO estados_cancha (id, nombre, descripcion) VALUES
  (1, 'Creada', 'Cancha creada por AngloAmerican'),
  (2, 'En Proceso', 'Trabajo en proceso por empresa validadora'),
  (4, 'Validada', 'Cancha validada, lista para cerrar'),
  (6, 'Cerrada', 'Cancha cerrada - proceso completado'),
  (7, 'En Espera', 'Esperando asignación o validación'),
  (8, 'Rechazada, en Espera', 'Cancha rechazada, esperando corrección')
ON CONFLICT (id) DO NOTHING;

-- Eliminar estados deprecados si existen
DELETE FROM estados_cancha WHERE id IN (3, 5);

SELECT * FROM estados_cancha ORDER BY id;
