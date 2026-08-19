const channelLabels = new Map([
  ["phone", "Phone"],
  ["chat", "Live Chat"],
  ["live_chat", "Live Chat"],
  ["virtual_agent", "Live Chat"],
  ["email", "Email"],
  ["web", "Self-Service / Portal"],
  ["portal", "Self-Service / Portal"],
  ["self_service", "Self-Service / Portal"],
]);

export function normalizeServiceNowFcrPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("ServiceNow payload must be a JSON object");
  }

  const externalTicketId = requiredString(payload.number ?? payload.externalTicketId, "number");
  const firstContactAt = requiredDate(payload.opened_at ?? payload.firstContactAt, "opened_at");
  const channelValue = requiredString(payload.contact_type ?? payload.channel ?? payload.contactChannel, "contact_type");

  return {
    externalTicketId,
    caseId: optionalString(payload.u_casezero_case_id ?? payload.caseId),
    contactChannel: normalizeChannel(channelValue),
    firstContactAt,
    firstResolvedAt: optionalDate(payload.resolved_at ?? payload.firstResolvedAt, "resolved_at"),
    resolvedOnFirstContact: toBoolean(
      payload.u_resolved_on_first_contact ?? payload.resolvedOnFirstContact
    ),
    escalationCount: nonNegativeInteger(
      payload.reassignment_count ?? payload.escalationCount,
      "reassignment_count"
    ),
    reopenCount: nonNegativeInteger(payload.reopen_count ?? payload.reopenCount, "reopen_count"),
    repeatContactAt: optionalDate(
      payload.u_repeat_contact_at ?? payload.repeatContactAt,
      "u_repeat_contact_at"
    ),
  };
}

function normalizeChannel(value) {
  const key = value.trim().toLowerCase().replace(/[ -]+/g, "_");
  return channelLabels.get(key) ?? value.trim();
}

function requiredString(value, field) {
  const normalized = optionalString(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

function optionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredDate(value, field) {
  const parsed = optionalDate(value, field);
  if (!parsed) throw new Error(`${field} is required`);
  return parsed;
}

function optionalDate(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
    throw new Error(`${field} must be a valid timestamp`);
  }

  const normalizedValue =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;
  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${field} must be a valid timestamp`);
  return parsed;
}

function nonNegativeInteger(value, field) {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${field} must be a non-negative integer`);
  return parsed;
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["1", "true", "yes", "y"].includes(value.trim().toLowerCase());
  return false;
}