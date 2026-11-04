import { o as __toESM } from "../_runtime.mjs";
import { n as supabase } from "./client-Dc1BRJHd.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as runPublishPipeline, t as isValidUUID } from "./publish-pipeline-sXCsH6To.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-orders-B90ZG_wS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var PLANS_PKR = [{
	key: "basic",
	label: "Package 1",
	pricePKR: 1e3,
	pricePaisa: 1e5,
	features: [
		"1 personalized page",
		"Full customization",
		"WhatsApp sharing",
		"Standard support"
	],
	popular: false
}, {
	key: "premium",
	label: "Package 2",
	pricePKR: 2e3,
	pricePaisa: 2e5,
	features: [
		"1 personalized page",
		"Full customization",
		"Custom URL slug",
		"Priority support",
		"VIP delivery"
	],
	popular: true
}];
function formatPKR(paisa) {
	return `Rs. ${(paisa / 100).toLocaleString("en-PK")}`;
}
function useAllOrders(statusFilter) {
	const qc = useQueryClient();
	(0, import_react.useEffect)(() => {
		const channel = supabase.channel("admin-orders-channel").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "orders"
		}, () => {
			qc.invalidateQueries({ queryKey: ["admin-orders"] });
			qc.invalidateQueries({ queryKey: ["pending-websites"] });
			qc.invalidateQueries({ queryKey: ["admin-stats"] });
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [qc]);
	return useQuery({
		queryKey: ["admin-orders", statusFilter],
		refetchInterval: 1e4,
		queryFn: async () => {
			let ordersList = [];
			try {
				let q = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
				if (statusFilter) q = q.eq("status", statusFilter);
				const { data, error } = await q;
				if (!error && data) ordersList = data;
			} catch (err) {
				console.warn("[Orders Fetch Join Warning]:", err);
			}
			if (ordersList.length === 0) try {
				let q2 = supabase.from("orders").select("*").order("created_at", { ascending: false });
				if (statusFilter) q2 = q2.eq("status", statusFilter);
				const { data: data2 } = await q2;
				if (data2) ordersList = data2;
			} catch {}
			return ordersList;
		}
	});
}
function usePlaceOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const plan = PLANS_PKR.find((p) => p.key === input.planKey) ?? PLANS_PKR[1];
			const refCode = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1e3 + Math.random() * 9e3)}`;
			let localTitle = input.templateName;
			let localSlug = input.pageId;
			let localContent = {};
			if (typeof window !== "undefined") {
				const cached = localStorage.getItem(`page_${input.pageId}`);
				if (cached) try {
					const parsed = JSON.parse(cached);
					localTitle = parsed.title || input.templateName;
					localSlug = parsed.slug || input.pageId;
					localContent = parsed.content || {};
					parsed.status = "pending_approval";
					parsed.updated_at = (/* @__PURE__ */ new Date()).toISOString();
					localStorage.setItem(`page_${input.pageId}`, JSON.stringify(parsed));
				} catch {}
			}
			const pagePayload = {
				id: input.pageId.startsWith("draft-") ? void 0 : input.pageId,
				user_id: input.userId,
				template_id: input.templateId,
				title: localTitle,
				slug: localSlug,
				status: "pending_approval",
				content: {
					...localContent,
					_template_id: input.templateId
				},
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			try {
				const pageRes = await supabase.from("pages").upsert(pagePayload).select().single();
				if (pageRes.error && pageRes.error.code === "23503") await supabase.from("pages").upsert({
					...pagePayload,
					template_id: null
				});
			} catch (e) {
				console.warn("Page upsert during order warning:", e);
			}
			let order = null;
			try {
				const { data, error: orderErr } = await supabase.from("orders").insert({
					user_id: input.userId,
					reference: refCode,
					status: "pending",
					plan_kind: "one_time",
					currency: "PKR",
					subtotal_cents: plan.pricePaisa,
					discount_cents: 0,
					total_cents: plan.pricePaisa,
					provider: input.paymentMethod,
					payment_method: input.paymentMethod,
					payment_screenshot: input.paymentScreenshot,
					page_id: input.pageId,
					currency_display: "PKR"
				}).select().single();
				if (!orderErr && data) {
					order = {
						...data,
						reference: data.reference || refCode,
						page_id: input.pageId,
						payment_method: input.paymentMethod,
						payment_screenshot: input.paymentScreenshot
					};
					try {
						await supabase.from("order_items").insert({
							order_id: order.id,
							template_id: input.templateId,
							page_id: input.pageId,
							label: input.templateName,
							quantity: 1,
							unit_price_cents: plan.pricePaisa
						});
					} catch {}
				}
			} catch (e) {
				console.warn("Order insert warning:", e);
			}
			if (!order) order = {
				id: `order-${Date.now()}`,
				reference: refCode,
				user_id: input.userId,
				status: "pending",
				plan_kind: "one_time",
				currency: "PKR",
				subtotal_cents: plan.pricePaisa,
				discount_cents: 0,
				total_cents: plan.pricePaisa,
				provider: input.paymentMethod,
				payment_method: input.paymentMethod,
				payment_screenshot: input.paymentScreenshot,
				page_id: input.pageId,
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			return order;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: ["orders", data.user_id] });
			qc.invalidateQueries({ queryKey: ["pages"] });
		}
	});
}
function useMarkWhatsappSent() {
	return useMutation({ mutationFn: async (orderId) => {
		await supabase.from("orders").update({ whatsapp_sent: true }).eq("id", orderId);
	} });
}
function useVerifyPayment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ orderId }) => {
			const { error } = await supabase.from("orders").update({ status: "payment_verified" }).eq("id", orderId);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-orders"] });
			qc.invalidateQueries({ queryKey: ["pending-websites"] });
			qc.invalidateQueries({ queryKey: ["admin-stats"] });
		}
	});
}
function useApproveOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ orderId, pageId }) => {
			let pageRecord = null;
			if (isValidUUID(pageId)) try {
				const { data } = await supabase.from("pages").select("*").eq("id", pageId).maybeSingle();
				if (data) pageRecord = data;
			} catch {}
			if (!pageRecord && typeof window !== "undefined") {
				const cached = localStorage.getItem(`page_${pageId}`);
				if (cached) try {
					pageRecord = JSON.parse(cached);
				} catch {}
			}
			if (!pageRecord) throw new Error(`Page record #${pageId} not found in database or local backup.`);
			const userId = pageRecord.user_id;
			const pubResult = await runPublishPipeline({
				pageId,
				userId,
				templateId: pageRecord.template_id || pageRecord.content?._template_id || pageRecord.template_id,
				title: pageRecord.title || "Untitled Dedicated Website",
				slug: pageRecord.slug || pageId,
				content: pageRecord.content || {}
			});
			if (!pubResult.success) throw new Error(pubResult.error || "Failed to publish page.");
			try {
				await supabase.from("orders").update({
					status: "paid",
					paid_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", orderId);
			} catch {}
			if (typeof window !== "undefined") try {
				const cached = localStorage.getItem(`page_${pubResult.pageId}`);
				if (cached) {
					const parsed = JSON.parse(cached);
					parsed.status = "published";
					parsed.is_public = true;
					parsed.published_at = (/* @__PURE__ */ new Date()).toISOString();
					parsed.slug = pubResult.slug;
					localStorage.setItem(`page_${pubResult.pageId}`, JSON.stringify(parsed));
				}
			} catch {}
			return {
				slug: pubResult.slug,
				pageId: pubResult.pageId
			};
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-orders"] });
			qc.invalidateQueries({ queryKey: ["admin-pages"] });
			qc.invalidateQueries({ queryKey: ["pending-websites"] });
			qc.invalidateQueries({ queryKey: ["admin-stats"] });
			qc.invalidateQueries({ queryKey: ["pages"] });
		}
	});
}
function useRejectOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ orderId, pageId, notes }) => {
			await supabase.from("orders").update({
				status: "failed",
				admin_notes: notes ?? "Payment could not be verified"
			}).eq("id", orderId);
			await supabase.from("pages").update({ status: "draft" }).eq("id", pageId);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-orders"] });
			qc.invalidateQueries({ queryKey: ["admin-stats"] });
		}
	});
}
function useRequestChanges() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ orderId, notes }) => {
			const { data: order } = await supabase.from("orders").select("page_id").eq("id", orderId).single();
			await supabase.from("orders").update({ admin_notes: notes }).eq("id", orderId);
			if (order?.page_id) await supabase.from("pages").update({ status: "draft" }).eq("id", order.page_id);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-orders"] });
		}
	});
}
function useUnpublishPage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (pageId) => {
			await supabase.from("pages").update({
				status: "archived",
				is_public: false
			}).eq("id", pageId);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-orders"] });
		}
	});
}
function useAdminStats() {
	return useQuery({
		queryKey: ["admin-stats"],
		refetchInterval: 1e4,
		queryFn: async () => {
			const [orders, pages, users] = await Promise.all([
				supabase.from("orders").select("id, status, total_cents"),
				supabase.from("pages").select("id, status"),
				supabase.from("profiles").select("id")
			]);
			const o = orders.data ?? [];
			const p = pages.data ?? [];
			return {
				totalOrders: o.length,
				pendingOrders: o.filter((x) => x.status === "pending").length,
				verifiedOrders: o.filter((x) => x.status === "payment_verified").length,
				paidOrders: o.filter((x) => x.status === "paid").length,
				failedOrders: o.filter((x) => x.status === "failed").length,
				totalRevenuePaisa: o.filter((x) => x.status === "paid" || x.status === "payment_verified").reduce((s, x) => s + (x.total_cents ?? 0), 0),
				publishedPages: p.filter((x) => x.status === "published").length,
				pendingPages: p.filter((x) => x.status === "pending_approval").length,
				totalUsers: (users.data ?? []).length
			};
		}
	});
}
function usePendingWebsites() {
	return useQuery({
		queryKey: ["pending-websites"],
		queryFn: async () => {
			let dbPages = [];
			try {
				const { data, error } = await supabase.from("pages").select("*").eq("status", "pending_approval").is("deleted_at", null).order("updated_at", { ascending: false });
				if (!error && data) dbPages = data;
			} catch (e) {
				console.warn("Supabase fetch pending pages warning:", e);
			}
			const localPages = [];
			if (typeof window !== "undefined") for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith("page_")) try {
					const item = JSON.parse(localStorage.getItem(key) || "{}");
					if (item && item.id && item.status === "pending_approval") localPages.push(item);
				} catch {}
			}
			const dbIds = new Set(dbPages.map((p) => p.id));
			const missingLocal = localPages.filter((p) => !dbIds.has(p.id));
			const pendingPages = [...dbPages, ...missingLocal];
			const { data: orders } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
			const userIds = Array.from(new Set(pendingPages.map((p) => p.user_id)));
			const { data: profiles } = userIds.length > 0 ? await supabase.from("profiles").select("*").in("id", userIds) : { data: [] };
			const allOrders = orders ?? [];
			const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
			return pendingPages.map((page) => {
				const matchingOrder = allOrders.find((o) => o.page_id === page.id || o.order_items?.some((item) => item.page_id === page.id)) || null;
				const templateId = page.template_id || page.content?._template_id || page.template_id;
				return {
					page: {
						...page,
						template_id: templateId
					},
					order: matchingOrder,
					userProfile: profileMap.get(page.user_id) || null
				};
			});
		}
	});
}
//#endregion
export { useApproveOrder as a, usePlaceOrder as c, useUnpublishPage as d, useVerifyPayment as f, useAllOrders as i, useRejectOrder as l, formatPKR as n, useMarkWhatsappSent as o, useAdminStats as r, usePendingWebsites as s, PLANS_PKR as t, useRequestChanges as u };
