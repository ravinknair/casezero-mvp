# CaseZero Collaborator Runbook

This is the no-questions-needed path for Mandar and Iranga to run, validate, and demo CaseZero locally.

## What CaseZero Is Now

CaseZero is FCR intelligence for AI-assisted support operations. It connects ServiceNow incident snapshots, measures true First Contact Resolution, tracks leakage from reopens/reassignments/repeat contacts, and presents leadership-ready reports.

Key local pages:

- Dashboard: http://localhost:3000/dashboard
- ServiceNow onboarding: http://localhost:3000/admin/integrations/servicenow
- Leadership brief: http://localhost:3000/reports/leadership-brief
- Security posture: http://localhost:3000/security
- Reports: http://localhost:3000/reports

## First-Time Setup

```bash
git clone https://github.com/ravinknair/casezero-mvp.git
cd casezero-mvp
chmod +x setup-collaborator.sh
./setup-collaborator.sh
```

The setup script installs app dependencies and creates `casezero-mvp/.dev.vars` with a local-only dummy webhook secret:

```text
ITSM_WEBHOOK_SECRET=local-smoke-secret
```

That file is ignored by git. Do not put real production secrets in chat or commits.

## Daily Local Run

From the repository root:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/dashboard
```

If the dev server says another vinext server is already running but the browser cannot connect, remove the stale generated lock and restart:

```bash
rm -f casezero-mvp/.vinext/dev/lock.json
npm run dev
```

## Validate Before Pushing

From the repository root:

```bash
npm run lint
npm run test
npm run build
```

Or run the whole app check:

```bash
npm run check
```

Current expected test count: 16 passing tests.

## Local ServiceNow Smoke Test

Start the app first:

```bash
npm run dev
```

In a second terminal, from the repository root:

```bash
npm run smoke:servicenow
```

The smoke test verifies:

- valid payload returns `accepted: true`
- duplicate payload stays idempotent
- missing `opened_at` returns HTTP 400
- wrong secret returns HTTP 401
- dashboard FCR metrics still respond
- integration health endpoint responds

Local health can still show `sampleMode: true` when vinext is using a remote D1 preview binding. That is acceptable for local collaborator smoke tests as long as the webhook responses and dashboard FCR metrics update.

## Cloudflare / D1 Work

Most local product work does not require Cloudflare login. Cloudflare is needed for remote migrations, secrets, and deploys.

Log in:

```bash
cd casezero-mvp
./node_modules/.bin/wrangler login
./node_modules/.bin/wrangler whoami
```

Check pending remote migrations:

```bash
./node_modules/.bin/wrangler d1 migrations list casezero-mvp --remote
```

Apply pending remote migrations:

```bash
./node_modules/.bin/wrangler d1 migrations apply casezero-mvp --remote
```

Confirm the ServiceNow health table exists remotely:

```bash
./node_modules/.bin/wrangler d1 execute casezero-mvp --remote --command "select name from sqlite_master where type = 'table' and name = 'servicenow_integration_events';" --json
```

Set the production ServiceNow webhook secret only in a real terminal prompt:

```bash
./node_modules/.bin/wrangler secret put ITSM_WEBHOOK_SECRET
```

Do not send the secret through chat, email, screenshots, or commits.

## Production Deploy

From the app directory:

```bash
cd casezero-mvp
npm run build
./node_modules/.bin/wrangler deploy
```

Production URL:

```text
https://casezero-mvp.raknair.workers.dev
```

## Common Problems

### Cloudflare error 7403

Re-auth Wrangler and retry:

```bash
cd casezero-mvp
./node_modules/.bin/wrangler logout
./node_modules/.bin/wrangler login
./node_modules/.bin/wrangler d1 migrations apply casezero-mvp --remote
```

### Wrangler says an update is available

Update from the app directory:

```bash
cd casezero-mvp
npm install -D wrangler@latest
./node_modules/.bin/wrangler --version
npm run lint
npm run test
```

### Lint reports generated `.wrangler` files

The repo ignores `.wrangler/**` and `.vinext/**` in ESLint. If this returns after a dependency update, keep generated folders ignored; do not edit generated Worker bundle files.

### Local webhook says ServiceNow ingestion is not configured

Make sure `casezero-mvp/.dev.vars` exists:

```bash
cp casezero-mvp/.dev.vars.example casezero-mvp/.dev.vars
npm run dev
```

## Ownership Notes

- Use branches for changes: `git checkout -b feature/name`
- Run `npm run check` before opening a PR
- Keep secrets out of source control
- Prefer the app-local Wrangler binary: `casezero-mvp/node_modules/.bin/wrangler`