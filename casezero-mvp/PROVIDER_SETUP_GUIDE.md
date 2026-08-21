# Provider setup guide

CaseZero currently has one dedicated outbound connector and health workflow: **ServiceNow**. Use `/admin/integrations/servicenow` for that setup.

Zendesk, Jira Service Management, Salesforce Service Cloud, Freshservice/Freshdesk, BMC Helix, Ivanti Neurons, and ManageEngine ServiceDesk Plus currently support **generic normalized inbound webhooks** only. They do not have dedicated outbound connectors in this MVP.

## Generic webhook setup

1. Configure the provider to send a webhook to `/api/integrations/itsm/fcr`.
2. Send `X-CaseZero-Webhook-Secret` with the value of the Worker secret `ITSM_WEBHOOK_SECRET`.
3. Include the provider identifier and the provider's ticket or incident ID. The normalizer accepts the sample payloads shown in the integration catalog.
4. Confirm accepted and duplicate events in `/admin/integrations` and provider summaries at `/admin/integrations/health`.

The shared table records normalized outcomes for all providers. Provider health is based on accepted, duplicate, rejected, missing-field, and failed-auth events; it is not an outbound connectivity test.