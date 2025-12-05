# 📚 Índice de Archivos SQL del Proyecto

## Archivos de Producción

### ⭐ SISTEMA_PKS_GEORREFERENCIADOS.sql (18.79 KB)
**Propósito**: Migración completa del sistema de georreferenciación de PKs  
**Contenido**:
- Tabla `pks_maestro` con 138 PKs (Principal: 73, Este: 29, Oeste: 36)
- Función `utm_to_wgs84()` para conversión de coordenadas
- Función `normalizar_pk()` para formatos irregulares
- Vista `vista_revanchas_georreferenciadas` (JOIN con coordenadas)
- Vista `vista_ultimas_revanchas_geo` (solo mediciones recientes)
- Vista `vista_resumen_revanchas_geo` (estadísticas por muro)
- Queries de verificación comentadas

**Cuándo usar**: Aplicar en Supabase para configurar todo el sistema de PKs georreferenciados

---

### 🏗️ migracion_revanchas_COMPLETA_FINAL.sql (18.7 KB)
**Propósito**: Migración completa del sistema de revanchas (base de datos)  
**Contenido**:
- Tabla `revanchas_archivos` (almacena archivos Excel subidos)
- Tabla `revanchas_mediciones` (mediciones individuales por PK)
- Triggers para validaciones y timestamps
- RLS policies para seguridad
- Índices para optimización

**Cuándo usar**: Primera vez configurando el sistema de revanchas en Supabase

---

### 📋 queries_revanchas_utiles.sql (14.1 KB)
**Propósito**: Colección de queries útiles para análisis y mantenimiento  
**Contenido**:
- Consultas de estadísticas por muro
- Análisis de alertas (rojas/amarillas)
- Comparación entre fechas
- Detección de anomalías
- Queries de exportación

**Cuándo usar**: Para análisis de datos, reportes, debugging

---

## Archivos de Respaldo

### 💾 backup-supabase.sql (6.85 KB)
**Propósito**: Backup de estructura de base de datos  
**Contenido**: Respaldo de esquema anterior  
**Estado**: Archivo histórico de respaldo

---

### 🔧 supabase_setup.sql (9 KB)
**Propósito**: Configuración inicial de Supabase  
**Contenido**: Setup básico de tablas y permisos  
**Estado**: Archivo de setup inicial

---

### 🔍 diagnostico_completo_database.sql (7.85 KB)
**Propósito**: Diagnóstico completo de la base de datos  
**Contenido**:
- Verificación de todas las tablas
- Conteo de registros
- Estado de índices
- Validación de integridad referencial

**Cuándo usar**: Cuando necesites verificar el estado general de la BD

---

## ⚠️ Archivos Eliminados (Consolidados)

Los siguientes archivos fueron eliminados porque se consolidaron en `SISTEMA_PKS_GEORREFERENCIADOS.sql`:

- ~~`migracion_pks_georreferenciados.sql`~~ → Tabla pks_maestro + inserts
- ~~`funcion_normalizar_pk.sql`~~ → Función normalizar_pk()
- ~~`vista_revanchas_georreferenciadas.sql`~~ → 3 vistas georreferenciadas
- ~~`test_vista_rapido.sql`~~ → Pruebas de debugging
- ~~`test_formato_pks.sql`~~ → Pruebas de normalización
- ~~`diagnostico_revanchas_geo.sql`~~ → Debugging de JOIN
- ~~`debug_revanchas_faltantes.sql`~~ → Debugging de mediciones
- ~~`debug_pks_faltantes.sql`~~ → Debugging de coincidencias
- ~~`fix_rls_revanchas_geo.sql`~~ → Políticas RLS (no necesarias)

---

## 📖 Documentación

### 📘 PKS_GEORREFERENCIADOS_README.md
Documentación completa del sistema de PKs georreferenciados:
- Descripción general y objetivos
- Datos del sistema (138 PKs, 3 muros)
- Componentes de BD (tablas, funciones, vistas)
- Componentes frontend (APIs, visualización)
- Proceso de implementación y solución de problemas
- Queries útiles
- Instrucciones de mantenimiento

---

## 🚀 Orden de Aplicación (Setup Inicial)

Si necesitas configurar el sistema desde cero:

1. **supabase_setup.sql** - Configuración base de Supabase
2. **migracion_revanchas_COMPLETA_FINAL.sql** - Sistema de revanchas
3. **SISTEMA_PKS_GEORREFERENCIADOS.sql** - Sistema de georreferenciación
4. Subir archivos Excel de revanchas vía dashboard
5. Verificar con **diagnostico_completo_database.sql**

---

## 📊 Resumen

| Archivo | Tipo | Tamaño | Estado |
|---------|------|--------|--------|
| SISTEMA_PKS_GEORREFERENCIADOS.sql | Producción | 18.79 KB | ✅ Activo |
| migracion_revanchas_COMPLETA_FINAL.sql | Producción | 18.7 KB | ✅ Activo |
| queries_revanchas_utiles.sql | Utilidad | 14.1 KB | ✅ Activo |
| diagnostico_completo_database.sql | Diagnóstico | 7.85 KB | ✅ Activo |
| supabase_setup.sql | Setup | 9 KB | ✅ Activo |
| backup-supabase.sql | Respaldo | 6.85 KB | 📦 Histórico |
| PKS_GEORREFERENCIADOS_README.md | Docs | - | 📖 Documentación |

**Total archivos SQL**: 6  
**Total archivos Markdown**: 1  
**Estado del proyecto**: ✅ Organizado y documentado
