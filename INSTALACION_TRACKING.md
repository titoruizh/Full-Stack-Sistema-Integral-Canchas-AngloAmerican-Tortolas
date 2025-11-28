# 🚀 INSTALACIÓN DEL SISTEMA DE TRACKING DE FECHAS

## ✅ ¿Qué se ha implementado?

### 1. **Nueva tabla de base de datos**: `transiciones_estado`
- Registra cada cambio de estado con fecha y hora exacta
- Incluye estado anterior/nuevo, empresa anterior/nueva, acción, observaciones, usuario
- Vista `vista_transiciones_completa` con nombres legibles

### 2. **Código actualizado en `src/lib/supabase.ts`**
- ✅ Nueva interfaz `TransicionEstado`
- ✅ Método privado `registrarTransicion()` para logging automático
- ✅ Todos los métodos actualizados:
  - `crearCancha()` - registra creación
  - `crearCanchaConPoligono()` - registra creación con polígono
  - `enviarABesalco()` - registra envío
  - `tomarTrabajo()` - registra cuando empresa toma trabajo
  - `rechazarBesalco()` - registra rechazo
  - `finalizarBesalco()` - registra finalización
  - `validarLinkapsis()` - registra validación/rechazo de espesores
  - `validarLlayLlay()` - registra validación/rechazo de densidad
  - `cerrarCancha()` - registra cierre
- ✅ Nuevo método `obtenerTransicionesCancha()` para consultar timeline

### 3. **Nuevo API endpoint**: `/api/canchas/[id]/timeline`
- Retorna historial completo de transiciones + validaciones
- GET request para consultar timeline de una cancha específica

### 4. **Archivos SQL creados**:
- `verificar_estados_cancha.sql` - Crear/verificar tabla de estados
- `crear_tabla_transiciones.sql` - Crear tabla de transiciones + vista

### 5. **Documentación completa**:
- `SISTEMA_TRACKING_FECHAS.md` - Guía completa del sistema

---

## 📋 PASOS PARA ACTIVAR EL SISTEMA

### PASO 1: Ejecutar SQL en Supabase

1. Abrir **Supabase Dashboard** → **SQL Editor**

2. **Verificar/Crear tabla de estados** (copiar y ejecutar):

```sql
-- ESTADOS_CANCHA
CREATE TABLE IF NOT EXISTS estados_cancha (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO estados_cancha (id, nombre, descripcion) VALUES
  (1, 'Creada', 'Cancha creada por AngloAmerican'),
  (2, 'En Proceso', 'Trabajo en proceso por empresa validadora'),
  (3, 'En Proceso', 'Trabajo en proceso (estado alternativo)'),
  (4, 'Validada', 'Cancha validada, lista para cerrar'),
  (6, 'Cerrada', 'Cancha cerrada - proceso completado'),
  (7, 'En Espera', 'Esperando asignación o validación'),
  (8, 'Rechazada, en Espera', 'Cancha rechazada, esperando corrección')
ON CONFLICT (id) DO NOTHING;

SELECT * FROM estados_cancha ORDER BY id;
```

3. **Crear tabla de transiciones** (copiar y ejecutar):

```sql
-- TABLA DE TRANSICIONES
CREATE TABLE IF NOT EXISTS transiciones_estado (
  id BIGSERIAL PRIMARY KEY,
  cancha_id BIGINT NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
  estado_anterior_id INT REFERENCES estados_cancha(id),
  estado_nuevo_id INT NOT NULL REFERENCES estados_cancha(id),
  empresa_anterior_id INT REFERENCES empresas(id),
  empresa_nueva_id INT REFERENCES empresas(id),
  accion VARCHAR(100) NOT NULL,
  observaciones TEXT,
  usuario_id INT REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transiciones_cancha_id ON transiciones_estado(cancha_id);
CREATE INDEX IF NOT EXISTS idx_transiciones_created_at ON transiciones_estado(created_at DESC);

COMMENT ON TABLE transiciones_estado IS 'Registra cada transición de estado de una cancha con timestamp exacto';
```

4. **Crear vista completa** (copiar y ejecutar):

```sql
-- VISTA TRANSICIONES COMPLETA
CREATE OR REPLACE VIEW vista_transiciones_completa AS
SELECT 
  t.id,
  t.cancha_id,
  c.nombre AS cancha_nombre,
  ea.nombre AS estado_anterior,
  en.nombre AS estado_nuevo,
  emp_ant.nombre AS empresa_anterior,
  emp_new.nombre AS empresa_nueva,
  t.accion,
  t.observaciones,
  u.nombre_completo AS usuario_nombre,
  t.created_at AS fecha_transicion
FROM transiciones_estado t
LEFT JOIN canchas c ON t.cancha_id = c.id
LEFT JOIN estados_cancha ea ON t.estado_anterior_id = ea.id
LEFT JOIN estados_cancha en ON t.estado_nuevo_id = en.id
LEFT JOIN empresas emp_ant ON t.empresa_anterior_id = emp_ant.id
LEFT JOIN empresas emp_new ON t.empresa_nueva_id = emp_new.id
LEFT JOIN usuarios u ON t.usuario_id = u.id
ORDER BY t.created_at DESC;
```

5. **Habilitar RLS (Row Level Security)** (copiar y ejecutar):

```sql
-- POLÍTICAS RLS
ALTER TABLE transiciones_estado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de transiciones" ON transiciones_estado
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de transiciones" ON transiciones_estado
  FOR INSERT WITH CHECK (true);
```

---

### PASO 2: Reiniciar aplicación Astro

```powershell
# Detener el servidor actual (Ctrl+C en la terminal)
# Luego reiniciar:
pnpm run dev
```

---

### PASO 3: Verificar funcionamiento

1. **Crear una nueva cancha** en la interfaz

2. **Ejecutar en Supabase SQL Editor**:

```sql
SELECT * FROM vista_transiciones_completa 
ORDER BY fecha_transicion DESC 
LIMIT 5;
```

3. **Debería ver la transición de creación** con:
   - `accion`: "crear_cancha" o "crear_cancha_con_poligono"
   - `estado_nuevo`: "Creada"
   - `empresa_nueva`: "AngloAmerican"
   - `fecha_transicion`: timestamp de hace unos segundos

4. **Probar el workflow completo**:
   - Enviar a Besalco
   - Tomar trabajo
   - Finalizar trabajo
   - Validar con Linkapsis
   - Validar con LlayLlay
   - Cerrar cancha

5. **Verificar timeline completo**:

```sql
SELECT 
  fecha_transicion,
  accion,
  estado_anterior,
  estado_nuevo,
  empresa_nueva,
  observaciones
FROM vista_transiciones_completa
WHERE cancha_nombre = 'NOMBRE_DE_TU_CANCHA'
ORDER BY fecha_transicion ASC;
```

Deberías ver **TODAS las transiciones** con sus fechas exactas.

---

## 🎯 ¿Qué hace este sistema?

### Antes (❌ Problema):
- Solo `created_at` y `updated_at` en tabla canchas
- No se sabía **cuándo** pasó de un estado a otro
- No se sabía **quién** hizo cada acción
- Pérdida de historial de fechas intermedias

### Ahora (✅ Solución):
- **Cada transición** de estado se registra con timestamp exacto
- **Historial completo**: saber cuándo se envió a Besalco, cuándo tomaron trabajo, cuándo validaron, etc.
- **Trazabilidad**: quién ejecutó cada acción
- **Auditoría**: cumple con "toda acción queda guardada con la fecha"

---

## 📊 Queries útiles

### Ver timeline de una cancha específica:
```sql
SELECT * FROM vista_transiciones_completa 
WHERE cancha_id = 31 
ORDER BY fecha_transicion ASC;
```

### Ver todas las transiciones del día:
```sql
SELECT * FROM vista_transiciones_completa 
WHERE fecha_transicion > NOW() - INTERVAL '1 day'
ORDER BY fecha_transicion DESC;
```

### Calcular tiempo en cada estado:
```sql
WITH transiciones_ordenadas AS (
  SELECT 
    cancha_id,
    estado_nuevo,
    created_at,
    LEAD(created_at) OVER (PARTITION BY cancha_id ORDER BY created_at) AS proxima
  FROM transiciones_estado
  WHERE cancha_id = 31
)
SELECT 
  estado_nuevo,
  created_at AS inicio,
  proxima AS fin,
  AGE(COALESCE(proxima, NOW()), created_at) AS duracion
FROM transiciones_ordenadas
ORDER BY created_at;
```

---

## 🚨 Problemas comunes

### Error: "relation estados_cancha does not exist"
**Solución**: Ejecutar PASO 1 punto 2 (crear tabla estados_cancha)

### Error: "relation transiciones_estado does not exist"
**Solución**: Ejecutar PASO 1 punto 3 (crear tabla transiciones_estado)

### No se registran transiciones
**Solución**: 
1. Verificar que las políticas RLS estén habilitadas (PASO 1 punto 5)
2. Reiniciar aplicación Astro (PASO 2)
3. Verificar logs de consola del navegador/servidor

### Vista devuelve datos vacíos
**Solución**: 
- Verificar que `estados_cancha` tenga datos: `SELECT * FROM estados_cancha;`
- Verificar que `transiciones_estado` tenga datos: `SELECT * FROM transiciones_estado;`

---

## ✅ Checklist de instalación

- [ ] Ejecutar SQL: Crear tabla `estados_cancha`
- [ ] Ejecutar SQL: Crear tabla `transiciones_estado`
- [ ] Ejecutar SQL: Crear vista `vista_transiciones_completa`
- [ ] Ejecutar SQL: Habilitar políticas RLS
- [ ] Reiniciar aplicación Astro (`pnpm run dev`)
- [ ] Probar creando una cancha nueva
- [ ] Verificar que aparezca en `vista_transiciones_completa`
- [ ] Probar workflow completo (enviar → tomar → validar → cerrar)
- [ ] Verificar timeline completo con query SQL

---

## 📞 Soporte

Si todo está instalado correctamente, cada acción ahora quedará registrada con:
- ✅ Fecha y hora exacta
- ✅ Estado anterior y nuevo
- ✅ Empresa anterior y nueva
- ✅ Tipo de acción
- ✅ Usuario que ejecutó (cuando aplique)
- ✅ Observaciones

**El sistema está listo para producción** 🚀
