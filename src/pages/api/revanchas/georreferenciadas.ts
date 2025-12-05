// =====================================================
// API ENDPOINT: Revanchas Georreferenciadas
// GET /api/revanchas/georreferenciadas - Obtener revanchas con coordenadas
// Fecha: 2025-12-05
// =====================================================

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

/**
 * GET /api/revanchas/georreferenciadas
 * Query params:
 *   - muro: 'Principal' | 'Este' | 'Oeste' (opcional)
 *   - fechaDesde: YYYY-MM-DD (opcional)
 *   - fechaHasta: YYYY-MM-DD (opcional)
 *   - soloUltimas: 'true' | 'false' (default: false)
 *   - formato: 'geojson' | 'json' (default: json)
 *   - limite: número (default: 1000)
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const muro = url.searchParams.get('muro');
    const fechaDesde = url.searchParams.get('fechaDesde');
    const fechaHasta = url.searchParams.get('fechaHasta');
    const soloUltimas = url.searchParams.get('soloUltimas') === 'true';
    const formato = url.searchParams.get('formato') || 'json';
    const limite = parseInt(url.searchParams.get('limite') || '1000');

    console.log('🗺️ GET /api/revanchas/georreferenciadas - Params:', {
      muro,
      fechaDesde,
      fechaHasta,
      soloUltimas,
      formato,
      limite,
    });

    // Seleccionar vista según si queremos solo últimas o todas
    const vistaBase = soloUltimas
      ? 'vista_ultimas_revanchas_geo'
      : 'vista_revanchas_georreferenciadas';

    // Construir query
    let query = supabase
      .from(vistaBase)
      .select('*')
      .eq('tiene_coordenadas', true) // Solo las que tienen lat/lon
      .order('fecha_medicion', { ascending: false })
      .order('pk')
      .limit(limite);

    // Filtrar por muro si se especifica
    if (muro) {
      query = query.eq('archivo_muro', muro);
    }

    // Filtrar por rango de fechas
    if (fechaDesde) {
      query = query.gte('fecha_medicion', fechaDesde);
    }
    if (fechaHasta) {
      query = query.lte('fecha_medicion', fechaHasta);
    }

    const { data: revanchas, error } = await query;

    if (error) {
      console.error('❌ Error al consultar revanchas georreferenciadas:', error);
      return new Response(
        JSON.stringify({
          error: 'Error al consultar revanchas',
          detalles: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Revanchas georreferenciadas encontradas: ${revanchas?.length || 0}`);

    // Devolver en formato GeoJSON si se solicita
    if (formato === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: revanchas.map((r) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [r.lon, r.lat], // [longitude, latitude]
          },
          properties: {
            medicion_id: r.medicion_id,
            archivo_id: r.archivo_id,
            muro: r.archivo_muro,
            sector: r.sector,
            pk: r.pk,
            fecha_medicion: r.fecha_medicion,
            
            // Mediciones
            coronamiento: r.coronamiento,
            revancha: r.revancha,
            lama: r.lama,
            ancho: r.ancho,
            geomembrana: r.geomembrana,
            dist_geo_lama: r.dist_geo_lama,
            dist_geo_coronamiento: r.dist_geo_coronamiento,
            
            // Colores para visualización
            color_revancha: r.color_revancha,
            color_ancho: r.color_ancho,
            color_dist_geo: r.color_dist_geo,
            
            // Metadata
            archivo_nombre: r.archivo_nombre,
            created_at: r.created_at,
          },
        })),
      };

      return new Response(JSON.stringify(geojson), {
        status: 200,
        headers: { 'Content-Type': 'application/geo+json' },
      });
    }

    // Devolver JSON normal
    return new Response(JSON.stringify(revanchas), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error inesperado en GET /api/revanchas/georreferenciadas:', error);
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
        detalles: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
