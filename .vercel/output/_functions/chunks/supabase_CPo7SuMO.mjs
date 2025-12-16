import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://chzlwqxjdcydnndrnfjk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoemx3cXhqZGN5ZG5uZHJuZmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjQxMDMsImV4cCI6MjA3NjEwMDEwM30.uyI7C2j8yz1WqAWXft4cbZTBdliJlYVhHv4oL1Nthxo";
const supabase = createClient(supabaseUrl, supabaseKey);
class CanchaService {
  // Registrar transición de estado
  static async registrarTransicion(canchaId, estadoAnteriorId, estadoNuevoId, empresaAnteriorId, empresaNuevaId, accion, observaciones, usuarioId) {
    const { error } = await supabase.from("transiciones_estado").insert({
      cancha_id: canchaId,
      estado_anterior_id: estadoAnteriorId,
      estado_nuevo_id: estadoNuevoId,
      empresa_anterior_id: empresaAnteriorId,
      empresa_nueva_id: empresaNuevaId,
      accion,
      observaciones,
      usuario_id: usuarioId
    });
    if (error) {
      console.error("Error al registrar transición:", error);
    }
  }
  // Obtener todas las canchas con información completa
  static async obtenerCanchas() {
    const { data, error } = await supabase.from("vista_canchas_completa").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  // Obtener próximo número de informe
  static async obtenerProximoNumeroInforme() {
    const { data: contador, error: errorGet } = await supabase.from("contador_informes").select("ultimo_numero").single();
    if (errorGet && errorGet.code === "PGRST116") {
      const { data, error: errorInsert } = await supabase.from("contador_informes").insert({ ultimo_numero: 5e3 }).select().single();
      if (errorInsert) throw errorInsert;
      return 5001;
    }
    if (errorGet) throw errorGet;
    const nuevoNumero = contador.ultimo_numero + 1;
    const { error: errorUpdate } = await supabase.from("contador_informes").update({ ultimo_numero: nuevoNumero }).eq("id", 1);
    if (errorUpdate) throw errorUpdate;
    return nuevoNumero;
  }
  // Crear nueva cancha
  static async crearCancha(muro, sector, nombreDetalle) {
    const nombre = `${muro}_${sector}_${nombreDetalle}`;
    const numeroInforme = await this.obtenerProximoNumeroInforme();
    const { data, error } = await supabase.from("canchas").insert({
      nombre,
      muro,
      sector,
      nombre_detalle: nombreDetalle,
      estado_actual_id: 1,
      // Creada
      empresa_actual_id: 1,
      // AngloAmerican
      created_by: 1,
      numero_informe: numeroInforme
    }).select().single();
    if (error) throw error;
    await this.registrarTransicion(
      data.id,
      null,
      // No hay estado anterior
      1,
      // Estado nuevo: Creada
      null,
      // No hay empresa anterior
      1,
      // AngloAmerican
      "crear_cancha",
      `Cancha creada: ${nombre}`,
      1
      // Usuario por defecto
    );
    return data;
  }
  // Crear nueva cancha con polígono (para AngloAmerican)
  static async crearCanchaConPoligono(muro, sector, nombreDetalle, poligonoCoordinadas) {
    const nombre = `${muro}_${sector}_${nombreDetalle}`;
    const numeroInforme = await this.obtenerProximoNumeroInforme();
    const { data, error } = await supabase.from("canchas").insert({
      nombre,
      muro,
      sector,
      nombre_detalle: nombreDetalle,
      estado_actual_id: 1,
      // Creada
      empresa_actual_id: 1,
      // AngloAmerican
      created_by: 1,
      numero_informe: numeroInforme,
      poligono_coordenadas: poligonoCoordinadas
    }).select().single();
    if (error) throw error;
    await this.registrarTransicion(
      data.id,
      null,
      1,
      null,
      1,
      "crear_cancha_con_poligono",
      `Cancha creada con polígono: ${nombre}`,
      1
    );
    return data;
  }
  // Enviar cancha a Besalco
  static async enviarABesalco(canchaId) {
    const { data: canchaActual } = await supabase.from("canchas").select("estado_actual_id, empresa_actual_id").eq("id", canchaId).single();
    const { error } = await supabase.from("canchas").update({
      estado_actual_id: 7,
      // En Espera (nuevo estado)
      empresa_actual_id: 2
      // Besalco
    }).eq("id", canchaId);
    if (error) throw error;
    await this.registrarTransicion(
      canchaId,
      canchaActual?.estado_actual_id || null,
      7,
      canchaActual?.empresa_actual_id || null,
      2,
      "enviar_besalco",
      "Cancha enviada a Besalco para trabajo de maquinaria"
    );
  }
  // Tomar trabajo (cambiar de "En Espera" a "En Proceso")
  static async tomarTrabajo(canchaId, empresa) {
    const { data: cancha, error: errorGet } = await supabase.from("canchas").select("estado_actual_id, empresa_actual_id").eq("id", canchaId).single();
    if (errorGet) throw errorGet;
    if (cancha.estado_actual_id !== 7 && cancha.estado_actual_id !== 8) {
      throw new Error("La cancha no está en estado de espera");
    }
    const { error } = await supabase.from("canchas").update({
      estado_actual_id: 2
      // En Proceso
      // empresa_actual_id no cambia, permanece la misma
    }).eq("id", canchaId);
    if (error) throw error;
    await this.registrarTransicion(
      canchaId,
      cancha.estado_actual_id,
      2,
      cancha.empresa_actual_id,
      cancha.empresa_actual_id,
      // Misma empresa
      "tomar_trabajo",
      `${empresa} toma el trabajo - cambio a En Proceso`
    );
    console.log(`Trabajo tomado por ${empresa}: cancha ${canchaId} ahora en estado En Proceso (2)`);
  }
  // Finalizar trabajo de Besalco (MÉTODO DEPRECADO - usar finalizarBesalco)
  static async finalizarTrabajo(canchaId) {
    console.warn("DEPRECADO: Usar finalizarBesalco() en lugar de finalizarTrabajo()");
    const { error } = await supabase.from("canchas").update({
      estado_actual_id: 7,
      // En Espera
      empresa_actual_id: 3
      // Linkapsis (siguiente en el flujo)
    }).eq("id", canchaId);
    if (error) throw error;
  }
  // Rechazar por Besalco (nueva función)
  static async rechazarBesalco(canchaId, observaciones) {
    const { data: canchaActual } = await supabase.from("canchas").select("estado_actual_id, empresa_actual_id").eq("id", canchaId).single();
    const { error } = await supabase.from("canchas").update({
      estado_actual_id: 8,
      // Rechazada, en Espera
      empresa_actual_id: 1
      // AngloAmerican
    }).eq("id", canchaId);
    if (error) throw error;
    await supabase.from("validaciones").insert({
      cancha_id: canchaId,
      empresa_validadora_id: 2,
      // Besalco
      tipo_validacion: "trabajo_maquinaria",
      resultado: "rechazada",
      observaciones
    });
    await this.registrarTransicion(
      canchaId,
      canchaActual?.estado_actual_id || null,
      8,
      canchaActual?.empresa_actual_id || null,
      1,
      "rechazar_besalco",
      observaciones || "Cancha rechazada por Besalco"
    );
  }
  static async finalizarBesalco(canchaId, observaciones, usuario) {
    const { data: canchaActual } = await supabase.from("canchas").select("estado_actual_id, empresa_actual_id").eq("id", canchaId).single();
    const { error } = await supabase.from("canchas").update({
      estado_actual_id: 7,
      // En Espera
      empresa_actual_id: 3
      // Linkapsis
    }).eq("id", canchaId);
    if (error) throw error;
    const validacionData = {
      cancha_id: canchaId,
      empresa_validadora_id: 2,
      // Besalco
      tipo_validacion: "trabajo_maquinaria",
      resultado: "validada",
      observaciones
    };
    if (usuario) {
      validacionData.usuario_validador_id = usuario.id;
      validacionData.usuario_validador_nombre = usuario.nombre_completo;
    }
    await supabase.from("validaciones").insert(validacionData);
    await this.registrarTransicion(
      canchaId,
      canchaActual?.estado_actual_id || null,
      7,
      canchaActual?.empresa_actual_id || null,
      3,
      "finalizar_besalco",
      observaciones || "Trabajo de Besalco finalizado, enviado a Linkapsis",
      usuario?.id
    );
  }
  // Validar por Linkapsis
  static async validarLinkapsis(canchaId, validar, observaciones, mediciones, esRevalidacion = false, usuario) {
    const { data: canchaActual } = await supabase.from("canchas").select("estado_actual_id, empresa_actual_id").eq("id", canchaId).single();
    if (validar) {
      await supabase.from("canchas").update({
        estado_actual_id: 7,
        // En Espera
        empresa_actual_id: 4
        // LlayLlay
      }).eq("id", canchaId);
      const validacionData = {
        cancha_id: canchaId,
        empresa_validadora_id: 3,
        // Linkapsis
        tipo_validacion: "espesores",
        resultado: "validada",
        observaciones,
        mediciones,
        is_revalidacion: esRevalidacion
      };
      if (usuario) {
        validacionData.usuario_validador_id = usuario.id;
        validacionData.usuario_validador_nombre = usuario.nombre_completo;
      }
      await supabase.from("validaciones").insert(validacionData);
      await this.registrarTransicion(
        canchaId,
        canchaActual?.estado_actual_id || null,
        7,
        canchaActual?.empresa_actual_id || null,
        4,
        "validar_linkapsis",
        observaciones || "Espesores validados por Linkapsis, enviado a LlayLlay",
        usuario?.id
      );
    } else {
      await supabase.from("canchas").update({
        estado_actual_id: 8,
        // Rechazada, en Espera
        empresa_actual_id: 2
        // Besalco
      }).eq("id", canchaId);
      const rechazoData = {
        cancha_id: canchaId,
        empresa_validadora_id: 3,
        // Linkapsis
        tipo_validacion: "espesores",
        resultado: "rechazada",
        observaciones
      };
      if (usuario) {
        rechazoData.usuario_validador_id = usuario.id;
        rechazoData.usuario_validador_nombre = usuario.nombre_completo;
      }
      await supabase.from("validaciones").insert(rechazoData);
      await this.registrarTransicion(
        canchaId,
        canchaActual?.estado_actual_id || null,
        8,
        canchaActual?.empresa_actual_id || null,
        2,
        "rechazar_linkapsis",
        observaciones || "Espesores rechazados por Linkapsis, devuelto a Besalco",
        usuario?.id
      );
    }
  }
  // Validar por LlayLlay
  static async validarLlayLlay(canchaId, validar, observaciones, mediciones, esRevalidacion = false, usuario) {
    const { data: canchaActual } = await supabase.from("canchas").select("estado_actual_id, empresa_actual_id").eq("id", canchaId).single();
    if (validar) {
      await supabase.from("canchas").update({
        estado_actual_id: 4,
        // Validada (todas las validaciones completas)
        empresa_actual_id: 1
        // AngloAmerican
      }).eq("id", canchaId);
      await this.registrarTransicion(
        canchaId,
        canchaActual?.estado_actual_id || null,
        4,
        canchaActual?.empresa_actual_id || null,
        1,
        "validar_llay_llay",
        observaciones || "Densidad validada por LlayLlay - Cancha completamente validada",
        usuario?.id
      );
    } else {
      await supabase.from("canchas").update({
        estado_actual_id: 8,
        // Rechazada, en Espera
        empresa_actual_id: 2
        // Besalco
      }).eq("id", canchaId);
      await this.registrarTransicion(
        canchaId,
        canchaActual?.estado_actual_id || null,
        8,
        canchaActual?.empresa_actual_id || null,
        2,
        "rechazar_llay_llay",
        observaciones || "Densidad rechazada por LlayLlay, devuelto a Besalco",
        usuario?.id
      );
    }
    const validacionData = {
      cancha_id: canchaId,
      empresa_validadora_id: 4,
      // LlayLlay
      tipo_validacion: "densidad",
      resultado: validar ? "validada" : "rechazada",
      observaciones,
      mediciones,
      is_revalidacion: esRevalidacion
    };
    if (usuario) {
      validacionData.usuario_validador_id = usuario.id;
      validacionData.usuario_validador_nombre = usuario.nombre_completo;
    }
    await supabase.from("validaciones").insert(validacionData);
  }
  // Cerrar cancha (AngloAmerican)
  static async cerrarCancha(canchaId) {
    const { data: canchaActual } = await supabase.from("canchas").select("estado_actual_id, empresa_actual_id").eq("id", canchaId).single();
    const { error } = await supabase.from("canchas").update({
      estado_actual_id: 6
      // Cerrada
    }).eq("id", canchaId);
    if (error) throw error;
    await this.registrarTransicion(
      canchaId,
      canchaActual?.estado_actual_id || null,
      6,
      canchaActual?.empresa_actual_id || null,
      1,
      // AngloAmerican
      "cerrar_cancha",
      "Cancha cerrada por AngloAmerican - proceso completado"
    );
  }
  // Obtener historial de una cancha
  static async obtenerHistorial(canchaId) {
    const { data, error } = await supabase.from("vista_historial_completa").select("*").eq("cancha_id", canchaId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  // Obtener transiciones de estado de una cancha (nuevo timeline completo)
  static async obtenerTransicionesCancha(canchaId) {
    const { data, error } = await supabase.from("vista_transiciones_completa").select("*").eq("cancha_id", canchaId).order("fecha_transicion", { ascending: true });
    if (error) throw error;
    return data || [];
  }
  // Obtener empresas
  static async obtenerEmpresas() {
    const { data, error } = await supabase.from("empresas").select("*").order("id");
    if (error) throw error;
    return data || [];
  }
  // Obtener observaciones de validaciones/rechazos de una cancha
  static async obtenerObservacionesCancha(canchaId) {
    const { data, error } = await supabase.from("validaciones").select(`
        *,
        empresa_validadora:empresas!empresa_validadora_id(nombre)
      `).eq("cancha_id", canchaId).eq("resultado", "rechazada").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  // Obtener historial de validaciones de una cancha
  static async obtenerValidacionesCancha(canchaId) {
    const { data, error } = await supabase.from("validaciones").select(`
        *,
        empresa_validadora:empresas!empresa_validadora_id(nombre)
      `).eq("cancha_id", canchaId).order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }
  // Borrar cancha y todas sus validaciones relacionadas
  static async borrarCancha(canchaId) {
    const { error: errorValidaciones } = await supabase.from("validaciones").delete().eq("cancha_id", canchaId);
    if (errorValidaciones) throw errorValidaciones;
    const { error: errorCancha } = await supabase.from("canchas").delete().eq("id", canchaId);
    if (errorCancha) throw errorCancha;
  }
}

export { CanchaService as C, supabase as s };
