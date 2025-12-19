# Guía de Contribución - Canchas AngloAmerican

## 🎯 Bienvenido

Gracias por tu interés en contribuir al proyecto. Esta guía te ayudará a empezar.

## 🚀 Primeros Pasos

### 1. Setup del Entorno

```bash
# Clonar el repositorio
git clone <repo-url>
cd canchas-anglo2

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Configurar credenciales (ver docs/SETUP.md)
```

### 2. Familiarízate con el Proyecto

Antes de contribuir, lee:

1. [README.md](../README.md) - Visión general
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema
3. [CODE_STANDARDS.md](CODE_STANDARDS.md) - Estándares de código
4. [docs/INDEX.md](INDEX.md) - Índice de documentación

### 3. Ejecutar en Local

```bash
# Desarrollo
pnpm dev

# Acceder a http://localhost:4321
```

## 🌿 Workflow de Git

### Estructura de Ramas

```
main (producción)
  └── develop (desarrollo)
       ├── feature/nueva-funcionalidad
       ├── fix/correccion-bug
       └── docs/actualizar-readme
```

### Crear una Nueva Rama

```bash
# Actualizar develop
git checkout develop
git pull origin develop

# Crear rama feature
git checkout -b feature/nombre-descriptivo

# O rama fix
git checkout -b fix/nombre-del-bug
```

### Commits

Usa mensajes descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: agregar filtro de canchas por empresa"

# Fixes
git commit -m "fix: corregir cálculo de distancia PKs"

# Docs
git commit -m "docs: actualizar guía de instalación"

# Refactor
git commit -m "refactor: simplificar lógica de validación"

# Style
git commit -m "style: formatear código según estándares"

# Chore
git commit -m "chore: actualizar dependencias"
```

### Pull Requests

1. **Asegúrate de que tu rama esté actualizada**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout tu-rama
   git rebase develop
   ```

2. **Push tu rama**
   ```bash
   git push origin tu-rama
   ```

3. **Crea el PR en GitHub/GitLab**
   - Título descriptivo
   - Descripción detallada de los cambios
   - Screenshots si hay cambios visuales
   - Referencias a issues relacionados

4. **Template de PR**
   ```markdown
   ## Descripción
   Breve descripción de qué hace este PR
   
   ## Tipo de cambio
   - [ ] Bug fix
   - [ ] Nueva funcionalidad
   - [ ] Refactorización
   - [ ] Documentación
   
   ## Checklist
   - [ ] He leído CODE_STANDARDS.md
   - [ ] Mi código sigue los estándares del proyecto
   - [ ] He documentado los cambios necesarios
   - [ ] He probado localmente
   - [ ] No hay console.logs de debug
   
   ## Screenshots (si aplica)
   
   ## Notas adicionales
   ```

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no esté ya reportado
2. Intenta reproducirlo en local
3. Identifica los pasos exactos para reproducirlo

### Template de Issue - Bug

```markdown
## Descripción del Bug
Descripción clara del problema

## Pasos para Reproducir
1. Ir a '...'
2. Hacer click en '...'
3. Ver error

## Comportamiento Esperado
Qué debería pasar

## Comportamiento Actual
Qué está pasando

## Screenshots
Si es visual, adjuntar capturas

## Entorno
- Navegador: [ej. Chrome 120]
- OS: [ej. Windows 11]
- Versión: [ej. commit hash o rama]

## Logs/Errores
```
Pegar errores de consola aquí
```

## Información Adicional
Cualquier contexto relevante
```

## 💡 Sugerir Features

### Template de Issue - Feature Request

```markdown
## Descripción de la Funcionalidad
¿Qué funcionalidad propones?

## Problema que Resuelve
¿Qué problema actual soluciona esto?

## Solución Propuesta
Cómo debería funcionar

## Alternativas Consideradas
Otras opciones que evaluaste

## Impacto
- ¿Afecta a usuarios existentes?
- ¿Requiere cambios en la BD?
- ¿Necesita nuevas dependencias?

## Mockups/Ejemplos (opcional)
Capturas, diagramas, código de ejemplo
```

## 🔧 Desarrollo

### Agregar Nueva Funcionalidad

1. **Crear issue** con la propuesta
2. **Esperar aprobación** antes de empezar
3. **Crear rama** desde `develop`
4. **Desarrollar** siguiendo [CODE_STANDARDS.md](CODE_STANDARDS.md)
5. **Documentar** en [`docs/`](.)
6. **Probar** exhaustivamente
7. **Crear PR** con descripción detallada

### Modificar Base de Datos

Si tu cambio requiere modificaciones a la BD:

1. **Crear archivo de migración** en `docs/database/migrations/`
   ```sql
   -- Migration: YYYY-MM-DD_descripcion.sql
   -- Autor: Tu Nombre
   -- Descripción: Qué hace esta migración
   
   BEGIN;
   
   -- Tu código SQL aquí
   
   COMMIT;
   ```

2. **Documentar** en `docs/database/SCHEMA.md` (si no existe, créalo)

3. **Probar rollback** (si es posible)
   ```sql
   -- Rollback:
   BEGIN;
   
   -- Código para deshacer cambios
   
   COMMIT;
   ```

### Agregar Endpoint API

1. Crear archivo en `src/pages/api/`
2. Documentar en `docs/api/ENDPOINTS.md` (créalo si no existe)
3. Incluir:
   - Método HTTP
   - Ruta
   - Parámetros
   - Response esperado
   - Códigos de error
   - Ejemplo de uso

Ejemplo:
```markdown
### POST /api/canchas/[id]/accion

Ejecuta una acción sobre una cancha.

**Autenticación**: Requerida

**Parámetros URL:**
- `id` (number) - ID de la cancha

**Body:**
```json
{
  "accion": "finalizar",
  "observaciones": "Trabajo completado"
}
```

**Response 200:**
```json
{
  "success": true,
  "cancha": { ... }
}
```

**Errores:**
- 401: No autenticado
- 403: No autorizado para esta acción
- 404: Cancha no encontrada
- 400: Acción inválida
```

### Agregar Componente

1. Crear en `src/components/`
2. Documentar props y uso en comentarios
3. Incluir ejemplo en `docs/componentes/` (créalo si no existe)

## 🧪 Testing (Futuro)

Cuando se implemente testing:

```bash
# Ejecutar tests
pnpm test

# Coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## 📝 Documentación

### Actualizar Documentación

- **README.md**: Cambios en setup o features principales
- **ARCHITECTURE.md**: Cambios arquitectónicos significativos
- **CODE_STANDARDS.md**: Nuevos estándares o convenciones
- **docs/**: Cualquier nueva funcionalidad o sistema

### Crear Nueva Documentación

Si creas un nuevo sistema o módulo importante:

1. Crear archivo en carpeta apropiada de `docs/`
2. Agregar enlace en `docs/INDEX.md`
3. Seguir formato Markdown consistente
4. Incluir ejemplos de código
5. Agregar diagramas si ayudan (usar Mermaid)

## ✅ Checklist Pre-PR

Antes de crear un Pull Request:

- [ ] Mi código sigue [CODE_STANDARDS.md](CODE_STANDARDS.md)
- [ ] He probado localmente todos los cambios
- [ ] He agregado/actualizado documentación
- [ ] He removido `console.log` de debug
- [ ] He revisado mis propios cambios (self-review)
- [ ] No hay código comentado innecesario
- [ ] Los mensajes de commit son descriptivos
- [ ] He actualizado variables de entorno (si aplica)
- [ ] Los cambios de BD están documentados (si aplica)

## 🔍 Code Review

### Como Autor

- Responde a comentarios constructivamente
- Haz cambios solicitados prontamente
- Explica decisiones de diseño si es necesario
- Marca conversaciones como resueltas cuando aplique

### Como Reviewer

- Sé constructivo y respetuoso
- Explica el "por qué" de tus sugerencias
- Diferencia entre "debe cambiar" vs "sugerencia"
- Aprueba cuando esté listo

## 🎨 Guías de Estilo

### TypeScript
```typescript
// ✅ Bueno
interface Props {
  canchaId: number;
  onUpdate?: () => void;
}

async function fetchCancha(id: number): Promise<Cancha> {
  // ...
}
```

### CSS
```css
/* ✅ Bueno - BEM */
.cancha-card { }
.cancha-card__header { }
.cancha-card--active { }
```

### SQL
```sql
-- ✅ Bueno - nombres claros
SELECT 
  c.id,
  c.nombre_cancha,
  e.nombre AS empresa
FROM canchas c
JOIN empresas e ON c.empresa_id = e.id
WHERE c.estado = 'activo';
```

## 🆘 ¿Necesitas Ayuda?

- Lee la [documentación](INDEX.md)
- Revisa [issues existentes](link-to-issues)
- Pregunta en [canal de Slack/Discord]
- Contacta a los maintainers

## 📚 Recursos

- [Astro Docs](https://docs.astro.build)
- [Supabase Docs](https://supabase.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licenciarán bajo la misma licencia del proyecto.

---

**¡Gracias por contribuir! 🎉**
