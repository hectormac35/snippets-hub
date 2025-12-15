
# Snippets Hub Ultra PRO+ — Docker Compose

## Estructura
.
├─ backend/   (API Express + Prisma/PostgreSQL)
├─ frontend/  (React, SPA)
└─ docker-compose.yml

## Uso
1) Copia `.env.example` a `.env` y ajusta valores si quieres.
2) Construye y levanta todo:
   ```bash
   docker compose up --build
   ```
3) URLs:
   - Web: http://localhost:3000
   - API: http://localhost:5000
   - Docs: http://localhost:5000/docs
   - Salud: http://localhost:5000/health
   - Métricas: http://localhost:5000/metrics

## Notas
- El frontend toma `REACT_APP_API_URL` en **build** (configurable en `.env`).
- La API ejecuta `prisma migrate deploy` al arrancar.
- Para reiniciar limpio la DB: `docker compose down -v` (borra el volumen `pgdata`).
