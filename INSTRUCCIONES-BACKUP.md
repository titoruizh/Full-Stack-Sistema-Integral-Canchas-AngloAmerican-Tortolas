# =====================================================
# SCRIPT PARA EXTRAER DATOS DE SUPABASE
# =====================================================

## INSTRUCCIONES:
## 1. Ve a tu Supabase Dashboard
## 2. SQL Editor → Nueva consulta
## 3. Ejecuta CADA COMANDO por separado
## 4. Copia los resultados y pégalos en un archivo

## =====================================================
## COMANDOS PARA EXTRAER DATOS:
## =====================================================

## 1. EXTRAER EMPRESAS:
```sql
SELECT 'INSERT INTO empresas (id, nombre, created_at) VALUES (' 
    || id || ', ''' || nombre || ''', ''' || created_at || ''');'
FROM empresas ORDER BY id;
```

## 2. EXTRAER ESTADOS_CANCHA:
```sql
SELECT 'INSERT INTO estados_cancha (id, nombre, descripcion, created_at) VALUES (' 
    || id || ', ''' || nombre || ''', ''' 
    || COALESCE(descripcion, '') || ''', ''' || created_at || ''');'
FROM estados_cancha ORDER BY id;
```

## 3. EXTRAER CONTADOR_INFORMES:
```sql
SELECT 'INSERT INTO contador_informes (id, ultimo_numero, created_at, updated_at) VALUES (' 
    || id || ', ' || ultimo_numero || ', ''' || created_at || ''', ''' || updated_at || ''');'
FROM contador_informes ORDER BY id;
```

## 4. EXTRAER CANCHAS:
```sql
SELECT 'INSERT INTO canchas (id, nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, created_at, updated_at, numero_informe) VALUES (' 
    || id || ', ''' || replace(nombre, '''', '''''') || ''', ''' || muro || ''', ''' || sector || ''', ''' 
    || COALESCE(replace(nombre_detalle, '''', ''''''), '') || ''', ' || estado_actual_id || ', ' || empresa_actual_id 
    || ', ' || created_by || ', ''' || created_at || ''', ''' || updated_at || ''', ' 
    || COALESCE(numero_informe::text, 'NULL') || ');'
FROM canchas ORDER BY id;
```

## 5. EXTRAER HISTORIAL_CANCHAS:
```sql
SELECT 'INSERT INTO historial_canchas (id, cancha_id, estado_anterior_id, estado_nuevo_id, empresa_anterior_id, empresa_nueva_id, accion, observaciones, created_by, created_at) VALUES (' 
    || id || ', ' || cancha_id || ', ' || COALESCE(estado_anterior_id::text, 'NULL') 
    || ', ' || estado_nuevo_id || ', ' || COALESCE(empresa_anterior_id::text, 'NULL') 
    || ', ' || empresa_nueva_id || ', ''' || replace(accion, '''', '''''') || ''', ''' 
    || COALESCE(replace(observaciones, '''', ''''''), '') || ''', ' || created_by || ', ''' || created_at || ''');'
FROM historial_canchas ORDER BY id;
```

## =====================================================
## COMANDO PARA VER ESTRUCTURA DE TABLAS:
## =====================================================

```sql
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('empresas', 'estados_cancha', 'canchas', 'historial_canchas', 'contador_informes')
ORDER BY table_name, ordinal_position;
```

## =====================================================
## PASOS PARA HACER EL BACKUP COMPLETO:
## =====================================================

1. **Ejecuta cada comando SQL arriba en Supabase SQL Editor**
2. **Copia cada resultado en un archivo: backup-datos.sql**
3. **Guarda también el archivo backup-supabase.sql (estructura)**
4. **Para restaurar: ejecuta primero backup-supabase.sql, luego backup-datos.sql**

## =====================================================
## VERIFICAR QUE TODO ESTÉ BIEN:
## =====================================================

```sql
-- Contar registros en cada tabla
SELECT 'empresas' as tabla, COUNT(*) as registros FROM empresas
UNION ALL
SELECT 'estados_cancha', COUNT(*) FROM estados_cancha
UNION ALL
SELECT 'canchas', COUNT(*) FROM canchas
UNION ALL
SELECT 'historial_canchas', COUNT(*) FROM historial_canchas
UNION ALL
SELECT 'contador_informes', COUNT(*) FROM contador_informes;
```