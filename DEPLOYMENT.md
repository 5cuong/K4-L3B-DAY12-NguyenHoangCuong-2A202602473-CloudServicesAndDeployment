# CP5 — Cloud deployment record

## Student and repository

| Field | Value |
|---|---|
| Name | Nguyễn Hoàng Cường |
| Mã học viên | 2A202602473 |
| Repository | https://github.com/5cuong/K4-L3B-DAY12-NguyenHoangCuong-2A202602473-CloudServicesAndDeployment |

## Deployment

| Field | Value |
|---|---|
| Public URL | https://day12-agent-rr5v.onrender.com |
| Platform | Render Blueprint; web service and Key Value both on Free plans |
| Deployed | 2026-09-29, from main commit 7aed726 |

The service binds to 0.0.0.0 and reads the platform-provided PORT. The Render dashboard shows the web service as Live and the Key Value instance as Available. Free Key Value has no persistence, so data may reset after restart.

## Environment variables

Only variable names are recorded here; secret values remain in Render.

| Variable | Source |
|---|---|
| AGENT_API_KEY | Entered in Render by the student |
| REDIS_URL | Render Key Value connection string wired by render.yaml |
| RATE_LIMIT_PER_MINUTE | render.yaml sets 10 |
| MONTHLY_BUDGET_USD | render.yaml sets 10.0 |
| LOG_LEVEL | render.yaml sets INFO |
| PORT | Supplied by Render |

## Public verification

Checks performed on 2026-09-29 against the live service:

```bash
URL=https://day12-agent-rr5v.onrender.com
curl -i "$URL/health"
curl -i "$URL/ready"
curl -i -X POST "$URL/ask" -H "Content-Type: application/json" -d '{"question":"Hello"}'
```

```text
GET /                 -> HTTP 200, Cloud Agent · Day 12 HTML page
GET /health           -> HTTP 200, {"status":"ok","service":"day12-agent","version":"1.0.0"}
GET /ready            -> HTTP 200, {"status":"ready","redis":true}
GET /docs             -> HTTP 200, Swagger UI
GET /openapi.json     -> HTTP 200
POST /ask without key -> HTTP 401
```

The unauthenticated request confirms the API key gate without exposing a secret. An authenticated request requires the private service key as DEPLOY_API_KEY in the local ignored .env.

## Screenshots

The screenshots/ directory contains genuine captures of the live homepage, public status checks, and Swagger documentation taken on 2026-09-29. The status capture shows /health 200, /ready with redis: true, and unauthenticated /ask 401. Direct Render dashboard and standalone /health captures are still required if the assessor requires the exact filenames screenshots/dashboard.png and screenshots/health.png.

## Local fallback

The cloud deployment is live; local fallback was not used. If needed, the documented fallback uses LOCAL_FALLBACK=true in a local .env and docker compose up -d.
