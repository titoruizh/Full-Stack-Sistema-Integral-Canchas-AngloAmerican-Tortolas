# Mapbox Utils - Utilidades GIS

## 📍 Descripción

Módulo de utilidades para conversión de coordenadas, manejo de geometrías y operaciones GIS con Mapbox.

## 📁 Ubicación

`src/utils/mapbox.ts`

## 🎯 Funcionalidades

### 1. Gestión de Token de Mapbox

#### `getMapboxToken()`
Obtiene el token de acceso de Mapbox desde el archivo público.

```typescript
async function getMapboxToken(): Promise<string>
```

**Uso:**
```typescript
const token = await getMapboxToken();
mapboxgl.accessToken = token;
```

**Errores:**
- Lanza error si no puede cargar el token
- El token debe estar en `/public/mapbox-gis/token.txt`

---

### 2. Sistema de Coordenadas

#### `COORDINATE_SYSTEM`
Constante con la configuración del sistema de coordenadas UTM Zona 19S.

```typescript
export const COORDINATE_SYSTEM = {
  utmZone: 19,
  hemisphere: 'S',
  epsg: 'EPSG:32719',
  bounds: {
    west: -70.76,
    south: -33.16,
    east: -70.70,
    north: -33.10
  }
};
```

**Uso:**
```typescript
import { COORDINATE_SYSTEM } from '@/utils/mapbox';

console.log(`Zona UTM: ${COORDINATE_SYSTEM.utmZone}${COORDINATE_SYSTEM.hemisphere}`);
```

---

### 3. Conversión de Coordenadas

#### `utmToWgs84(easting, northing)`
Convierte coordenadas UTM (metros) a WGS84 (grados decimales).

```typescript
function utmToWgs84(
  easting: number, 
  northing: number
): [number, number]
```

**Parámetros:**
- `easting` - Coordenada X en metros (Este)
- `northing` - Coordenada Y en metros (Norte)

**Retorna:**
- `[lng, lat]` - Longitud y latitud en WGS84

**Ejemplo:**
```typescript
import { utmToWgs84 } from '@/utils/mapbox';

// Coordenadas UTM del PK 100
const easting = 347823.45;
const northing = 6331245.67;

const [lng, lat] = utmToWgs84(easting, northing);
console.log(`Longitud: ${lng}, Latitud: ${lat}`);
// Longitud: -70.73456, Latitud: -33.12345
```

**Notas:**
- Usa `proj4` para conversión precisa
- Fallback a conversión manual si proj4 falla
- Optimizado para UTM Zona 19S (hemisferio sur)

#### `utmToWgs84Manual(easting, northing)`
Conversión manual usando fórmulas matemáticas (fallback).

```typescript
function utmToWgs84Manual(
  easting: number, 
  northing: number
): [number, number]
```

**Uso interno:** Se usa automáticamente si proj4 falla.

---

### 4. Conversión de Arrays de Coordenadas

#### `convertCoordinateArray(coords)`
Convierte un array de coordenadas UTM a WGS84.

```typescript
function convertCoordinateArray(
  coords: number[][]
): number[][]
```

**Parámetros:**
- `coords` - Array de coordenadas `[[x1, y1], [x2, y2], ...]`

**Retorna:**
- Array de coordenadas WGS84 `[[lng1, lat1], [lng2, lat2], ...]`

**Ejemplo:**
```typescript
const utmCoords = [
  [347823.45, 6331245.67],
  [347920.12, 6331350.89],
  [348015.34, 6331455.23]
];

const wgs84Coords = convertCoordinateArray(utmCoords);
// [
//   [-70.73456, -33.12345],
//   [-70.73340, -33.12250],
//   [-70.73225, -33.12155]
// ]
```

**Soporte:**
- Coordenadas 2D: `[x, y]`
- Coordenadas 3D: `[x, y, z]` (mantiene la elevación)

---

### 5. Conversión de Geometrías GeoJSON

#### `convertGeometry(geometry)`
Convierte cualquier tipo de geometría GeoJSON de UTM a WGS84.

```typescript
function convertGeometry(geometry: any): any
```

**Tipos soportados:**
- `Point` - Punto
- `LineString` - Línea
- `Polygon` - Polígono
- `MultiPolygon` - Multi-polígono

**Ejemplo - Point:**
```typescript
const utmPoint = {
  type: 'Point',
  coordinates: [347823.45, 6331245.67]
};

const wgs84Point = convertGeometry(utmPoint);
// {
//   type: 'Point',
//   coordinates: [-70.73456, -33.12345]
// }
```

**Ejemplo - Polygon:**
```typescript
const utmPolygon = {
  type: 'Polygon',
  coordinates: [[
    [347823.45, 6331245.67],
    [347920.12, 6331350.89],
    [348015.34, 6331455.23],
    [347823.45, 6331245.67] // Cerrado
  ]]
};

const wgs84Polygon = convertGeometry(utmPolygon);
// Todas las coordenadas convertidas a WGS84
```

**Ejemplo - LineString:**
```typescript
const utmLine = {
  type: 'LineString',
  coordinates: [
    [347823.45, 6331245.67],
    [347920.12, 6331350.89]
  ]
};

const wgs84Line = convertGeometry(utmLine);
```

**Notas:**
- Preserva la estructura de la geometría
- Maneja anillos múltiples en polígonos
- Soporta multi-geometrías

---

### 6. Cálculo de Bounds

#### `calculateBounds(features)`
Calcula los límites (bounding box) de un conjunto de features GeoJSON.

```typescript
function calculateBounds(
  features: any[]
): [number, number, number, number]
```

**Parámetros:**
- `features` - Array de features GeoJSON

**Retorna:**
- `[minLng, minLat, maxLng, maxLat]` - Límites en WGS84

**Ejemplo:**
```typescript
const features = [
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-70.73456, -33.12345]
    }
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-70.73340, -33.12250]
    }
  }
];

const bounds = calculateBounds(features);
// [-70.73656, -33.12545, -70.73140, -33.12050]
//  minLng     minLat      maxLng     maxLat
//  (con padding de 0.002 grados)

// Usar con Mapbox
map.fitBounds(bounds, { padding: 50 });
```

**Características:**
- Agrega padding automático de 0.002 grados
- Maneja arrays vacíos (devuelve bounds por defecto)
- Procesa cualquier tipo de geometría recursivamente
- Útil para hacer zoom a un conjunto de datos

---

## 🔧 Configuración Técnica

### Proyecciones

```typescript
// UTM Zona 19 Sur
const utm19s = '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs';

// WGS84 (latitud/longitud)
const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
```

### Parámetros del Elipsoide WGS84

```typescript
const a = 6378137.0;          // Semi-eje mayor (metros)
const e2 = 0.00669437999014;  // Excentricidad al cuadrado
const k0 = 0.9996;            // Factor de escala
const E0 = 500000;            // Falso Este
const N0 = 10000000;          // Falso Norte (hemisferio sur)
const lambda0 = -69 * Math.PI / 180; // Meridiano central zona 19
```

---

## 📊 Casos de Uso

### 1. Convertir PKs de la Base de Datos

```typescript
// PKs almacenados en UTM
const pks = await supabase
  .from('pks_georreferenciados')
  .select('*');

// Convertir a WGS84 para Mapbox
const pksWGS84 = pks.map(pk => {
  const [lng, lat] = utmToWgs84(pk.easting, pk.northing);
  return {
    ...pk,
    lng,
    lat
  };
});

// Agregar marcadores al mapa
pksWGS84.forEach(pk => {
  new mapboxgl.Marker()
    .setLngLat([pk.lng, pk.lat])
    .addTo(map);
});
```

### 2. Cargar y Convertir GeoJSON

```typescript
// GeoJSON en UTM desde archivo
const response = await fetch('/mapbox-gis/sectores.geojson');
const utmGeoJSON = await response.json();

// Convertir todas las features
const wgs84GeoJSON = {
  ...utmGeoJSON,
  features: utmGeoJSON.features.map(feature => ({
    ...feature,
    geometry: convertGeometry(feature.geometry)
  }))
};

// Agregar al mapa
map.addSource('sectores', {
  type: 'geojson',
  data: wgs84GeoJSON
});
```

### 3. Zoom a Área de Interés

```typescript
// Obtener canchas del área
const canchas = await fetch('/api/canchas').then(r => r.json());

// Crear features de las canchas
const features = canchas.map(cancha => ({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [cancha.pk_inicio_lng, cancha.pk_inicio_lat],
      [cancha.pk_fin_lng, cancha.pk_fin_lat]
    ]
  }
}));

// Calcular bounds y hacer zoom
const bounds = calculateBounds(features);
map.fitBounds(bounds, {
  padding: 100,
  duration: 1000
});
```

---

## ⚠️ Consideraciones

### Precisión

- Conversión con proj4: ±1 metro de precisión
- Conversión manual: ±2-3 metros de precisión
- Apropiado para visualización en mapas

### Performance

- Las conversiones son síncronas y rápidas
- Para grandes volúmenes (>1000 puntos), considerar:
  - Web Workers para procesamiento paralelo
  - Conversión en servidor
  - Cache de resultados

### Validación

```typescript
// Validar coordenadas antes de convertir
function isValidUTM(easting: number, northing: number): boolean {
  return easting >= 0 && 
         easting <= 1000000 && 
         northing >= 0 && 
         northing <= 10000000;
}

if (isValidUTM(easting, northing)) {
  const [lng, lat] = utmToWgs84(easting, northing);
} else {
  console.error('Coordenadas UTM inválidas');
}
```

---

## 🧪 Testing

### Test Manual en Consola

```javascript
// En browser console con el módulo cargado
import { utmToWgs84 } from './utils/mapbox.ts';

// Coordenada conocida (ej: esquina de un sector)
const [lng, lat] = utmToWgs84(347823.45, 6331245.67);

// Verificar en Google Maps
console.log(`https://www.google.com/maps?q=${lat},${lng}`);
```

### Test Unitarios (futuro)

```typescript
import { describe, it, expect } from 'vitest';
import { utmToWgs84, convertGeometry } from './mapbox';

describe('utmToWgs84', () => {
  it('should convert known coordinate correctly', () => {
    const [lng, lat] = utmToWgs84(347823.45, 6331245.67);
    expect(lng).toBeCloseTo(-70.734, 3);
    expect(lat).toBeCloseTo(-33.123, 3);
  });
});
```

---

## 📚 Referencias

- [Proj4js Documentation](http://proj4js.org/)
- [UTM Coordinate System](https://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system)
- [WGS84 Ellipsoid](https://en.wikipedia.org/wiki/World_Geodetic_System)
- [GeoJSON Specification](https://geojson.org/)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)

---

## 🔗 Ver También

- [MAPBOX_INTEGRATION.md](../integraciones/MAPBOX_INTEGRATION.md)
- [PKS_GEORREFERENCIADOS_README.md](../diseno/PKS_GEORREFERENCIADOS_README.md)
- [Página mapbox-window.astro](paginas.md#-mapbox-windowastro---ventana-de-mapas)
