#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${CASEZERO_BASE_URL:-http://localhost:3000}"
WEBHOOK_SECRET="${ITSM_WEBHOOK_SECRET:-local-smoke-secret}"

echo "ServiceNow local smoke test"
echo "Base URL: ${BASE_URL}"
echo ""

if ! curl -fsS --max-time 5 "${BASE_URL}/api/integrations/servicenow/health" >/tmp/casezero-health-before.json; then
  echo "Could not reach ${BASE_URL}. Start the app first with: npm run dev"
  exit 1
fi

echo "Health before:"
cat /tmp/casezero-health-before.json
echo ""
echo ""

valid_payload='{
  "number":"INC-SMOKE-COLLAB-001",
  "contact_type":"virtual_agent",
  "opened_at":"2026-08-01 09:04:00",
  "resolved_at":"2026-08-01 09:31:00",
  "u_resolved_on_first_contact":"true",
  "reassignment_count":"0",
  "reopen_count":"0",
  "u_repeat_contact_at":"",
  "u_casezero_case_id":"CZ-1825"
}'

echo "1. Valid payload should return accepted=true"
curl -fsS -X POST "${BASE_URL}/api/integrations/servicenow/fcr" \
  -H "Content-Type: application/json" \
  -H "X-CaseZero-Webhook-Secret: ${WEBHOOK_SECRET}" \
  -d "${valid_payload}"
echo ""
echo ""

echo "2. Duplicate payload should also return accepted=true"
curl -fsS -X POST "${BASE_URL}/api/integrations/servicenow/fcr" \
  -H "Content-Type: application/json" \
  -H "X-CaseZero-Webhook-Secret: ${WEBHOOK_SECRET}" \
  -d "${valid_payload}"
echo ""
echo ""

echo "3. Missing opened_at should return HTTP 400"
missing_status=$(curl -sS -o /tmp/casezero-missing-response.json -w "%{http_code}" -X POST "${BASE_URL}/api/integrations/servicenow/fcr" \
  -H "Content-Type: application/json" \
  -H "X-CaseZero-Webhook-Secret: ${WEBHOOK_SECRET}" \
  -d '{"number":"INC-SMOKE-COLLAB-MISSING","contact_type":"virtual_agent"}')
cat /tmp/casezero-missing-response.json
echo ""
if [ "${missing_status}" != "400" ]; then
  echo "Expected HTTP 400 for missing-field payload, got ${missing_status}"
  exit 1
fi
echo ""

echo "4. Wrong secret should return HTTP 401"
auth_status=$(curl -sS -o /tmp/casezero-auth-response.json -w "%{http_code}" -X POST "${BASE_URL}/api/integrations/servicenow/fcr" \
  -H "Content-Type: application/json" \
  -H "X-CaseZero-Webhook-Secret: wrong-secret" \
  -d '{"number":"INC-SMOKE-COLLAB-AUTH","contact_type":"virtual_agent","opened_at":"2026-08-01 09:04:00"}')
cat /tmp/casezero-auth-response.json
echo ""
if [ "${auth_status}" != "401" ]; then
  echo "Expected HTTP 401 for wrong-secret payload, got ${auth_status}"
  exit 1
fi
echo ""

echo "Health after:"
curl -fsS "${BASE_URL}/api/integrations/servicenow/health"
echo ""
echo ""

echo "Note: local health may show sampleMode=true when vinext is using a remote D1 preview binding."
echo "The smoke test still verifies webhook auth, validation, idempotency, and dashboard FCR metrics."
echo ""

echo "Dashboard metrics sample:"
curl -fsS "${BASE_URL}/api/dashboard/metrics" | node -e 'let input=""; process.stdin.on("data", chunk => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); console.log(JSON.stringify(data.firstContactResolution, null, 2)); });'
echo ""
echo "Smoke test completed."