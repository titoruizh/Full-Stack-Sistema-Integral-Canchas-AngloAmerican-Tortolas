-- Actualizar vista_canchas_completa para incluir poligono_coordenadas y numero_informe
DROP VIEW IF EXISTS vista_canchas_completa;

CREATE VIEW vista_canchas_completa AS
SELECT 
    c.id,
    c.nombre,
    c.muro,
    c.sector,
    c.nombre_detalle,
    ec.nombre AS estado_actual,
    emp.nombre AS empresa_actual,
    created_emp.nombre AS creada_por,
    c.created_at,
    c.updated_at,
    c.numero_informe,
    c.poligono_coordenadas
FROM canchas c
LEFT JOIN estados_cancha ec ON c.estado_actual_id = ec.id
LEFT JOIN empresas emp ON c.empresa_actual_id = emp.id
LEFT JOIN empresas created_emp ON c.created_by = created_emp.id;