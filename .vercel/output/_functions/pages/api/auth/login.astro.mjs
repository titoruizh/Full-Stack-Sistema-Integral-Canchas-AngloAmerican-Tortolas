import { s as supabase } from '../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { empresa_id, usuario_id, password } = body;
    if (!empresa_id || !usuario_id || !password) {
      return new Response(JSON.stringify({
        error: "Campos requeridos faltantes",
        details: "empresa_id, usuario_id y password son obligatorios"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: usuario, error } = await supabase.from("vista_usuarios_completa").select("*").eq("id", parseInt(usuario_id)).eq("empresa_id", parseInt(empresa_id)).eq("activo", true).single();
    if (error || !usuario) {
      console.error("Error al buscar usuario:", error);
      return new Response(JSON.stringify({
        error: "Usuario no encontrado",
        details: "No se encontró un usuario activo con esas credenciales"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: usuarioAuth, error: errorAuth } = await supabase.from("usuarios").select("password_hash").eq("id", usuario.id).single();
    if (errorAuth || !usuarioAuth || usuarioAuth.password_hash !== password) {
      return new Response(JSON.stringify({
        error: "Credenciales incorrectas",
        details: "Password incorrecto"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const usuarioAutenticado = {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      empresa_id: usuario.empresa_id,
      empresa_nombre: usuario.empresa_nombre,
      rol_id: usuario.rol_id,
      rol_nombre: usuario.rol_nombre,
      rol_descripcion: usuario.rol_descripcion
    };
    return new Response(JSON.stringify({
      success: true,
      usuario: usuarioAutenticado,
      message: "Autenticación exitosa"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error inesperado en autenticación:", error);
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
