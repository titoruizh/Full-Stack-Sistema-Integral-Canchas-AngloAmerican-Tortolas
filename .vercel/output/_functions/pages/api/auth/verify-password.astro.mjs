import { s as supabase } from '../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { usuario_id, empresa_id, password } = body;
    console.log("Debug verify-password - Datos recibidos:", { usuario_id, empresa_id, password: "***" });
    if (!usuario_id || !empresa_id || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Datos incompletos"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data, error } = await supabase.from("usuarios").select("id, empresa_id, activo, password_hash").eq("id", usuario_id).eq("empresa_id", empresa_id).eq("activo", true).single();
    console.log("Debug verify-password - Resultado BD:", { data, error });
    if (error || !data) {
      console.error("Usuario no encontrado o error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Usuario no encontrado"
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const passwordValida = data.password_hash === password;
    console.log("Debug verify-password - Comparación:", {
      passwordIngresada: password,
      passwordBD: data.password_hash,
      coincide: passwordValida
    });
    const isValid = passwordValida;
    if (isValid) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Contraseña verificada correctamente"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Contraseña incorrecta"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error en verify-password:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error interno del servidor"
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
