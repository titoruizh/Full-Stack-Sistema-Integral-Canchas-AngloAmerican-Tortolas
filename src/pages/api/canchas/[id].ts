import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const GET: APIRoute = async ({ params }) => {
  try {
    const canchaId = parseInt(params.id!)

    if (!canchaId) {
      return new Response(JSON.stringify({ error: 'ID de cancha requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Consulta directa a la tabla canchas con joins para obtener nombres legibles
    const { data: cancha, error } = await supabase
      .from('canchas')
      .select(`
        *,
        estado_actual:estados_cancha!estado_actual_id(nombre),
        empresa_actual:empresas!empresa_actual_id(nombre),
        creada_por:empresas!created_by(nombre)
      `)
      .eq('id', canchaId)
      .single()

    if (error) {
      console.error('Error de Supabase:', error)
      return new Response(JSON.stringify({ error: 'Cancha no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Formatear la respuesta para que coincida con la estructura esperada
    const canchaFormateada = {
      id: cancha.id,
      nombre: cancha.nombre,
      muro: cancha.muro,
      sector: cancha.sector,
      nombre_detalle: cancha.nombre_detalle,
      estado_actual: cancha.estado_actual?.nombre || 'Sin estado',
      empresa_actual: cancha.empresa_actual?.nombre || 'Sin empresa',
      creada_por: cancha.creada_por?.nombre || 'Sin usuario',
      created_at: cancha.created_at,
      updated_at: cancha.updated_at,
      numero_informe: cancha.numero_informe,
      poligono_coordenadas: cancha.poligono_coordenadas
    }

    console.log('Cancha obtenida:', {
      id: canchaFormateada.id,
      nombre: canchaFormateada.nombre,
      poligono_presente: !!canchaFormateada.poligono_coordenadas,
      poligono_data: canchaFormateada.poligono_coordenadas
    })

    return new Response(JSON.stringify({ 
      success: true, 
      cancha: canchaFormateada 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error al obtener cancha:', error)
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}