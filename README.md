# Sistema de Gestión de Canchas - AngloAmerican

## 🎯 Descripción

Sistema completo de gestión de canchas georreferenciadas que maneja el flujo de trabajo entre AngloAmerican, Besalco, Linkapsis y LlayLlay. Incluye:

- 📍 Sistema de PKs georreferenciados con Mapbox
- 🔄 Flujo de trabajo con trazabilidad completa
- ✅ Validaciones y rechazos con historial
- 🔐 Sistema de autenticación y roles
- 🗺️ Visualización de mapas y polígonos

## 📚 Documentación

Toda la documentación del proyecto está organizada en [`/docs`](docs/):

- **[Índice de Documentación](docs/INDEX.md)** - Punto de entrada a toda la documentación
- **[Arquitectura del Sistema](docs/ARCHITECTURE.md)** - Visión general de la arquitectura
- **[Estándares de Código](docs/CODE_STANDARDS.md)** - Guía de desarrollo

### Enlaces Rápidos
- [Flujos de Trabajo](docs/flujos/) - Diagramas y descripciones de flujos
- [Integraciones](docs/integraciones/) - Mapbox, TileServer, etc.
- [Base de Datos](docs/database/) - Esquemas, migraciones y queries
- [Instrucciones](docs/instrucciones/) - Guías paso a paso

## 🏗️ Stack Tecnológico

- **Frontend**: Astro 5.x (SSR + Client Islands)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Mapas**: Mapbox GL JS + TileServer
- **Estilos**: CSS vanilla con diseño responsivo
- **Deploy**: Vercel (Frontend) + Docker (TileServer)

## � Flujo de Trabajo

1. **AngloAmerican** crea canchas → Estado: "Creada"
2. **AngloAmerican** envía a Besalco → Estado: "En Proceso"
3. **Besalco** realiza trabajos → Estado: "Finalizada" (pasa a Linkapsis)
4. **Linkapsis** valida espesores:
   - ✅ Validada → pasa a LlayLlay
   - ❌ Rechazada → vuelve a Besalco
5. **LlayLlay** valida densidad:
   - ✅ Validada → vuelve a AngloAmerican
   - ❌ Rechazada → vuelve a Besalco
6. **AngloAmerican** cierra la cancha → Estado: "Cerrada"

## 🗄️ Base de Datos

### Configuración de Supabase

**URL**: https://chzlwqxjdcydnndrnfjk.supabase.co
**Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoemx3cXhqZGN5ZG5uZHJuZmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjQxMDMsImV4cCI6MjA3NjEwMDEwM30.uyI7C2j8yz1WqAWXft4cbZTBdliJlYVhHv4oL1Nthxo

### Ejecutar Script SQL

1. Ve a tu dashboard de Supabase (https://supabase.com/dashboard/projects)
2. Navega a SQL Editor
3. Ejecuta el archivo `supabase_setup.sql` completo
4. Esto creará todas las tablas, relaciones, triggers y datos iniciales

### Estructura de Tablas

- **empresas**: Catálogo de empresas participantes
- **estados_cancha**: Estados posibles de las canchas
- **canchas**: Tabla principal con información de canchas
- **historial_cancha**: Trazabilidad completa de cambios
- **validaciones**: Registro de validaciones/rechazos específicos

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta de Supabase
- API Key de Mapbox (opcional para desarrollo)

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd canchas-anglo2

# Instalar dependencias
pnpm install

# Configurar variables de entorno (ver docs/SETUP.md)
cp .env.example .env

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build
```

### Configuración Inicial

Ver [Guía de Configuración Completa](docs/SETUP.md) para:
- Configuración de Supabase
- Setup de Mapbox y TileServer
- Variables de entorno
- Despliegue en Vercel

## 📖 Para Desarrolladores

Si vas a trabajar en este proyecto o colaborar:

1. Lee [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución
2. Revisa [CODE_STANDARDS.md](docs/CODE_STANDARDS.md) para estándares de código
3. Familiarízate con la [Arquitectura](docs/ARCHITECTURE.md)
4. Consulta la documentación de componentes en [`docs/componentes/`](docs/componentes/)

## 🔗 Enlaces Útiles

- **Dashboard Supabase**: https://chzlwqxjdcydnndrnfjk.supabase.co
- **Producción**: (añadir URL de Vercel)
- **Documentación API**: [docs/api/](docs/api/)

## 📝 Licencia

(Añadir información de licencia)

- Node.js 18+
- pnpm (o npm/yarn)

### Pasos de Instalación

1. **Instalar dependencias**
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno**
   El archivo `.env` ya está configurado con las credenciales correctas.

3. **Ejecutar el script SQL en Supabase**
   - Copia todo el contenido de `supabase_setup.sql`
   - Pégalo en el SQL Editor de Supabase
   - Ejecuta el script

4. **Iniciar el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

5. **Acceder a la aplicación**
   - Abre http://localhost:4323 en tu navegador

## 💻 Uso de la Aplicación

### Selección de Empresa

1. Al ingresar, selecciona tu empresa en el dropdown superior
2. Las acciones disponibles cambiarán según tu empresa

### AngloAmerican

- **Crear canchas**: Completa Muro, Sector y Nombre
- **Enviar a Besalco**: Cuando la cancha esté creada
- **Cerrar cancha**: Cuando vuelva validada

### Besalco

- **Finalizar trabajo**: Para canchas en proceso o rechazadas

### Linkapsis

- **Validar espesores**: Aprueba y envía a LlayLlay
- **Rechazar**: Devuelve a Besalco con observaciones

### LlayLlay

- **Validar densidad**: Aprueba y envía a AngloAmerican
- **Rechazar**: Devuelve a Besalco con observaciones

## 🔍 Características del Sistema

### Trazabilidad Completa

- Cada cambio se registra automáticamente
- Historial detallado con timestamps
- Registro de quién realizó cada acción

### Validaciones y Rechazos

- Observaciones obligatorias en rechazos
- Tipos específicos de validación (espesores, densidad)
- Mantenimiento del estado histórico

### Nomenclatura de Canchas

Las canchas siguen el formato: `MURO_SECTOR_NOMBRE`

Ejemplos:
- `MP_S5_TALUD` (Muro Principal, Sector 5, Talud)
- `MS_S3_BERMA` (Muro Secundario, Sector 3, Berma)
- `MT_S1_PISTA` (Muro Terciario, Sector 1, Pista)

### Estados de Cancha

- **Creada**: Recién creada por AngloAmerican
- **En Proceso**: Trabajándose por Besalco
- **Finalizada**: Trabajo completado, esperando validación
- **Validada**: Aprobada por validador correspondiente
- **Rechazada**: Rechazada, requiere retrabajo
- **Cerrada**: Proceso completo, cancha cerrada

## 🎨 Interfaz de Usuario

### Diseño Responsivo

- Adaptable a dispositivos móviles
- Tabla scrolleable en pantallas pequeñas
- Botones optimizados para touch

### Indicadores Visuales

- Estados con colores distintivos
- Empresas identificadas por colores
- Botones contextuales según permisos

### Experiencia de Usuario

- Confirmaciones para acciones críticas
- Mensajes de éxito/error claros
- Loading states durante operaciones

## 📂 Estructura del Proyecto

```
canchas-anglo2/
├── src/
│   ├── pages/              # Rutas y páginas
│   │   ├── index.astro     # Dashboard principal
│   │   ├── login.astro     # Autenticación
│   │   └── api/            # Endpoints API
│   ├── components/         # Componentes reutilizables
│   ├── lib/                # Librerías (Supabase, etc.)
│   ├── utils/              # Utilidades (mapbox, auth, etc.)
│   └── styles/             # Estilos globales
├── public/                 # Archivos estáticos
│   └── mapbox-gis/         # GeoJSON y token Mapbox
├── docs/                   # 📚 Documentación completa
│   ├── INDEX.md            # Índice de documentación
│   ├── ARCHITECTURE.md     # Arquitectura del sistema
│   ├── CODE_STANDARDS.md   # Estándares de código
│   ├── SETUP.md            # Guía de instalación
│   ├── componentes/        # Docs de componentes
│   ├── api/                # Docs de APIs
│   ├── database/           # Scripts SQL
│   ├── flujos/             # Diagramas de flujo
│   └── integraciones/      # Mapbox, TileServer, etc.
├── CONTRIBUTING.md         # Guía de contribución
└── README.md               # Este archivo
```

## 🎯 Proyecto Reorganizado y Profesionalizado

**Fecha**: Diciembre 2025

Este proyecto ha sido **reorganizado y documentado profesionalmente** para:

✅ **Facilitar el crecimiento** - Estructura escalable y clara  
✅ **Mejorar colaboración** - Estándares consistentes  
✅ **Optimizar IA** - Documentación estructurada para mejores respuestas  
✅ **Acelerar onboarding** - Nuevos desarrolladores entienden rápido  

Ver [docs/REORGANIZACION.md](docs/REORGANIZACION.md) para detalles de los cambios.

### ¿Por dónde empezar?

1. **Nuevos al proyecto**: [docs/INDEX.md](docs/INDEX.md)
2. **Instalar y configurar**: [docs/SETUP.md](docs/SETUP.md)
3. **Contribuir**: [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Desarrollar**: [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)

---

**Sistema desarrollado para AngloAmerican** 🏗️⚡
