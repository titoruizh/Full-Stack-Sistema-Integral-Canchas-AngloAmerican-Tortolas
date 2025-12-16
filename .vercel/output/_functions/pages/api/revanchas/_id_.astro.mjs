import { s as supabase } from '../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de archivo requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: archivo, error: errorArchivo } = await supabase.from("revanchas_archivos").select("*").eq("id", id).single();
    if (errorArchivo || !archivo) {
      return new Response(
        JSON.stringify({ error: "Archivo no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: mediciones, error: errorMediciones } = await supabase.from("vista_mediciones_completas").select("*").eq("id", id).order("sector", { ascending: true }).order("pk", { ascending: true });
    if (errorMediciones) {
      return new Response(
        JSON.stringify({
          error: "Error al obtener mediciones",
          detalles: errorMediciones.message
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: estadisticas } = await supabase.from("revanchas_estadisticas").select("*").eq("archivo_id", id).single();
    const { data: estadisticasSector } = await supabase.from("revanchas_estadisticas_sector").select("*").eq("archivo_id", id).order("sector", { ascending: true });
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          archivo,
          mediciones: mediciones || [],
          estadisticas: estadisticas || null,
          estadisticasSector: estadisticasSector || []
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error en GET /api/revanchas/[id]:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        detalles: error instanceof Error ? error.message : "Error desconocido"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const DELETE = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de archivo requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { error } = await supabase.from("revanchas_archivos").delete().eq("id", id);
    if (error) {
      console.error("❌ Error eliminando archivo:", error);
      return new Response(
        JSON.stringify({
          error: "Error al eliminar archivo",
          detalles: error.message
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ success: true, mensaje: "Archivo eliminado exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error en DELETE /api/revanchas/[id]:", error);
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
  DELETE,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
