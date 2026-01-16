# Documentación: Vista de Mapa y Georreferencia

El sistema integra un visor geoespacial avanzado basado en **Mapbox GL JS**, enriquecido con ortomosaicos personalizados y capas de datos operacionales (sectores, polígonos y puntos de control/revanchas).

## 1. Arquitectura del Mapa

El mapa se implementa a través de un componente encapsulado `MiningMap.astro` que se carga usualmente dentro de un iframe (`src/pages/mapbox-window.astro`) para aislamiento de estilos y rendimiento.

### Tecnologías Clave
*   **Motor:** Mapbox GL JS v3.8.0.
*   **Gestión de Tiles:** TileServer GL (servidor local en puerto 8081).
*   **Formato de Datos:** GeoJSON para vectores (polígonos, puntos) y Raster Tiles para la imagen base.

---

## 2. Capas y Visualización

El mapa se compone de múltiples capas superpuestas (de abajo hacia arriba):

1.  **Fondo (Background):** Color gris neutro `#f0f0f0`.
2.  **Ortomosaico (`raster-layer`):**
    *   **Fuente:** `http://localhost:8081/data/mapbase/{z}/{x}/{y}.jpg`
    *   **Zoom:** 10 a 20.
    *   **Descripción:** Imagen aérea de alta resolución de la faena minera.
3.  **Sectores (`sectors-stroke`):**
    *   Líneas discontinuas blancas que delimitan las grandes zonas (S1, S2, etc.).
4.  **Polígonos de Canchas (`polygons-stroke`):**
    *   Líneas naranjas (`#ff7f00`) que muestran los perímetros de las canchas.
    *   **Visibilidad:** Se activan dinámicamente al filtrar por Muro.
5.  **Etiquetas (`*-labels`):**
    *   Nombres de sectores y muros con halo para legibilidad sobre el mapa satelital.

---

## 3. Funcionalidad: Filtro de Muros

El mapa permite "bloquear" la vista en áreas específicas de la mina (Muros) para facilitar la operación.

*   **Muro Principal (MP)**
*   **Muro Este (ME)**
*   **Muro Oeste (MO)**

**Comportamiento:**
Al seleccionar un muro, el mapa:
1.  Hace zoom suave (`flyTo`) a los límites (Bounds) predefinidos de ese muro.
2.  Restringe la navegación (`maxBounds`) para que el usuario no se pierda.
3.  Filtra las capas vectoriales para mostrar solo los polígonos pertenecientes a ese muro.

---

## 4. Funcionalidad: Toggle de Revanchas

En el dashboard principal (`index.astro`), existe un interruptor "Ver Revanchas" que proyecta puntos de control georreferenciados sobre el mapa.

### 4. Funcionalidad: Visualización de Revanchas (Modo Elegante)

En el dashboard principal (`index.astro`), el toggle "Ver Revanchas" activa una visualización técnica avanzada sobre el mapa.

#### Flujo de Datos
1.  **Activación:** Usuario activa el toggle.
2.  **Consulta:** `GET /api/revanchas/georreferenciadas?formato=geojson` (Filtrado por muro activo).
3.  **Procesamiento ("Renderizado Elegante"):**
    *   **Normalización:** Detecta automáticamente el muro (MP, ME, MO) basándose en las propiedades, con correcciones para evitar colisiones de nombres (e.g. priorizar "Oeste" sobre "Este").
    *   **Limpieza:** Ordena los puntos numéricamente por PK y elimina duplicados exactos o erróneos.
    *   **Geometría Avanzada:**
        *   **Línea Eje:** Conecta los PKs secuencialmente para formar el trazo del muro.
        *   **Líneas Perpendiculares (Ancho):** Genera líneas de 33m que representan el ancho de la revancha.
        *   **Direccionalidad:**
            *   **Muro Oeste (MO):** Perpendicular hacia la **Izquierda (-90°)** del avance.
            *   **Muro Principal/Este (MP/ME):** Perpendicular hacia la **Derecha (+90°)** del avance.
        *   **Suavizado de Curvas:** Utiliza el promedio vectorial de los segmentos adyacentes (tangente) para calcular el ángulo de la perpendicular, asegurando visualización correcta en curvas.
    *   **Código de Colores:**
        *   **Puntos (Revancha):** Verde (>3.5m), Amarillo (3.0-3.5m), Rojo (<3.0m).
        *   **Líneas Ancho:** Verde (>18m), Amarillo (15-18m), Rojo (<15m).

---

## 5. Referencias Técnicas
*   **Frontend:** `src/components/MiningMap.astro` (Lógica Mapbox), `src/pages/index.astro` (Controlador Toggle).
*   **Backend:** `src/pages/api/revanchas/georreferenciadas.ts`.
*   **Infraestructura:** Requiere TileServer GL corriendo localmente para servir el ortomosaico.
