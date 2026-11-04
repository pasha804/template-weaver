<div align="center">

<img src="https://img.shields.io/badge/TEMPLATE%20WEAVER-Interactive%20SaaS-f97316?style=for-the-badge&logoColor=white"/>

# TEMPLATE WEAVER
### Enterprise-Grade Interactive Dedication Page Builder & Commercial Template SaaS

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TanStack](https://img.shields.io/badge/TanStack-Router%20%26%20Query-FF4154?style=for-the-badge)](https://tanstack.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Edge%20Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

> *Transform heartfelt memories into interactive, cinematic web experiences.*

16 high-polish interactive template plugins for Anniversaries, Birthdays, Proposals, Weddings, and more — with live accordion form editing, instant viewport preview, 3-step checkout, and seamless Vercel edge deployment.

<br/>

[🚀 Quick Start](#-quick-start) · [🎭 Templates](#-live-template-showcase) · [🏗️ Architecture](#-architecture) · [🛠️ Tech Stack](#-technology-stack) · [🌐 Deploy](#-deployment)

</div>

---

## 🌟 Why Template Weaver?

Generic card generators produce forgettable results. Template Weaver produces **cinematic experiences** — interactive pages with particle physics, 3D animations, real-time personalization, and commercial-grade checkout. Every template is a fully self-contained plugin that can be extended, forked, or sold.

---

## 🎭 Live Template Showcase — 16 Plugins

| # | Template | Theme | Category | Interactive Highlights |
|---|----------|-------|----------|----------------------|
| 1 | `anniversary-galaxy` | Galaxy Romance | Anniversary | Starfield Canvas, Floating Audio, Memory Cards, Typewriter Love Letter |
| 2 | `anniversary-romantic` | Midnight Romance | Anniversary | Aurora Blobs, Flip Cards, Wax Seal Vows, Tap-to-Reveal Envelope |
| 3 | `birthday-aurora` | Aurora Waves | Birthday | Particle Waves, Age Reveal Counter, Confetti Blast, Photo Slideshow |
| 4 | `birthday-bloom` | Floral Bloom | Birthday | Floating Petals, Cake Candle Blowout, Virtual Hug & Wishes |
| 5 | `birthday-galaxy` | Celestial Wishes | Birthday | Cosmic Backdrop, Milestone Journey Timeline, Glowing Wishes |
| 6 | `birthday-magical` | Enchanted Kingdom | Birthday | 15 Interactive Storybook Scenes, Magical Wand Cursor, Golden Envelope |
| 7 | `birthday-rose` | Rose Petals | Birthday | Falling Rose Petals, Photo Carousel, Romantic Dedication Letter |
| 8 | `birthday-surprise` | 3D Vault Keypad | Birthday | Interactive PIN Lock Keypad, Unlocking Gift Box & Surprise Reveal |
| 9 | `congratulations-triumph` | Royal Triumph | Congratulations | 3D Spring Envelope Tilt, Vinyl Record Player with Sound Controls |
| 10 | `proposal-cook` | Culinary Recipe | Proposal | Interactive Quiz & Culinary Ingredients Reveal |
| 11 | `proposal-romantic` | Heart Glow | Proposal | Heart Particle Systems, Proposal Ring Reveal Box, Floating Confetti |
| 12 | `sorry-apology` | Heartfelt Apology | Sorry | Animated Runaway "NO" Button, Gentle Letter, Apology Card |
| 13 | `sorry-sweet` | Sweet Forgiveness | Sorry | 37 Public GIF Assets, Song Lyrics Card, Forgiveness Prompt |
| 14 | `sorry-teddy` | Teddy Hug | Sorry | Animated Bear Interactive Hug, Handwritten Diary Notes |
| 15 | `wedding-eternal` | Royal Navy & Gold | Wedding | Parallax Hero, Couple Bio, Interactive RSVP Form, Schedule Timeline |
| 16 | `wedding-petals` | Plum & Copper | Wedding | Falling Petals, Function Events Schedule, Photo Gallery |

---

## 🏗️ Architecture

```
src/
├── components/              # UI Components
│   ├── home/                # Hero, FeaturedTemplates, Features, FAQ
│   ├── layout/              # Navbar, Footer, Mobile Navigation
│   └── template-editor/     # EditorTopBar, EditorFormPanel, Field Inputs
├── engine/                  # Extensible Plugin Core Engine
│   ├── registry.ts          # Auto-discovery (import.meta.glob)
│   ├── types.ts             # TemplateManifest, SectionDef, TemplateConfig
│   └── combined.ts          # Marketplace unified template catalog
├── external-templates/      # 16 External Interactive Template Plugins
│   ├── anniversary-galaxy/
│   ├── birthday-aurora/
│   └── ... (all 16)
├── hooks/                   # Custom React Query & Auth Hooks
├── integrations/            # Supabase Postgres client & types
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx           # Root layout
│   ├── index.tsx            # Landing page
│   ├── templates/           # Template catalog & detail
│   ├── editor/              # Live editor (/editor/template/:templateId)
│   ├── checkout/            # Checkout (/checkout/:pageId)
│   ├── p/                   # Zero-margin public viewer (/p/:slug)
│   ├── demo/                # Standalone fullscreen demo
│   └── dashboard/           # User dashboard & analytics
└── store/                   # Zustand global state
```

---

## ✨ Engineering Highlights

- 🎨 **16 Extensible Template Plugins** — Each is a self-contained, independently deployable interactive experience
- ⚡ **Zero-Lag Accordion Form Editor** — Zustand-powered with 30s auto-save + LocalStorage backup
- 👁️ **Instant Live Preview** — Renders the generated public page without leaving the editor
- 📱 **Full-Screen Public Rendering** — Published pages strip all chrome and own the viewport
- 🔐 **Supabase Auth** — Email auth with strict validation, password reset, and RBAC
- 💳 **Local 3-Step Checkout** — PKR pricing, JazzCash/EasyPaisa/Bank, payment screenshot upload, WhatsApp notifications
- 🛠️ **Admin Control Panel** — Review orders, verify payments, approve/reject publications
- 🚀 **Vercel Edge Ready** — Pre-configured Nitro compilation for zero-downtime deployment

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Core** | React 19, TypeScript 5.8, Vite 6 |
| **Routing** | TanStack Router (file-based, type-safe) |
| **State** | Zustand v5, TanStack Query v5 |
| **Backend & DB** | Supabase (Postgres, RLS, RPCs, GoTrue Auth) |
| **Styling** | Tailwind CSS v4, Lucide Icons, OKLCH Colors |
| **Animations** | Framer Motion 12, Canvas Confetti, GSAP, React Three Fiber |
| **Deployment** | Nitro Engine, Cloudflare / Vercel Workers |

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ · Supabase account

```bash
# 1. Clone and install
git clone https://github.com/pasha804/template-weaver.git
cd template-weaver
npm install

# 2. Configure Supabase
cp .env.example .env
# Edit .env:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Start development server
npm run dev
# → http://localhost:5173
```

---

## 🌐 Deployment

```bash
# Type check (must be 0 errors)
npx tsc --noEmit

# Production build
npm run build

# Preview production bundle
npm run preview
```

**Vercel:** Push to GitHub → import in Vercel Dashboard → set env vars → Deploy.

The included `vercel.json` handles all routing configuration automatically.

---

## 📄 License

MIT © Pasha Dev

---

<div align="center">

**TEMPLATE WEAVER** — Transform heartfelt memories into cinematic web experiences.

*Created by **Pasha Dev***

</div>
