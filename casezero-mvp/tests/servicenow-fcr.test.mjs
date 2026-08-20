import assert from "node:assert/strict";
import test from "node:test";
import { normalizeItsmFcrPayload } from "../lib/itsmFcr.js";
import { normalizeServiceNowFcrPayload } from "../lib/serviceNowFcr.js";

test("normalizes a ServiceNow incident snapshot for FCR ingestion", () => {
  const record = normalizeServiceNowFcrPayload({
    number: "INC0012048",
    contact_type: "virtual_agent",
    opened_at: "2026-08-01 09:04:00",
    resolved_at: "2026-08-01 09:31:00",
    u_resolved_on_first_contact: "true",
    reassignment_count: "0",
    reopen_count: "0",
    u_casezero_case_id: "CZ-1825",
  });

  assert.equal(record.externalTicketId, "INC0012048");
  assert.equal(record.contactChannel, "Live Chat");
  assert.equal(record.firstContactAt.toISOString(), "2026-08-01T09:04:00.000Z");
  assert.equal(record.resolvedOnFirstContact, true);
  assert.equal(record.escalationCount, 0);
  assert.equal(record.caseId, "CZ-1825");
});

test("rejects incomplete or invalid ServiceNow snapshots", () => {
  assert.throws(
    () => normalizeServiceNowFcrPayload({ contact_type: "email", opened_at: "2026-08-01 09:04:00" }),
    /number is required/
  );
  assert.throws(
    () => normalizeServiceNowFcrPayload({ number: "INC1", contact_type: "email", opened_at: "not-a-date" }),
    /valid timestamp/
  );
  assert.throws(
    () => normalizeServiceNowFcrPayload({ number: "INC1", contact_type: "email", opened_at: "2026-08-01 09:04:00", reopen_count: -1 }),
    /non-negative integer/
  );
});

test("normalizes competitor ITSM payloads into canonical FCR records", () => {
  const zendeskRecord = normalizeItsmFcrPayload({
    provider: "zendesk",
    ticket: {
      id: 481516,
      via: { channel: "chat" },
      created_at: "2026-08-01T09:04:00Z",
      solved_at: "2026-08-01T09:31:00Z",
      custom_fields: {
        casezero_case_id: "CZ-1825",
        resolved_on_first_contact: true,
      },
    },
  });

  assert.equal(zendeskRecord.provider, "zendesk");
  assert.equal(zendeskRecord.externalTicketId, "481516");
  assert.equal(zendeskRecord.contactChannel, "Live Chat");
  assert.equal(zendeskRecord.caseId, "CZ-1825");
  assert.equal(zendeskRecord.resolvedOnFirstContact, true);

  const jiraRecord = normalizeItsmFcrPayload({
    provider: "jira_service_management",
    issue: {
      key: "OPS-2048",
      fields: {
        created: "2026-08-02T11:12:00Z",
        resolutiondate: "2026-08-02T11:41:00Z",
        request_channel: { value: "portal" },
        resolved_on_first_contact: "yes",
      },
    },
  });

  assert.equal(jiraRecord.provider, "jira_service_management");
  assert.equal(jiraRecord.externalTicketId, "OPS-2048");
  assert.equal(jiraRecord.contactChannel, "Self-Service / Portal");
  assert.equal(jiraRecord.resolvedOnFirstContact, true);

  const salesforceRecord = normalizeItsmFcrPayload({
    provider: "salesforce",
    CaseNumber: "00001042",
    Origin: "Phone",
    CreatedDate: "2026-08-03T14:20:00Z",
    ClosedDate: "2026-08-03T14:28:00Z",
    Resolved_On_First_Contact__c: true,
  });

  assert.equal(salesforceRecord.provider, "salesforce_service_cloud");
  assert.equal(salesforceRecord.externalTicketId, "00001042");
  assert.equal(salesforceRecord.contactChannel, "Phone");
  assert.equal(salesforceRecord.resolvedOnFirstContact, true);

  const bmcRecord = normalizeItsmFcrPayload({
    provider: "bmc",
    incident: {
      Incident_Number: "INC0000002048",
      Reported_Source: "Phone",
      Submit_Date: "2026-08-05T10:18:00Z",
      Resolution_Date: "2026-08-05T10:39:00Z",
      Resolved_On_First_Contact__c: "true",
    },
  });

  assert.equal(bmcRecord.provider, "bmc_helix");
  assert.equal(bmcRecord.externalTicketId, "INC0000002048");
  assert.equal(bmcRecord.contactChannel, "Phone");
  assert.equal(bmcRecord.resolvedOnFirstContact, true);
});