# Documentación Técnica: Componentes del Mapa

Este documento detalla la arquitectura modular del visor de mapas refactorizado, ubicado en `src/components/map/`.

## 1. Estructura Modular

El antiguo componente monolítico `MiningMap.astro` ha sido dividido en una clase gestora de lógica y componentes de UI puros:

*   **`MapManager.ts`**: Núcleo lógico (Clase TypeScript). Maneja Mapbox GL JS, eventos, capas y datos.
*   **`MapLoader.astro`**: Componente visual para estados de carga y error.
*   **`MapControls.astro`**: Interfaz de usuario para controles sobre el mapa (Filtros de muro, botones de dibujo).
*   **`MiningMap.astro`**: Componente orquestador que instancia `MapManager` e inyecta las dependencias.

## 2. MapManager.ts

Es el cerebro del mapa. Se instancia una única vez por contenedor de mapa.

### Responsabilidades Clave:
*   **Inicialización:** Carga el mapa, configura el TileServer local y ajusta los bounds iniciales.
*   **Gestión de Datos Geoespaciales (`loadGISData`):** Carga `poligonos.geojson` y `sectores.geojson` para la visualización estática de fondo.
*   **Modo Dashboard (`loadMultipleCanchas`):**
    *   Consume la API `/api/canchas` filtrando por IDs (`?ids=...`).
    *   Renderiza canchas dinámicas con colores según estado (`getStateColors`).
    *   **Auto-Zoom:** Calcula el `BoundingBox` de las canchas filtradas y ajusta la cámara (`fitBounds`) para enfocarlas.
    *   **Limpieza:** Gestiona la eliminación segura de fuentes y capas antes de recargar datos.
*   **Interacciones:**
    *   Detecta clicks en canchas y muestra Popups con metadatos (ID, Estado, Fecha).
    *   Maneja eventos de `mouseenter`/`mouseleave` para feedback visual (cursor).
*   **Revanchas Elegantes:** Implementa la lógica compleja de visualización técnica (líneas perpendiculares, colores semánticos, animaciones de pulso).

## 3. Integración con Dashboard

La comunicación entre el Dashboard (`index.astro`) y el Mapa (`mapbox-window.astro` -> `MiningMap`) se realiza mediante:

1.  **URL Parameters (Carga Inicial/Recarga):**
    *   `dashboardMode=true`: Activa el modo de visualización de datos.
    *   `canchaIds=1,2,3...`: Lista de IDs para filtrar desde la API.
    *   `muro=MP`: Filtra la vista inicial a un muro específico.

2.  **Window Messages (Interacción en tiempo real):**
    *   `zoom-to-cancha`: Enfoca una cancha específica.
    *   `mostrar-revanchas` / `ocultar-revanchas`: Toggle de capas de revanchas.

## 4. API Backend

Para soportar el filtrado eficiente, se actualizó el endpoint:

*   **`GET /api/canchas?ids=1,2,3`**:
    *   Acepta parámetro opcional `ids`.
    *   Filtra los resultados en el servidor antes de responder.
    *   Esencial para que el mapa muestre *solo* lo que el usuario filtró en el dashboard ("Mis Acciones", "Estados").
