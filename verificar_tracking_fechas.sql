-- =====================================================
-- VERIFICAR QUE EL SISTEMA DE TRACKING ESTÁ FUNCIONANDO
-- =====================================================

-- 1. Ver las últimas transiciones registradas
SELECT 
  fecha_transicion,
  cancha_nombre,
  accion,
  estado_anterior,
  estado_nuevo,
  empresa_anterior,
  empresa_nueva,
  usuario_nombre,
  observaciones
FROM vista_transiciones_completa
ORDER BY fecha_transicion DESC
LIMIT 10;

-- 2. Ver timeline completo de la cancha ME_S3_TEST_FECHAS
SELECT 
  fecha_transicion,
  accion,
  estado_anterior,
  estado_nuevo,
  empresa_anterior,
  empresa_nueva,
  observaciones
FROM vista_transiciones_completa
WHERE cancha_nombre = 'ME_S3_TEST_FECHAS'
ORDER BY fecha_transicion ASC;

-- 3. Verificar que cada acción tenga su fecha
-- Deberías ver transiciones para:
-- - crear_cancha (cuando se creó)
-- - enviar_besalco (cuando se envió a Besalco)
-- - tomar_trabajo (cuando Besalco aceptó)
-- Y así sucesivamente...

-- 4. Ver resumen de acciones por tipo
SELECT 
  accion,
  COUNT(*) as cantidad,
  MIN(fecha_transicion) as primera_vez,
  MAX(fecha_transicion) as ultima_vez
FROM vista_transiciones_completa
GROUP BY accion
ORDER BY ultima_vez DESC;
