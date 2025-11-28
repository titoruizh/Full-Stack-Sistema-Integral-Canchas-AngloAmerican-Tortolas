-- =====================================================
-- ELIMINAR ESTADOS DEPRECADOS 3 Y 5 CORRECTAMENTE
-- =====================================================

-- PASO 1: Verificar si hay canchas usando estados 3 o 5
SELECT id, nombre, estado_actual_id 
FROM canchas 
WHERE estado_actual_id IN (3, 5);

-- PASO 2: Corregir canchas que usan estado 3 (cambiar a 2)
UPDATE canchas 
SET estado_actual_id = 2 
WHERE estado_actual_id = 3;

-- PASO 3: Corregir canchas que usan estado 5 (cambiar a 8)
UPDATE canchas 
SET estado_actual_id = 8 
WHERE estado_actual_id = 5;

-- PASO 4: Verificar que no haya transiciones usando estados 3 o 5
SELECT COUNT(*) as transiciones_con_estado_3 
FROM transiciones_estado 
WHERE estado_anterior_id = 3 OR estado_nuevo_id = 3;

SELECT COUNT(*) as transiciones_con_estado_5 
FROM transiciones_estado 
WHERE estado_anterior_id = 5 OR estado_nuevo_id = 5;

-- PASO 5: Corregir transiciones que apuntan a estado 3
UPDATE transiciones_estado 
SET estado_anterior_id = 2 
WHERE estado_anterior_id = 3;

UPDATE transiciones_estado 
SET estado_nuevo_id = 2 
WHERE estado_nuevo_id = 3;

-- PASO 6: Corregir transiciones que apuntan a estado 5
UPDATE transiciones_estado 
SET estado_anterior_id = 8 
WHERE estado_anterior_id = 5;

UPDATE transiciones_estado 
SET estado_nuevo_id = 8 
WHERE estado_nuevo_id = 5;

-- PASO 7: Ahora sí, eliminar los estados deprecados
DELETE FROM estados_cancha WHERE id = 3;
DELETE FROM estados_cancha WHERE id = 5;

-- PASO 8: Verificar que solo queden los estados correctos
SELECT * FROM estados_cancha ORDER BY id;

-- Deberías ver solo: 1, 2, 4, 6, 7, 8
