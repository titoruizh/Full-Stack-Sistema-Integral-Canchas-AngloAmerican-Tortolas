import '../../../../chunks/supabase_CPo7SuMO.mjs';
import nativeFs from 'fs';
import path from 'path';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ params, request }) => {
  try {
    const canchaId = params.id;
    if (!canchaId) {
      return new Response(JSON.stringify({ error: "ID de cancha requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const response = await fetch(`http://localhost:4324/api/canchas/${canchaId}`);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Cancha no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { cancha } = await response.json();
    if (cancha.estado !== "EN_PROCESO") {
      return new Response(JSON.stringify({
        error: "La cancha debe estar en estado EN_PROCESO para generar PDF"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const validaciones = cancha.validaciones || [];
    const hasLinkapsis = validaciones.some((v) => v.empresa === "Linkapsis" && v.estado === "VALIDADO");
    const hasLlayLlay = validaciones.some((v) => v.empresa === "LlayLlay" && v.estado === "VALIDADO");
    const hasBesalco = validaciones.some((v) => v.empresa === "Besalco" && v.estado === "VALIDADO");
    if (!hasLinkapsis || !hasLlayLlay || !hasBesalco) {
      return new Response(JSON.stringify({
        error: "La cancha debe tener todas las validaciones completadas (Besalco, Linkapsis, LlayLlay)"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const templatePath = path.join(process.cwd(), "documento.html");
    let htmlTemplate = nativeFs.readFileSync(templatePath, "utf-8");
    const datosTemplate = extraerDatosParaTemplate(cancha);
    htmlTemplate = reemplazarVariables(htmlTemplate, datosTemplate);
    return new Response(JSON.stringify({
      success: true,
      html: htmlTemplate,
      datos: datosTemplate
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    return new Response(JSON.stringify({
      error: "Error interno del servidor al generar PDF"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
function extraerDatosParaTemplate(cancha) {
  const validaciones = cancha.validaciones || [];
  const validacionLinkapsis = validaciones.find((v) => v.empresa === "Linkapsis" && v.estado === "VALIDADO");
  const validacionLlayLlay = validaciones.find((v) => v.empresa === "LlayLlay" && v.estado === "VALIDADO");
  const validacionBesalco = validaciones.find((v) => v.empresa === "Besalco" && v.estado === "VALIDADO");
  const medicionesLinkapsis = validacionLinkapsis?.mediciones || {};
  const coordenadas = medicionesLinkapsis.coordenadas || {};
  const tipoTrabajo = medicionesLinkapsis.tipoTrabajo || [];
  const medicionesLlayLlay = validacionLlayLlay?.mediciones || {};
  return {
    // Datos básicos de la cancha
    NUMERO_CN: cancha.numero_informe || "N/A",
    FECHA_ACTUAL: (/* @__PURE__ */ new Date()).toLocaleDateString("es-CL"),
    NOMBRE_CANCHA: cancha.nombre || "Sin nombre",
    // Datos de Linkapsis (Espesores)
    ESPESOR_LK: medicionesLinkapsis.espesor || "N/A",
    TIPO_TRABAJO_CORTE: tipoTrabajo.includes("corte") ? "X" : "",
    TIPO_TRABAJO_RELLENO: tipoTrabajo.includes("relleno") ? "X" : "",
    // Coordenadas P1
    P1_N: coordenadas.p1?.norte || "N/A",
    P1_E: coordenadas.p1?.este || "N/A",
    P1_C: coordenadas.p1?.cota || "N/A",
    // Coordenadas P2
    P2_N: coordenadas.p2?.norte || "N/A",
    P2_E: coordenadas.p2?.este || "N/A",
    P2_C: coordenadas.p2?.cota || "N/A",
    // Coordenadas P3
    P3_N: coordenadas.p3?.norte || "N/A",
    P3_E: coordenadas.p3?.este || "N/A",
    P3_C: coordenadas.p3?.cota || "N/A",
    // Coordenadas P4
    P4_N: coordenadas.p4?.norte || "N/A",
    P4_E: coordenadas.p4?.este || "N/A",
    P4_C: coordenadas.p4?.cota || "N/A",
    // Datos de LlayLlay (Densidad)
    DENSIDAD_LL: medicionesLlayLlay.densidad || "N/A",
    // Observaciones
    OBS_BESALCO: validacionBesalco?.observaciones || "Sin observaciones",
    OBS_LINKAPSIS: validacionLinkapsis?.observaciones || "Sin observaciones",
    OBS_LLAYLLAY: validacionLlayLlay?.observaciones || "Sin observaciones",
    // Fechas
    FECHA_BESALCO: validacionBesalco?.fecha_validacion ? new Date(validacionBesalco.fecha_validacion).toLocaleDateString("es-CL") : "N/A",
    FECHA_LINKAPSIS: validacionLinkapsis?.fecha_validacion ? new Date(validacionLinkapsis.fecha_validacion).toLocaleDateString("es-CL") : "N/A",
    FECHA_LLAYLLAY: validacionLlayLlay?.fecha_validacion ? new Date(validacionLlayLlay.fecha_validacion).toLocaleDateString("es-CL") : "N/A",
    // Usuarios validadores
    USUARIO_BESALCO: validacionBesalco?.usuario || "N/A",
    USUARIO_LINKAPSIS: validacionLinkapsis?.usuario || "N/A",
    USUARIO_LLAYLLAY: validacionLlayLlay?.usuario || "N/A"
  };
}
function reemplazarVariables(template, datos) {
  let resultado = template;
  Object.keys(datos).forEach((key) => {
    const valor = datos[key];
    const regex = new RegExp(`{{${key}}}`, "g");
    resultado = resultado.replace(regex, String(valor));
  });
  return resultado;
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
