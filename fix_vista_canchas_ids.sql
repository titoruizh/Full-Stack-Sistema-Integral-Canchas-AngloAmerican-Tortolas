-- Actualizar vista_canchas_completa para incluir los IDs de estado y empresa
-- Esto es necesario para que el mapa pueda colorear los polígonos según el estado

DROP VIEW IF EXISTS vista_canchas_completa;

CREATE VIEW vista_canchas_completa AS
SELECT 
    c.id,
    c.nombre,
    c.muro,
    c.sector,
    c.nombre_detalle,
    c.estado_actual_id,           -- ✅ AGREGADO: ID del estado actual
    ec.nombre AS estado_actual,
    c.empresa_actual_id,          -- ✅ AGREGADO: ID de la empresa actual
    emp.nombre AS empresa_actual,
    c.created_by,                 -- ✅ AGREGADO: ID del creador
    created_emp.nombre AS creada_por,
    c.created_at,
    c.updated_at,
    c.numero_informe,
    c.poligono_coordenadas
FROM canchas c
LEFT JOIN estados_cancha ec ON c.estado_actual_id = ec.id
LEFT JOIN empresas emp ON c.empresa_actual_id = emp.id
LEFT JOIN empresas created_emp ON c.created_by = created_emp.id;

-- Verificar que la vista incluye los nuevos campos
SELECT 
    id,
    nombre,
    estado_actual_id,
    estado_actual,
    empresa_actual_id,
    empresa_actual
FROM vista_canchas_completa
LIMIT 5;
