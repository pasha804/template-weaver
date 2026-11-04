# SHAUKAT TECHS TEMPLATES — Technical Blueprint

> This document is the contract every module must follow. Read it before adding
> a feature. If an implementation disagrees with this document, one of the two
> is wrong — fix it, don't fork the convention.

## 1. Runtime & stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Framework      | TanStack Start v1 (SSR, file-based routing), React 19, TypeScript |
| Build          | Vite 7, Tailwind CSS v4 (CSS-first, `src/styles.css`)             |
| Server logic   | `createServerFn` (RPC) + `src/routes/api/public/*` (raw HTTP)     |
| Database       | PostgreSQL (Lovable Cloud) with RLS on every table                |
| Auth           | Cloud Auth — email/password + Google, JWT + refresh managed       |
| Storage        | Cloud Storage buckets, signed uploads, per-user quota accounting  |
| Payments       | Stripe (Lovable managed) — orders, coupons, invoices              |
| State          | TanStack Query (server state), Zustand + Immer (editor state)     |
| Animation      | Framer Motion (component/page), GSAP (scroll/parallax), CSS       |
| Validation     | Zod everywhere — client forms and server function inputs          |

Runtime is an edge worker. No `child_process`, `sharp`, `fs.watch`, or native
addons in server code. Read `process.env` **inside** handlers only.

## 2. Folder structure

```
docs/ARCHITECTURE.md          this document
src/
  blocks/                     reusable block library (the render primitives)
    types.ts                  BlockDefinition / FieldDef contracts
    registry.ts               type -> definition map (single source of truth)
    components/               one file per block family
  templates/                  plugin-based template packs
    contract.ts               TemplatePlugin contract + Zod meta schema
    registry.ts               auto-discovery via import.meta.glob
    <template-id>/
      manifest.ts             id, name, category, pricing, preview media
      schema.ts               Zod schema for the template's content
      theme.ts                theme tokens (colors, fonts, radius)
      animations.ts           motion presets used by the renderer
      renderer.tsx            composes blocks into the final page
  components/
    ui/                       shadcn primitives (variants only, no overrides)
    marketing/                landing sections
    app/                      shell, nav, sidebars
    editor/                   visual editor panels & canvas
  features/                   feature-scoped hooks/services
  lib/                        pure utils, formatters, guards
    *.functions.ts            server functions (client-importable)
    *.server.ts               server-only helpers (never client-imported)
  routes/                     file-based routes (see §6)
  integrations/supabase/      generated clients — never edit
```

## 3. Database schema

All tables use `uuid` primary keys, `created_at`/`updated_at` timestamps,
`deleted_at` for soft deletion where relevant, and foreign keys with explicit
`ON DELETE` behaviour. Every table has RLS enabled plus explicit `GRANT`s.

| Domain     | Tables                                                                             |
| ---------- | ---------------------------------------------------------------------------------- |
| Identity   | `profiles`, `user_roles`, `permissions`, `role_permissions`                        |
| Catalog    | `categories`, `templates`, `template_media`                                        |
| Pages      | `pages`, `page_versions`                                                           |
| Analytics  | `page_views`                                                                       |
| Commerce   | `orders`, `order_items`, `subscriptions`, `invoices`, `coupons`                    |
| Social     | `reviews`, `favorites`, `recently_viewed`, `notifications`                         |
| CMS        | `blog_posts`, `cms_blocks`, `email_templates`                                      |
| Support    | `support_tickets`, `ticket_messages`                                               |
| Platform   | `settings`, `feature_flags`, `audit_logs`, `storage_objects`                       |

### RBAC

Roles live **only** in `user_roles` (`app_role` enum: `admin`, `moderator`,
`support`, `user`). Never store a role on `profiles`. Authorization is decided
by the `SECURITY DEFINER` functions `public.has_role(uuid, app_role)` and
`public.is_admin()`, which are called from RLS policies. `permissions` and
`role_permissions` express finer capability grants for the admin UI.

Access rules in short:

- A user reads and writes only rows where `user_id = auth.uid()`.
- Anonymous visitors read `templates`, `categories`, `blog_posts`, `settings`,
  `feature_flags`, approved `reviews`, and `pages` that are published, public,
  and not expired.
- Admins have full access through `public.is_admin()`.

## 4. Template plugin architecture

A template is a **folder**, not a database row body. The database stores catalog
metadata (`templates.plugin_id` links to the folder). Adding a template means
adding a folder — no existing file is modified.

```ts
export interface TemplatePlugin<C = unknown> {
  manifest: TemplateManifest;   // id, name, slug, category, tags, price, media
  schema: z.ZodType<C>;         // validates content
  defaults: C;                  // seed content for a new page
  theme: TemplateTheme;         // colors, fonts, radius, background
  animations: AnimationPreset;  // entrance, transition, ambient
  blocks: BlockInstance[];      // default block composition
  Renderer: TemplateRenderer<C>;
}
```

`src/templates/registry.ts` collects every `*/manifest.ts` with
`import.meta.glob(..., { eager: true })`. Marketplace, editor, and admin all
read from the registry, so a new folder appears everywhere at once.

## 5. Block library

A block is `{ id, type, props }` persisted in `pages.blocks` (JSONB). Each block
type registers a `BlockDefinition`:

```ts
interface BlockDefinition<P> {
  type: string;
  label: string;
  group: "content" | "media" | "effects" | "interactive";
  schema: z.ZodType<P>;
  defaults: P;
  fields: FieldDef[];          // drives the editor inspector automatically
  Component: FC<BlockRenderProps<P>>;
}
```

`FieldDef.kind` is the editor widget: `text`, `textarea`, `richtext`, `image`,
`video`, `audio`, `color`, `gradient`, `font`, `number`, `date`, `boolean`,
`select`, `list-text`, `list-image`, `animation`.

The inspector renders purely from `fields` — no per-template editor code exists
anywhere in the app. That is the rule that makes the platform scale.

## 6. Routing map

```
/                        landing
/templates               marketplace (search, filter, sort)
/templates/$slug         template detail, preview, reviews
/pricing                 plans
/blog, /blog/$slug       CMS
/faq, /contact           support surfaces
/auth                    sign in / sign up / reset (email + Google)
/p/$slug                 published page (password / PIN / expiry gate)
/dashboard               user home
/dashboard/pages|analytics|orders|favorites|billing|settings|notifications
/editor/$pageId          visual editor
/admin/*                 admin console (role-gated)
/api/public/track        first-party analytics beacon
```

Public routes never call auth-protected server functions from a loader.

## 7. Editor architecture

Zustand + Immer store: `{ page, blocks, selectedId, past[], future[], dirty }`.

- Every mutation pushes the previous state onto `past` (capped at 50).
- `undo`/`redo` move snapshots between `past`/`future`.
- Autosave is a debounced (1.2s) server function call; explicit saves also write
  a `page_versions` snapshot.
- The canvas renders the real template renderer inside a width-constrained frame
  (`desktop 100% / tablet 834px / mobile 390px`), so preview equals production.
- dnd-kit provides block reordering; the inspector is generated from `fields`.

## 8. Storage, payments, analytics

- **Storage** — uploads go through a server function that validates MIME and
  size, writes to the bucket, records `storage_objects`, and increments
  `profiles.storage_used_bytes`. Quota is enforced before the write.
- **Payments** — `orders` + `order_items` are created server-side from a price
  table, never from client-supplied amounts. Coupons validate against
  `coupons.is_active`, expiry, and `max_redemptions`.
- **Analytics** — `/api/public/track` accepts a page id, hashes the visitor IP
  with a daily salt (no raw IP stored), and inserts into `page_views`.
  Dashboards aggregate by day, country, device, and referrer.

## 9. Security rules

1. RLS on every table; policies scoped `TO authenticated` or `TO anon`
   explicitly. `service_role` grants only for privileged server paths.
2. `supabaseAdmin` is imported **inside** a handler, after the caller is
   authorized. Never at module scope, never for ordinary reads.
3. Every server function validates input with Zod.
4. Page passwords are stored as SHA-256 hashes with a per-page salt, never in
   plain text; the gate check happens server-side.
5. `/api/public/*` handlers verify their caller and never return PII.
6. CSRF middleware stays registered in `src/start.ts`.

## 10. Design system rules

Colours, gradients, shadows, and motion easings are tokens in `src/styles.css`
(`oklch` only). Components use semantic classes (`bg-primary`, `text-muted-
foreground`, `glass`, `shadow-lift`). Hardcoded colour utilities
(`text-white`, `bg-[#...]`) are forbidden — they break theming and dark mode.

Typography: `Sora` for display, `Manrope` for body. Motion: entrance
animations use the `--ease-smooth` curve; ambient effects respect
`prefers-reduced-motion`.
