import type { APIRoute } from 'astro'
import { supabase } from '../../../../lib/supabase'
import fs from 'fs'
import path from 'path'

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params
  
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'ID de cancha requerido' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Obtener los datos de la cancha
    const { data: cancha, error: errorCancha } = await supabase
      .from('vista_canchas_completa')
      .select('*')
      .eq('id', id)
      .single()

    if (errorCancha || !cancha) {
      return new Response(
        JSON.stringify({ error: 'Cancha no encontrada' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obtener las mediciones
    const { data: mediciones, error: errorMediciones } = await supabase
      .from('mediciones')
      .select('*')
      .eq('cancha_id', id)
      .order('created_at', { ascending: false })

    if (errorMediciones) {
      console.error('Error al obtener mediciones:', errorMediciones)
      return new Response(
        JSON.stringify({ error: 'Error al obtener mediciones' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Leer el template HTML
    const templatePath = path.join(process.cwd(), 'src', 'documento.html')
    let htmlTemplate: string
    
    try {
      htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
    } catch (error) {
      console.error('Error al leer template:', error)
      return new Response(
        JSON.stringify({ error: 'Template no encontrado' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Función para reemplazar variables
    function reemplazarVariables(template: string, datos: any): string {
      return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        const valor = datos[variable]
        return valor !== undefined && valor !== null ? String(valor) : ''
      })
    }

    // Extraer datos para el template
    function extraerDatosParaTemplate(cancha: any, mediciones: any[] = []) {
      const medicion = mediciones.length > 0 ? mediciones[0] : {}
      const coordenadas = medicion.coordenadas || {}

      return {
        // Datos básicos de la cancha
        NUMERO_INFORME: cancha.numero_informe || '',
        UBICACION: cancha.ubicacion || '',
        EMPRESA: cancha.empresa || '',
        FECHA_VALIDACION: cancha.fecha_ultima_validacion ? 
          new Date(cancha.fecha_ultima_validacion).toLocaleDateString('es-ES') : '',
        ESTADO: cancha.estado || '',
        OBSERVACIONES: cancha.observaciones || '',
        
        // Datos de mediciones Linkapsis
        DENSIDAD: medicion.densidad || '',
        FIBRA_SINTETICA: medicion.fibra_sintetica || '',
        SHOCK_PAD: medicion.shock_pad || '',
        
        // Coordenadas
        X1: coordenadas.punto1?.x || '',
        Y1: coordenadas.punto1?.y || '',
        X2: coordenadas.punto2?.x || '',
        Y2: coordenadas.punto2?.y || '',
        X3: coordenadas.punto3?.x || '',
        Y3: coordenadas.punto3?.y || '',
        X4: coordenadas.punto4?.x || '',
        Y4: coordenadas.punto4?.y || '',
        X5: coordenadas.punto5?.x || '',
        Y5: coordenadas.punto5?.y || '',
        X6: coordenadas.punto6?.x || '',
        Y6: coordenadas.punto6?.y || '',
        
        // Tipos de trabajo
        MANTENIMIENTO: medicion.tipo_trabajo?.mantenimiento ? 'X' : '',
        CERTIFICACION: medicion.tipo_trabajo?.certificacion ? 'X' : '',
        EVALUACION: medicion.tipo_trabajo?.evaluacion ? 'X' : '',
        
        // Fechas y otros
        FECHA_HOY: new Date().toLocaleDateString('es-ES'),
        USUARIO: 'Sistema'
      }
    }

    // Procesar el template
    const datosTemplate = extraerDatosParaTemplate(cancha, mediciones)
    const htmlProcesado = reemplazarVariables(htmlTemplate, datosTemplate)

    // Crear HTML completo para la descarga
    const htmlCompleto = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Documento Cancha - ${cancha.numero_informe || id}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            margin: 0;
        }
        @media print { 
            body { margin: 0; }
        }
    </style>
</head>
<body>
    ${htmlProcesado}
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`

    return new Response(htmlCompleto, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="cancha-${cancha.numero_informe || id}.html"`
      }
    })

  } catch (error) {
    console.error('Error al generar PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}