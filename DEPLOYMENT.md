# CP5 — Cloud deployment record

## Student and repository

| Field | Status |
|---|---|
| Name | Verify and enter privately when submitting the assignment |
| Mã học viên | Do not publish the student ID in this repository; provide it through the course submission channel |
| Repository | Personal GitHub repository (`origin` is configured locally) |

## Deployment status

| Field | Status |
|---|---|
| Public URL | https://day12-agent.onrender.com |
| Selected platform | Render; Free plan requested in `render.yaml` (dashboard billing state not verified) |
| Deployment date | 2026-09-29 (public endpoint checked at 14:45 UTC) |

The public endpoint responds. Render dashboard access is unavailable here, so
the plan and billing state have not been checked. The live `/ready` response
does not include a `redis` field; verify the Redis binding in Render before
claiming Redis evidence. Never paste an API key or Redis credential into this
file.

### Zero-cost limits

- **Render:** choose Free for both the web service and Key Value. Free web
  services spin down after 15 minutes idle and can take about a minute to wake.
  Render grants 750 free instance hours per workspace monthly. Free Key Value
  has 25 MB and no persistence; data can disappear after a restart. Render can
  bill outbound bandwidth and build-pipeline overages when a payment method is
  attached; without one, it disables affected services/builds instead. For the
  required $0 cap, use a workspace with no payment method attached. If Render
  requires adding one, stop before creating the Blueprint.
- Do not approve paid compute or overages. Verify the workspace is on the free
  Hobby plan before creating the Blueprint; this assignment must stay at $0.

## Required environment variables

The values below are declared in `render.yaml`; actual dashboard values were
not inspected in this session.

| Variable | Required source/status |
|---|---|
| `PORT` | Supplied by the hosting platform |
| `AGENT_API_KEY` | Prompted as a secret by `render.yaml`; dashboard value not verified |
| `REDIS_URL` | Wired to `day12-redis` Key Value connection string; live connection not confirmed |
| `RATE_LIMIT_PER_MINUTE` | Declared as `10`; dashboard value not verified |
| `MONTHLY_BUDGET_USD` | Declared as `10.0`; dashboard value not verified |
| `LOG_LEVEL` | Declared as `INFO`; dashboard value not verified |

## Verification after deployment

The following checks were run against the public URL on 2026-09-29:

```bash
curl -i <SERVICE_URL>/health
curl -i <SERVICE_URL>/ready
curl -i -X POST <SERVICE_URL>/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Hello"}'
```

Expected: `/health` returns 200, `/ready` returns 200 with Redis connected, and
`/ask` without `X-API-Key` returns 401. Run an authenticated ask and a burst of
requests only after the private API key has been set in the platform dashboard.

### Observed results

```text
GET /health -> HTTP 200
{"status":"ok","version":"1.0.0","environment":"production","uptime_seconds":219.7,"total_requests":7,"checks":{"llm":"mock"},"timestamp":"2026-09-29T14:45:24.528762+00:00"}

GET /ready -> HTTP 200
{"ready":true}

POST /ask without X-API-Key -> HTTP 401
{"detail":"Invalid or missing API key. Include header: X-API-Key: <key>"}
```

`/ready` returned 200 but did not report `redis: true`, so Redis connectivity
still needs confirmation in the Render dashboard or from an updated readiness
response.

### Screenshots

After deployment, add genuine captures to `screenshots/`:

- `screenshots/dashboard.png` — the service and connected Redis on the selected platform.
- `screenshots/health.png` — the deployed `/health` response.

No cloud screenshots are present yet.

## Local fallback

If cloud deployment is unavailable, CP5 can use `LOCAL_FALLBACK=true` in the
local `.env`; the rubric caps this path at 9/15. Start the Compose stack, verify
`/health`, `/ready`, and unauthenticated `/ask`, then capture a genuine local
terminal or browser screenshot in `screenshots/`. Record the actual reason for
using fallback before submitting.
