-- =====================================================
-- TODAS LAS ACCIONES QUE SE REGISTRAN CON FECHA
-- =====================================================

-- Este query muestra TODAS las acciones posibles con ejemplos

-- ACCIONES IMPLEMENTADAS:
-- 1. crear_cancha / crear_cancha_con_poligono
-- 2. enviar_besalco
-- 3. tomar_trabajo (Besalco, Linkapsis, LlayLlay)
-- 4. rechazar_besalco
-- 5. finalizar_besalco
-- 6. validar_linkapsis
-- 7. rechazar_linkapsis
-- 8. validar_llay_llay
-- 9. rechazar_llay_llay
-- 10. cerrar_cancha

-- Ver todas las acciones registradas en el sistema
SELECT 
  accion,
  COUNT(*) as veces_ejecutada,
  MIN(fecha_transicion) as primera_vez,
  MAX(fecha_transicion) as ultima_vez
FROM vista_transiciones_completa
GROUP BY accion
ORDER BY accion;

-- Ver ejemplo completo CON RECHAZOS de una cancha
-- (reemplaza 'NOMBRE_CANCHA' con una cancha real que tenga rechazos)
SELECT 
  fecha_transicion,
  accion,
  estado_anterior,
  estado_nuevo,
  empresa_anterior,
  empresa_nueva,
  observaciones,
  CASE 
    WHEN accion LIKE '%rechazar%' THEN '❌ RECHAZO'
    WHEN accion LIKE '%validar%' THEN '✅ VALIDACIÓN'
    WHEN accion LIKE '%tomar%' THEN '🔨 TOMAR TRABAJO'
    WHEN accion LIKE '%finalizar%' THEN '✅ FINALIZAR'
    WHEN accion LIKE '%enviar%' THEN '📤 ENVIAR'
    WHEN accion LIKE '%crear%' THEN '🆕 CREAR'
    WHEN accion LIKE '%cerrar%' THEN '🔒 CERRAR'
    ELSE '📋 OTRA'
  END as tipo
FROM vista_transiciones_completa
WHERE cancha_nombre = 'NOMBRE_CANCHA'
ORDER BY fecha_transicion ASC;

-- Timeline COMPLETO con todos los escenarios posibles:
-- 
-- ESCENARIO 1: FLUJO EXITOSO (sin rechazos)
-- 1. crear_cancha → Creada
-- 2. enviar_besalco → En Espera (Besalco)
-- 3. tomar_trabajo → En Proceso (Besalco)
-- 4. finalizar_besalco → En Espera (Linkapsis)
-- 5. tomar_trabajo → En Proceso (Linkapsis)
-- 6. validar_linkapsis → En Espera (LlayLlay)
-- 7. tomar_trabajo → En Proceso (LlayLlay)
-- 8. validar_llay_llay → Validada (AngloAmerican)
-- 9. cerrar_cancha → Cerrada
--
-- ESCENARIO 2: CON RECHAZO POR BESALCO
-- 1. crear_cancha → Creada
-- 2. enviar_besalco → En Espera (Besalco)
-- 3. tomar_trabajo → En Proceso (Besalco)
-- 4. rechazar_besalco → Rechazada, en Espera (AngloAmerican) ❌
-- 5. enviar_besalco → En Espera (Besalco) [reenvío]
-- 6. tomar_trabajo → En Proceso (Besalco)
-- 7. finalizar_besalco → En Espera (Linkapsis)
-- ... continúa flujo normal
--
-- ESCENARIO 3: CON RECHAZO POR LINKAPSIS
-- ... flujo normal hasta Linkapsis
-- 5. tomar_trabajo → En Proceso (Linkapsis)
-- 6. rechazar_linkapsis → Rechazada, en Espera (Besalco) ❌
-- 7. tomar_trabajo → En Proceso (Besalco) [retrabajo]
-- 8. finalizar_besalco → En Espera (Linkapsis) [reenvío]
-- ... continúa flujo
--
-- ESCENARIO 4: CON RECHAZO POR LLAYLLAY
-- ... flujo normal hasta LlayLlay
-- 7. tomar_trabajo → En Proceso (LlayLlay)
-- 8. rechazar_llay_llay → Rechazada, en Espera (Besalco) ❌
-- 9. tomar_trabajo → En Proceso (Besalco) [retrabajo]
-- ... continúa flujo desde inicio validaciones

-- TODAS estas acciones tienen fecha_transicion automáticamente ✅
