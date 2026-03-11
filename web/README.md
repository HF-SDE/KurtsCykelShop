# 🌐 Web Catalogue (`web/`)

Next.js storefront for Kurts Cykel Shop.

## ✨ Overview

The web app provides:

- 🛍️ public catalogue of items from backend inventory
- 🔎 fast search across name, SKU, and description
- ↕️ sorting by name, price, and stock
- 📦 stock-aware UI states (`På lager`, `Få tilbage`, `Udsolgt`)
- 🌗 light/dark theme toggle
- 🎨 animated card visuals and gradient effects

## 🏗️ Architecture

### 📂 Folder Structure

| Path               | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `app/page.tsx`     | Server-rendered home page fetching catalogue data   |
| `app/layout.tsx`   | Root layout, metadata, fonts, theme provider wiring |
| `components/`      | Feature and reusable UI components                  |
| `components/ui/`   | shadcn-based primitives (`Button`, `Card`, `Input`) |
| `lib/apiClient.ts` | Axios instance configured from `BACKEND_URL`        |
| `types/`           | Domain types (inventory, service orders, users, UI) |
| `app/globals.css`  | Tailwind v4 theme tokens, dark mode, animations     |

### 🔄 Data Flow

1. `app/page.tsx` runs on the server.
2. It calls `GET items/public` via `lib/apiClient.ts`.
3. `Catalogue` receives items and renders searchable/sortable cards.

## 🧰 Tech Stack

- ⚛️ Next.js 16 (App Router) + React 19
- 🎨 Tailwind CSS v4 + shadcn/ui + `tw-animate-css`
- 🌗 `next-themes` for theme switching
- 🧠 Axios for backend API calls
- 🌀 `@shadergradient/react`, `three`, `@react-three/fiber` for visual effects

## ⚙️ Environment Variables

Required:

| Variable      | Purpose                                 | Default               |
| ------------- | --------------------------------------- | --------------------- |
| `BACKEND_URL` | Base URL used by server-side Axios call | `http://backend:5000` |

Dev template lives at:

- `../config/environment-variables/.env.web.example`

Generated dev file:

- `../config/environment-variables/.env.web.dev`

## 🚀 Local Development

## ▶️ Option A: Run Web App Directly (fastest for UI work)

From `web/`:

```bash
npm install
BACKEND_URL=http://localhost/api npm run dev
```

Then open `http://localhost:3000`.

Use this when backend is running through root Docker setup with Nginx on port `80`.

## 🐳 Option B: Run Full Docker Stack From Repo Root

From repository root:

```bash
npm run create-envs
npm run backend:dev
```

Then open `http://localhost` (served by Nginx -> `web`), with API at `http://localhost/api`.

## 🧪 Scripts

From `web/`:

| Command         | Purpose                  |
| --------------- | ------------------------ |
| `npm run dev`   | Start Next.js dev server |
| `npm run build` | Create production build  |
| `npm run start` | Run production server    |
| `npm run lint`  | Run ESLint               |

## 🐳 Docker Notes

- `web/Dockerfile` uses `node:20-bookworm-slim`.
- Container command is `npm run dev`.
- In Compose dev, Nginx routes:
  - `/` -> `web:3000`
  - `/api` -> `backend:5000`

## 🩺 Troubleshooting

- 📭 Catalogue is empty:
  - verify backend is running and seeded (`npm run seed` from repo root)
  - check `GET /api/items/public` returns data
- 🌐 `ECONNREFUSED` or fetch failures:
  - verify `BACKEND_URL` points to a reachable host from where Next.js runs
  - inside Docker use `http://backend:5000`; on host use `http://localhost/api`
- 🔁 Theme mismatch/hydration warning:
  - keep theme usage client-side (`next-themes`), as implemented in `components/theme-provider.tsx`
