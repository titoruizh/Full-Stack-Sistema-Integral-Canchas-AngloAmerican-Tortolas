import type { APIRoute } from 'astro'
import { supabase } from '../../../../lib/supabase'
import fs from 'fs'
import path from 'path'

export const GET: APIRoute = async ({ params, request }) => {
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

    // Obtener las validaciones (que contienen las mediciones)
    const { data: validaciones, error: errorValidaciones } = await supabase
      .from('validaciones')
      .select('*')
      .eq('cancha_id', id)
      .order('created_at', { ascending: false })

    if (errorValidaciones) {
      console.error('Error al obtener validaciones:', errorValidaciones)
      return new Response(
        JSON.stringify({ error: 'Error al obtener validaciones' }), 
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
    function extraerDatosParaTemplate(cancha: any, validaciones: any[] = []) {
      // Buscar validaciones específicas
      const validacionLinkapsis = validaciones.find(v => v.empresa === 'Linkapsis')
      const validacionLlayLlay = validaciones.find(v => v.empresa === 'LlayLlay')
      const validacionBesalco = validaciones.find(v => v.empresa === 'Besalco')
      
      // Extraer datos de mediciones de las validaciones
      const medicionLinkapsis = validacionLinkapsis?.mediciones || {}
      const medicionLlayLlay = validacionLlayLlay?.mediciones || {}
      const coordenadas = medicionLinkapsis.coordenadas || {}

      return {
        // Datos básicos de la cancha
        NUMERO_INFORME: cancha.numero_informe || '',
        UBICACION: cancha.nombre || '',
        EMPRESA: cancha.empresa_actual || '',
        FECHA_VALIDACION: cancha.updated_at ? 
          new Date(cancha.updated_at).toLocaleDateString('es-ES') : '',
        ESTADO: cancha.estado_actual || '',
        OBSERVACIONES: cancha.observaciones || '',
        
        // Datos de mediciones Linkapsis
        DENSIDAD: medicionLlayLlay.densidad || '',
        FIBRA_SINTETICA: medicionLinkapsis.fibra_sintetica || '',
        SHOCK_PAD: medicionLinkapsis.shock_pad || '',
        
        // Coordenadas (de Linkapsis)
        X1: coordenadas.p1?.este || '',
        Y1: coordenadas.p1?.norte || '',
        X2: coordenadas.p2?.este || '',
        Y2: coordenadas.p2?.norte || '',
        X3: coordenadas.p3?.este || '',
        Y3: coordenadas.p3?.norte || '',
        X4: coordenadas.p4?.este || '',
        Y4: coordenadas.p4?.norte || '',
        X5: coordenadas.p5?.este || '',
        Y5: coordenadas.p5?.norte || '',
        X6: coordenadas.p6?.este || '',
        Y6: coordenadas.p6?.norte || '',
        
        // Tipos de trabajo (de Linkapsis)
        MANTENIMIENTO: medicionLinkapsis.tipoTrabajo?.includes('mantenimiento') ? 'X' : '',
        CERTIFICACION: medicionLinkapsis.tipoTrabajo?.includes('certificacion') ? 'X' : '',
        EVALUACION: medicionLinkapsis.tipoTrabajo?.includes('evaluacion') ? 'X' : '',
        
        // Fechas y otros
        FECHA_HOY: new Date().toLocaleDateString('es-ES'),
        USUARIO: 'Sistema'
      }
    }

    // Procesar el template
    const datosTemplate = extraerDatosParaTemplate(cancha, validaciones)
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