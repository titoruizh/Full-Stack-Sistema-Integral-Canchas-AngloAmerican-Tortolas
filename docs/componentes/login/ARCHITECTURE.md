# Arquitectura del Login (Refactorizado)

El sistema de login ha sido refactorizado para seguir una arquitectura modular, separando la UI de la lógica de negocio y eliminando dependencias globales.

## Estructura de Archivos

### 1. Pagina Principal (`src/pages/login.astro`)
Actúa como un **contenedor ligero**. Su única responsabilidad es:
- Importar los estilos globales (`src/styles/login.css`).
- Importar y renderizar los componentes UI.
- Inicializar el `LoginManager` en el cliente.

### 2. Componentes UI (`src/components/login/`)
Componentes "tontos" (dumb components) que solo renderizan HTML.
- **[LoginBackground](./UI.md#loginbackground):** Canvas de partículas y video de fondo.
- **[CompanySelector](./UI.md#companyselector):** Grid de selección de empresas.
- **[LoginForm](./UI.md#loginform):** Formulario de credenciales.
- **[WelcomeModal](./UI.md#welcomemodal):** Feedback visual de éxito.

### 3. Lógica de Negocio (`src/components/login/LoginManager.ts`)
Clase TypeScript que orquesta toda la interactividad.
- Maneja eventos del DOM.
- Realiza llamadas a la API (`/api/auth/login`).
- Gestiona el `localStorage` para la sesión.
- Controla las transiciones entre vistas (Empresas <-> Login).

## Flujo de Datos

1.  **Carga Inicial:** `LoginManager` consulta `/api/empresas`.
2.  **Renderizado:** Se inyectan las tarjetas en `CompanySelector`.
3.  **Selección:** Al hacer click, se oculta el selector y se muestra `LoginForm`.
4.  **Autenticación:**
    -   Se bloquea la UI (`setLoading`).
    -   POST a `/api/auth/login`.
    -   Si éxito: Se guarda token y muestra `WelcomeModal`.
    -   Si error: Se muestra mensaje en `messageContainer`.

## Ventajas del Refactor
- **Type Safety:** Todo el código TS está estrictamente tipado (Interfaces `Empresa`, `Usuario`).
- **Aislamiento:** CSS extraído a archivo dedicado simplifica el mantenimiento.
- **Contexto IA:** Archivos pequeños (<150 líneas) facilitan la lectura y modificación por agentes de IA.
