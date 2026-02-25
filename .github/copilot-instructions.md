# Kurt's Cykel Shop - AI Coding Agent Instructions

## Project Overview

Full-stack bike shop management system with React Native/Expo mobile app and Node.js/Express backend. Uses Docker for backend services with PostgreSQL database, JWT authentication, and Prisma ORM.

## Architecture

### Monorepo Structure

- **`/app`**: React Native mobile app (Expo + Expo Router)
- **`/backend`**: Node.js/Express API with Prisma ORM
- **`/schemas`**: Shared Zod validation schemas (imported by both frontend and backend)
- **`/config`**: Environment variables and Nginx configuration
- **`/docker`**: Docker Compose configurations

### Key Entry Points

- Root: [`package.json`](package.json) orchestrates entire stack with Docker Compose
- App: [`app/app/_layout.tsx`](app/app/_layout.tsx) → SessionProvider → routing
- Backend: [`backend/src/index.ts`](backend/src/index.ts) → Express app initialization

## Development Workflows

### Starting the Application

```bash
# Full stack (backend + app)
npm run dev                 # Starts Docker backend + Expo app
npm run backend:dev         # Only backend with Docker rebuild
npm run app:dev             # Only Expo app

# Database operations
npm run seed                # Deploy migrations and seed data
npm run prisma:generate     # Generate Prisma client

# Setup
npm run create-envs         # Copy .env.example files to actual .env files
```

### File-Based Routing (Expo Router)

- **`app/app/(auth)/`**: Protected routes group with authentication guard
- **`app/app/(auth)/(tabs)/`**: Tab navigation (index, cases, admin, tab2)
- **`app/app/login.tsx`**: Public login screen
- Route guards in [`app/app/(auth)/_layout.tsx`](<app/app/(auth)/_layout.tsx>) (currently commented out, see TODO)

## Backend Patterns

### Three-Layer Architecture

**Routes → Controllers → Services** pattern strictly enforced:

```typescript
// Example: backend/src/api/routes/auth.routes.ts
router.post("/login", authController.login);

// Controller (backend/src/api/controllers/auth.controller.ts)
export async function login(req, res) {
  const response = await AuthService.login(userObject);
  res.status(getHttpStatusCode(response.status)).json(response).end();
}

// Service (backend/src/api/services/auth.service.ts)
export async function login(userObject) {
  // Business logic, DB access via Prisma
  return { status: Status.Success, data: tokens };
}
```

### Status Enum Pattern

All API responses use [`Status` enum](backend/src/types/general.types.ts) (`Success`, `Failed`, `Unauthorized`, etc.) with standardized `APIResponse<T>` interface. Controllers call `getHttpStatusCode()` to map Status to HTTP codes.

### Prisma Configuration

- Schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)
- **Custom output path**: `backend/src/generated/prisma` (not default `node_modules/.prisma`)
- Import as: `import prisma from "@/lib/prisma"`
- Models include: User, Role, Permission, Customer, ServiceOrder, Product, Inventory

### Authentication

- **Passport.js strategies**: Local (login) + JWT (protected routes)
- **IP-bound tokens**: JWT secret includes client IP from `x-forwarded-for` header
- **Dual token system**: Access (5m) and Refresh (1h) tokens stored in `Session` + `Token` tables
- Password encoding: Base64 in transit, Argon2 in database

## Frontend Patterns

### UI Component Library

**Gluestack UI** with custom theme configuration:

- Components: [`app/components/ui/`](app/components/ui/)
- Provider: [`GluestackUIProvider`](app/components/ui/gluestack-ui-provider) wraps app
- Adding components: `npx gluestack-ui add <component>` (run from `app/` directory)

### Styling Conventions

- **NativeWind** (Tailwind for React Native): Use `className` prop with Tailwind utilities
- Color system: `primary-{0-950}`, `secondary-{0-950}`, `tertiary`, `error`, `success`, `warning`, `info`
- Example: `<Text className="text-typography-500 py-8 text-center">`
- Global styles: [`app/global.css`](app/global.css)

### API Communication

[`app/utils/apiClient.ts`](app/utils/apiClient.ts) is preconfigured Axios instance:

- Automatically adds JWT from `useStorageState("token")` to Authorization header
- Handles token refresh with retry logic on 401 responses
- Base URL from `EXPO_PUBLIC_API_URL` environment variable
- Includes ngrok header bypass: `ngrok-skip-browser-warning: 69420`

### Session Management

[`app/app/ctx.tsx`](app/app/ctx.tsx) `SessionProvider`:

- `useSession()` hook provides `signIn`, `signOut`, `session`, `isLoading`
- Session token stored in Expo SecureStore via `useStorageState`
- Base64-encodes passwords before sending to backend

### Component Structure

Feature-based organization under [`app/components/`](app/components/):

- `cases/` → `casesTable.tsx`, `casesFilterDrawer.tsx`, `casesActionRow.tsx`, `new/newCase.tsx`
- Status badges use `statusConfig` mapping: `completed` → success, `pending` → warning, etc.
- Date formatting: `new Date().toLocaleDateString("da-DK")` (Danish locale)

## Critical Integration Points

### Shared Schemas (`/schemas`)

Zod schemas imported by both app and backend:

```typescript
// schemas/auth.schema.ts
export const LoginSchema = z.object({ username: z.string(), password: z.string() });

// Backend validation
const validated = LoginSchema.parse(req.body);

// Frontend type inference
type LoginType = z.infer<typeof LoginSchema>;
```

### Docker Services

[`docker/docker-compose.yml`](docker/docker-compose.yml):

- **backend**: Node.js app on port 5000 (internal), volume-mounts `src/` for hot reload
- **db**: PostgreSQL 18 on port 5432
- **reverse-proxy**: Nginx routes incoming requests to backend
- **ngrok**: Exposes local backend via ngrok tunnel for mobile device testing
- Networks: `internal` (backend ↔ db), `public` (external access)

### Environment Variables

Split across multiple files in [`config/environment-variables/`](config/environment-variables/):

- `.env.backend.dev`: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `PORT`
- `.env.db.dev`: Postgres credentials
- `.env.docker.dev`: Docker Compose environment
- `.env.grok.dev`: Ngrok auth token and URL
- Use `npm run create-envs` to generate from `.example` files

## Important Conventions

### Path Aliases

Both app and backend use `@/` alias:

- App: `@/components`, `@/utils`, `@/hooks` → [`app/`](app/) root
- Backend: `@/api`, `@/lib`, `@/types` → [`backend/src/`](backend/src/) root
- Configured in respective `tsconfig.json` files

### Database Migrations

```bash
cd backend
npx prisma migrate dev --name <description>  # Create and apply migration
npx prisma migrate deploy                    # Production deployment
npx prisma db seed                           # Run seed script
npx prisma studio                            # GUI database browser
```

### TypeScript Strictness

- Backend uses strict type checking with custom Express types in [`backend/src/types/express.d.ts`](backend/src/types/express.d.ts)
- Request handlers: `Request<Params, ResponseBody, RequestBody, QueryString>`
- All API responses typed as `APIResponse<T>` from [`general.types.ts`](backend/src/types/general.types.ts)

### Testing & Linting

- Backend: Vitest configured (`npm run test` in [`backend/`](backend/))
- Linting: ESLint with security plugins (`eslint-plugin-security`, `eslint-plugin-no-secrets`)
- App: Expo lint (`npm run lint` in [`app/`](app/))

## Common Gotchas

1. **Prisma client location**: Import from `@/lib/prisma`, not `@prisma/client` directly
2. **Routing authentication**: Auth guard in [`(auth)/_layout.tsx`](<app/app/(auth)/_layout.tsx>) is currently disabled (see TODO comment)
3. **Token refresh**: Must use `apiClient` for authenticated requests, not `localApiClient`
4. **IP-bound tokens**: Backend tokens include client IP in signature - same user from different IP requires re-authentication
5. **Docker networking**: Backend must use container names (e.g., `db`, not `localhost`) in connection strings
6. **Gluestack commands**: Run `npx gluestack-ui add` from `app/` directory, not root
7. **Tab navigation**: Active tab defined in [`app/app/(auth)/(tabs)/_layout.tsx`](<app/app/(auth)/(tabs)/_layout.tsx>) using `@react-navigation/bottom-tabs`

## Debug & Troubleshooting

- Backend logs: `docker logs backend -f`
- Database access: `docker exec -it postgres psql -U <username> -d <database>`
- Prisma Studio: `cd backend && npx prisma studio` (opens GUI on port 5555)
- Ngrok dashboard: http://localhost:4040 (when ngrok container running)
- Reset database: `docker compose down -v` (removes volumes)

## Commit Messages (Angular Conventional Commits)

When generating commit messages, always follow Angular-style Conventional Commits.

### Header format

`<emoji> <type>(<scope>): <subject>`

- `type` is required and must be one of:
  - `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `init`
- `scope` is optional but preferred (examples: `backend`, `app`, `auth`, `prisma`, `cases`, `docker`)
- `subject` is required and must:
  - be imperative ("add", "fix", "refactor")
  - start with lowercase
  - have no trailing period
  - be concise (ideally <= 72 chars)

### Required emoji mapping

- `🎉 init:`
- `✨ feat:`
- `🐞 fix:`
- `📃 docs:`
- `🌈 style:`
- `🦄 refactor:`
- `🎈 perf:`
- `🧪 test:`
- `🔧 build:`
- `🐎 ci:`
- `🐳 chore:`
- `↩ revert:`

Always use the exact emoji that matches the commit `type`.

### Body and footer rules

- Use a body only when context is needed (what and why, not how)
- Wrap body lines around 72 characters
- For breaking changes, add footer:
  - `BREAKING CHANGE: <description>`
- For issue references, use footers such as:
  - `Closes #123`
  - `Refs #456`

### Output constraints for Copilot

- Return only the commit message text (no markdown, no quotes, no explanations)
- Prefer one logical change per commit message
- Avoid generic subjects like "update code" or "fix stuff"
- Always include the emoji prefix before the type

### Examples

- `✨ feat(auth): add refresh token rotation`
- `🐞 fix(cases): handle empty customer name in table`
- `🦄 refactor(prisma): centralize session cleanup logic`
- `🐳 chore(docker): align compose service names`
- `🎉 init(app): create expo bootstrap setup`
