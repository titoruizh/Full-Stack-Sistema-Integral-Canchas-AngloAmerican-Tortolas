// =====================================================
// API ENDPOINT: PKs Georreferenciados
// GET /api/pks - Obtener PKs maestros con coordenadas
// Fecha: 2025-12-05
// =====================================================

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

/**
 * GET /api/pks
 * Query params:
 *   - muro: 'Principal' | 'Este' | 'Oeste' (opcional)
 *   - activo: 'true' | 'false' (default: true)
 *   - formato: 'geojson' | 'json' (default: json)
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const muro = url.searchParams.get('muro');
    const activo = url.searchParams.get('activo') !== 'false';
    const formato = url.searchParams.get('formato') || 'json';

    console.log('📍 GET /api/pks - Params:', { muro, activo, formato });

    // Construir query
    let query = supabase
      .from('pks_maestro')
      .select('*')
      .eq('activo', activo)
      .order('muro')
      .order('pk');

    // Filtrar por muro si se especifica
    if (muro) {
      query = query.eq('muro', muro);
    }

    const { data: pks, error } = await query;

    if (error) {
      console.error('❌ Error al consultar pks_maestro:', error);
      return new Response(
        JSON.stringify({
          error: 'Error al consultar PKs',
          detalles: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ PKs encontrados: ${pks?.length || 0}`);

    // Devolver en formato GeoJSON si se solicita
    if (formato === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: pks.map((pk) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [pk.lon, pk.lat], // [longitude, latitude]
          },
          properties: {
            id: pk.id,
            muro: pk.muro,
            pk: pk.pk,
            utm_x: pk.utm_x,
            utm_y: pk.utm_y,
            descripcion: pk.descripcion,
          },
        })),
      };

      return new Response(JSON.stringify(geojson), {
        status: 200,
        headers: { 'Content-Type': 'application/geo+json' },
      });
    }

    // Devolver JSON normal
    return new Response(JSON.stringify(pks), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error inesperado en GET /api/pks:', error);
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
        detalles: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
