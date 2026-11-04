import { n as supabase } from "./client-Dc1BRJHd.mjs";
import { o as getExternalTemplate } from "./registry-Bk6PYt-G.mjs";
import { n as getTemplate } from "./registry-CtMqHc0B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/publish-pipeline-sXCsH6To.js
/**
* slug-utils.ts — Slug sanitization, reserved words protection, and unique slug resolution.
*/
var RESERVED_SLUGS = /* @__PURE__ */ new Set([
	"admin",
	"dashboard",
	"auth",
	"login",
	"signup",
	"checkout",
	"editor",
	"p",
	"pricing",
	"contact",
	"api",
	"templates",
	"blog",
	"demo"
]);
/**
* Converts a raw string to a clean, lowercase, URL-safe slug.
*/
function sanitizeSlug(input) {
	if (!input) return "";
	let slug = input.toLowerCase().trim();
	slug = slug.replace(/[\s_]+/g, "-");
	slug = slug.replace(/[^a-z0-9-]/g, "");
	slug = slug.replace(/-+/g, "-");
	slug = slug.replace(/^-+|-+$/g, "");
	return slug;
}
/**
* Checks if a slug is reserved or already taken in Supabase.
* Returns a guaranteed unique, clean slug.
*/
async function ensureUniqueSlug(rawSlug, currentPageId) {
	let baseSlug = sanitizeSlug(rawSlug);
	if (!baseSlug) baseSlug = "my-page";
	if (RESERVED_SLUGS.has(baseSlug)) baseSlug = `${baseSlug}-page`;
	let candidate = baseSlug;
	let counter = 1;
	while (counter <= 20) {
		try {
			let query = supabase.from("pages").select("id").eq("slug", candidate);
			if (currentPageId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentPageId)) query = query.neq("id", currentPageId);
			const { data, error } = await query.maybeSingle();
			if (!error && !data) return candidate;
		} catch {}
		candidate = `${baseSlug}-${counter}`;
		counter++;
	}
	return `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
}
/**
* publish-pipeline.ts — Atomic, transactional website publishing engine with step-by-step progress.
*/
/**
* Validates all pre-conditions before publishing.
*/
async function validatePageBeforePublish(pageId, content, templateId, userId) {
	if (!pageId) return {
		valid: false,
		error: "Invalid Page ID."
	};
	if (!userId) return {
		valid: false,
		error: "User is not authenticated."
	};
	const extTemplate = getExternalTemplate(templateId);
	const blockTemplate = getTemplate(templateId);
	if (!extTemplate && !blockTemplate) return {
		valid: false,
		error: `Template "${templateId}" not found.`
	};
	try {
		const { error: dbErr } = await supabase.from("profiles").select("id").limit(1);
		if (dbErr) return {
			valid: false,
			error: "Database connection failed. Please check network."
		};
	} catch (e) {
		return {
			valid: false,
			error: `Database check failed: ${e?.message || e}`
		};
	}
	const title = content._page_title || content.title || extTemplate?.manifest.name;
	if (!title || !title.trim()) return {
		valid: false,
		error: "Page title is required before publishing."
	};
	return { valid: true };
}
function isValidUUID(str) {
	if (!str) return false;
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
/**
* Executes an atomic transactional publish pipeline.
* If any step fails, all progress is safely stopped and marked as failed.
*/
async function runPublishPipeline(params, onProgress) {
	const { pageId, userId, templateId, title, slug, content } = params;
	const extTemplate = getExternalTemplate(templateId);
	function report(step, message, progressPercent) {
		if (onProgress) onProgress({
			step,
			message,
			progressPercent
		});
	}
	try {
		report("PREPARING", "Preparing website configuration...", 10);
		report("VALIDATING", "Validating content and database permissions...", 25);
		const val = await validatePageBeforePublish(pageId, content, templateId, userId);
		if (!val.valid) {
			report("FAILED", val.error || "Pre-publish validation failed.", 25);
			return {
				success: false,
				pageId,
				slug,
				error: val.error,
				failedStep: "VALIDATING"
			};
		}
		report("SLUG_GENERATION", "Sanitizing URL slug and checking uniqueness...", 45);
		const finalSlug = await ensureUniqueSlug(slug || title || pageId, pageId);
		report("SAVING_CONTENT", "Saving content and template schema...", 65);
		try {
			await supabase.from("templates").upsert({
				id: templateId,
				name: extTemplate?.manifest.name || templateId,
				category: extTemplate?.manifest.category || "General",
				version: extTemplate?.manifest.version || "1.0.0",
				defaults: extTemplate?.defaults || {},
				schema: extTemplate?.schema || [],
				is_active: true
			}, { onConflict: "id" });
		} catch (e) {
			console.warn("Template seed warning:", e);
		}
		const isInvalidUuid = !isValidUUID(pageId);
		let dbPageId = isInvalidUuid ? void 0 : pageId;
		if (isInvalidUuid && userId) try {
			const { data: existingRow } = await supabase.from("pages").select("id").eq("user_id", userId).eq("slug", finalSlug).maybeSingle();
			if (existingRow?.id) dbPageId = existingRow.id;
		} catch {}
		const pagePayload = {
			id: dbPageId,
			user_id: userId,
			template_id: templateId,
			title: title.trim(),
			slug: finalSlug,
			status: "draft",
			content: {
				...content,
				_template_id: templateId,
				_page_slug: finalSlug
			},
			is_public: false,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		let upsertRes = await supabase.from("pages").upsert(pagePayload).select("id, slug").single();
		if (upsertRes.error) if (upsertRes.error.code === "23503") {
			await supabase.from("templates").upsert({
				id: templateId,
				name: extTemplate?.manifest.name || templateId,
				category: extTemplate?.manifest.category || "General",
				version: extTemplate?.manifest.version || "1.0.0",
				defaults: extTemplate?.defaults || {},
				schema: extTemplate?.schema || [],
				is_active: true
			}, { onConflict: "id" });
			const retryRes = await supabase.from("pages").upsert(pagePayload).select("id, slug").single();
			if (retryRes.error) throw new Error(`Failed to save page data: ${retryRes.error.message}`);
			upsertRes = retryRes;
		} else throw new Error(`Failed to save page content: ${upsertRes.error.message}`);
		const resolvedPageId = upsertRes.data?.id || (isValidUUID(pageId) ? pageId : null);
		if (!resolvedPageId) throw new Error("Failed to resolve a valid database page ID.");
		report("PUBLISHING_DATABASE", "Publishing page record live to Supabase...", 85);
		const publishRes = await supabase.from("pages").update({
			status: "published",
			published_at: (/* @__PURE__ */ new Date()).toISOString(),
			is_public: true,
			slug: finalSlug,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", resolvedPageId).select("id, slug, status").single();
		if (publishRes.error || !publishRes.data || publishRes.data.status !== "published") {
			const errMsg = publishRes.error?.message || "Database publish write returned invalid status.";
			throw new Error(errMsg);
		}
		report("COMPLETED", `Website published live! Accessible at /p/${finalSlug}`, 100);
		return {
			success: true,
			pageId: resolvedPageId,
			slug: finalSlug
		};
	} catch (err) {
		const errorText = err?.message || String(err) || "Unknown publishing error occurred.";
		report("FAILED", errorText, 0);
		return {
			success: false,
			pageId,
			slug,
			error: errorText,
			failedStep: "PUBLISHING_DATABASE"
		};
	}
}
//#endregion
export { runPublishPipeline as n, isValidUUID as t };
