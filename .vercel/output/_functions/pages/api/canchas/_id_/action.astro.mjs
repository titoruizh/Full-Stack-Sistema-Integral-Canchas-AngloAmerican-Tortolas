import { C as CanchaService } from '../../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ params, request }) => {
  try {
    const canchaId = parseInt(params.id);
    const { accion, observaciones } = await request.json();
    console.log("API Debug - Acción recibida:", accion);
    console.log("API Debug - Observaciones:", observaciones);
    console.log("API Debug - CanchaID:", canchaId);
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
        console.log("API Debug - Ejecutando rechazo por Besalco...");
        await CanchaService.rechazarPorBesalco(canchaId, observaciones);
        console.log("API Debug - Rechazo por Besalco completado");
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
        console.log("API Debug - Acción no reconocida:", accion);
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
    console.error("API Debug - Error en API:", error);
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
