# 🧭 Architecture

## 🧭 Hierarchy

[Home](Home.md) -> `Architecture`

## 🗂️ Monorepo Layout

- `app/`: 📱 Expo React Native app
- `backend/`: 🛠️ Express API with Prisma ORM
- `schemas/`: 📐 shared Zod validation schemas
- `config/`, `docker/`, `k8s/`: ⚙️ infra and environment setup
- `web/`: 🌐 Next.js web surface

## 🔁 High-Level Flow

```text
Expo App (app/)
  -> API calls to EXPO_PUBLIC_API_URL (/api)
    -> Nginx reverse proxy
      -> Express API (backend/)
        -> Prisma ORM
          -> PostgreSQL
```

## 🤝 Shared Contracts

- Schema definitions live in `schemas/`.
- Both app and backend consume these schemas for validation and typing.
- `permissions.d.ts` is generated and acts as permission union source of truth.

## 🧩 Backend Design Pattern

Routes -> Controllers -> Services

- routes define endpoints and middleware
- controllers translate HTTP into service calls
- services contain business logic and DB access

## 🔐 Authentication Summary

- Passport local and JWT strategies
- Access and refresh token flow
- Session and token tables for persistence
- Token validation depends on secret and client IP
