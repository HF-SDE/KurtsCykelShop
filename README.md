# Kurts Cykel Shop Monorepo

This repository contains the full stack for Kurts Cykel Shop:
- `app/`: Expo React Native app used by employees.
- `backend/`: Express + Prisma API used by the app.
- `schemas/`: Shared Zod schemas used across frontend and backend.
- `config/`, `docker/`, `k8s/`: Environment, Docker Compose, and Kubernetes setup.

## What The System Does

The platform supports:
- employee login and session handling
- role/permission-based page and API access
- storage/inventory management (items, vendors, locations, units, barcodes)
- service order and repair workflows
- admin management for users, roles, and permissions

## Monorepo Architecture

```text
Expo App (app/)
  -> API calls to EXPO_PUBLIC_API_URL (/api)
    -> ngrok tunnel (dev, optional but used for mobile devices)
      -> Nginx reverse proxy (config/nginx.conf)
        -> Express API (backend/)
          -> Prisma ORM
            -> PostgreSQL

Shared validation/types:
  app/ + backend/ <- schemas/*.ts (Zod)
  app/ + backend/ <- permissions.d.ts (generated from DB permissions)
```

### Important Folders

| Path | Purpose |
|---|---|
| `app/` | Expo Router frontend, Gluestack UI components, auth/session + permissions handling |
| `backend/` | Express API, routes/controllers/services, Prisma schema + migrations + seed |
| `schemas/` | Shared Zod schemas (`auth`, `item`, `serviceOrder`, etc.) |
| `config/environment-variables/` | `.env` templates used by Docker Compose and backend |
| `docker/` | Local/prod Docker Compose definitions |
| `k8s/` | Kubernetes base manifests and dev/prod overlays |

## Tech Stack

- Frontend: Expo, React Native, Expo Router, NativeWind, Gluestack UI, Axios
- Backend: Node.js, Express 5, Prisma, PostgreSQL, Passport JWT/Local, Zod
- Infra: Docker Compose, Nginx reverse proxy, ngrok, Kubernetes manifests

## Prerequisites

- Node.js 20+ (repo currently uses Node 24 Docker images)
- npm
- Docker Desktop (for local API + DB stack)
- ngrok account/domain (for device testing outside localhost)

## Getting Started (Recommended)

1. Install dependencies:

```bash
npm install
```

2. Create local dev env files from templates:

```bash
npm run create-envs
```

3. Configure environment files:
- `config/environment-variables/.env.db.dev`
- `config/environment-variables/.env.backend.dev`
- `config/environment-variables/.env.grok.dev`
- `config/environment-variables/.env.docker.dev`
- `app/.env` (copy from `app/.env.example` if needed)

4. Start full dev setup (backend containers + Expo app):

```bash
npm run dev
```

This command:
- starts Docker Compose from `docker/docker-compose.yml`
- starts `backend`, `postgres`, `reverse-proxy`, and `ngrok`
- starts Expo in `app/`

## First Login (After Seeding)

If you need seed data:

```bash
npm run seed
```

Seed creates users including:
- `admin` / `admin`
- `kurt` / `12345678`
- `medarbejder` / `87654321`
- `elev` / `elev`

## Common Commands (Root)

| Command | Purpose |
|---|---|
| `npm run dev` | Start backend containers + Expo app |
| `npm run backend:dev` | Start/rebuild backend stack only |
| `npm run app:dev` | Start Expo app only |
| `npm run app:dev:tunnel` | Start Expo with tunnel mode |
| `npm run seed` | Run Prisma migrations + seed data |
| `npm run prisma:generate` | Regenerate Prisma client and permission type |
| `npm run k8s:dry-run` | Validate k8s overlay |
| `npm run k8s:apply` | Apply dev overlay |
| `npm run k8s:status` | Show k8s deployment/pod status |

## Shared Contracts: `schemas/` And Permissions

- Request/response validation is centralized in `schemas/` (Zod).
- Backend references these schemas in route validation and services.
- Frontend also imports the same schemas/types for form validation.
- `permissions.d.ts` is generated from DB permissions and used as the source of truth for permission string unions.

When permission rows change in DB, regenerate:

```bash
npm run prisma:generate
```

## Deployment Notes

- Kubernetes manifests live in `k8s/` with `base/` + `overlays/dev|prod`.
- Secret handling instructions are documented in [`k8s/README.md`](k8s/README.md).
- `docker/docker-compose.prod.yml` still references legacy `client/` and `admin/` services; verify/update it before relying on it for production builds in this repo state.

## Troubleshooting

- App cannot reach API:
  - check `app/.env` `EXPO_PUBLIC_API_URL`
  - check ngrok URL matches `.env.grok.dev` + `.env.docker.dev`
  - verify backend health at `http://localhost/health` and API health at `http://localhost/api/health`
- Unauthorized after login:
  - ensure requests pass through reverse proxy with forwarded IP headers
  - tokens are tied to `secret + client IP` in backend auth logic
- Empty UI lists:
  - run `npm run seed`
  - verify `DATABASE_URL` and backend container logs

## Additional Docs

- Backend details: [`backend/README.md`](backend/README.md)
- Frontend details: [`app/README.md`](app/README.md)

