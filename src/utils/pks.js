// =====================================================
// MÓDULO DE PKs GEORREFERENCIADOS
// =====================================================

export async function initializePKsModule(mapInstance) {
    let map = mapInstance;

    // Cargar PKs desde la API con visualización moderna y dinámica
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

            // Función para determinar color según estado
            const getColorByState = (pk) => {
                // Prioridad: Revancha > Ancho > Coronamiento > Lama
                if (pk.revancha && pk.revancha > 0) {
                    // Rojo para revancha crítica
                    if (pk.revancha >= 3) return '#ef4444'; // Rojo intenso
                    if (pk.revancha >= 2) return '#f97316'; // Naranja
                    return '#fbbf24'; // Amarillo
                }
                if (pk.ancho && pk.ancho > 0) return '#3b82f6'; // Azul
                if (pk.coronamiento && pk.coronamiento > 0) return '#8b5cf6'; // Púrpura
                if (pk.lama && pk.lama > 0) return '#06b6d4'; // Cyan
                return '#10b981'; // Verde por defecto (OK)
            };

            // Crear features con propiedades de color
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
                    descripcion: pk.descripcion || '',
                    revancha: pk.revancha || 0,
                    ancho: pk.ancho || 0,
                    coronamiento: pk.coronamiento || 0,
                    lama: pk.lama || 0,
                    color: getColorByState(pk)
                }
            }));

            // Ordenar features por PK para crear líneas de conexión
            const sortedFeatures = [...features].sort((a, b) => {
                if (a.properties.muro !== b.properties.muro) {
                    return a.properties.muro.localeCompare(b.properties.muro);
                }
                return parseInt(a.properties.pk) - parseInt(b.properties.pk);
            });

            // Crear líneas de conexión entre PKs consecutivos del mismo muro
            const lineFeatures = [];
            for (let i = 0; i < sortedFeatures.length - 1; i++) {
                const current = sortedFeatures[i];
                const next = sortedFeatures[i + 1];

                // Solo conectar PKs del mismo muro
                if (current.properties.muro === next.properties.muro) {
                    lineFeatures.push({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                current.geometry.coordinates,
                                next.geometry.coordinates
                            ]
                        },
                        properties: {
                            from_pk: current.properties.pk,
                            to_pk: next.properties.pk,
                            from_color: current.properties.color,
                            to_color: next.properties.color,
                            muro: current.properties.muro
                        }
                    });
                }
            }

            const geojson = {
                type: 'FeatureCollection',
                features: features
            };

            const linesGeojson = {
                type: 'FeatureCollection',
                features: lineFeatures
            };

            // Limpiar capas existentes
            if (map.getLayer('pks-labels')) map.removeLayer('pks-labels');
            if (map.getLayer('pks-pulse-outer')) map.removeLayer('pks-pulse-outer');
            if (map.getLayer('pks-pulse-middle')) map.removeLayer('pks-pulse-middle');
            if (map.getLayer('pks-points')) map.removeLayer('pks-points');
            if (map.getLayer('pks-connections')) map.removeLayer('pks-connections');
            if (map.getSource('pks-revanchas')) map.removeSource('pks-revanchas');
            if (map.getSource('pks-lines')) map.removeSource('pks-lines');

            // Agregar fuentes
            map.addSource('pks-revanchas', {
                type: 'geojson',
                data: geojson
            });

            map.addSource('pks-lines', {
                type: 'geojson',
                data: linesGeojson
            });

            // CAPA 1: Líneas de conexión con degradado (más abajo)
            map.addLayer({
                id: 'pks-connections',
                type: 'line',
                source: 'pks-lines',
                paint: {
                    'line-color': ['get', 'from_color'], // Color del punto inicial
                    'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        12, 1.5,
                        16, 3
                    ],
                    'line-opacity': 0.6,
                    'line-blur': 1
                },
                layout: {
                    'visibility': 'none',
                    'line-cap': 'round',
                    'line-join': 'round'
                }
            });

            // CAPA 2: Onda expansiva exterior (más grande, más transparente)
            map.addLayer({
                id: 'pks-pulse-outer',
                type: 'circle',
                source: 'pks-revanchas',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        12, 12,  // Radio ~20m a zoom 12
                        16, 24   // Radio ~20m a zoom 16
                    ],
                    'circle-color': ['get', 'color'],
                    'circle-opacity': 0.15,
                    'circle-blur': 0.8
                },
                layout: {
                    'visibility': 'none'
                }
            });

            // CAPA 3: Onda expansiva media
            map.addLayer({
                id: 'pks-pulse-middle',
                type: 'circle',
                source: 'pks-revanchas',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        12, 8,
                        16, 16
                    ],
                    'circle-color': ['get', 'color'],
                    'circle-opacity': 0.3,
                    'circle-blur': 0.5
                },
                layout: {
                    'visibility': 'none'
                }
            });

            // CAPA 4: Punto central (más brillante y definido)
            map.addLayer({
                id: 'pks-points',
                type: 'circle',
                source: 'pks-revanchas',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        12, 5,
                        16, 10
                    ],
                    'circle-color': ['get', 'color'],
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2.5,
                    'circle-opacity': 1
                },
                layout: {
                    'visibility': 'none'
                }
            });

            // CAPA 5: Etiquetas
            map.addLayer({
                id: 'pks-labels',
                type: 'symbol',
                source: 'pks-revanchas',
                minzoom: 14,
                layout: {
                    'text-field': ['get', 'pk'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                    'text-offset': [0, 2.2],
                    'text-anchor': 'top',
                    'visibility': 'none'
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': ['get', 'color'],
                    'text-halo-width': 2.5,
                    'text-halo-blur': 1
                }
            });

            // Iniciar animación de pulso
            startPulseAnimation();

            setupPKsInteractivity();
            console.log('✅ Capa de PKs configurada con visualización moderna');

        } catch (error) {
            console.error('❌ Error al cargar PKs:', error);
        }
    }

    // Animación de pulso para las ondas expansivas
    function startPulseAnimation() {
        let pulsePhase = 0;

        function animatePulse() {
            if (!map.getLayer('pks-pulse-outer')) return;

            pulsePhase = (pulsePhase + 0.02) % 1;

            // Animar opacidad de las ondas con efecto sinusoidal
            const opacity1 = 0.15 + Math.sin(pulsePhase * Math.PI * 2) * 0.1;
            const opacity2 = 0.3 + Math.sin((pulsePhase + 0.33) * Math.PI * 2) * 0.15;

            try {
                map.setPaintProperty('pks-pulse-outer', 'circle-opacity', opacity1);
                map.setPaintProperty('pks-pulse-middle', 'circle-opacity', opacity2);
            } catch (e) {
                // Capa no visible, ignorar
            }

            requestAnimationFrame(animatePulse);
        }

        animatePulse();
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

            // Determinar estado principal
            let estadoBadge = '';
            if (pk.revancha > 0) {
                const nivel = pk.revancha >= 3 ? 'CRÍTICO' : pk.revancha >= 2 ? 'ALTO' : 'MEDIO';
                estadoBadge = `<span style="background: ${pk.color}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 11px;">⚠️ REVANCHA ${nivel}</span>`;
            } else if (pk.ancho > 0) {
                estadoBadge = `<span style="background: ${pk.color}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 11px;">📏 ANCHO</span>`;
            } else if (pk.coronamiento > 0) {
                estadoBadge = `<span style="background: ${pk.color}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 11px;">👑 CORONAMIENTO</span>`;
            } else if (pk.lama > 0) {
                estadoBadge = `<span style="background: ${pk.color}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 11px;">💧 LAMA</span>`;
            } else {
                estadoBadge = `<span style="background: ${pk.color}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 11px;">✅ OK</span>`;
            }

            const popupHTML = `
        <div style="padding: 12px; min-width: 240px; font-family: 'Inter', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h3 style="margin: 0; color: ${pk.color}; font-size: 18px; font-weight: bold;">
              📍 PK ${pk.pk}
            </h3>
            ${estadoBadge}
          </div>
          
          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">
              <strong style="color: #334155;">Muro:</strong> ${pk.muro}
            </div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <strong>UTM:</strong> ${parseFloat(pk.utm_x).toFixed(2)}, ${parseFloat(pk.utm_y).toFixed(2)}<br>
              <strong>Coord:</strong> ${parseFloat(pk.lat).toFixed(6)}°, ${parseFloat(pk.lon).toFixed(6)}°
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
            <div style="background: ${pk.revancha > 0 ? '#fef2f2' : '#f9fafb'}; padding: 6px; border-radius: 6px; border-left: 3px solid ${pk.revancha > 0 ? '#ef4444' : '#e5e7eb'};">
              <strong style="color: #64748b;">Revancha:</strong> <span style="color: ${pk.revancha > 0 ? '#ef4444' : '#94a3b8'}; font-weight: bold;">${pk.revancha || 0}</span>
            </div>
            <div style="background: ${pk.ancho > 0 ? '#eff6ff' : '#f9fafb'}; padding: 6px; border-radius: 6px; border-left: 3px solid ${pk.ancho > 0 ? '#3b82f6' : '#e5e7eb'};">
              <strong style="color: #64748b;">Ancho:</strong> <span style="color: ${pk.ancho > 0 ? '#3b82f6' : '#94a3b8'}; font-weight: bold;">${pk.ancho || 0}</span>
            </div>
            <div style="background: ${pk.coronamiento > 0 ? '#faf5ff' : '#f9fafb'}; padding: 6px; border-radius: 6px; border-left: 3px solid ${pk.coronamiento > 0 ? '#8b5cf6' : '#e5e7eb'};">
              <strong style="color: #64748b;">Coronamiento:</strong> <span style="color: ${pk.coronamiento > 0 ? '#8b5cf6' : '#94a3b8'}; font-weight: bold;">${pk.coronamiento || 0}</span>
            </div>
            <div style="background: ${pk.lama > 0 ? '#ecfeff' : '#f9fafb'}; padding: 6px; border-radius: 6px; border-left: 3px solid ${pk.lama > 0 ? '#06b6d4' : '#e5e7eb'};">
              <strong style="color: #64748b;">Lama:</strong> <span style="color: ${pk.lama > 0 ? '#06b6d4' : '#94a3b8'}; font-weight: bold;">${pk.lama || 0}</span>
            </div>
          </div>
          
          ${pk.descripcion ? `<div style="margin-top: 10px; padding: 8px; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 6px; font-size: 12px; color: #92400e; font-style: italic;">${pk.descripcion}</div>` : ''}
        </div>
      `;

            new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: true,
                maxWidth: '320px'
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
                        map.setLayoutProperty('pks-connections', 'visibility', 'visible');
                        map.setLayoutProperty('pks-pulse-outer', 'visibility', 'visible');
                        map.setLayoutProperty('pks-pulse-middle', 'visibility', 'visible');
                        map.setLayoutProperty('pks-points', 'visibility', 'visible');
                        map.setLayoutProperty('pks-labels', 'visibility', 'visible');
                    }
                }, 1500);
                return;
            }

            const visibility = visible ? 'visible' : 'none';

            // Controlar todas las capas: líneas, ondas, puntos y etiquetas
            if (map.getLayer('pks-connections')) {
                map.setLayoutProperty('pks-connections', 'visibility', visibility);
            }
            if (map.getLayer('pks-pulse-outer')) {
                map.setLayoutProperty('pks-pulse-outer', 'visibility', visibility);
            }
            if (map.getLayer('pks-pulse-middle')) {
                map.setLayoutProperty('pks-pulse-middle', 'visibility', visibility);
            }
            map.setLayoutProperty('pks-points', 'visibility', visibility);
            map.setLayoutProperty('pks-labels', 'visibility', visibility);

            console.log(`✅ PKs ${visible ? 'mostrados' : 'ocultados'} con efectos visuales`);
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
