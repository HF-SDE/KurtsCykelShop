# Kubernetes secret setup

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
kubectl apply -k .\k8s
```

## Option B: edit placeholder files locally

Update placeholder values in:

- `backend-secret.yaml`
- `db-secret.yaml`
- `cloudflare-tunnel-secret.yaml`

Then apply:

```powershell
kubectl apply -k .\k8s
```
