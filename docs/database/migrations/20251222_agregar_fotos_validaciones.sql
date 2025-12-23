-- =====================================================
-- MIGRACIÓN: Sistema de Fotos para Validaciones
-- =====================================================
-- Fecha: 2025-12-22
-- Descripción: Permite a cada empresa (Besalco, Linkapsis, LlayLlay)
--              subir fotos durante sus validaciones, manteniendo
--              trazabilidad completa para reportes PDF
-- =====================================================

-- =====================================================
-- PASO 1: Crear tabla validaciones_fotos
-- =====================================================

CREATE TABLE IF NOT EXISTS validaciones_fotos (
    id BIGSERIAL PRIMARY KEY,
    
    -- Relación con validación (trazabilidad)
    validacion_id INTEGER NOT NULL REFERENCES validaciones(id) ON DELETE CASCADE,
    
    -- Información de la foto en Supabase Storage
    storage_path TEXT NOT NULL, -- Ruta: empresa/cancha-X/validacion-Y/foto-Z.jpg
    storage_url TEXT NOT NULL, -- URL pública para acceso directo
    nombre_archivo VARCHAR(255) NOT NULL, -- Nombre original del archivo
    tipo_mime VARCHAR(100) NOT NULL, -- image/jpeg, image/png, image/webp
    tamano_bytes INTEGER, -- Tamaño del archivo en bytes
    
    -- Metadata adicional
    descripcion TEXT, -- Descripción opcional de la foto
    orden INTEGER DEFAULT 1, -- Orden de visualización (1, 2, 3, 4, 5)
    
    -- Trazabilidad (redundante pero útil para queries directas)
    empresa_id INTEGER REFERENCES empresas(id), -- Empresa que subió la foto
    cancha_id INTEGER REFERENCES canchas(id) ON DELETE CASCADE, -- Cancha relacionada
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_validacion_orden UNIQUE (validacion_id, orden),
    CONSTRAINT check_orden_positivo CHECK (orden > 0 AND orden <= 5)
);

-- =====================================================
-- PASO 2: Crear índices para optimizar consultas
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_validacion 
    ON validaciones_fotos(validacion_id);

CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_cancha 
    ON validaciones_fotos(cancha_id);

CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_empresa 
    ON validaciones_fotos(empresa_id);

CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_created 
    ON validaciones_fotos(created_at DESC);

-- =====================================================
-- PASO 3: Trigger para actualizar updated_at
-- =====================================================

CREATE TRIGGER update_validaciones_fotos_updated_at
    BEFORE UPDATE ON validaciones_fotos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PASO 4: Comentarios para documentación
-- =====================================================

COMMENT ON TABLE validaciones_fotos IS 
'Fotos subidas por empresas (Besalco, Linkapsis, LlayLlay) durante validaciones de canchas. Mantiene trazabilidad completa para reportes PDF.';

COMMENT ON COLUMN validaciones_fotos.storage_path IS 
'Ruta en Supabase Storage. Formato: {empresa}/cancha-{id}/validacion-{id}/foto-{orden}-{timestamp}.{ext}';

COMMENT ON COLUMN validaciones_fotos.storage_url IS 
'URL pública para acceso directo en reportes PDF y visualización';

COMMENT ON COLUMN validaciones_fotos.orden IS 
'Orden de visualización en reportes (1=primera, 2=segunda, etc.). Máximo 5 fotos por validación';

COMMENT ON COLUMN validaciones_fotos.empresa_id IS 
'Empresa que subió la foto (redundante con validacion.empresa_validadora_id pero útil para queries)';

COMMENT ON COLUMN validaciones_fotos.cancha_id IS 
'Cancha relacionada (redundante con validacion.cancha_id pero útil para queries directas)';

-- =====================================================
-- PASO 5: Políticas de Seguridad (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE validaciones_fotos ENABLE ROW LEVEL SECURITY;

-- Política de lectura: Todos pueden ver fotos
CREATE POLICY "Permitir lectura de fotos de validaciones" 
    ON validaciones_fotos
    FOR SELECT 
    USING (true);

-- Política de inserción: Todos los usuarios autenticados
CREATE POLICY "Permitir inserción de fotos" 
    ON validaciones_fotos
    FOR INSERT 
    WITH CHECK (true);

-- Política de actualización: Todos pueden actualizar
CREATE POLICY "Permitir actualización de fotos" 
    ON validaciones_fotos
    FOR UPDATE 
    USING (true);

-- Política de eliminación: Todos pueden eliminar
CREATE POLICY "Permitir eliminación de fotos" 
    ON validaciones_fotos
    FOR DELETE 
    USING (true);

-- =====================================================
-- PASO 6: Vista para reportes con fotos
-- =====================================================

CREATE OR REPLACE VIEW vista_fotos_reporte AS
SELECT 
    -- Información de la cancha
    c.id as cancha_id,
    c.nombre as cancha_nombre,
    c.muro,
    c.sector,
    c.nombre_detalle,
    c.numero_informe,
    
    -- Información de la empresa
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    
    -- Información de la validación
    v.id as validacion_id,
    v.tipo_validacion,
    v.resultado,
    v.observaciones,
    v.mediciones,
    v.created_at as fecha_validacion,
    
    -- Información de la foto
    vf.id as foto_id,
    vf.storage_url,
    vf.storage_path,
    vf.nombre_archivo,
    vf.tipo_mime,
    vf.tamano_bytes,
    vf.descripcion as foto_descripcion,
    vf.orden as foto_orden,
    vf.created_at as foto_created_at
    
FROM validaciones_fotos vf
JOIN validaciones v ON vf.validacion_id = v.id
JOIN canchas c ON vf.cancha_id = c.id
JOIN empresas e ON vf.empresa_id = e.id
ORDER BY c.id, e.id, v.created_at, vf.orden;

COMMENT ON VIEW vista_fotos_reporte IS 
'Vista completa para generar reportes PDF con todas las fotos organizadas por cancha, empresa y validación';

-- =====================================================
-- PASO 7: Vista de resumen de fotos por cancha
-- =====================================================

CREATE OR REPLACE VIEW vista_resumen_fotos_cancha AS
SELECT 
    c.id as cancha_id,
    c.nombre as cancha_nombre,
    c.numero_informe,
    COUNT(DISTINCT vf.id) as total_fotos,
    COUNT(DISTINCT CASE WHEN e.nombre = 'Besalco' THEN vf.id END) as fotos_besalco,
    COUNT(DISTINCT CASE WHEN e.nombre = 'Linkapsis' THEN vf.id END) as fotos_linkapsis,
    COUNT(DISTINCT CASE WHEN e.nombre = 'LlayLlay' THEN vf.id END) as fotos_llayllay,
    MAX(vf.created_at) as ultima_foto_subida
FROM canchas c
LEFT JOIN validaciones v ON c.id = v.cancha_id
LEFT JOIN validaciones_fotos vf ON v.id = vf.validacion_id
LEFT JOIN empresas e ON vf.empresa_id = e.id
GROUP BY c.id, c.nombre, c.numero_informe
ORDER BY c.id;

COMMENT ON VIEW vista_resumen_fotos_cancha IS 
'Resumen de fotos por cancha, mostrando cuántas fotos tiene cada empresa';

-- =====================================================
-- PASO 8: Función auxiliar para obtener fotos de una cancha
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_fotos_cancha(p_cancha_id INTEGER)
RETURNS TABLE (
    empresa_nombre VARCHAR(50),
    validacion_id INTEGER,
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    foto_url TEXT,
    foto_orden INTEGER,
    foto_descripcion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.nombre as empresa_nombre,
        v.id as validacion_id,
        v.created_at as fecha_validacion,
        vf.storage_url as foto_url,
        vf.orden as foto_orden,
        vf.descripcion as foto_descripcion
    FROM validaciones_fotos vf
    JOIN validaciones v ON vf.validacion_id = v.id
    JOIN empresas e ON vf.empresa_id = e.id
    WHERE vf.cancha_id = p_cancha_id
    ORDER BY e.id, v.created_at, vf.orden;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_fotos_cancha IS 
'Obtiene todas las fotos de una cancha organizadas por empresa, validación y orden';

-- =====================================================
-- PASO 9: Verificación de la migración
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    'Tabla validaciones_fotos creada' as status,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'validaciones_fotos';

-- Verificar índices
SELECT 
    'Índices creados' as status,
    COUNT(*) as total_indices
FROM pg_indexes
WHERE tablename = 'validaciones_fotos';

-- Verificar vistas
SELECT 
    'Vistas creadas' as status,
    COUNT(*) as total_vistas
FROM information_schema.views
WHERE table_name IN ('vista_fotos_reporte', 'vista_resumen_fotos_cancha');

-- =====================================================
-- PASO 10: Datos de ejemplo (OPCIONAL - para testing)
-- =====================================================

-- Descomentar para insertar datos de prueba
/*
-- Insertar una validación de ejemplo
INSERT INTO validaciones (cancha_id, empresa_validadora_id, tipo_validacion, resultado, observaciones)
VALUES (227, 2, 'trabajo', 'finalizada', 'Trabajo de maquinaria completado')
RETURNING id;

-- Insertar fotos de ejemplo (reemplazar validacion_id con el ID retornado arriba)
INSERT INTO validaciones_fotos (
    validacion_id, 
    storage_path, 
    storage_url, 
    nombre_archivo, 
    tipo_mime, 
    tamano_bytes,
    orden,
    empresa_id,
    cancha_id,
    descripcion
) VALUES 
(
    1, -- Reemplazar con ID de validación real
    'besalco/cancha-227/validacion-1/foto-1-20251222-163000.jpg',
    'https://chzlwqxjdcydnndrnfjk.supabase.co/storage/v1/object/public/validaciones-fotos/besalco/cancha-227/validacion-1/foto-1-20251222-163000.jpg',
    'trabajo_terminado.jpg',
    'image/jpeg',
    1024000,
    1,
    2,
    227,
    'Vista general del trabajo completado'
);
*/

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

SELECT '✅ Migración completada exitosamente' as status;
