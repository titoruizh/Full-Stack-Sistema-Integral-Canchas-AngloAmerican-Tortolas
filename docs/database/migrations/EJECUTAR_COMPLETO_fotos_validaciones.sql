-- =====================================================
-- MIGRACIÓN COMPLETA: Sistema de Fotos para Validaciones
-- =====================================================
-- Ejecutar TODO este archivo de una sola vez en Supabase SQL Editor
-- Fecha: 2025-12-22
-- =====================================================

-- PASO 1: Crear tabla validaciones_fotos
-- =====================================================

CREATE TABLE IF NOT EXISTS validaciones_fotos (
    id BIGSERIAL PRIMARY KEY,
    validacion_id INTEGER NOT NULL REFERENCES validaciones(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_bytes INTEGER,
    descripcion TEXT,
    orden INTEGER DEFAULT 1,
    empresa_id INTEGER REFERENCES empresas(id),
    cancha_id INTEGER REFERENCES canchas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_validacion_orden UNIQUE (validacion_id, orden),
    CONSTRAINT check_orden_positivo CHECK (orden > 0 AND orden <= 5)
);

-- PASO 2: Crear índices
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_validacion ON validaciones_fotos(validacion_id);
CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_cancha ON validaciones_fotos(cancha_id);
CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_empresa ON validaciones_fotos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_validaciones_fotos_created ON validaciones_fotos(created_at DESC);

-- PASO 3: Trigger para updated_at
-- =====================================================

CREATE TRIGGER update_validaciones_fotos_updated_at
    BEFORE UPDATE ON validaciones_fotos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- PASO 4: RLS Policies
-- =====================================================

ALTER TABLE validaciones_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de fotos de validaciones" ON validaciones_fotos FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de fotos" ON validaciones_fotos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización de fotos" ON validaciones_fotos FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación de fotos" ON validaciones_fotos FOR DELETE USING (true);

-- PASO 5: Vista para reportes
-- =====================================================

CREATE OR REPLACE VIEW vista_fotos_reporte AS
SELECT 
    c.id as cancha_id,
    c.nombre as cancha_nombre,
    c.muro,
    c.sector,
    c.nombre_detalle,
    c.numero_informe,
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    v.id as validacion_id,
    v.tipo_validacion,
    v.resultado,
    v.observaciones,
    v.mediciones,
    v.created_at as fecha_validacion,
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

-- PASO 6: Vista resumen por cancha
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

-- PASO 7: Función auxiliar
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

-- PASO 8: Configurar Supabase Storage
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'validaciones-fotos',
    'validaciones-fotos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- PASO 9: Políticas de Storage
-- =====================================================

CREATE POLICY "Acceso público a fotos de validaciones" ON storage.objects FOR SELECT
USING (bucket_id = 'validaciones-fotos');

CREATE POLICY "Subida autenticada de fotos" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'validaciones-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Actualización autenticada de fotos" ON storage.objects FOR UPDATE
USING (bucket_id = 'validaciones-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Eliminación autenticada de fotos" ON storage.objects FOR DELETE
USING (bucket_id = 'validaciones-fotos' AND auth.role() = 'authenticated');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT '✅ Migración completada exitosamente' as status;
SELECT 'Tabla validaciones_fotos creada' as paso_1, COUNT(*) as columnas FROM information_schema.columns WHERE table_name = 'validaciones_fotos';
SELECT 'Bucket validaciones-fotos creado' as paso_2, public FROM storage.buckets WHERE id = 'validaciones-fotos';
SELECT 'Vistas creadas' as paso_3, COUNT(*) as total FROM information_schema.views WHERE table_name IN ('vista_fotos_reporte', 'vista_resumen_fotos_cancha');
