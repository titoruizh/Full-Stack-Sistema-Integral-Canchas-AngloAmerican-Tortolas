import { CanchaService } from '../../../../lib/supabase'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ params }) => {
  try {
    const canchaId = parseInt(params.id!)
    
    if (!canchaId) {
      return new Response(JSON.stringify({ message: 'ID de cancha inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Obtener transiciones de estado (timeline completo)
    const transiciones = await CanchaService.obtenerTransicionesCancha(canchaId)
    
    // Obtener validaciones (detalles técnicos)
    const validaciones = await CanchaService.obtenerValidacionesCancha(canchaId)
    
    return new Response(JSON.stringify({
      transiciones,
      validaciones
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error obteniendo timeline:', error)
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
