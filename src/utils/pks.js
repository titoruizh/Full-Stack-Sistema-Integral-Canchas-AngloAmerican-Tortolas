// =====================================================
// MÓDULO DE PKs GEORREFERENCIADOS
// =====================================================

export async function initializePKsModule(mapInstance) {
    let map = mapInstance;

    // Cargar PKs desde la API
    async function loadPKsLayer(muro = null) {
        try {
            console.log('📍 Cargando PKs georreferenciados...', { muro });

            let apiUrl = '/api/pks';
            if (muro && muro !== '' && muro !== 'todos') {
                apiUrl += `?muro=${muro}`;
            }

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ PKs cargados:', data.total, 'puntos');

            if (!data.success || !data.pks || data.pks.length === 0) {
                console.log('⚠️ No hay PKs disponibles');
                return;
            }

            const features = data.pks.map(pk => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [pk.lon, pk.lat]
                },
                properties: {
                    id: pk.id,
                    pk: pk.pk,
                    muro: pk.muro,
                    utm_x: pk.utm_x,
                    utm_y: pk.utm_y,
                    lat: pk.lat,
                    lon: pk.lon,
                    descripcion: pk.descripcion || ''
                }
            }));

            const geojson = {
                type: 'FeatureCollection',
                features: features
            };

            if (map.getLayer('pks-labels')) map.removeLayer('pks-labels');
            if (map.getLayer('pks-points')) map.removeLayer('pks-points');
            if (map.getSource('pks-revanchas')) map.removeSource('pks-revanchas');

            map.addSource('pks-revanchas', {
                type: 'geojson',
                data: geojson
            });

            map.addLayer({
                id: 'pks-points',
                type: 'circle',
                source: 'pks-revanchas',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        12, 4,
                        16, 8
                    ],
                    'circle-color': '#10b981',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2,
                    'circle-opacity': 0.9
                },
                layout: {
                    'visibility': 'none'
                }
            });

            map.addLayer({
                id: 'pks-labels',
                type: 'symbol',
                source: 'pks-revanchas',
                minzoom: 14,
                layout: {
                    'text-field': ['get', 'pk'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 11,
                    'text-offset': [0, 1.8],
                    'text-anchor': 'top',
                    'visibility': 'none'
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': '#10b981',
                    'text-halo-width': 2,
                    'text-halo-blur': 1
                }
            });

            setupPKsInteractivity();
            console.log('✅ Capa de PKs configurada correctamente');

        } catch (error) {
            console.error('❌ Error al cargar PKs:', error);
        }
    }

    // Configurar interactividad
    function setupPKsInteractivity() {
        map.on('mouseenter', 'pks-points', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'pks-points', () => {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', 'pks-points', async (e) => {
            const pk = e.features[0].properties;
            const mapboxgl = await import('mapbox-gl');

            const popupHTML = `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #10b981; font-size: 16px; font-weight: bold;">
            📍 PK ${pk.pk}
          </h3>
          <div style="font-size: 13px; color: #374151; line-height: 1.6;">
            <strong>Muro:</strong> ${pk.muro}<br>
            <strong>UTM X:</strong> ${parseFloat(pk.utm_x).toFixed(3)}<br>
            <strong>UTM Y:</strong> ${parseFloat(pk.utm_y).toFixed(3)}<br>
            <strong>Lat:</strong> ${parseFloat(pk.lat).toFixed(6)}°<br>
            <strong>Lon:</strong> ${parseFloat(pk.lon).toFixed(6)}°
            ${pk.descripcion ? `<br><br><em>${pk.descripcion}</em>` : ''}
          </div>
        </div>
      `;

            new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: true,
                maxWidth: '300px'
            })
                .setLngLat(e.lngLat)
                .setHTML(popupHTML)
                .addTo(map);
        });

        console.log('✅ Interactividad de PKs configurada');
    }

    // Toggle visibilidad
    function togglePKsVisibility(visible) {
        try {
            if (!map.getLayer('pks-points')) {
                console.log('⚠️ Capa de PKs no existe, cargando...');
                loadPKsLayer();
                setTimeout(() => {
                    if (visible && map.getLayer('pks-points')) {
                        map.setLayoutProperty('pks-points', 'visibility', 'visible');
                        map.setLayoutProperty('pks-labels', 'visibility', 'visible');
                    }
                }, 1500);
                return;
            }

            const visibility = visible ? 'visible' : 'none';
            map.setLayoutProperty('pks-points', 'visibility', visibility);
            map.setLayoutProperty('pks-labels', 'visibility', visibility);

            console.log(`✅ PKs ${visible ? 'mostrados' : 'ocultados'}`);
        } catch (error) {
            console.error('❌ Error al toggle PKs:', error);
        }
    }

    // Listener para mensajes
    window.addEventListener('message', (event) => {
        if (event.data.type === 'toggle-revanchas') {
            const enabled = event.data.enabled;
            console.log('📨 Mensaje recibido: toggle-revanchas =', enabled);
            togglePKsVisibility(enabled);
        }
    });

    // Cargar PKs al inicializar
    await loadPKsLayer();

    return {
        loadPKsLayer,
        togglePKsVisibility
    };
}
