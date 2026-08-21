# vinext-starter

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.hosting/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## CaseZero Production

The deployed application is available at <https://casezero-mvp.raknair.workers.dev>.

Leadership and integration endpoints:

- `/dashboard`: operational leadership dashboard with First Contact Resolution
- `/reports`: detailed FCR cohort, channel, leakage, and measurement reporting
- `GET /api/dashboard/metrics`: operational and FCR metrics
- `POST /api/integrations/servicenow/fcr`: authenticated, idempotent ServiceNow incident ingestion

The ServiceNow integration uses workspace-specific connector tokens and remote D1 persistence. See [SERVICENOW_FCR_INTEGRATION.md](SERVICENOW_FCR_INTEGRATION.md) for the REST Message, custom field, and Business Rule configuration.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm run deploy:workers`: build and deploy to Cloudflare Workers (requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`)
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Cloudflare Deploy

This repo includes `.github/workflows/deploy-workers.yml`, which deploys `main` to Cloudflare Workers after a successful build using [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action).

### Required GitHub Secrets

| Secret                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token (see required permissions below)           |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (found in the Cloudflare dashboard)  |

### Required API Token Permissions

Create the token at <https://dash.cloudflare.com/profile/api-tokens> with these permissions:

- **Account > Workers Scripts > Edit** — deploy the Worker script
- **Account > Workers Assets > Write** — upload static assets (required by wrangler 4.x)
- **User > User Details > Read** — wrangler identity diagnostics
- **User > Memberships > Read** — wrangler account discovery

### How It Works

The build writes a generated Wrangler config to `dist/server/wrangler.json` plus a redirect at
`.wrangler/deploy/config.json`. The workflow therefore runs a bare `wrangler deploy` so that redirect is
honoured — passing `--config wrangler.json` would bypass it and drop the `nodejs_compat` flag.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
