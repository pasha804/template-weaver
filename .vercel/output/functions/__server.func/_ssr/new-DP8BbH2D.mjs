import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-DP8BbH2D.js
var $$splitComponentImporter = () => import("./new-CsqOBJdn.mjs");
var searchSchema = objectType({ template: stringType() });
var Route = createFileRoute("/editor/new")({
	validateSearch: searchSchema,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
