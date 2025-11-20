-- =====================================================
-- SCRIPT DE PRUEBAS PARA SISTEMA DE USUARIOS Y ROLES
-- Ejecutar después de usuarios_roles_setup.sql
-- =====================================================

-- 1. Verificar estructura de tablas creadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('usuarios', 'roles') 
AND schemaname = 'public';

-- 2. Verificar roles creados por empresa
SELECT 
    e.nombre as empresa,
    r.nombre as rol,
    r.descripcion,
    COUNT(u.id) as usuarios_asignados
FROM public.empresas e
LEFT JOIN public.roles r ON e.id = r.empresa_id
LEFT JOIN public.usuarios u ON r.id = u.rol_id AND u.activo = true
GROUP BY e.id, e.nombre, r.id, r.nombre, r.descripcion
ORDER BY e.nombre, r.nombre;

-- 3. Verificar usuarios creados con información completa
SELECT 
    u.id,
    u.nombre_completo,
    u.email,
    e.nombre as empresa,
    r.nombre as rol,
    u.activo,
    u.created_at
FROM public.usuarios u
JOIN public.empresas e ON u.empresa_id = e.id
JOIN public.roles r ON u.rol_id = r.id
ORDER BY e.nombre, r.nombre, u.nombre_completo;

-- 4. Probar la vista de usuarios completa
SELECT * FROM public.vista_usuarios_completa
ORDER BY empresa_nombre, rol_nombre, nombre_completo;

-- 5. Verificar usuarios por empresa específica (ejemplo: AngloAmerican)
SELECT 
    nombre_completo,
    rol_nombre,
    email
FROM public.vista_usuarios_completa
WHERE empresa_id = 1;

-- 6. Probar autenticación (simulación)
SELECT 
    u.id,
    u.nombre_completo,
    e.nombre as empresa,
    r.nombre as rol
FROM public.usuarios u
JOIN public.empresas e ON u.empresa_id = e.id
JOIN public.roles r ON u.rol_id = r.id
WHERE u.nombre_completo = 'Juan Pérez González' 
AND u.password_hash = '123'
AND u.activo = true;

-- 7. Verificar usuarios por rol específico en AngloAmerican
-- Ingeniero QA/QC (para variable {{NOMBRE_AAQAQC}})
SELECT 
    u.nombre_completo
FROM public.usuarios u
JOIN public.roles r ON u.rol_id = r.id
WHERE r.nombre = 'Ingeniero QA/QC' 
AND u.empresa_id = 1
AND u.activo = true
LIMIT 1;

-- Jefe de Operaciones (para variable {{NOMBRE_AAJO}})
SELECT 
    u.nombre_completo
FROM public.usuarios u
JOIN public.roles r ON u.rol_id = r.id
WHERE r.nombre = 'Jefe de Operaciones' 
AND u.empresa_id = 1
AND u.activo = true
LIMIT 1;

-- 8. Verificar índices creados
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('usuarios', 'roles')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 9. Verificar políticas de seguridad (RLS)
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('usuarios', 'roles')
AND schemaname = 'public';

-- 10. Verificar triggers
SELECT 
    trigger_name,
    table_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE table_name IN ('usuarios', 'roles')
AND table_schema = 'public';

-- 11. Estadísticas finales
SELECT 
    'Empresas' as tipo,
    COUNT(*) as cantidad
FROM public.empresas
UNION ALL
SELECT 
    'Roles' as tipo,
    COUNT(*) as cantidad
FROM public.roles
UNION ALL
SELECT 
    'Usuarios Activos' as tipo,
    COUNT(*) as cantidad
FROM public.usuarios
WHERE activo = true
UNION ALL
SELECT 
    'Usuarios Totales' as tipo,
    COUNT(*) as cantidad
FROM public.usuarios;

-- 12. Verificar integridad referencial
-- Usuarios sin empresa válida
SELECT COUNT(*) as usuarios_sin_empresa
FROM public.usuarios u
LEFT JOIN public.empresas e ON u.empresa_id = e.id
WHERE e.id IS NULL;

-- Usuarios sin rol válido
SELECT COUNT(*) as usuarios_sin_rol
FROM public.usuarios u
LEFT JOIN public.roles r ON u.rol_id = r.id
WHERE r.id IS NULL;

-- Roles sin empresa válida
SELECT COUNT(*) as roles_sin_empresa
FROM public.roles r
LEFT JOIN public.empresas e ON r.empresa_id = e.id
WHERE e.id IS NULL;