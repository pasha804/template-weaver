import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_pageId-D4E7bQgc.js
/**
* Checkout — /checkout/:pageId
*
* Shown after user finishes editing and clicks "Continue".
* PKR pricing, JazzCash / EasyPaisa / Bank Transfer.
* On "Place Order" → creates order, marks page pending_approval,
* then shows WhatsApp redirect.
*/
var $$splitComponentImporter = () => import("./_pageId-DsAdpF3r2.mjs");
var Route = createFileRoute("/checkout/$pageId")({
	head: () => ({ meta: [{ title: "Checkout — Shaukat Techs" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
