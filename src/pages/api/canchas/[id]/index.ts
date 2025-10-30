import { CanchaService } from '../../../../lib/supabase'
import type { APIRoute } from 'astro'

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

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const canchaId = parseInt(params.id!)
    const { accion, observaciones } = await request.json()
    
    console.log('Acción recibida:', accion) // Debug
    console.log('Observaciones:', observaciones) // Debug
    
    if (!canchaId || !accion) {
      return new Response(JSON.stringify({ message: 'Faltan datos requeridos' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    
    switch (accion) {
      case 'enviar-besalco':
        await CanchaService.enviarABesalco(canchaId)
        break
      case 'finalizar-trabajo':
        await CanchaService.finalizarTrabajo(canchaId)
        break
      case 'rechazar-besalco':
        console.log('Ejecutando rechazo por Besalco...') // Debug
        await CanchaService.rechazarBesalco(canchaId, observaciones)
        break
      case 'validar-linkapsis':
        await CanchaService.validarLinkapsis(canchaId, true, observaciones)
        break
      case 'rechazar-linkapsis':
        await CanchaService.validarLinkapsis(canchaId, false, observaciones)
        break
      case 'validar-llayllay':
        await CanchaService.validarLlayLlay(canchaId, true, observaciones)
        break
      case 'rechazar-llayllay':
        await CanchaService.validarLlayLlay(canchaId, false, observaciones)
        break
      case 'cerrar':
        await CanchaService.cerrarCancha(canchaId)
        break
      default:
        console.log('Acción no reconocida:', accion) // Debug
        return new Response(JSON.stringify({ message: 'Acción no válida: ' + accion }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        })
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Error en API:', error) // Debug
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}