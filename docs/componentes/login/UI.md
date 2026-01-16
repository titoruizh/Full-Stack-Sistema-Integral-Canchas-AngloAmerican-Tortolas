# Documentación UI del Login

Referencia de los componentes visuales ubicados en `src/components/login/`.

## LoginBackground.astro
Encapsula los elementos visuales de fondo.
- **Canvas:** ID `#bg-canvas`. Usado por `ParticleNetwork.ts` para dibujar la red neuronal interactiva.
- **Estilos:** Definidos en `login.css`, usa `z-index: 0` para quedar detrás del contenido.

## CompanySelector.astro
Vista inicial donde el usuario elige su organización.
- **Contenedor:** ID `#view-companies`, clase `.company-selection-container`.
- **Grid:** ID `#companies-grid`. Aquí el `LoginManager` inyecta dinámicamente las tarjetas (`.company-card`).
- **Transiciones:** Usa clase `.fade-in` para animación de entrada.

## LoginForm.astro
Formulario de credenciales.
- **Contenedor:** ID `#view-login`, clase `.login-window`. Inicialmente oculto (`.hidden`).
- **Elementos Clave:**
    -   `#btn-back`: Botón para volver a la selección de empresa.
    -   `#selected-company-img`: Muestra el logo de la empresa elegida.
    -   `#usuarioSelect`: Dropdown poblado vía API `/api/usuarios`.
    -   `#loginBtn`: Botón de submit con estado de carga (spinner).

## WelcomeModal.astro
Modal de éxito que aparece tras un login correcto.
- **ID:** `#welcome-modal`.
- **Animaciones:** CSS puro (`@keyframes slideInWelcome`, `bounceIcon`).
- **Control:** `LoginManager` añade/quita la clase `.show` para activarlo.
