import { supabase } from '../../../lib/supabase'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json()
        const { cancha_id, empresa_validadora_id, observaciones, resultado, tipo_validacion, mediciones } = body

        // Validar campos requeridos
        if (!cancha_id || !empresa_validadora_id || !observaciones || !resultado || !tipo_validacion) {
            return new Response(
                JSON.stringify({
                    error: 'Campos requeridos: cancha_id, empresa_validadora_id, observaciones, resultado, tipo_validacion'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        }

        // Crear validación
        const { data: validacion, error } = await supabase
            .from('validaciones')
            .insert({
                cancha_id,
                empresa_validadora_id,
                tipo_validacion,
                resultado,
                observaciones,
                mediciones: mediciones || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error al crear validación:', error)
            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        }

        return new Response(
            JSON.stringify({ validacion }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            }
        )
    } catch (error: any) {
        console.error('Error en POST /api/validaciones:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        )
    }
}
