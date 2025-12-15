
# Snippets Hub — Backend Ultra PRO+
Funciones añadidas: **Workspaces/RBAC**, **Versionado**, **Papelera (soft delete)**, **API Tokens**, **Webhooks**, **Búsqueda avanzada**, **SSO dev stub**, **Analytics**.

## Desarrollo
1. Crea `.env` desde `.env.example` y ajusta `DATABASE_URL`.
2. `npm install && npx prisma generate && npx prisma migrate dev --name init`
3. `npm start` ➜ `http://localhost:5000` (docs en `/docs`)

## Notas
- OAuth real requiere credenciales; se incluye **/api/v1/auth/oauth/dev** como stub.
- Refresh token se guarda en **cookie httpOnly** (segura).
- Usa `workspaceId` al crear/snippets para asignarlos a un workspace.
