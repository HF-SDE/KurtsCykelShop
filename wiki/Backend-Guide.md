# Backend Guide

## Key Locations

- Entry point: `backend/src/index.ts`
- API: `backend/src/api/`
- Prisma schema: `backend/prisma/schema.prisma`
- Prisma client import path: `@/lib/prisma`

## Development Commands

From `backend/`:

```bash
npm run dev
npm run test
```

From repo root:

```bash
npm run backend:dev
npm run seed
npm run prisma:generate
```

## API Response Convention

Use `Status` enum and `APIResponse<T>` structure.

Controller pattern:

1. validate and normalize request input
2. call service
3. map `Status` to HTTP code with `getHttpStatusCode`
4. return typed response body

## Prisma Notes

- Use migrations for schema changes
- Keep generated client in sync
- Do not import default `@prisma/client` where custom path is expected

## Troubleshooting

- tail backend logs via Docker
- verify database connectivity and env vars
- confirm reverse proxy and forwarded headers for auth flows
