import { C as CanchaService } from '../../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params }) => {
  try {
    const canchaId = parseInt(params.id);
    if (!canchaId) {
      return new Response(JSON.stringify({ message: "ID de cancha inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const transiciones = await CanchaService.obtenerTransicionesCancha(canchaId);
    const validaciones = await CanchaService.obtenerValidacionesCancha(canchaId);
    return new Response(JSON.stringify({
      transiciones,
      validaciones
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error obteniendo timeline:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
