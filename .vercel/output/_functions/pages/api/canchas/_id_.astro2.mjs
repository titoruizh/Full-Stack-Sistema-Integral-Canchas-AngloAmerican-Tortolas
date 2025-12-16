import { s as supabase } from '../../../chunks/supabase_CPo7SuMO.mjs';
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
    const { data: cancha, error } = await supabase.from("canchas").select(`
        *,
        estado_actual:estados_cancha!estado_actual_id(nombre),
        empresa_actual:empresas!empresa_actual_id(nombre),
        creada_por:empresas!created_by(nombre)
      `).eq("id", canchaId).single();
    if (error) {
      console.error("Error de Supabase:", error);
      return new Response(JSON.stringify({ error: "Cancha no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const canchaFormateada = {
      id: cancha.id,
      nombre: cancha.nombre,
      muro: cancha.muro,
      sector: cancha.sector,
      nombre_detalle: cancha.nombre_detalle,
      estado_actual: cancha.estado_actual?.nombre || "Sin estado",
      estado_actual_id: cancha.estado_actual_id,
      // Agregar el ID del estado
      empresa_actual: cancha.empresa_actual?.nombre || "Sin empresa",
      empresa_actual_id: cancha.empresa_actual_id,
      // Agregar el ID de la empresa
      creada_por: cancha.creada_por?.nombre || "Sin usuario",
      created_at: cancha.created_at,
      updated_at: cancha.updated_at,
      numero_informe: cancha.numero_informe,
      poligono_coordenadas: cancha.poligono_coordenadas
    };
    console.log("Cancha obtenida:", {
      id: canchaFormateada.id,
      nombre: canchaFormateada.nombre,
      estado_actual_id: canchaFormateada.estado_actual_id,
      poligono_presente: !!canchaFormateada.poligono_coordenadas,
      poligono_data: canchaFormateada.poligono_coordenadas
    });
    return new Response(JSON.stringify({
      success: true,
      cancha: canchaFormateada
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
