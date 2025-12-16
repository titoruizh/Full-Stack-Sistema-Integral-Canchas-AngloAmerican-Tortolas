import { s as supabase } from '../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const anteriorId = url.searchParams.get("anteriorId");
    const actualId = url.searchParams.get("actualId");
    const muro = url.searchParams.get("muro");
    if (muro && !anteriorId && !actualId) {
      const { data: archivos, error: errorArchivos } = await supabase.from("revanchas_archivos").select("id, fecha_medicion").eq("muro", muro).order("fecha_medicion", { ascending: false }).limit(2);
      if (errorArchivos || !archivos || archivos.length < 2) {
        return new Response(
          JSON.stringify({
            error: "Se necesitan al menos 2 archivos del mismo muro para comparar"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      return await compararArchivos(archivos[1].id, archivos[0].id);
    }
    if (anteriorId && actualId) {
      return await compararArchivos(parseInt(anteriorId), parseInt(actualId));
    }
    return new Response(
      JSON.stringify({
        error: 'Debes especificar "muro" o ambos "anteriorId" y "actualId"'
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error en GET /api/revanchas/comparar:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        detalles: error instanceof Error ? error.message : "Error desconocido"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
async function compararArchivos(anteriorId, actualId) {
  const { data: anterior, error: errorAnterior } = await supabase.from("revanchas_archivos").select("*").eq("id", anteriorId).single();
  const { data: actual, error: errorActual } = await supabase.from("revanchas_archivos").select("*").eq("id", actualId).single();
  if (errorAnterior || errorActual || !anterior || !actual) {
    return new Response(
      JSON.stringify({ error: "Uno o ambos archivos no encontrados" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
  if (anterior.muro !== actual.muro) {
    return new Response(
      JSON.stringify({
        error: "Los archivos deben ser del mismo muro",
        detalles: { anterior: anterior.muro, actual: actual.muro }
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const { data: medicionesAnterior } = await supabase.from("revanchas_mediciones").select("*").eq("archivo_id", anteriorId).order("sector").order("pk");
  const { data: medicionesActual } = await supabase.from("revanchas_mediciones").select("*").eq("archivo_id", actualId).order("sector").order("pk");
  if (!medicionesAnterior || !medicionesActual) {
    return new Response(
      JSON.stringify({ error: "Error al obtener mediciones" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  const mapaAnterior = new Map(
    medicionesAnterior.map((m) => [`${m.sector}-${m.pk}`, m])
  );
  const UMBRAL_REVANCHA = 0.3;
  const UMBRAL_ANCHO = 1;
  const UMBRAL_CORONAMIENTO = 0.5;
  const comparaciones = medicionesActual.map((actual2) => {
    const clave = `${actual2.sector}-${actual2.pk}`;
    const anterior2 = mapaAnterior.get(clave);
    if (!anterior2) {
      return {
        sector: actual2.sector,
        pk: actual2.pk,
        estado: "NUEVO",
        mensaje: "Punto no existía en medición anterior"
      };
    }
    const diffRevancha = actual2.revancha !== null && anterior2.revancha !== null ? actual2.revancha - anterior2.revancha : null;
    const diffAncho = actual2.ancho !== null && anterior2.ancho !== null ? actual2.ancho - anterior2.ancho : null;
    const diffCoronamiento = actual2.coronamiento !== null && anterior2.coronamiento !== null ? actual2.coronamiento - anterior2.coronamiento : null;
    const alertaRevancha = diffRevancha !== null && Math.abs(diffRevancha) > UMBRAL_REVANCHA;
    const alertaAncho = diffAncho !== null && Math.abs(diffAncho) > UMBRAL_ANCHO;
    const alertaCoronamiento = diffCoronamiento !== null && Math.abs(diffCoronamiento) > UMBRAL_CORONAMIENTO;
    return {
      sector: actual2.sector,
      pk: actual2.pk,
      anterior: {
        revancha: anterior2.revancha,
        ancho: anterior2.ancho,
        coronamiento: anterior2.coronamiento
      },
      actual: {
        revancha: actual2.revancha,
        ancho: actual2.ancho,
        coronamiento: actual2.coronamiento
      },
      diferencias: {
        revancha: diffRevancha,
        ancho: diffAncho,
        coronamiento: diffCoronamiento
      },
      alertas: {
        revancha: alertaRevancha,
        ancho: alertaAncho,
        coronamiento: alertaCoronamiento
      },
      tieneAlertas: alertaRevancha || alertaAncho || alertaCoronamiento
    };
  }).filter((c) => c !== null);
  const totalPuntos = comparaciones.length;
  const puntosConAlertas = comparaciones.filter((c) => c.tieneAlertas).length;
  const alertasRevancha = comparaciones.filter((c) => c.alertas?.revancha).length;
  const alertasAncho = comparaciones.filter((c) => c.alertas?.ancho).length;
  const alertasCoronamiento = comparaciones.filter((c) => c.alertas?.coronamiento).length;
  return new Response(
    JSON.stringify({
      success: true,
      metadata: {
        anterior: {
          id: anterior.id,
          muro: anterior.muro,
          fecha: anterior.fecha_medicion,
          archivo: anterior.archivo_nombre
        },
        actual: {
          id: actual.id,
          muro: actual.muro,
          fecha: actual.fecha_medicion,
          archivo: actual.archivo_nombre
        }
      },
      resumen: {
        totalPuntos,
        puntosConAlertas,
        alertasPorTipo: {
          revancha: alertasRevancha,
          ancho: alertasAncho,
          coronamiento: alertasCoronamiento
        },
        umbrales: {
          revancha: UMBRAL_REVANCHA,
          ancho: UMBRAL_ANCHO,
          coronamiento: UMBRAL_CORONAMIENTO
        }
      },
      comparaciones
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
const POST = async ({ request }) => {
  try {
    const { anteriorId, actualId } = await request.json();
    if (!anteriorId || !actualId) {
      return new Response(
        JSON.stringify({ error: "anteriorId y actualId son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const response = await compararArchivos(anteriorId, actualId);
    const responseData = await response.json();
    if (!responseData.success) {
      return response;
    }
    const comparaciones = responseData.comparaciones.filter((c) => c.estado !== "NUEVO").map((c) => ({
      archivo_anterior_id: anteriorId,
      archivo_actual_id: actualId,
      sector: c.sector,
      pk: c.pk,
      diff_coronamiento: c.diferencias.coronamiento,
      diff_revancha: c.diferencias.revancha,
      diff_ancho: c.diferencias.ancho,
      alerta_revancha: c.alertas.revancha,
      alerta_ancho: c.alertas.ancho,
      alerta_coronamiento: c.alertas.coronamiento
    }));
    const { error } = await supabase.from("revanchas_comparaciones").insert(comparaciones);
    if (error) {
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Esta comparación ya existe en la base de datos",
            codigo: "COMPARACION_DUPLICADA"
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          error: "Error al guardar comparación",
          detalles: error.message
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        mensaje: "Comparación guardada exitosamente",
        totalRegistros: comparaciones.length
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error en POST /api/revanchas/comparar:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        detalles: error instanceof Error ? error.message : "Error desconocido"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
