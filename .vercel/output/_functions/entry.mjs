import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_AwlI_4Ml.mjs';
import { manifest } from './manifest_B11HmGHH.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/usuarios.astro.mjs');
const _page2 = () => import('./pages/api/auth/login.astro.mjs');
const _page3 = () => import('./pages/api/auth/verify-password.astro.mjs');
const _page4 = () => import('./pages/api/canchas/_id_/accion.astro.mjs');
const _page5 = () => import('./pages/api/canchas/_id_/action.astro.mjs');
const _page6 = () => import('./pages/api/canchas/_id_/download-pdf.astro.mjs');
const _page7 = () => import('./pages/api/canchas/_id_/generar-pdf.astro.mjs');
const _page8 = () => import('./pages/api/canchas/_id_/observaciones.astro.mjs');
const _page9 = () => import('./pages/api/canchas/_id_/timeline.astro.mjs');
const _page10 = () => import('./pages/api/canchas/_id_/validaciones.astro.mjs');
const _page11 = () => import('./pages/api/canchas/_id_.astro.mjs');
const _page12 = () => import('./pages/api/canchas/_id_.astro2.mjs');
const _page13 = () => import('./pages/api/canchas.astro.mjs');
const _page14 = () => import('./pages/api/empresas.astro.mjs');
const _page15 = () => import('./pages/api/pks.astro.mjs');
const _page16 = () => import('./pages/api/pks.astro2.mjs');
const _page17 = () => import('./pages/api/revanchas/comparar.astro.mjs');
const _page18 = () => import('./pages/api/revanchas/georreferenciadas.astro.mjs');
const _page19 = () => import('./pages/api/revanchas/_id_.astro.mjs');
const _page20 = () => import('./pages/api/revanchas.astro.mjs');
const _page21 = () => import('./pages/api/roles.astro.mjs');
const _page22 = () => import('./pages/api/usuarios/_id_.astro.mjs');
const _page23 = () => import('./pages/api/usuarios.astro.mjs');
const _page24 = () => import('./pages/login.astro.mjs');
const _page25 = () => import('./pages/mapbox-window.astro.mjs');
const _page26 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.15.1_@types+node@24_8774199cb0c1186b0f7b3e5540d24875/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/usuarios.astro", _page1],
    ["src/pages/api/auth/login.ts", _page2],
    ["src/pages/api/auth/verify-password.ts", _page3],
    ["src/pages/api/canchas/[id]/accion.ts", _page4],
    ["src/pages/api/canchas/[id]/action.ts", _page5],
    ["src/pages/api/canchas/[id]/download-pdf.ts", _page6],
    ["src/pages/api/canchas/[id]/generar-pdf.ts", _page7],
    ["src/pages/api/canchas/[id]/observaciones.ts", _page8],
    ["src/pages/api/canchas/[id]/timeline.ts", _page9],
    ["src/pages/api/canchas/[id]/validaciones.ts", _page10],
    ["src/pages/api/canchas/[id]/index.ts", _page11],
    ["src/pages/api/canchas/[id].ts", _page12],
    ["src/pages/api/canchas.ts", _page13],
    ["src/pages/api/empresas.ts", _page14],
    ["src/pages/api/pks/index.ts", _page15],
    ["src/pages/api/pks.ts", _page16],
    ["src/pages/api/revanchas/comparar.ts", _page17],
    ["src/pages/api/revanchas/georreferenciadas.ts", _page18],
    ["src/pages/api/revanchas/[id].ts", _page19],
    ["src/pages/api/revanchas/index.ts", _page20],
    ["src/pages/api/roles/index.ts", _page21],
    ["src/pages/api/usuarios/[id].ts", _page22],
    ["src/pages/api/usuarios/index.ts", _page23],
    ["src/pages/login.astro", _page24],
    ["src/pages/mapbox-window.astro", _page25],
    ["src/pages/index.astro", _page26]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "3257b2fe-b135-44b6-95c8-aa782bd1903c",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
