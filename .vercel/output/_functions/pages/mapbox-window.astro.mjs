import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, l as renderScript, r as renderTemplate, o as renderHead, k as renderComponent } from '../chunks/astro/server_B9J4CstS.mjs';
/* empty css                                         */
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro();
const $$MiningMap = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$MiningMap;
  const {
    muroFilter,
    drawingMode = false,
    canchaId,
    dashboardMode = false,
    canchaIds
  } = Astro2.props;
  console.log("\u{1F3D7}\uFE0F MiningMap iniciado con:", {
    muroFilter,
    drawingMode,
    canchaId,
    dashboardMode,
    canchaIds
  });
  return renderTemplate`${maybeRenderHead()}<div class="map-container"${addAttribute(muroFilter || "", "data-muro-filter")}${addAttribute(drawingMode.toString(), "data-drawing-mode")}${addAttribute(canchaId || "", "data-cancha-id")}${addAttribute(dashboardMode.toString(), "data-dashboard-mode")}${addAttribute(canchaIds || "", "data-cancha-ids")} data-astro-cid-kcplqlp5> <div id="map" data-astro-cid-kcplqlp5></div> <div class="map-controls" data-astro-cid-kcplqlp5> <div class="control-panel" data-astro-cid-kcplqlp5> <div class="control-group" data-astro-cid-kcplqlp5> <label class="control-label" data-astro-cid-kcplqlp5>Filtro de Muros</label> <select id="muro-filter" class="control-select" data-astro-cid-kcplqlp5> <option value="todos" data-astro-cid-kcplqlp5>Todos los Muros</option> <option value="MP" data-astro-cid-kcplqlp5>MP</option> <option value="MO" data-astro-cid-kcplqlp5>MO</option> <option value="ME" data-astro-cid-kcplqlp5>ME</option> </select> </div> </div> </div> <div id="loading" class="loading" style="display: none;" data-astro-cid-kcplqlp5>
Cargando mapa...
</div> <div id="error" class="error" style="display: none;" data-astro-cid-kcplqlp5></div> </div> ${renderScript($$result, "E:/TITO/1 Astro/canchas-anglo2/src/components/MiningMap.astro?astro&type=script&index=0&lang.ts")}`;
}, "E:/TITO/1 Astro/canchas-anglo2/src/components/MiningMap.astro", void 0);

const $$Astro = createAstro();
const $$MapboxWindow = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MapboxWindow;
  const url = Astro2.url;
  const muro = url.searchParams.get("muro");
  const drawing = url.searchParams.get("drawing") === "true";
  const canchaId = url.searchParams.get("canchaId");
  const dashboardMode = url.searchParams.get("dashboardMode") === "true";
  const canchaIds = url.searchParams.get("canchaIds");
  console.log("\u{1F527} Par\xE1metros recibidos:", { muro, drawing, canchaId, dashboardMode, canchaIds });
  return renderTemplate`<html lang="es" data-astro-cid-w5566ti4> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Visor Mapbox - ${drawing ? "Modo Dibujo" : "Integraci\xF3n"}</title><link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet">${drawing && renderTemplate`<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css">`}${renderHead()}</head> <body${addAttribute(drawing ? "drawing-mode" : "", "class")} data-astro-cid-w5566ti4> ${drawing && renderTemplate`<div class="drawing-instructions" data-astro-cid-w5566ti4> <span class="drawing-mode-indicator" data-astro-cid-w5566ti4>🎨 Modo Dibujo</span> </div>`} <!-- Render the MiningMap component --> <main data-astro-cid-w5566ti4> ${renderComponent($$result, "MiningMap", $$MiningMap, { "muroFilter": muro || void 0, "drawingMode": drawing, "canchaId": canchaId || void 0, "dashboardMode": dashboardMode, "canchaIds": canchaIds || void 0, "data-astro-cid-w5566ti4": true })} </main> </body></html>`;
}, "E:/TITO/1 Astro/canchas-anglo2/src/pages/mapbox-window.astro", void 0);

const $$file = "E:/TITO/1 Astro/canchas-anglo2/src/pages/mapbox-window.astro";
const $$url = "/mapbox-window";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MapboxWindow,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
