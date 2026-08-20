# ServiceNow FCR Integration

CaseZero accepts idempotent ServiceNow incident snapshots at:

```text
POST /api/integrations/servicenow/fcr
X-CaseZero-Webhook-Secret: <ITSM_WEBHOOK_SECRET>
Content-Type: application/json
```

ServiceNow is also supported through the vendor-neutral ITSM endpoint by sending `"provider": "servicenow"`:

```text
POST /api/integrations/itsm/fcr
```

See `ITSM_INTEGRATIONS.md` for Zendesk, Jira Service Management, Salesforce Service Cloud, and Freshservice payloads.

Production endpoint:

```text
https://casezero-mvp.raknair.workers.dev/api/integrations/servicenow/fcr
```

## Cloudflare Setup

Create the Worker secret from a terminal. Enter the value only at Wrangler's hidden prompt:

```bash
wrangler secret put ITSM_WEBHOOK_SECRET
```

Do not store the secret in source control or send it through chat.

Use the custom `X-CaseZero-Webhook-Secret` header in ServiceNow. ServiceNow may replace the standard `Authorization` header when an authentication profile is selected. Bearer authorization remains supported for other clients.

## ServiceNow REST Message

Create an outbound REST Message named `CaseZero FCR` with an HTTP Method named `post`:

- HTTP method: `POST`
- Authentication type: `No authentication`
- `Content-Type` header: `application/json`
- `X-CaseZero-Webhook-Secret` header: the same value stored in `ITSM_WEBHOOK_SECRET`

Do not use ServiceNow Basic Authentication for this endpoint.

## ServiceNow Payload

Configure an outbound REST message or Business Rule for incident insert/update events. Send:

```json
{
  "number": "INC0012048",
  "contact_type": "virtual_agent",
  "opened_at": "2026-08-01 09:04:00",
  "resolved_at": "2026-08-01 09:31:00",
  "u_resolved_on_first_contact": "true",
  "reassignment_count": "0",
  "reopen_count": "0",
  "u_repeat_contact_at": "",
  "u_casezero_case_id": "CZ-1825"
}
```

For the reusable HTTP Method, replace the literal values with variables:

```json
{
  "number": "${number}",
  "contact_type": "${contact_type}",
  "opened_at": "${opened_at}",
  "resolved_at": "${resolved_at}",
  "u_resolved_on_first_contact": "${resolved_on_first_contact}",
  "reassignment_count": "${reassignment_count}",
  "reopen_count": "${reopen_count}",
  "u_repeat_contact_at": "${repeat_contact_at}",
  "u_casezero_case_id": "${casezero_case_id}"
}
```

Required fields are `number`, `contact_type`, and `opened_at`. The CaseZero case ID is optional. Ticket updates overwrite the same interaction by `number`, so retries do not inflate the FCR denominator.

Recommended ServiceNow trigger conditions:

- On incident insert
- When state changes to Resolved or Closed
- When `reassignment_count` or `reopen_count` changes
- When the repeat-contact field changes

The dashboard uses a seven-day validation window. New records remain pending until that window closes.

## Incident Fields

The standard Incident fields used by the integration are:

- `number`
- `contact_type` (shown as Channel in current ServiceNow releases)
- `opened_at`
- `resolved_at`
- `reassignment_count`
- `reopen_count`

Add these fields when the ServiceNow instance does not already provide an equivalent:

- `u_resolved_on_first_contact` as True/False
- `u_repeat_contact_at` as Date/Time
- `u_casezero_case_id` as String

## Business Rule

Create an active advanced Business Rule named `Send Incident FCR to CaseZero` on the Incident table. Run it `after` insert and update with order `100`.

```javascript
(function executeRule(current, previous) {
  try {
    var request = new sn_ws.RESTMessageV2('CaseZero FCR', 'post');

    request.setStringParameterNoEscape('number', current.getValue('number') || '');
    request.setStringParameterNoEscape('contact_type', current.getValue('contact_type') || 'web');
    request.setStringParameterNoEscape('opened_at', current.getValue('opened_at') || '');
    request.setStringParameterNoEscape('resolved_at', current.getValue('resolved_at') || '');
    request.setStringParameterNoEscape('resolved_on_first_contact', current.getValue('u_resolved_on_first_contact') || 'false');
    request.setStringParameterNoEscape('reassignment_count', current.getValue('reassignment_count') || '0');
    request.setStringParameterNoEscape('reopen_count', current.getValue('reopen_count') || '0');
    request.setStringParameterNoEscape('repeat_contact_at', current.getValue('u_repeat_contact_at') || '');
    request.setStringParameterNoEscape('casezero_case_id', current.getValue('u_casezero_case_id') || '');

    request.executeAsync();
  } catch (error) {
    gs.error('CaseZero FCR export failed for ' + current.getValue('number') + ': ' + error.message);
  }
})(current, previous);
```

CaseZero upserts records by ServiceNow incident number. Insert, resolution, reassignment, and reopen events therefore update one interaction instead of inflating the FCR denominator.

In the shared ITSM ingestion layer, the idempotency key is `provider` plus ticket number. This allows other platforms to use the same ticket number format without colliding with ServiceNow records.

## Verification

Successful requests return HTTP `200`:

```json
{
  "accepted": true,
  "source": "servicenow",
  "externalTicketId": "INC0010001",
  "linkedCaseId": null
}
```

The production leadership report is available at:

```text
https://casezero-mvp.raknair.workers.dev/reports
```