import { C as CanchaService } from '../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params }) => {
  try {
    const canchaId = parseInt(params.id);
    if (!canchaId) {
      return new Response(JSON.stringify({ error: "ID de cancha requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const canchas = await CanchaService.obtenerCanchas();
    const cancha = canchas.find((c) => c.id === canchaId);
    if (!cancha) {
      return new Response(JSON.stringify({ error: "Cancha no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      cancha
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al obtener cancha:", error);
    return new Response(JSON.stringify({
      error: "Error interno del servidor"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ params, request }) => {
  try {
    const canchaId = parseInt(params.id);
    const { accion, observaciones } = await request.json();
    console.log("Acción recibida:", accion);
    console.log("Observaciones:", observaciones);
    if (!canchaId || !accion) {
      return new Response(JSON.stringify({ message: "Faltan datos requeridos" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    switch (accion) {
      case "enviar-besalco":
        await CanchaService.enviarABesalco(canchaId);
        break;
      case "finalizar-trabajo":
        await CanchaService.finalizarTrabajo(canchaId);
        break;
      case "rechazar-besalco":
        console.log("Ejecutando rechazo por Besalco...");
        await CanchaService.rechazarBesalco(canchaId, observaciones);
        break;
      case "validar-linkapsis":
        await CanchaService.validarLinkapsis(canchaId, true, observaciones);
        break;
      case "rechazar-linkapsis":
        await CanchaService.validarLinkapsis(canchaId, false, observaciones);
        break;
      case "validar-llayllay":
        await CanchaService.validarLlayLlay(canchaId, true, observaciones);
        break;
      case "rechazar-llayllay":
        await CanchaService.validarLlayLlay(canchaId, false, observaciones);
        break;
      case "cerrar":
        await CanchaService.cerrarCancha(canchaId);
        break;
      default:
        console.log("Acción no reconocida:", accion);
        return new Response(JSON.stringify({ message: "Acción no válida: " + accion }), {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error en API:", error);
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
