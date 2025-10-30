import type { APIRoute } from 'astro'
import { CanchaService } from '../../../lib/supabase'

export const GET: APIRoute = async ({ params }) => {
  try {
    const canchaId = parseInt(params.id!)

    if (!canchaId) {
      return new Response(JSON.stringify({ error: 'ID de cancha requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Obtener todas las canchas y filtrar por ID
    const canchas = await CanchaService.obtenerCanchas()
    const cancha = canchas.find(c => c.id === canchaId)

    if (!cancha) {
      return new Response(JSON.stringify({ error: 'Cancha no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      cancha: cancha 
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