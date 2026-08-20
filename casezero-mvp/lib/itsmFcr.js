export const itsmProviders = [
  "servicenow",
  "zendesk",
  "jira_service_management",
  "salesforce_service_cloud",
  "freshservice",
];

const channelLabels = new Map([
  ["phone", "Phone"],
  ["voice", "Phone"],
  ["chat", "Live Chat"],
  ["live_chat", "Live Chat"],
  ["virtual_agent", "Live Chat"],
  ["messaging", "Live Chat"],
  ["email", "Email"],
  ["web", "Self-Service / Portal"],
  ["portal", "Self-Service / Portal"],
  ["self_service", "Self-Service / Portal"],
  ["api", "API"],
]);

const providerLabels = new Map([
  ["servicenow", "servicenow"],
  ["service_now", "servicenow"],
  ["zendesk", "zendesk"],
  ["jira", "jira_service_management"],
  ["jira_service_management", "jira_service_management"],
  ["jsm", "jira_service_management"],
  ["salesforce", "salesforce_service_cloud"],
  ["salesforce_service_cloud", "salesforce_service_cloud"],
  ["service_cloud", "salesforce_service_cloud"],
  ["freshservice", "freshservice"],
  ["freshdesk", "freshservice"],
]);

export function normalizeItsmFcrPayload(payload, fallbackProvider = "servicenow") {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("ITSM payload must be a JSON object");
  }

  const provider = normalizeProvider(payload.provider ?? payload.source ?? fallbackProvider);
  if (provider === "servicenow") return normalizeServiceNowFcrPayload(payload);
  if (provider === "zendesk") return normalizeZendeskFcrPayload(payload);
  if (provider === "jira_service_management") return normalizeJiraServiceManagementFcrPayload(payload);
  if (provider === "salesforce_service_cloud") return normalizeSalesforceServiceCloudFcrPayload(payload);
  if (provider === "freshservice") return normalizeFreshserviceFcrPayload(payload);
  throw new Error(`Unsupported ITSM provider: ${provider}`);
}

export function normalizeServiceNowFcrPayload(payload) {
  const externalTicketId = requiredString(payload.number ?? payload.externalTicketId, "number");
  const firstContactAt = requiredDate(payload.opened_at ?? payload.firstContactAt, "opened_at");
  const channelValue = requiredString(payload.contact_type ?? payload.channel ?? payload.contactChannel, "contact_type");

  return canonicalRecord("servicenow", {
    externalTicketId,
    caseId: optionalString(payload.u_casezero_case_id ?? payload.caseId),
    contactChannel: normalizeChannel(channelValue),
    firstContactAt,
    firstResolvedAt: optionalDate(payload.resolved_at ?? payload.firstResolvedAt, "resolved_at"),
    resolvedOnFirstContact: toBoolean(payload.u_resolved_on_first_contact ?? payload.resolvedOnFirstContact),
    escalationCount: nonNegativeInteger(payload.reassignment_count ?? payload.escalationCount, "reassignment_count"),
    reopenCount: nonNegativeInteger(payload.reopen_count ?? payload.reopenCount, "reopen_count"),
    repeatContactAt: optionalDate(payload.u_repeat_contact_at ?? payload.repeatContactAt, "u_repeat_contact_at"),
  });
}

function normalizeZendeskFcrPayload(payload) {
  const ticket = payload.ticket && typeof payload.ticket === "object" ? payload.ticket : payload;
  const custom = normalizeCustomFields(ticket.custom_fields ?? payload.custom_fields);
  return canonicalRecord("zendesk", {
    externalTicketId: requiredString(ticket.id ?? ticket.external_id ?? payload.externalTicketId, "id"),
    caseId: optionalString(custom.casezero_case_id ?? ticket.caseId ?? payload.caseId),
    contactChannel: normalizeChannel(ticket.via?.channel ?? ticket.channel ?? payload.channel ?? "web"),
    firstContactAt: requiredDate(ticket.created_at ?? payload.created_at ?? payload.firstContactAt, "created_at"),
    firstResolvedAt: optionalDate(ticket.solved_at ?? ticket.resolved_at ?? payload.firstResolvedAt, "solved_at"),
    resolvedOnFirstContact: toBoolean(custom.resolved_on_first_contact ?? payload.resolvedOnFirstContact),
    escalationCount: nonNegativeInteger(custom.escalation_count ?? payload.escalationCount, "escalation_count"),
    reopenCount: nonNegativeInteger(custom.reopen_count ?? payload.reopenCount, "reopen_count"),
    repeatContactAt: optionalDate(custom.repeat_contact_at ?? payload.repeatContactAt, "repeat_contact_at"),
  });
}

function normalizeJiraServiceManagementFcrPayload(payload) {
  const issue = payload.issue && typeof payload.issue === "object" ? payload.issue : payload;
  const fields = issue.fields && typeof issue.fields === "object" ? issue.fields : {};
  return canonicalRecord("jira_service_management", {
    externalTicketId: requiredString(issue.key ?? payload.key ?? payload.externalTicketId, "key"),
    caseId: optionalString(fields.casezero_case_id ?? payload.caseId),
    contactChannel: normalizeChannel(fields.request_channel?.value ?? fields.channel ?? payload.channel ?? "portal"),
    firstContactAt: requiredDate(fields.created ?? payload.created ?? payload.firstContactAt, "created"),
    firstResolvedAt: optionalDate(fields.resolutiondate ?? payload.resolutiondate ?? payload.firstResolvedAt, "resolutiondate"),
    resolvedOnFirstContact: toBoolean(fields.resolved_on_first_contact ?? payload.resolvedOnFirstContact),
    escalationCount: nonNegativeInteger(fields.escalation_count ?? payload.escalationCount, "escalation_count"),
    reopenCount: nonNegativeInteger(fields.reopen_count ?? payload.reopenCount, "reopen_count"),
    repeatContactAt: optionalDate(fields.repeat_contact_at ?? payload.repeatContactAt, "repeat_contact_at"),
  });
}

function normalizeSalesforceServiceCloudFcrPayload(payload) {
  const record = payload.case && typeof payload.case === "object" ? payload.case : payload;
  return canonicalRecord("salesforce_service_cloud", {
    externalTicketId: requiredString(record.CaseNumber ?? record.Id ?? record.externalTicketId, "CaseNumber"),
    caseId: optionalString(record.CaseZero_Case_ID__c ?? record.caseId),
    contactChannel: normalizeChannel(record.Origin ?? record.channel ?? "web"),
    firstContactAt: requiredDate(record.CreatedDate ?? record.firstContactAt, "CreatedDate"),
    firstResolvedAt: optionalDate(record.ClosedDate ?? record.firstResolvedAt, "ClosedDate"),
    resolvedOnFirstContact: toBoolean(record.Resolved_On_First_Contact__c ?? record.resolvedOnFirstContact),
    escalationCount: nonNegativeInteger(record.Escalation_Count__c ?? record.escalationCount, "Escalation_Count__c"),
    reopenCount: nonNegativeInteger(record.Reopen_Count__c ?? record.reopenCount, "Reopen_Count__c"),
    repeatContactAt: optionalDate(record.Repeat_Contact_At__c ?? record.repeatContactAt, "Repeat_Contact_At__c"),
  });
}

function normalizeFreshserviceFcrPayload(payload) {
  const ticket = payload.ticket && typeof payload.ticket === "object" ? payload.ticket : payload;
  const custom = ticket.custom_fields && typeof ticket.custom_fields === "object" ? ticket.custom_fields : {};
  return canonicalRecord("freshservice", {
    externalTicketId: requiredString(ticket.id ?? ticket.display_id ?? payload.externalTicketId, "id"),
    caseId: optionalString(custom.casezero_case_id ?? ticket.caseId ?? payload.caseId),
    contactChannel: normalizeChannel(ticket.source_name ?? ticket.source ?? ticket.channel ?? "portal"),
    firstContactAt: requiredDate(ticket.created_at ?? payload.created_at ?? payload.firstContactAt, "created_at"),
    firstResolvedAt: optionalDate(ticket.resolved_at ?? ticket.closed_at ?? payload.firstResolvedAt, "resolved_at"),
    resolvedOnFirstContact: toBoolean(custom.resolved_on_first_contact ?? payload.resolvedOnFirstContact),
    escalationCount: nonNegativeInteger(custom.escalation_count ?? payload.escalationCount, "escalation_count"),
    reopenCount: nonNegativeInteger(custom.reopen_count ?? payload.reopenCount, "reopen_count"),
    repeatContactAt: optionalDate(custom.repeat_contact_at ?? payload.repeatContactAt, "repeat_contact_at"),
  });
}

function canonicalRecord(provider, record) {
  return { provider, ...record };
}

function normalizeProvider(value) {
  const key = requiredString(value, "provider").trim().toLowerCase().replace(/[ -]+/g, "_");
  return providerLabels.get(key) ?? key;
}

function normalizeChannel(value) {
  const key = String(value).trim().toLowerCase().replace(/[ -]+/g, "_");
  return channelLabels.get(key) ?? String(value).trim();
}

function normalizeCustomFields(fields) {
  if (!Array.isArray(fields)) return fields && typeof fields === "object" ? fields : {};
  return fields.reduce((normalized, field) => {
    if (field && typeof field === "object" && field.id !== undefined) {
      normalized[String(field.id)] = field.value;
    }
    return normalized;
  }, {});
}

function requiredString(value, field) {
  const normalized = optionalString(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

function optionalString(value) {
  if (typeof value === "number") return String(value);
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