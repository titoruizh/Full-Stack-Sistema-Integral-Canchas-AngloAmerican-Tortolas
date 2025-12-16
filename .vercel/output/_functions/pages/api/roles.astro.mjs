import { s as supabase } from '../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const empresa_id = searchParams.get("empresa_id");
    let query = supabase.from("roles").select(`
        *,
        empresa:empresas(
          id,
          nombre
        )
      `);
    if (empresa_id) {
      query = query.eq("empresa_id", parseInt(empresa_id));
    }
    const { data: roles, error } = await query.order("empresa_id", { ascending: true }).order("nombre", { ascending: true });
    if (error) {
      console.error("Error al obtener roles:", error);
      return new Response(JSON.stringify({
        error: "Error al obtener roles",
        details: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      roles: roles || []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error inesperado en API roles:", error);
    return new Response(JSON.stringify({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { nombre, empresa_id, descripcion } = body;
    if (!nombre || !empresa_id) {
      return new Response(JSON.stringify({
        error: "Campos requeridos faltantes",
        details: "nombre y empresa_id son obligatorios"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const nuevoRol = {
      nombre,
      empresa_id: parseInt(empresa_id),
      descripcion: descripcion || null
    };
    const { data: rol, error } = await supabase.from("roles").insert([nuevoRol]).select(`
        *,
        empresa:empresas(
          id,
          nombre
        )
      `).single();
    if (error) {
      console.error("Error al crear rol:", error);
      if (error.code === "23505") {
        return new Response(JSON.stringify({
          error: "Rol duplicado",
          details: "Ya existe un rol con ese nombre en la empresa"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        error: "Error al crear rol",
        details: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      rol,
      message: "Rol creado exitosamente"
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error inesperado al crear rol:", error);
    return new Response(JSON.stringify({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
