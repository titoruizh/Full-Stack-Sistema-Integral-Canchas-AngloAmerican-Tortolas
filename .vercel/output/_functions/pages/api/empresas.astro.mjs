import { C as CanchaService } from '../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const empresas = await CanchaService.obtenerEmpresas();
    return new Response(JSON.stringify({
      success: true,
      empresas
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Error al obtener empresas",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
