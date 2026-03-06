# Getting Started

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop
- ngrok account and token for device testing

## First-Time Setup

From repository root:

```bash
npm install
npm run create-envs
```

Configure environment files:

- `config/environment-variables/.env.db.dev`
- `config/environment-variables/.env.backend.dev`
- `config/environment-variables/.env.grok.dev`
- `config/environment-variables/.env.docker.dev`
- `app/.env`

## Run The Stack

```bash
npm run dev
```

Useful alternatives:

- `npm run backend:dev`
- `npm run app:dev`
- `npm run app:dev:tunnel`

## Seed Data

```bash
npm run seed
```

## Common Root Commands

- `npm run prisma:generate`: regenerate Prisma client and permissions typing
- `npm run k8s:dry-run`: validate Kubernetes dev overlay
- `npm run k8s:apply`: apply Kubernetes dev overlay
- `npm run k8s:status`: check pod and deployment status
