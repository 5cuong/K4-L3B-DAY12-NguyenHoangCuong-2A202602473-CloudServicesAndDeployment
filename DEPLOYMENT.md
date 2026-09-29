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
| Public URL | Not deployed yet; no public URL is claimed |
| Platforms requested | Try both Render Free (`render.yaml`) and Railway Free (`railway.toml`); compare health, readiness, and auth checks |
| Deployment date | Pending deployment |

No cloud resource has been created. The deployment CLIs and authenticated
browser session are unavailable in this workspace. Deploy from each matching
configuration only after signing in to the existing account, choosing its Free
plan, and verifying the billing guard below. Never paste an API key or Redis
credential into this file.

### Zero-cost limits

- **Render:** choose Free for both the web service and Key Value. Free web
  services spin down after 15 minutes idle; free Key Value is memory-only and
  may lose data when restarted. Render grants 750 free instance hours per
  workspace monthly. If a payment method is attached, bandwidth/build overages
  can be billed; without one, Render disables services instead.
- **Railway:** use the Free plan only; do not upgrade to Hobby. Free includes
  $1 monthly usage credit after any 30-day trial. The Free API limit is 100
  requests per hour; this is a control-plane API limit, not the agent's
  `/health` request limit. Stop if the account asks for a paid upgrade or a
  paid resource.
- Do not add a payment method or approve paid compute. If one is already attached
  to Render, remove it or set a spend limit before deployment.

## Required environment variables

| Variable | Required source/status |
|---|---|
| `PORT` | Supplied by the hosting platform |
| `AGENT_API_KEY` | Generate a private key and set it as a platform secret; currently not set on cloud |
| `REDIS_URL` | Private connection string from the platform Redis service; currently not set on cloud |
| `RATE_LIMIT_PER_MINUTE` | Set to `10` |
| `MONTHLY_BUDGET_USD` | Set to `10.0` |
| `LOG_LEVEL` | Set to `INFO` |

## Verification after deployment

After replacing `<SERVICE_URL>` with the actual URL, run these checks and record
their real output below:

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

Pending a real cloud deployment. Do not copy local test results into this section
as cloud evidence.

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
