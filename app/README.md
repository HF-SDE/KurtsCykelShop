# 📱 Frontend App (`app/`)

Expo React Native app for Kurts Cykel Shop employees.

## ✨ Overview

The app provides:

- 🔐 login and token-backed sessions
- 🧩 permission-aware tab navigation
- 📦 storage workflows (list, search, filter, barcode scan, create/edit/delete item)
- 🔧 service order workflows (list, create, detail actions)
- 👥 admin access to roles and users (permission-gated)
- 👤 profile and password reset

## 🏗️ Architecture

### 🧱 Core Building Blocks

| Area                           | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `app/app/`                     | Expo Router route tree                                |
| `app/ctx.tsx`                  | Session/auth context                                  |
| `contexts/permissions.ctx.tsx` | Permission decoding and page access checks            |
| `utils/apiClient.ts`           | Axios client + auth interceptors + token refresh flow |
| `hooks/useData.ts`             | Generic data fetching with in-memory cache            |
| `hooks/usePaginatedData.ts`    | Paginated data + search/filter state                  |
| `components/`                  | Feature and reusable UI components                    |
| `components/ui/`               | Gluestack UI wrappers/styled primitives               |

### 🧭 Navigation Structure

- Root layout: `app/app/_layout.tsx`
  - wires providers (`SessionProvider`, `PermissionsProvider`, UI/theme providers)
- Auth guard layout: `app/app/(auth)/_layout.tsx`
  - redirects unauthenticated users to `/login`
- Tabs layout: `app/app/(auth)/(tabs)/_layout.tsx`
  - shows tab screens based on `hasPageAccess(...)`

### 🔐 Permissions In The UI

Permissions are decoded from JWT payload and mapped to page names.

Examples:

- `case:*` permissions unlock Case tab/screens
- `storage:*` permissions unlock Storage tab/screens
- `administrator:*` permissions unlock Management features

## 🔌 API Integration

### 🌐 Base URL

`EXPO_PUBLIC_API_URL` controls API target and should include `/api`.

Example:

```env
EXPO_PUBLIC_API_URL=https://your-domain.ngrok-free.app/api
```

### 🔑 Auth Flow In Client

1. Login screen posts `username` + Base64-encoded password to `/login`.
2. Access token is stored via `useStorageState` (SecureStore/native storage wrapper).
3. `apiClient` request interceptor adds `Authorization: Bearer <token>`.
4. If token is expired:
   - `GET /refreshToken` with expired access token
   - `POST /accessToken` with refresh token
5. On auth failure, token is cleared and user is redirected to `/login`.

## 🧩 Feature Modules

### 📦 Storage

Key files:

- route context: `app/app/(auth)/(tabs)/storage/ctx.tsx`
- list screen: `app/app/(auth)/(tabs)/storage/index.tsx`
- new item: `app/app/(auth)/(tabs)/storage/new-item.tsx`
- edit item: `app/app/(auth)/(tabs)/storage/[id]/edit-item.tsx`

Highlights:

- 📄 paginated API loading (`/items/paginated`)
- 🔎 search + filters + infinite scroll
- 🧾 barcode scanner action sheet
- ✅ create/edit forms validated with shared Zod schemas from `../schemas`
- ⚡ optimistic local state updates after create/edit/delete

### 🛠️ Cases

Key files:

- list screen: `app/app/(auth)/(tabs)/case/index.tsx`
- create screen: `app/app/(auth)/(tabs)/case/new.tsx`
- details: `app/app/(auth)/(tabs)/case/[id].tsx`

### 👥 Admin

Admin entry screen is in `app/app/(auth)/(tabs)/admin/index.tsx` and routes to roles/users screens based on page access.

## ⚙️ Environment Setup

Required file:

- `app/.env` (can be copied from `.env.example`)

Current example keys:

- `EXPO_PUBLIC_API_URL`
- `CMAKE_VERSION` (kept for native toolchain workflows)

## 🚀 Running The App

From repository root:

```bash
npm run app:dev
```

Or from `app/` directly:

```bash
npm start
```

Other scripts:

```bash
npm run android
npm run ios
npm run web
npm run tunnel
npm run lint
```

## 🎨 Styling And UI

- 🌬️ NativeWind + Tailwind config: `tailwind.config.js`
- 🧩 Gluestack component wrappers: `components/ui/`
- 🖼️ SVG support via Metro transformer: `metro.config.js`
- 🎛️ Global styles: `global.css`

## 🔗 Shared Contracts

This app imports shared types/schemas via aliases:

- `@schemas/*` -> `../schemas/*`
- `@permission-types` -> `../permissions.d.ts`

This keeps frontend forms and backend validation aligned.

## 🛠️ Common Development Workflow

1. Add/update schema in `../schemas`.
2. Use schema types in app forms/hooks/components.
3. Implement corresponding backend route/service changes.
4. If permissions changed in DB, regenerate `permissions.d.ts`.
5. Validate manually in Expo app and API logs.

## 🩺 Troubleshooting

- 🚧 App stuck on login redirect:
  - confirm backend is reachable from device
  - confirm `EXPO_PUBLIC_API_URL` is correct and includes `/api`
- 🚫 401 after some time:
  - check refresh endpoints `/refreshToken` and `/accessToken`
  - verify tunnel/proxy configuration keeps consistent forwarding headers
- 📭 Storage list empty:
  - ensure backend is seeded (`npm run seed` from repo root)
  - inspect API responses in console/network logs
