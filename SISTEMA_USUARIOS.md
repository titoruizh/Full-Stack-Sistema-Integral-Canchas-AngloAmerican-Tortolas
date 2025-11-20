# Sistema de Gestión de Canchas AngloAmerican

## Descripción del Proyecto

Sistema web para la gestión y control de calidad de canchas mineras, con funcionalidades de mapeo GIS, validaciones por empresas especializadas y generación de reportes PDF.

## Nuevas Funcionalidades - Sistema de Usuarios

### 🔧 Backend Implementado

#### 1. Base de Datos - Nuevas Tablas

**Tabla `roles`:**
- `id` (BIGSERIAL PRIMARY KEY)
- `nombre` (VARCHAR 100) - Nombre del rol
- `empresa_id` (BIGINT) - Referencia a empresas
- `descripcion` (TEXT) - Descripción opcional
- `created_at` (TIMESTAMP)

**Tabla `usuarios`:**
- `id` (BIGSERIAL PRIMARY KEY)
- `nombre_completo` (VARCHAR 200) - Nombre completo del usuario
- `email` (VARCHAR 255) - Email opcional
- `empresa_id` (BIGINT) - Referencia a empresas
- `rol_id` (BIGINT) - Referencia a roles
- `activo` (BOOLEAN) - Estado del usuario
- `password_hash` (VARCHAR 255) - Password (desarrollo: '123')
- `created_at`, `updated_at` (TIMESTAMP)

**Vista `vista_usuarios_completa`:**
Combina usuarios con información de empresa y rol para consultas optimizadas.

#### 2. Scripts de Instalación

**`usuarios_roles_setup.sql`** - Script principal que:
- Crea las tablas con índices y constraints
- Establece relaciones de Foreign Key
- Habilita Row Level Security (RLS)
- Crea roles predeterminados por empresa
- Inserta usuarios de ejemplo
- Configura triggers para `updated_at`

**`test_usuarios_roles.sql`** - Script de verificación que:
- Valida la creación de tablas
- Verifica datos insertados
- Prueba consultas de la vista
- Valida integridad referencial

#### 3. APIs REST Implementadas

**GET/POST `/api/usuarios`**
```typescript
// Obtener usuarios (con filtros opcionales)
GET /api/usuarios?empresa_id=1&rol_id=2&activo=true

// Crear nuevo usuario
POST /api/usuarios
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@empresa.com",
  "empresa_id": 1,
  "rol_id": 2
}
```

**GET/POST `/api/roles`**
```typescript
// Obtener roles por empresa
GET /api/roles?empresa_id=1

// Crear nuevo rol
POST /api/roles
{
  "nombre": "Supervisor",
  "empresa_id": 1,
  "descripcion": "Supervisor de campo"
}
```

**POST `/api/auth/login`**
```typescript
// Autenticación de usuario
POST /api/auth/login
{
  "empresa_id": 1,
  "usuario_id": 5,
  "password": "123"
}
```

#### 4. Servicios Backend (supabase.ts)

**Nuevas Interfaces:**
```typescript
interface Usuario {
  id: number
  nombre_completo: string
  email?: string
  empresa_id: number
  rol_id: number
  activo: boolean
  password_hash?: string
  created_at: string
  updated_at: string
}

interface Rol {
  id: number
  nombre: string
  empresa_id: number
  descripcion?: string
  created_at: string
}

interface UsuarioCompleto extends Usuario {
  empresa_nombre: string
  rol_nombre: string
  rol_descripcion?: string
}
```

**Nuevas Clases de Servicio:**
- `RolService`: Gestión de roles por empresa
- `UsuarioService`: CRUD completo de usuarios con autenticación

### 🎯 Roles Predeterminados por Empresa

**AngloAmerican (ID: 1):**
- Ingeniero QA/QC
- Jefe de Operaciones

**Besalco (ID: 2):**
- Admin
- Operador

**Linkapsis (ID: 3):**
- Admin  
- Operador

**LlayLlay (ID: 4):**
- Admin
- Operador

### 📄 Integración PDF Mejorada

El sistema de generación PDF ahora incluye nombres reales de usuarios:
- **{{NOMBRE_AAQAQC}}**: Nombre del Ingeniero QA/QC de AngloAmerican
- **{{NOMBRE_AAJO}}**: Nombre del Jefe de Operaciones de AngloAmerican

Los nombres se obtienen dinámicamente de la base de datos al generar el PDF.

## Instrucciones de Instalación

### 1. Ejecutar Scripts de Base de Datos

```sql
-- En Supabase SQL Editor:
-- 1. Ejecutar usuarios_roles_setup.sql
-- 2. Ejecutar test_usuarios_roles.sql (verificación)
```

### 2. Verificar APIs

```bash
# Probar obtener usuarios de AngloAmerican
curl "http://localhost:4321/api/usuarios?empresa_id=1"

# Probar autenticación
curl -X POST "http://localhost:4321/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"empresa_id":1,"usuario_id":1,"password":"123"}'
```

### 3. Usuarios de Ejemplo Creados

**AngloAmerican:**
- Juan Pérez González (Ingeniero QA/QC) - password: '123'
- María Rodriguez Silva (Jefe de Operaciones) - password: '123'

**Besalco:**
- Carlos Mendez Torres (Admin) - password: '123'
- Ana López Morales (Operador) - password: '123'

**Linkapsis:**
- Roberto Sanchez Castro (Admin) - password: '123'
- Patricia Díaz Herrera (Operador) - password: '123'

**LlayLlay:**
- Miguel Fernandez Ramos (Admin) - password: '123'
- Valentina Castro Núñez (Operador) - password: '123'

## Sistema PDF Avanzado

### Variables Implementadas

**Información Principal:**
- `{{NUMERO_CN}}` - Número de informe
- `{{MURO}}` - Nombre del muro (MP→PRINCIPAL, MO→OESTE, ME→ESTE)
- `{{SECTOR}}` - Sector de la cancha
- `{{CANCHA_NAME}}` - Nombre de la cancha

**Fechas y Personal:**
- `{{FECHA_ANGLO}}` - Fecha de creación
- `{{NOMBRE_AAQAQC}}` - Ingeniero QA/QC (nombre real)
- `{{NOMBRE_AAJO}}` - Jefe de Operaciones (nombre real)

**Comentarios por Empresa:**
- `{{COMENTARIOS_BESALCO}}` - Observaciones de Besalco
- `{{COMENTARIOS_LINKAPSIS}}` - Observaciones de Linkapsis  
- `{{COMENTARIOS_LLAYLLAY}}` - Observaciones de LlayLlay

**Checkboxes Condicionales:**
- `{{TICKET_LK_C}}` - ☑ si usuario marcó "corte"
- `{{TICKET_LK_R}}` - ☑ si usuario marcó "relleno"

### Lógica de Validaciones

- **Primera validación**: Primera entrada por empresa
- **Última validación**: Última revalidación por empresa
- **Fechas dinámicas**: `{{ENTREGA_1}}` y `{{ENTREGA_2}}` basadas en validaciones reales

## Próximos Pasos

### 🚀 Frontend Pendiente

1. **Pantalla de Login:**
   - Selector de empresa
   - Selector de usuario de la empresa
   - Input de password
   - Autenticación via API

2. **Gestión de Usuarios:**
   - CRUD de usuarios por empresa
   - Asignación de roles
   - Cambio de passwords

3. **Integración con Mapbox:**
   - Mostrar usuario logueado
   - Filtros por permisos de rol

### 🔒 Seguridad

- Implementar hash real de passwords (bcrypt)
- JWT tokens para sesiones
- Políticas RLS más restrictivas
- Validación de permisos por rol

### 📊 Funcionalidades Avanzadas

- Logs de auditoría de usuarios
- Notificaciones por email
- Reportes de actividad
- Backup automático de datos de usuarios

## Tecnologías

- **Frontend**: Astro.js + TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Mapas**: Mapbox GL JS
- **PDF**: HTML + CSS + window.print()
- **Autenticación**: Sistema propio con roles

## Estructura de Archivos

```
src/
├── lib/
│   └── supabase.ts          # Servicios y interfaces
├── pages/api/
│   ├── usuarios/
│   │   └── index.ts         # CRUD usuarios
│   ├── roles/
│   │   └── index.ts         # CRUD roles  
│   ├── auth/
│   │   └── login.ts         # Autenticación
│   └── canchas/[id]/
│       └── download-pdf.ts  # PDF con usuarios reales
├── template_mejorado.html   # Template PDF
├── usuarios_roles_setup.sql # Script instalación
└── test_usuarios_roles.sql  # Script verificación
```