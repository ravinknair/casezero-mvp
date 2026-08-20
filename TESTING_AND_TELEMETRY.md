# CaseZero — Running Tests & Viewing Telemetry

## Run all tests on the live website

1. Open https://casezero-mvp.raknair.workers.dev/status.
2. The dashboard automatically runs all 16 checks: 9 case-workflow tests and 7 live API smoke tests.
3. Click **Run all tests** to rerun them at any time.
4. A successful run displays **16 / 16 checks passed** with no red failure rows.

The API smoke tests create a temporary `CZ-SMOKE-*` case, validate it, and remove it after the run.

## Running tests

### Root project (`/`)
```bash
cd /Users/ravinair/Documents/GitHub/casezero-mvp
npm test
```
Runs `node --test tests/casezero-e2e.test.mjs` — 9 tests covering the detect → diagnose → decide → act → verify flow for each case type, approvals, rejections, stop-conditions, and idempotency.

### `casezero-mvp/` copy
```bash
cd /Users/ravinair/Documents/GitHub/casezero-mvp/casezero-mvp
npm test
```
Same 9-test suite, run against the mvp copy.

### Full check (tests + build)
```bash
npm run test:full
```

## Running the app locally

```bash
cd /Users/ravinair/Documents/GitHub/casezero-mvp
pnpm dev
```
Opens at `http://localhost:3000`. Uses `.env.local` for the Azure Application Insights connection string (already configured).

## Viewing telemetry in Azure

Telemetry is sent from these API routes whenever you use the app:
- `CaseCreated` — creating a case
- `CaseStatusChanged` — moving a case through detect/diagnose/decide/act/verify
- `ApprovalDecision` — approving or rejecting a recommendation

**Azure resource details:**
- Tenant: `GoMandy101` (`GoMandy101.onmicrosoft.com`)
- Subscription: `Visual Studio Enterprise`
- Resource group: `casezero-rg`
- Application Insights resource: `casezero-appinsights` (East US)

**Steps to view data:**
1. Go to https://portal.azure.com and make sure you're in the `GoMandy101` directory (top-right account menu → switch directory if needed).
2. Search **"casezero-appinsights"** in the top search bar and open it.
3. For near real-time events while testing: left nav → **Investigate → Live Metrics**.
4. For historical/queryable data: left nav → **Monitoring → Logs**, then run a query, e.g.:
   ```kusto
   customEvents
   | order by timestamp desc
   | take 50
   ```
5. To filter to a specific event type:
   ```kusto
   customEvents
   | where name == "CaseStatusChanged"
   | order by timestamp desc
   ```

Note: ingestion can take a couple of minutes to show up in **Logs** (Live Metrics is faster, near-instant).

## Environment variable reference

`.env.local` (gitignored, local dev only):
```
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=817f2602-ab2f-41fe-a09a-3543a03c4c9e;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=22dbeda5-4339-494b-af55-769bbf5c39ec
```

For the deployed Cloudflare Worker (`casezero-mvp.raknair.workers.dev`), set the same value as a secret instead:
```bash
npx wrangler secret put APPLICATIONINSIGHTS_CONNECTION_STRING
```
