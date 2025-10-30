import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://chzlwqxjdcydnndrnfjk.supabase.co'
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoemx3cXhqZGN5ZG5uZHJuZmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjQxMDMsImV4cCI6MjA3NjEwMDEwM30.uyI7C2j8yz1WqAWXft4cbZTBdliJlYVhHv4oL1Nthxo'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos TypeScript para las tablas
export interface Empresa {
  id: number
  nombre: string
  created_at: string
}

export interface EstadoCancha {
  id: number
  nombre: string
  descripcion: string
  created_at: string
}

export interface Cancha {
  id: number
  nombre: string
  muro: string
  sector: string
  nombre_detalle: string
  estado_actual_id: number
  empresa_actual_id: number
  created_by: number
  created_at: string
  updated_at: string
  numero_informe?: number // Nuevo campo para el número correlativo
}

export interface ContadorInforme {
  id: number
  ultimo_numero: number
  created_at: string
  updated_at: string
}

export interface HistorialCancha {
  id: number
  cancha_id: number
  estado_anterior_id: number
  estado_nuevo_id: number
  empresa_anterior_id: number
  empresa_nueva_id: number
  accion: string
  observaciones?: string
  created_by: number
  created_at: string
}

export interface Validacion {
  id: number
  cancha_id: number
  empresa_validadora_id: number
  tipo_validacion: string
  resultado: string
  observaciones?: string
  mediciones?: MedicionData
  created_at: string
  is_revalidacion?: boolean // Para distinguir primera vs segunda validación
}

// Interfaces para mediciones específicas
export interface MedicionData {
  // Mediciones de Linkapsis
  espesor?: number
  unidad?: string
  coordenadas?: Coordenadas
  tipo_trabajo?: TipoTrabajo
  
  // Mediciones de LlayLlay  
  densidad?: number
  
  // Mediciones legacy (compatibilidad)
  espesores?: number[]
  promedio?: number
}

export interface Coordenadas {
  p1: Punto
  p2: Punto
  p3: Punto
  p4: Punto
}

export interface Punto {
  norte: number
  este: number
  cota: number
}

export interface TipoTrabajo {
  corte: boolean
  relleno: boolean
}

// Vista completa con joins
export interface CanchaCompleta {
  id: number
  nombre: string
  muro: string
  sector: string
  nombre_detalle: string
  estado_actual: string
  empresa_actual: string
  creada_por: string
  created_at: string
  updated_at: string
  numero_informe?: number // Nuevo campo
}

// Funciones auxiliares para el manejo de datos
export class CanchaService {
  // Obtener todas las canchas con información completa
  static async obtenerCanchas(): Promise<CanchaCompleta[]> {
    const { data, error } = await supabase
      .from('vista_canchas_completa')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Obtener próximo número de informe
  static async obtenerProximoNumeroInforme(): Promise<number> {
    // Primero verificar si existe el contador
    const { data: contador, error: errorGet } = await supabase
      .from('contador_informes')
      .select('ultimo_numero')
      .single()
    
    if (errorGet && errorGet.code === 'PGRST116') {
      // No existe contador, crear uno inicial (empezando en 5001)
      const { data, error: errorInsert } = await supabase
        .from('contador_informes')
        .insert({ ultimo_numero: 5000 })
        .select()
        .single()
      
      if (errorInsert) throw errorInsert
      return 5001
    }
    
    if (errorGet) throw errorGet
    
    // Incrementar el contador
    const nuevoNumero = contador.ultimo_numero + 1
    
    const { error: errorUpdate } = await supabase
      .from('contador_informes')
      .update({ ultimo_numero: nuevoNumero })
      .eq('id', 1)
    
    if (errorUpdate) throw errorUpdate
    
    return nuevoNumero
  }

  // Crear nueva cancha
  static async crearCancha(muro: string, sector: string, nombreDetalle: string): Promise<Cancha> {
    const nombre = `${muro}_${sector}_${nombreDetalle}`
    
    // Obtener próximo número de informe
    const numeroInforme = await this.obtenerProximoNumeroInforme()
    
    const { data, error } = await supabase
      .from('canchas')
      .insert({
        nombre,
        muro,
        sector,
        nombre_detalle: nombreDetalle,
        estado_actual_id: 1, // Creada
        empresa_actual_id: 1, // AngloAmerican
        created_by: 1,
        numero_informe: numeroInforme
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Enviar cancha a Besalco
  static async enviarABesalco(canchaId: number): Promise<void> {
    const { error } = await supabase
      .from('canchas')
      .update({
        estado_actual_id: 2, // En Proceso
        empresa_actual_id: 2  // Besalco
      })
      .eq('id', canchaId)
    
    if (error) throw error
  }

  // Finalizar trabajo de Besalco
  static async finalizarTrabajo(canchaId: number): Promise<void> {
    const { error } = await supabase
      .from('canchas')
      .update({
        estado_actual_id: 3, // Finalizada
        empresa_actual_id: 3  // Linkapsis (siguiente en el flujo)
      })
      .eq('id', canchaId)
    
    if (error) throw error
  }

  // Rechazar por Besalco (nueva función)
  static async rechazarBesalco(canchaId: number, observaciones?: string): Promise<void> {
    // Devolver a AngloAmerican con estado rechazada
    const { error } = await supabase
      .from('canchas')
      .update({
        estado_actual_id: 5, // Rechazada
        empresa_actual_id: 1  // AngloAmerican
      })
      .eq('id', canchaId)
    
    if (error) throw error

    // Registrar validación de rechazo
    await supabase
      .from('validaciones')
      .insert({
        cancha_id: canchaId,
        empresa_validadora_id: 2, // Besalco
        tipo_validacion: 'trabajo_maquinaria',
        resultado: 'rechazada',
        observaciones
      })
  }

  static async finalizarBesalco(canchaId: number, observaciones?: string): Promise<void> {
    // Enviar a Linkapsis
    const { error } = await supabase
      .from('canchas')
      .update({
        estado_actual_id: 2, // En Proceso
        empresa_actual_id: 3  // Linkapsis
      })
      .eq('id', canchaId)
    
    if (error) throw error

    // Registrar finalización del trabajo
    await supabase
      .from('validaciones')
      .insert({
        cancha_id: canchaId,
        empresa_validadora_id: 2, // Besalco
        tipo_validacion: 'trabajo_maquinaria',
        resultado: 'validada',
        observaciones
      })
  }

  // Validar por Linkapsis
  static async validarLinkapsis(
    canchaId: number, 
    validar: boolean, 
    observaciones?: string, 
    mediciones?: MedicionData,
    esRevalidacion: boolean = false
  ): Promise<void> {
    if (validar) {
      // Pasar a LlayLlay
      await supabase
        .from('canchas')
        .update({
          estado_actual_id: 2, // En Proceso
          empresa_actual_id: 4  // LlayLlay
        })
        .eq('id', canchaId)
      
      // Guardar validación con mediciones
      await supabase
        .from('validaciones')
        .insert({
          cancha_id: canchaId,
          empresa_validadora_id: 3, // Linkapsis
          tipo_validacion: 'espesores',
          resultado: 'validada',
          observaciones,
          mediciones,
          is_revalidacion: esRevalidacion
        })
    } else {
      // Rechazar y volver a Besalco
      await supabase
        .from('canchas')
        .update({
          estado_actual_id: 5, // Rechazada
          empresa_actual_id: 2  // Besalco
        })
        .eq('id', canchaId)
      
      // Guardar rechazo
      await supabase
        .from('validaciones')
        .insert({
          cancha_id: canchaId,
          empresa_validadora_id: 3, // Linkapsis
          tipo_validacion: 'espesores',
          resultado: 'rechazada',
          observaciones
        })
    }
  }

  // Validar por LlayLlay
  static async validarLlayLlay(
    canchaId: number, 
    validar: boolean, 
    observaciones?: string, 
    mediciones?: MedicionData,
    esRevalidacion: boolean = false
  ): Promise<void> {
    if (validar) {
      // Devolver a AngloAmerican para cierre
      await supabase
        .from('canchas')
        .update({
          estado_actual_id: 2, // En Proceso
          empresa_actual_id: 1  // AngloAmerican
        })
        .eq('id', canchaId)
    } else {
      // Rechazar y volver a Besalco
      await supabase
        .from('canchas')
        .update({
          estado_actual_id: 5, // Rechazada
          empresa_actual_id: 2  // Besalco
        })
        .eq('id', canchaId)
    }

    // Registrar validación con mediciones
    await supabase
      .from('validaciones')
      .insert({
        cancha_id: canchaId,
        empresa_validadora_id: 4, // LlayLlay
        tipo_validacion: 'densidad',
        resultado: validar ? 'validada' : 'rechazada',
        observaciones,
        mediciones,
        is_revalidacion: esRevalidacion
      })
  }

  // Cerrar cancha (AngloAmerican)
  static async cerrarCancha(canchaId: number): Promise<void> {
    const { error } = await supabase
      .from('canchas')
      .update({
        estado_actual_id: 6 // Cerrada
      })
      .eq('id', canchaId)
    
    if (error) throw error
  }

  // Obtener historial de una cancha
  static async obtenerHistorial(canchaId: number) {
    const { data, error } = await supabase
      .from('vista_historial_completa')
      .select('*')
      .eq('cancha_id', canchaId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Obtener empresas
  static async obtenerEmpresas(): Promise<Empresa[]> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('id')
    
    if (error) throw error
    return data || []
  }

  // Obtener observaciones de validaciones/rechazos de una cancha
  static async obtenerObservacionesCancha(canchaId: number) {
    const { data, error } = await supabase
      .from('validaciones')
      .select(`
        *,
        empresa_validadora:empresas!empresa_validadora_id(nombre)
      `)
      .eq('cancha_id', canchaId)
      .eq('resultado', 'rechazada')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Obtener historial de validaciones de una cancha
  static async obtenerValidacionesCancha(canchaId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('validaciones')
      .select(`
        *,
        empresa_validadora:empresas!empresa_validadora_id(nombre)
      `)
      .eq('cancha_id', canchaId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Borrar cancha y todas sus validaciones relacionadas
  static async borrarCancha(canchaId: number): Promise<void> {
    // Primero eliminar todas las validaciones relacionadas
    const { error: errorValidaciones } = await supabase
      .from('validaciones')
      .delete()
      .eq('cancha_id', canchaId)
    
    if (errorValidaciones) throw errorValidaciones

    // Luego eliminar la cancha
    const { error: errorCancha } = await supabase
      .from('canchas')
      .delete()
      .eq('id', canchaId)
    
    if (errorCancha) throw errorCancha
  }
}