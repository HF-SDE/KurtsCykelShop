# Kubernetes secret setup

## Current architecture diagram

The current Kubernetes architecture (as defined by manifests in `k8s/base` and overlays) is documented as Mermaid in:

- `k8s/architecture-current.mmd`

Notes:

- This diagram reflects the manifests in this repository.
- It intentionally shows **no Ingress resource** because none is defined.
- PostgreSQL is shown as a **Deployment** (not StatefulSet), matching `base/db-deployment.yaml`.

This folder contains placeholder values in Secret manifests.
Do not commit real secrets to git.

## Option A (recommended): create/update secrets with kubectl

Run from repo root:

```powershell
kubectl create secret generic backend-secret \
  --from-literal=ACCESS_TOKEN_SECRET="<access-secret>" \
  --from-literal=REFRESH_TOKEN_SECRET="<refresh-secret>" \
  --from-literal=DATABASE_URL="postgresql://<user>:<password>@db:5432/KurtsCykelShop" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic db-secret \
  --from-literal=POSTGRES_PASSWORD="<postgres-password>" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic cloudflare-tunnel-secret \
  --from-literal=CLOUDFLARE_TUNNEL_TOKEN="<cloudflare-tunnel-token>" \
  --dry-run=client -o yaml | kubectl apply -f -
```

Then apply manifests:

```powershell
kubectl apply -k .\k8s\overlays\dev
```

## Option B: edit placeholder files locally

Update placeholder values in:

- `base/backend-secret.yaml`
- `base/db-secret.yaml`
- `base/cloudflare-tunnel-secret.yaml`

Then apply:

```powershell
kubectl apply -k .\k8s\overlays\dev
```

## Quick commands

From repo root:

```powershell
npm run k8s:build-backend
npm run k8s:dry-run
npm run k8s:apply
npm run k8s:status
```
