import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as objectType, s as stringType } from "./_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_templateId-X-oVih69.js
/**
* Template Editor — configuration-only page
* /editor/template/:templateId?pageId=xxx
*
* Pure data-entry form. No live preview. No split layout.
* User fills in fields → Save → Continue → Checkout.
*/
var $$splitComponentImporter = () => import("./_templateId-C6SBXlo1.mjs");
var searchSchema = objectType({ pageId: stringType().optional() });
var Route = createFileRoute("/editor/template/$templateId")({
	validateSearch: searchSchema,
	head: () => ({ meta: [{ title: "Edit Template — Shaukat Techs" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
