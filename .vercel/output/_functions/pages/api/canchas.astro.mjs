import { C as CanchaService } from '../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const canchas = await CanchaService.obtenerCanchas();
    return new Response(JSON.stringify(canchas), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    if (body.poligonoCoordinadas) {
      const { muro, sector, nombreDetalle, poligonoCoordinadas } = body;
      if (!muro || !sector || !nombreDetalle || !poligonoCoordinadas) {
        return new Response(JSON.stringify({ message: "Faltan datos requeridos para crear cancha con polígono" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const nuevaCancha = await CanchaService.crearCanchaConPoligono(muro, sector, nombreDetalle, poligonoCoordinadas);
      return new Response(JSON.stringify(nuevaCancha), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      const { muro, sector, nombreDetalle } = body;
      if (!muro || !sector || !nombreDetalle) {
        return new Response(JSON.stringify({ message: "Faltan datos requeridos" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const cancha = await CanchaService.crearCancha(muro, sector, nombreDetalle);
      return new Response(JSON.stringify(cancha), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
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
