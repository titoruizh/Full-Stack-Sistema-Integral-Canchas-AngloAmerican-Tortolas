// =====================================================
// API ENDPOINT: Obtener Fotos de una Cancha
// GET /api/canchas/[id]/fotos
// =====================================================
// Obtiene todas las fotos de una cancha organizadas por empresa
// Útil para generar reportes PDF completos
// Fecha: 2025-12-22
// =====================================================

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
    try {
        const canchaId = parseInt(params.id!);

        if (isNaN(canchaId)) {
            return new Response(JSON.stringify({ error: 'ID de cancha inválido' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`🔍 Obteniendo todas las fotos de cancha ${canchaId}`);

        // Usar la vista de reportes para obtener información completa
        const { data: fotos, error } = await supabase
            .from('vista_fotos_reporte')
            .select('*')
            .eq('cancha_id', canchaId)
            .order('empresa_id', { ascending: true })
            .order('fecha_validacion', { ascending: true })
            .order('foto_orden', { ascending: true });

        if (error) {
            console.error('❌ Error obteniendo fotos:', error);
            return new Response(JSON.stringify({
                error: 'Error al obtener fotos',
                detalles: error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Agrupar fotos por empresa
        const fotosPorEmpresa = {
            Besalco: fotos?.filter(f => f.empresa_nombre === 'Besalco') || [],
            Linkapsis: fotos?.filter(f => f.empresa_nombre === 'Linkapsis') || [],
            LlayLlay: fotos?.filter(f => f.empresa_nombre === 'LlayLlay') || []
        };

        console.log(`✅ Fotos encontradas - Besalco: ${fotosPorEmpresa.Besalco.length}, Linkapsis: ${fotosPorEmpresa.Linkapsis.length}, LlayLlay: ${fotosPorEmpresa.LlayLlay.length}`);

        return new Response(JSON.stringify({
            cancha_id: canchaId,
            total_fotos: fotos?.length || 0,
            fotos_por_empresa: fotosPorEmpresa,
            todas_las_fotos: fotos || []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Error inesperado en GET /api/canchas/[id]/fotos:', error);
        return new Response(JSON.stringify({
            error: 'Error interno del servidor',
            detalles: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
