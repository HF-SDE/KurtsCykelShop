# App Guide

## Key Locations

- App root layout: `app/app/_layout.tsx`
- Session context: `app/app/ctx.tsx`
- Auth routes: `app/app/(auth)/`
- Tab routes: `app/app/(auth)/(tabs)/`
- API client: `app/utils/apiClient.ts`

## Conventions

- Expo Router for navigation
- NativeWind utility classes for styling
- Gluestack UI components under `app/components/ui/`
- Shared schema usage from `schemas/`

## Session And API

- Store token with secure storage hooks
- Use `apiClient` for authenticated requests
- Rely on configured refresh logic for 401 handling

## Common Commands

From `app/`:

```bash
npm run dev
npm run lint
```

From repo root:

```bash
npm run app:dev
npm run app:dev:tunnel
```

## Mobile Testing Tips

- ensure `EXPO_PUBLIC_API_URL` is correct
- ensure ngrok and backend are both reachable
- use seeded users for quick sign-in verification
