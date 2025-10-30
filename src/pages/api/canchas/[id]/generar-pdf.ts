import type { APIRoute } from 'astro'
import { CanchaService } from '../../../../lib/supabase'
import fs from 'fs'
import path from 'path'

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const canchaId = params.id

    if (!canchaId) {
      return new Response(JSON.stringify({ error: 'ID de cancha requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Obtener datos completos de la cancha usando la API existente
    const response = await fetch(`http://localhost:4324/api/canchas/${canchaId}`)
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Cancha no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { cancha } = await response.json()

    // Verificar que la cancha esté en estado correcto para generar PDF
    if (cancha.estado !== 'EN_PROCESO') {
      return new Response(JSON.stringify({ 
        error: 'La cancha debe estar en estado EN_PROCESO para generar PDF' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verificar que todas las validaciones estén completas
    const validaciones = cancha.validaciones || []
    const hasLinkapsis = validaciones.some((v: any) => v.empresa === 'Linkapsis' && v.estado === 'VALIDADO')
    const hasLlayLlay = validaciones.some((v: any) => v.empresa === 'LlayLlay' && v.estado === 'VALIDADO')
    const hasBesalco = validaciones.some((v: any) => v.empresa === 'Besalco' && v.estado === 'VALIDADO')

    if (!hasLinkapsis || !hasLlayLlay || !hasBesalco) {
      return new Response(JSON.stringify({ 
        error: 'La cancha debe tener todas las validaciones completadas (Besalco, Linkapsis, LlayLlay)' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Leer el template HTML
    const templatePath = path.join(process.cwd(), 'documento.html')
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')

    // Extraer datos para las variables del template
    const datosTemplate = extraerDatosParaTemplate(cancha)

    // Reemplazar variables en el template
    htmlTemplate = reemplazarVariables(htmlTemplate, datosTemplate)

    // Retornar el HTML procesado
    return new Response(JSON.stringify({ 
      success: true, 
      html: htmlTemplate,
      datos: datosTemplate 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error al generar PDF:', error)
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor al generar PDF' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function extraerDatosParaTemplate(cancha: any) {
  const validaciones = cancha.validaciones || []
  
  // Buscar validaciones específicas
  const validacionLinkapsis = validaciones.find((v: any) => v.empresa === 'Linkapsis' && v.estado === 'VALIDADO')
  const validacionLlayLlay = validaciones.find((v: any) => v.empresa === 'LlayLlay' && v.estado === 'VALIDADO')
  const validacionBesalco = validaciones.find((v: any) => v.empresa === 'Besalco' && v.estado === 'VALIDADO')

  // Extraer mediciones de Linkapsis
  const medicionesLinkapsis = validacionLinkapsis?.mediciones || {}
  const coordenadas = medicionesLinkapsis.coordenadas || {}
  const tipoTrabajo = medicionesLinkapsis.tipoTrabajo || []

  // Extraer mediciones de LlayLlay
  const medicionesLlayLlay = validacionLlayLlay?.mediciones || {}

  return {
    // Datos básicos de la cancha
    NUMERO_CN: cancha.numero_informe || 'N/A',
    FECHA_ACTUAL: new Date().toLocaleDateString('es-CL'),
    NOMBRE_CANCHA: cancha.nombre || 'Sin nombre',
    
    // Datos de Linkapsis (Espesores)
    ESPESOR_LK: medicionesLinkapsis.espesor || 'N/A',
    TIPO_TRABAJO_CORTE: tipoTrabajo.includes('corte') ? 'X' : '',
    TIPO_TRABAJO_RELLENO: tipoTrabajo.includes('relleno') ? 'X' : '',
    
    // Coordenadas P1
    P1_N: coordenadas.p1?.norte || 'N/A',
    P1_E: coordenadas.p1?.este || 'N/A',
    P1_C: coordenadas.p1?.cota || 'N/A',
    
    // Coordenadas P2
    P2_N: coordenadas.p2?.norte || 'N/A',
    P2_E: coordenadas.p2?.este || 'N/A',
    P2_C: coordenadas.p2?.cota || 'N/A',
    
    // Coordenadas P3
    P3_N: coordenadas.p3?.norte || 'N/A',
    P3_E: coordenadas.p3?.este || 'N/A',
    P3_C: coordenadas.p3?.cota || 'N/A',
    
    // Coordenadas P4
    P4_N: coordenadas.p4?.norte || 'N/A',
    P4_E: coordenadas.p4?.este || 'N/A',
    P4_C: coordenadas.p4?.cota || 'N/A',
    
    // Datos de LlayLlay (Densidad)
    DENSIDAD_LL: medicionesLlayLlay.densidad || 'N/A',
    
    // Observaciones
    OBS_BESALCO: validacionBesalco?.observaciones || 'Sin observaciones',
    OBS_LINKAPSIS: validacionLinkapsis?.observaciones || 'Sin observaciones',
    OBS_LLAYLLAY: validacionLlayLlay?.observaciones || 'Sin observaciones',
    
    // Fechas
    FECHA_BESALCO: validacionBesalco?.fecha_validacion ? new Date(validacionBesalco.fecha_validacion).toLocaleDateString('es-CL') : 'N/A',
    FECHA_LINKAPSIS: validacionLinkapsis?.fecha_validacion ? new Date(validacionLinkapsis.fecha_validacion).toLocaleDateString('es-CL') : 'N/A',
    FECHA_LLAYLLAY: validacionLlayLlay?.fecha_validacion ? new Date(validacionLlayLlay.fecha_validacion).toLocaleDateString('es-CL') : 'N/A',
    
    // Usuarios validadores
    USUARIO_BESALCO: validacionBesalco?.usuario || 'N/A',
    USUARIO_LINKAPSIS: validacionLinkapsis?.usuario || 'N/A',
    USUARIO_LLAYLLAY: validacionLlayLlay?.usuario || 'N/A'
  }
}

function reemplazarVariables(template: string, datos: Record<string, any>): string {
  let resultado = template
  
  // Reemplazar cada variable en formato {{VARIABLE}}
  Object.keys(datos).forEach(key => {
    const valor = datos[key]
    const regex = new RegExp(`{{${key}}}`, 'g')
    resultado = resultado.replace(regex, String(valor))
  })
  
  return resultado
}