-- =====================================================
-- LIMPIAR ESTADOS DEPRECADOS Y CORREGIR DATOS
-- =====================================================

-- PASO 1: Ver estados actuales
SELECT * FROM estados_cancha ORDER BY id;

-- PASO 2: Corregir canchas que usan estados deprecados
-- Cambiar estado 3 (Finalizada DEPRECADO) a estado 2 (En Proceso)
UPDATE canchas 
SET estado_actual_id = 2 
WHERE estado_actual_id = 3;

-- Cambiar estado 5 (Rechazada DEPRECADO) a estado 8 (Rechazada, en Espera)
UPDATE canchas 
SET estado_actual_id = 8 
WHERE estado_actual_id = 5;

-- PASO 3: Eliminar estados deprecados
DELETE FROM estados_cancha WHERE id IN (3, 5);

-- PASO 4: Verificar que solo queden los estados correctos
SELECT * FROM estados_cancha ORDER BY id;

-- Deberías ver solo estos:
-- 1 = Creada
-- 2 = En Proceso
-- 4 = Validada
-- 6 = Cerrada
-- 7 = En Espera
-- 8 = Rechazada, en Espera
