import { CanchaService } from '../../lib/supabase'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ url }) => {
  try {
    const idsParam = url.searchParams.get('ids')
    let canchas = await CanchaService.obtenerCanchas()

    // Filter by IDs if provided
    if (idsParam) {
      const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      canchas = canchas.filter((c: any) => ids.includes(c.id))
    }

    return new Response(JSON.stringify(canchas), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()

    // Verificar si es creación con polígono (AngloAmerican)
    if (body.poligonoCoordinadas) {
      const { muro, sector, nombreDetalle, poligonoCoordinadas } = body

      if (!muro || !sector || !nombreDetalle || !poligonoCoordinadas) {
        return new Response(JSON.stringify({ message: 'Faltan datos requeridos para crear cancha con polígono' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const nuevaCancha = await CanchaService.crearCanchaConPoligono(muro, sector, nombreDetalle, poligonoCoordinadas)
      return new Response(JSON.stringify(nuevaCancha), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      // Creación normal (sin polígono)
      const { muro, sector, nombreDetalle } = body

      if (!muro || !sector || !nombreDetalle) {
        return new Response(JSON.stringify({ message: 'Faltan datos requeridos' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const cancha = await CanchaService.crearCancha(muro, sector, nombreDetalle)
      return new Response(JSON.stringify(cancha), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}