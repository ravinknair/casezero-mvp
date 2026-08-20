# ITSM Integrations

CaseZero supports ServiceNow directly and accepts normalized FCR snapshots from additional ITSM and support platforms through a shared endpoint:

```text
POST /api/integrations/itsm/fcr
X-CaseZero-Webhook-Secret: <ITSM_WEBHOOK_SECRET>
Content-Type: application/json
```

Production endpoint:

```text
https://casezero-mvp.raknair.workers.dev/api/integrations/itsm/fcr
```

The existing ServiceNow endpoint remains supported:

```text
POST /api/integrations/servicenow/fcr
```

Both endpoints use the same secret, validation, idempotent upsert behavior, and FCR dashboard pipeline. CaseZero stores support interactions by the pair of `provider` and `externalTicketId`, so ticket numbers from different systems cannot collide.

## Supported Providers

Use one of these `provider` values in generic ITSM requests:

- `servicenow`
- `zendesk`
- `jira_service_management`
- `salesforce_service_cloud`
- `freshservice`

Common aliases are accepted for convenience: `service_now`, `jira`, `jsm`, `salesforce`, `service_cloud`, and `freshdesk`.

## Canonical Fields

Each provider-specific payload is mapped into this internal FCR record:

```json
{
  "provider": "zendesk",
  "externalTicketId": "481516",
  "caseId": "CZ-1825",
  "contactChannel": "Live Chat",
  "firstContactAt": "2026-08-01T09:04:00Z",
  "firstResolvedAt": "2026-08-01T09:31:00Z",
  "resolvedOnFirstContact": true,
  "escalationCount": 0,
  "reopenCount": 0,
  "repeatContactAt": null
}
```

Required source fields are the external ticket ID, contact channel when the provider does not provide a default, and first contact timestamp. The CaseZero case ID is optional.

## Zendesk Example

```json
{
  "provider": "zendesk",
  "ticket": {
    "id": 481516,
    "via": { "channel": "chat" },
    "created_at": "2026-08-01T09:04:00Z",
    "solved_at": "2026-08-01T09:31:00Z",
    "custom_fields": {
      "casezero_case_id": "CZ-1825",
      "resolved_on_first_contact": true,
      "escalation_count": 0,
      "reopen_count": 0,
      "repeat_contact_at": ""
    }
  }
}
```

## Jira Service Management Example

```json
{
  "provider": "jira_service_management",
  "issue": {
    "key": "OPS-2048",
    "fields": {
      "created": "2026-08-02T11:12:00Z",
      "resolutiondate": "2026-08-02T11:41:00Z",
      "request_channel": { "value": "portal" },
      "casezero_case_id": "CZ-1825",
      "resolved_on_first_contact": "yes",
      "escalation_count": 0,
      "reopen_count": 0,
      "repeat_contact_at": ""
    }
  }
}
```

## Salesforce Service Cloud Example

```json
{
  "provider": "salesforce",
  "CaseNumber": "00001042",
  "Origin": "Phone",
  "CreatedDate": "2026-08-03T14:20:00Z",
  "ClosedDate": "2026-08-03T14:28:00Z",
  "Resolved_On_First_Contact__c": true,
  "Escalation_Count__c": 0,
  "Reopen_Count__c": 0,
  "CaseZero_Case_ID__c": "CZ-1825"
}
```

## Freshservice Example

```json
{
  "provider": "freshservice",
  "ticket": {
    "id": 90210,
    "source_name": "email",
    "created_at": "2026-08-04T08:44:00Z",
    "resolved_at": "2026-08-04T09:02:00Z",
    "custom_fields": {
      "casezero_case_id": "CZ-1825",
      "resolved_on_first_contact": true,
      "escalation_count": 0,
      "reopen_count": 0
    }
  }
}
```

## Recommended Rollout

Start with ServiceNow as the reference connector. For each customer, map their ticket system fields into the canonical FCR record, then send sample insert, resolve, reopen, and repeat-contact events. Retries are safe because CaseZero upserts by `provider` and `externalTicketId`.