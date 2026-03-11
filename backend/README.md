# 🛠️ Backend (`backend/`)

Express + Prisma API for Kurts Cykel Shop.

## ✨ Overview

The backend provides:

- 🔐 authentication (`/login`, `/logout`, `/refreshToken`, `/accessToken`)
- 📚 Swagger docs (`/docs`, no trailing-slash redirect)
- 👤 profile endpoints (`/profile`)
- 🔧 service order workflows (`/service-orders`)
- 📦 inventory/storage APIs (`/items`, `/vendors`, `/locations`, `/units`, `/item-statuses`)
- 👥 admin management (`/manage` users/roles/permissions)

The API runs on port `5000` and exposes health at `/health`.
Swagger UI is available at `/docs` when you hit the backend directly, or `/api/docs` through the bundled Nginx proxy.

## 🏗️ Architecture

### 📂 Folder Structure

| Path                   | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `src/index.ts`         | App bootstrap, middleware setup, route mounting |
| `src/api/routes/`      | Route definitions + middleware wiring           |
| `src/api/controllers/` | HTTP layer (req/res handling)                   |
| `src/api/services/`    | Business logic and DB operations                |
| `src/lib/prisma.ts`    | Prisma client + DB error helper                 |
| `src/lib/passport.ts`  | JWT and local auth strategies                   |
| `src/middleware/`      | `verifyJWT`, permission checks, validation      |
| `prisma/schema.prisma` | Database schema                                 |
| `prisma/migrations/`   | Prisma migrations                               |
| `prisma/seed.ts`       | Dev/test seed data generation                   |

### 🔄 Request Pipeline

1. Request enters Express app.
2. Middleware runs (`cors`, `helmet`, JSON parser, rate limiter, passport).
3. Route-level auth/permission middleware runs (`verifyJWT`, `isAllowed`).
4. Controller validates/parses request, delegates to service.
5. Service executes business logic and Prisma queries.
6. Standard API response is returned (`status`, optional `message`, optional `data`).

## 🔐 Security And Auth Model

### 🔑 Login / Token Lifecycle

- `POST /login` expects body:
  - `username`
  - `password` as Base64-encoded string
- Backend decodes password, authenticates via Passport local strategy.
- On success, backend issues:
  - access token
  - refresh token
- Tokens are persisted in `Session` + `Token` tables.

### 🌐 IP-Bound Tokens

JWT signing secret uses:

- `ACCESS_TOKEN_SECRET + clientIp`
- `REFRESH_TOKEN_SECRET + clientIp`

Because of this, forwarded IP headers matter in proxy setups:

- app sets `trust proxy`
- Nginx forwards `X-Forwarded-For`

### 🧩 Permission Checks

- Protected routes call `verifyJWT`.
- Role-based permission checks use `isAllowed([...permissionCodes])`.
- Permission type union is generated from DB into root `permissions.d.ts`.

Regenerate after permission changes:

```bash
npm run prisma:generate
```

## 🛣️ API Route Groups

| Base Path         | Notes                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| `/`               | Auth endpoints (`/login`, `/logout`, `/accessToken`, `/refreshToken`) |
| `/profile`        | Profile fetch and password reset                                      |
| `/manage`         | Users/roles/permissions management                                    |
| `/service-orders` | Service order list/create/update + repairs/parts                      |
| `/customers`      | Customer search for order creation                                    |
| `/items`          | Inventory items (public + protected endpoints)                        |
| `/vendors`        | Vendor CRUD + pagination                                              |
| `/locations`      | Location CRUD + pagination                                            |
| `/units`          | Unit CRUD                                                             |
| `/item-statuses`  | Item status reads                                                     |
| `/user`           | User listing (JWT-protected)                                          |

## 🗄️ Database

- 🐘 Provider: PostgreSQL
- 🔷 ORM: Prisma (`@prisma/client`)
- 🔌 Adapter: `@prisma/adapter-pg`
- 🧬 Client output: `src/generated/prisma`

### 🧱 Main Domain Areas

- Identity and access: `User`, `Role`, `Permission`, `PermissionGroup`, `Session`, `Token`
- Service orders: `ServiceOrder`, `ServiceRepair`, `ServicePartsUsed`, `ServiceOrderInvoice`, logs
- Storage/inventory: `Item`, `Unit`, `Vendor`, `Location`, `Barcode`, `InventoryTransaction`, `SaleLog`, logs

## ⚙️ Environment Variables

Primary vars used by backend:

| Variable                    | Purpose                      |
| --------------------------- | ---------------------------- |
| `NODE_ENV`                  | Runtime mode                 |
| `PORT`                      | API port (default `5000`)    |
| `DATABASE_URL`              | PostgreSQL connection string |
| `ACCESS_TOKEN_SECRET`       | Access JWT secret            |
| `REFRESH_TOKEN_SECRET`      | Refresh JWT secret           |
| `ACCESS_TOKEN_EXPIRATION`   | Access token lifetime        |
| `REFRESH_TOKEN_EXPIRATION`  | Refresh token lifetime       |
| `RATE_LIMIT_COUNT`          | Request limit per window     |
| `RATE_LIMIT_RESET_MINUTES`  | Rate-limit window length     |
| `MAX_FAILED_LOGIN_ATTEMPTS` | Login lock threshold         |
| `ATTEMPT_WINDOW_MINUTES`    | Login lock window            |

See templates:

- `../config/environment-variables/.env.backend.example`
- `.env.example` (backend-local convenience)

## 🚀 Local Development

## 🐳 Option A (Recommended): Run Through Root Compose

From repository root:

```bash
npm run backend:dev
```

This starts backend + postgres + reverse-proxy + ngrok with mounted source and live reload.

## ▶️ Option B: Run Backend Process Directly

1. Ensure PostgreSQL is reachable.
2. Set `DATABASE_URL` and required secrets.
3. From `backend/`:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

## 🌱 Seed Data

From repository root:

```bash
npm run seed
```

Seed includes:

- 🧩 roles/permissions
- 👥 test users
- 📦 inventory, vendors, locations, units
- 🧾 customers, service orders, repairs, transactions, logs

## 🧪 Quality Commands

From `backend/`:

```bash
npm run lint
npm run test
npm run build:tsc
```

## 🐳 Docker Notes

- `Dockerfile` and `Dockerfile.k8s` build runtime images.
- `entrypoint.sh` currently:
  - compiles TypeScript (`npm run build:tsc`)
  - deploys migrations
  - regenerates Prisma client

This means container startup includes build + migration work by default.

## 🩺 Troubleshooting

- 🚫 `401`/`403` on protected endpoints:
  - verify `Authorization: Bearer <token>`
  - verify request path has the needed permission code for that user
- 🔁 Token refresh loop:
  - ensure consistent client IP forwarding through proxy/tunnel
- 🧯 Prisma errors:
  - check `DATABASE_URL`
  - run `npx prisma migrate deploy`
  - regenerate with `npm run prisma:generate`
