# ☸️ Kubernetes Secret Setup

## 🏗️ Current Architecture Diagram

The current Kubernetes architecture (as defined by manifests in `k8s/base` and overlays) is documented as Mermaid in:

- `k8s/architecture-current.mmd`

### 🖼️ Project Report Diagrams

#### Figur 7: Kubernetes Architecture

![Figur 7 - Kubernetes Architecture](../.github/images/project-rapport/figur%207.svg)

#### Figur 8: Deployment Diagram

![Figur 8 - Deployment Diagram](../.github/images/project-rapport/figur%208.svg)

Notes:

- 🧭 This diagram reflects the manifests in this repository.
- 🚫 It intentionally shows **no Ingress resource** because none is defined.
- 🐘 PostgreSQL is shown as a **Deployment** (not StatefulSet), matching `base/db-deployment.yaml`.

This folder contains placeholder values in Secret manifests.
🔒 Do not commit real secrets to git.

## 🅰️ Option A (Recommended): Create/Update Secrets With kubectl

Run from repo root:

```powershell
$NAMESPACE = "kurts-cykel-shop"

kubectl create secret generic backend-secret `
  -n $NAMESPACE `
  --from-literal=ACCESS_TOKEN_SECRET="<access-secret>" `
  --from-literal=REFRESH_TOKEN_SECRET="<refresh-secret>" `
  --from-literal=DATABASE_URL="postgresql://<user>:<password>@db:5432/KurtsCykelShop" `
  --dry-run=client -o yaml | kubectl apply -n $NAMESPACE -f -

kubectl create secret generic db-secret `
  -n $NAMESPACE `
  --from-literal=POSTGRES_PASSWORD="<postgres-password>" `
  --dry-run=client -o yaml | kubectl apply -n $NAMESPACE -f -

kubectl create secret generic cloudflare-tunnel-secret `
  -n $NAMESPACE `
  --from-literal=CLOUDFLARE_TUNNEL_TOKEN="<cloudflare-tunnel-token>" `
  --dry-run=client -o yaml | kubectl apply -n $NAMESPACE -f -
```

Then apply manifests:

```powershell
kubectl apply -n $NAMESPACE -k .\k8s\overlays\dev
```

## 🅱️ Option B: Edit Placeholder Files Locally

Update placeholder values in:

- `base/backend-secret.yaml`
- `base/db-secret.yaml`
- `base/cloudflare-tunnel-secret.yaml`

Then apply:

```powershell
kubectl apply -k .\k8s\overlays\dev
```

## 🐧 Deploy On Linux

Run from repository root in a Linux shell (`bash`/`zsh`).

### 1) Prerequisites

- `kubectl` installed and connected to your cluster
- `docker` installed (only required if you build images locally)
- access to a Kubernetes namespace where you can create Secrets/Deployments

### 2) Create/Update Secrets

```bash
NAMESPACE="kurts-cykel-shop"

kubectl create secret generic backend-secret \
  -n "$NAMESPACE" \
  --from-literal=ACCESS_TOKEN_SECRET="<access-secret>" \
  --from-literal=REFRESH_TOKEN_SECRET="<refresh-secret>" \
  --from-literal=DATABASE_URL="postgresql://<user>:<password>@db:5432/KurtsCykelShop" \
  --dry-run=client -o yaml | kubectl apply -n "$NAMESPACE" -f -

kubectl create secret generic db-secret \
  -n "$NAMESPACE" \
  --from-literal=POSTGRES_PASSWORD="<postgres-password>" \
  --dry-run=client -o yaml | kubectl apply -n "$NAMESPACE" -f -

kubectl create secret generic cloudflare-tunnel-secret \
  -n "$NAMESPACE" \
  --from-literal=CLOUDFLARE_TUNNEL_TOKEN="<cloudflare-tunnel-token>" \
  --dry-run=client -o yaml | kubectl apply -n "$NAMESPACE" -f -
```

### 3) Apply Kubernetes Manifests

```bash
kubectl apply -n "$NAMESPACE" -k ./k8s/overlays/dev
```

### 4) Verify Deployment

```bash
kubectl get deployments -n "$NAMESPACE"
kubectl get pods -n "$NAMESPACE"
kubectl get services -n "$NAMESPACE"
kubectl get ingress -n "$NAMESPACE"
```

## ⚡ Quick Commands

From repo root:

```powershell
npm run k8s:build-backend
npm run k8s:build-web
npm run k8s:dry-run
npm run k8s:apply
npm run k8s:status
```
