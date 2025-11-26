-- ================================================
-- CORRECCIÓN DE ESTADOS: Deprecar "Finalizada" (ID 3)
-- ================================================
-- El estado "Finalizada" no se usa en el nuevo flujo.
-- Solo necesitamos: Creada(1), Validada(4), Cerrada(6), En Espera(7), Rechazada en Espera(8)
-- Y necesitamos "En Proceso" que actualmente NO EXISTE con ID correcto

-- PASO 1: Verificar estado actual
SELECT id, nombre, descripcion 
FROM estados_cancha 
ORDER BY id;

-- PASO 2: Deprecar estado "Finalizada" (ID 3) renombrándolo
UPDATE estados_cancha 
SET 
    nombre = '[DEPRECADO] Finalizada',
    descripcion = 'Estado deprecado - No usar. Reemplazado por En Proceso con nuevo flujo'
WHERE id = 3;

-- PASO 3: Asegurar que "En Proceso" existe con ID 2
-- Si actualmente ID 2 es "En Proceso", no hacer nada
-- Si ID 2 es otro estado deprecado, actualizarlo

UPDATE estados_cancha 
SET 
    nombre = 'En Proceso',
    descripcion = 'Trabajo de maquinaria en proceso por empresa contratista'
WHERE id = 2;

-- PASO 4: Verificar el resultado
SELECT id, nombre, descripcion 
FROM estados_cancha 
ORDER BY id;

-- RESUMEN DE ESTADOS FINALES:
-- ID 1: Creada
-- ID 2: En Proceso (ACTIVO)
-- ID 3: [DEPRECADO] Finalizada (NO USAR)
-- ID 4: Validada
-- ID 5: [DEPRECADO] Rechazada (NO USAR)
-- ID 6: Cerrada
-- ID 7: En Espera
-- ID 8: Rechazada, en Espera
