import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../renderers.mjs';

const GET = async ({ params, request }) => {
  try {
    const supabaseUrl = undefined                                   ;
    const supabaseKey = undefined                                        ;
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Variables de entorno de Supabase no configuradas");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuración de base de datos no disponible"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(request.url);
    const muro = url.searchParams.get("muro");
    console.log("🔍 API PKs - Parámetros:", { muro });
    let query = supabase.from("pks_maestro").select("*").eq("activo", true).order("muro", { ascending: true }).order("pk", { ascending: true });
    if (muro && muro !== "" && muro !== "todos") {
      query = query.eq("muro", muro);
    }
    const { data, error } = await query;
    if (error) {
      console.error("❌ Error al obtener PKs:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log(`✅ PKs obtenidos: ${data?.length || 0} registros`);
    return new Response(
      JSON.stringify({
        success: true,
        pks: data,
        total: data?.length || 0
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("❌ Error en API PKs:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
