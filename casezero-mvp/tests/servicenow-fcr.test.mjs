import assert from "node:assert/strict";
import test from "node:test";
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