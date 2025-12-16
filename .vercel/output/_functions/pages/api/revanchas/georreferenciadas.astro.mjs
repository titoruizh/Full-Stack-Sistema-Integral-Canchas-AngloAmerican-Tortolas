import { s as supabase } from '../../../chunks/supabase_CPo7SuMO.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const muro = url.searchParams.get("muro");
    const fechaDesde = url.searchParams.get("fechaDesde");
    const fechaHasta = url.searchParams.get("fechaHasta");
    const soloUltimas = url.searchParams.get("soloUltimas") === "true";
    const formato = url.searchParams.get("formato") || "json";
    const limite = parseInt(url.searchParams.get("limite") || "1000");
    console.log("🗺️ GET /api/revanchas/georreferenciadas - Params:", {
      muro,
      fechaDesde,
      fechaHasta,
      soloUltimas,
      formato,
      limite
    });
    const vistaBase = soloUltimas ? "vista_ultimas_revanchas_geo" : "vista_revanchas_georreferenciadas";
    let query = supabase.from(vistaBase).select("*").eq("tiene_coordenadas", true).order("fecha_medicion", { ascending: false }).order("pk").limit(limite);
    if (muro) {
      query = query.eq("archivo_muro", muro);
    }
    if (fechaDesde) {
      query = query.gte("fecha_medicion", fechaDesde);
    }
    if (fechaHasta) {
      query = query.lte("fecha_medicion", fechaHasta);
    }
    const { data: revanchas, error } = await query;
    if (error) {
      console.error("❌ Error al consultar revanchas georreferenciadas:", error);
      return new Response(
        JSON.stringify({
          error: "Error al consultar revanchas",
          detalles: error.message
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log(`✅ Revanchas georreferenciadas encontradas: ${revanchas?.length || 0}`);
    if (formato === "geojson") {
      const geojson = {
        type: "FeatureCollection",
        features: revanchas.map((r) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [r.lon, r.lat]
            // [longitude, latitude]
          },
          properties: {
            medicion_id: r.medicion_id,
            archivo_id: r.archivo_id,
            muro: r.archivo_muro,
            sector: r.sector,
            pk: r.pk,
            fecha_medicion: r.fecha_medicion,
            // Mediciones
            coronamiento: r.coronamiento,
            revancha: r.revancha,
            lama: r.lama,
            ancho: r.ancho,
            geomembrana: r.geomembrana,
            dist_geo_lama: r.dist_geo_lama,
            dist_geo_coronamiento: r.dist_geo_coronamiento,
            // Colores para visualización
            color_revancha: r.color_revancha,
            color_ancho: r.color_ancho,
            color_dist_geo: r.color_dist_geo,
            // Metadata
            archivo_nombre: r.archivo_nombre,
            created_at: r.created_at
          }
        }))
      };
      return new Response(JSON.stringify(geojson), {
        status: 200,
        headers: { "Content-Type": "application/geo+json" }
      });
    }
    return new Response(JSON.stringify(revanchas), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ Error inesperado en GET /api/revanchas/georreferenciadas:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        detalles: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
