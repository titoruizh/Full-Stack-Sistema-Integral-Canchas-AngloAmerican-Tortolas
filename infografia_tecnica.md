# Infografía: Arquitectura Técnica (Frontend & Backend)

![Infografía Técnica](/infografia_tecnica.png)

Esta imagen ilustra la arquitectura tecnológica de la aplicación, separando claramente el Frontend (lo que ve el usuario) del Backend (donde se procesan los datos).

## Detalle de Tecnologías

### 🖥️ Frontend (Lado del Cliente)
Es la interfaz con la que interactúan los usuarios.
*   **Framework**: [Astro](https://astro.build/) (Renderizado híbrido/SSR).
*   **Lenguajes**: HTML5, CSS3, JavaScript (ES6+).
*   **Mapas**: [Mapbox GL JS](https://www.mapbox.com/) para visualización y dibujo de polígonos.
*   **Estilos**: CSS nativo con variables y diseño responsivo.

### ⚙️ Backend (Lado del Servidor)
Es el motor que procesa la lógica y guarda la información.
*   **Servidor**: Node.js (ejecutado a través del adaptador de Astro).
*   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL) para almacenamiento relacional.
*   **API**: Endpoints propios (`/api/...`) que gestionan las peticiones del frontend.
*   **Autenticación**: Gestión de sesiones y roles mediante tablas de usuarios en Supabase.

### 🔄 Comunicación
*   El Frontend se comunica con el Backend mediante peticiones **HTTP (Fetch API)** enviando y recibiendo datos en formato **JSON**.
