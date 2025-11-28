# Sistema de Tracking de Fechas - Ciclo Completo de Cancha

## 📋 Resumen

Sistema implementado para registrar **cada acción y transición de estado** con fecha y hora exacta, proporcionando un historial completo auditable del ciclo de vida de una cancha.

## 🗄️ Estructura de Base de Datos

### Tabla: `transiciones_estado`

Registra **cada cambio de estado** de una cancha con timestamp exacto.

```sql
CREATE TABLE transiciones_estado (
  id BIGSERIAL PRIMARY KEY,
  cancha_id BIGINT NOT NULL,
  estado_anterior_id INT,
  estado_nuevo_id INT NOT NULL,
  empresa_anterior_id INT,
  empresa_nueva_id INT,
  accion VARCHAR(100) NOT NULL,
  observaciones TEXT,
  usuario_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos clave:**
- `created_at`: **Fecha y hora exacta** de la transición
- `accion`: Tipo de acción ejecutada
- `usuario_id`: Usuario que ejecutó la acción (cuando aplica)

### Vista: `vista_transiciones_completa`

Proporciona información completa con nombres legibles:

```sql
SELECT * FROM vista_transiciones_completa WHERE cancha_id = 31;
```

Retorna:
- Nombre de cancha
- Estado anterior/nuevo (nombre, no ID)
- Empresa anterior/nueva (nombre, no ID)
- Nombre del usuario
- Fecha de transición
- Observaciones

## 📅 Workflow Completo con Fechas

### 1️⃣ **Creación** (AngloAmerican)
```
Acción: crear_cancha / crear_cancha_con_poligono
Estado: null → Creada (1)
Empresa: null → AngloAmerican (1)
Fecha: created_at en canchas + transicion_estado
```

### 2️⃣ **Envío a Besalco** (AngloAmerican)
```
Acción: enviar_besalco
Estado: Creada (1) → En Espera (7)
Empresa: AngloAmerican (1) → Besalco (2)
Fecha: transicion_estado.created_at
```

### 3️⃣ **Tomar Trabajo** (Besalco)
```
Acción: tomar_trabajo
Estado: En Espera (7) → En Proceso (3)
Empresa: Besalco (2) → Besalco (2) [sin cambio]
Fecha: transicion_estado.created_at
```

### 4️⃣A **Finalizar Trabajo** (Besalco → Linkapsis)
```
Acción: finalizar_besalco
Estado: En Proceso (3) → En Espera (7)
Empresa: Besalco (2) → Linkapsis (3)
Fecha: transicion_estado.created_at
También: validacion con tipo_validacion='trabajo_maquinaria'
```

### 4️⃣B **Rechazar Trabajo** (Besalco → AngloAmerican)
```
Acción: rechazar_besalco
Estado: En Proceso (3) → Rechazada, en Espera (8)
Empresa: Besalco (2) → AngloAmerican (1)
Fecha: transicion_estado.created_at
También: validacion con resultado='rechazada'
```

### 5️⃣A **Validar Espesores** (Linkapsis → LlayLlay)
```
Acción: validar_linkapsis
Estado: En Espera (7) → En Espera (7)
Empresa: Linkapsis (3) → LlayLlay (4)
Fecha: transicion_estado.created_at
También: validacion con tipo_validacion='espesores', mediciones
```

### 5️⃣B **Rechazar Espesores** (Linkapsis → Besalco)
```
Acción: rechazar_linkapsis
Estado: En Espera (7) → Rechazada, en Espera (8)
Empresa: Linkapsis (3) → Besalco (2)
Fecha: transicion_estado.created_at
También: validacion con resultado='rechazada'
```

### 6️⃣A **Validar Densidad** (LlayLlay → AngloAmerican)
```
Acción: validar_llay_llay
Estado: En Espera (7) → En Espera (7)
Empresa: LlayLlay (4) → AngloAmerican (1)
Fecha: transicion_estado.created_at
También: validacion con tipo_validacion='densidad', mediciones
```

### 6️⃣B **Rechazar Densidad** (LlayLlay → Besalco)
```
Acción: rechazar_llay_llay
Estado: En Espera (7) → Rechazada, en Espera (8)
Empresa: LlayLlay (4) → Besalco (2)
Fecha: transicion_estado.created_at
También: validacion con resultado='rechazada'
```

### 7️⃣ **Cerrar Cancha** (AngloAmerican)
```
Acción: cerrar_cancha
Estado: En Espera (7) → Cerrada (6)
Empresa: AngloAmerican (1) → AngloAmerican (1)
Fecha: transicion_estado.created_at
```

## 🔧 Instalación

### Paso 1: Verificar/Crear Tabla de Estados

```sql
-- Ejecutar en Supabase SQL Editor
\i verificar_estados_cancha.sql
```

### Paso 2: Crear Tabla de Transiciones

```sql
-- Ejecutar en Supabase SQL Editor
\i crear_tabla_transiciones.sql
```

### Paso 3: Verificar RLS (Row Level Security)

```sql
-- Habilitar políticas para lectura pública
ALTER TABLE transiciones_estado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de transiciones" ON transiciones_estado
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de transiciones" ON transiciones_estado
  FOR INSERT WITH CHECK (true);
```

## 📡 API Endpoints

### Obtener Timeline Completo

```typescript
GET /api/canchas/[id]/timeline

Response:
{
  "transiciones": [
    {
      "id": 1,
      "cancha_nombre": "MP_S1_TEST3123",
      "estado_anterior": null,
      "estado_nuevo": "Creada",
      "empresa_anterior": null,
      "empresa_nueva": "AngloAmerican",
      "accion": "crear_cancha",
      "observaciones": "Cancha creada: MP_S1_TEST3123",
      "usuario_nombre": null,
      "fecha_transicion": "2025-11-25T16:12:58.851593Z"
    },
    {
      "id": 2,
      "estado_anterior": "Creada",
      "estado_nuevo": "En Espera",
      "empresa_anterior": "AngloAmerican",
      "empresa_nueva": "Besalco",
      "accion": "enviar_besalco",
      "fecha_transicion": "2025-11-25T16:13:00.123456Z"
    },
    // ... más transiciones
  ],
  "validaciones": [
    // Validaciones técnicas con mediciones
  ]
}
```

## 📊 Queries Útiles

### Timeline Completo de una Cancha

```sql
SELECT 
  fecha_transicion,
  accion,
  estado_anterior,
  estado_nuevo,
  empresa_anterior,
  empresa_nueva,
  usuario_nombre,
  observaciones
FROM vista_transiciones_completa
WHERE cancha_id = 31
ORDER BY fecha_transicion ASC;
```

### Duración en Cada Estado

```sql
WITH transiciones_ordenadas AS (
  SELECT 
    cancha_id,
    estado_nuevo,
    empresa_nueva,
    created_at,
    LEAD(created_at) OVER (PARTITION BY cancha_id ORDER BY created_at) AS proxima_transicion
  FROM transiciones_estado
  WHERE cancha_id = 31
)
SELECT 
  estado_nuevo,
  empresa_nueva,
  created_at AS inicio,
  proxima_transicion AS fin,
  AGE(COALESCE(proxima_transicion, NOW()), created_at) AS duracion
FROM transiciones_ordenadas
ORDER BY created_at;
```

### Canchas por Tiempo de Procesamiento

```sql
SELECT 
  c.id,
  c.nombre,
  MIN(t.created_at) AS fecha_creacion,
  MAX(t.created_at) AS ultima_transicion,
  AGE(MAX(t.created_at), MIN(t.created_at)) AS tiempo_total
FROM canchas c
JOIN transiciones_estado t ON c.id = t.cancha_id
GROUP BY c.id, c.nombre
ORDER BY tiempo_total DESC;
```

## 🎯 Verificación

### Comprobar que Todas las Acciones se Registran

```sql
-- Después de ejecutar cualquier acción, verificar:
SELECT * FROM vista_transiciones_completa 
WHERE cancha_id = [ID_CANCHA] 
ORDER BY fecha_transicion DESC 
LIMIT 1;
```

### Auditoría Completa

```sql
-- Ver todas las transiciones del último día
SELECT 
  cancha_nombre,
  accion,
  estado_nuevo,
  empresa_nueva,
  usuario_nombre,
  fecha_transicion
FROM vista_transiciones_completa
WHERE fecha_transicion > NOW() - INTERVAL '1 day'
ORDER BY fecha_transicion DESC;
```

## ✅ Beneficios del Sistema

1. **Auditoría Completa**: Cada acción queda registrada con timestamp exacto
2. **Trazabilidad**: Saber exactamente quién hizo qué y cuándo
3. **Métricas**: Calcular tiempos de proceso, cuellos de botella, eficiencia
4. **Debugging**: Rastrear problemas en el workflow
5. **Reportes**: Generar informes de rendimiento por empresa/usuario/período
6. **Compliance**: Cumplir requisitos de auditoría y documentación

## 🚀 Próximos Pasos (Opcional)

1. **UI Timeline**: Crear componente visual tipo línea de tiempo
2. **Estadísticas**: Dashboard con métricas de tiempo promedio
3. **Alertas**: Notificar si una cancha lleva demasiado tiempo en un estado
4. **Export**: Exportar timeline a PDF para informes
5. **Filtros**: Buscar canchas por rango de fechas, empresa, usuario
