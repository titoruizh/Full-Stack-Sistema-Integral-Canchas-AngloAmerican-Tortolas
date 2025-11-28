# 🚀 INSTALACIÓN EN 3 PASOS

## PASO 1: Ejecutar SQL #1

1. Abre **Supabase** → **SQL Editor**
2. Abre el archivo `verificar_estados_cancha.sql`
3. **Copia TODO el contenido**
4. **Pega** en Supabase SQL Editor
5. Click **"Run"** ▶️
6. ✅ Deberías ver 7 filas en el resultado

---

## PASO 2: Ejecutar SQL #2

1. En Supabase SQL Editor (nueva query o limpia la anterior)
2. Abre el archivo `crear_tabla_transiciones.sql`
3. **Copia TODO el contenido**
4. **Pega** en Supabase SQL Editor
5. Click **"Run"** ▶️
6. ✅ Deberías ver "Success. No rows returned"

---

## PASO 3: Reiniciar Astro

En tu terminal PowerShell:

```powershell
# Ctrl+C para detener el servidor
# Luego:
pnpm run dev
```

---

## ✅ VERIFICAR QUE FUNCIONA

1. **Crea una cancha nueva** desde la web

2. En **Supabase SQL Editor**, ejecuta:

```sql
SELECT * FROM vista_transiciones_completa 
ORDER BY fecha_transicion DESC 
LIMIT 5;
```

3. ✅ **Deberías ver** la cancha que creaste con:
   - `accion`: "crear_cancha"
   - `estado_nuevo`: "Creada"
   - `empresa_nueva`: "AngloAmerican"
   - `fecha_transicion`: hace unos segundos

---

## 🎯 ¿Qué hace esto?

Ahora **CADA acción** queda registrada con su fecha exacta:
- ✅ Crear cancha
- ✅ Enviar a Besalco
- ✅ Tomar trabajo
- ✅ Finalizar trabajo
- ✅ Validar/Rechazar (Linkapsis)
- ✅ Validar/Rechazar (LlayLlay)
- ✅ Cerrar cancha

**Objetivo cumplido:** "Toda acción queda guardada con la fecha" 🎉
