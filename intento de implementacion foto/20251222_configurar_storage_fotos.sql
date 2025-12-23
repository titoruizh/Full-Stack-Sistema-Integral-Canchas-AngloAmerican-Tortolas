-- =====================================================
-- CONFIGURACIÓN: Supabase Storage para Fotos
-- =====================================================
-- Fecha: 2025-12-22
-- Descripción: Configuración del bucket de Storage para fotos de validaciones
-- IMPORTANTE: Ejecutar esto en el SQL Editor de Supabase DESPUÉS de la migración
-- =====================================================

-- =====================================================
-- PASO 1: Crear bucket público para fotos
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'validaciones-fotos',
    'validaciones-fotos',
    true, -- Público para acceso directo en reportes PDF
    5242880, -- 5MB máximo por archivo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- =====================================================
-- PASO 2: Políticas de Storage - Lectura Pública
-- =====================================================

-- Permitir lectura pública de todas las fotos
CREATE POLICY "Acceso público a fotos de validaciones"
ON storage.objects FOR SELECT
USING (bucket_id = 'validaciones-fotos');

-- =====================================================
-- PASO 3: Políticas de Storage - Subida Autenticada
-- =====================================================

-- Permitir subida de fotos a usuarios autenticados
CREATE POLICY "Subida autenticada de fotos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'validaciones-fotos' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- PASO 4: Políticas de Storage - Actualización
-- =====================================================

-- Permitir actualización de fotos (por si se necesita reemplazar)
CREATE POLICY "Actualización autenticada de fotos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'validaciones-fotos' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- PASO 5: Políticas de Storage - Eliminación
-- =====================================================

-- Permitir eliminación de fotos
CREATE POLICY "Eliminación autenticada de fotos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'validaciones-fotos' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- PASO 6: Verificación
-- =====================================================

-- Verificar que el bucket se creó correctamente
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'validaciones-fotos';

-- Verificar políticas de storage
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%fotos%';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
ESTRUCTURA DE CARPETAS EN EL BUCKET:

validaciones-fotos/
├── besalco/
│   ├── cancha-227/
│   │   ├── validacion-1/
│   │   │   ├── foto-1-20251222-153045.jpg
│   │   │   ├── foto-2-20251222-153102.jpg
│   │   │   └── foto-3-20251222-153115.jpg
│   │   └── validacion-2/
│   │       └── foto-1-20251223-091234.jpg
│   └── cancha-228/
│       └── ...
├── linkapsis/
│   ├── cancha-227/
│   │   ├── validacion-3/
│   │   │   ├── foto-1-20251222-160000.jpg
│   │   │   └── foto-2-20251222-160015.jpg
│   │   └── ...
│   └── ...
└── llayllay/
    ├── cancha-227/
    │   ├── validacion-4/
    │   │   └── foto-1-20251222-170000.jpg
    │   └── ...
    └── ...

FORMATO DE NOMBRE DE ARCHIVO:
foto-{orden}-{timestamp}.{extension}

Ejemplo:
foto-1-20251222-153045.jpg
foto-2-20251222-153102.jpg

FORMATO DE RUTA COMPLETA:
{empresa}/cancha-{id}/validacion-{id}/foto-{orden}-{timestamp}.{ext}

Ejemplo:
besalco/cancha-227/validacion-1/foto-1-20251222-153045.jpg

URL PÚBLICA RESULTANTE:
https://chzlwqxjdcydnndrnfjk.supabase.co/storage/v1/object/public/validaciones-fotos/besalco/cancha-227/validacion-1/foto-1-20251222-153045.jpg
*/

-- =====================================================
-- FIN DE CONFIGURACIÓN
-- =====================================================

SELECT '✅ Configuración de Storage completada' as status;
