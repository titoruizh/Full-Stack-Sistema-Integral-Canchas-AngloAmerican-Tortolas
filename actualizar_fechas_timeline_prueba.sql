-- =====================================================
-- ACTUALIZAR FECHAS DE TRANSICIONES PARA TIMELINE DE PRUEBA
-- Cancha: ME_S3_test_fechas_2 (cancha_id = 222)
-- =====================================================

-- Verificar transiciones actuales
SELECT id, accion, created_at 
FROM transiciones_estado 
WHERE cancha_id = 222 
ORDER BY id;

-- ACTUALIZAR FECHAS (de atrás para adelante, 1 día por acción)

-- ID 12: cerrar_cancha - HOY 28/11/2025 a las 14:00
UPDATE transiciones_estado 
SET created_at = '2025-11-28 14:00:00+00' 
WHERE id = 12;

-- ID 11: validar_llay_llay - AYER 27/11/2025 a las 15:30
UPDATE transiciones_estado 
SET created_at = '2025-11-27 15:30:00+00' 
WHERE id = 11;

-- ID 10: tomar_trabajo (LlayLlay) - 26/11/2025 a las 10:00
UPDATE transiciones_estado 
SET created_at = '2025-11-26 10:00:00+00' 
WHERE id = 10;

-- ID 9: validar_linkapsis - 25/11/2025 a las 16:00
UPDATE transiciones_estado 
SET created_at = '2025-11-25 16:00:00+00' 
WHERE id = 9;

-- ID 8: tomar_trabajo (Linkapsis) - 24/11/2025 a las 09:30
UPDATE transiciones_estado 
SET created_at = '2025-11-24 09:30:00+00' 
WHERE id = 8;

-- ID 7: finalizar_besalco - 23/11/2025 a las 14:45
UPDATE transiciones_estado 
SET created_at = '2025-11-23 14:45:00+00' 
WHERE id = 7;

-- ID 6: tomar_trabajo (Besalco) - 22/11/2025 a las 08:00
UPDATE transiciones_estado 
SET created_at = '2025-11-22 08:00:00+00' 
WHERE id = 6;

-- ID 5: enviar_besalco - 21/11/2025 a las 11:00
UPDATE transiciones_estado 
SET created_at = '2025-11-21 11:00:00+00' 
WHERE id = 5;

-- ID 4: crear_cancha_con_poligono - 20/11/2025 a las 10:00
UPDATE transiciones_estado 
SET created_at = '2025-11-20 10:00:00+00' 
WHERE id = 4;

-- Verificar cambios
SELECT 
  id,
  accion,
  created_at,
  DATE(created_at) as fecha,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as fecha_formateada
FROM transiciones_estado 
WHERE cancha_id = 222 
ORDER BY created_at ASC;

-- Ver timeline completo con nombres legibles
SELECT 
  fecha_transicion,
  TO_CHAR(fecha_transicion, 'DD/MM/YYYY') as fecha,
  accion,
  estado_anterior,
  estado_nuevo,
  empresa_anterior,
  empresa_nueva,
  observaciones
FROM vista_transiciones_completa
WHERE cancha_id = 222
ORDER BY fecha_transicion ASC;
