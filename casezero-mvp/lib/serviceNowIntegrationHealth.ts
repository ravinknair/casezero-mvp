import { desc } from "drizzle-orm";

type ServiceNowEventStatus = "accepted" | "duplicate" | "missing_fields" | "rejected" | "failed_auth";

export interface ServiceNowIntegrationEventInput {
  status: ServiceNowEventStatus;
  externalTicketId?: string | null;
  missingFields?: string[];
  message?: string;
}

export interface ServiceNowIntegrationHealth {
  webhookUrl: string;
  secretConfigured: boolean;
  lastEventReceived: string | null;
  lastSuccessfulEvent: string | null;
  rejectedEvents: number;
  missingFields: string[];
  duplicateUpdates: number;
  failedAuthCount: number;
  sampleMode: boolean;
}

export interface ItsmIntegrationEventSummary {
  id: string;
  provider: string;
  externalTicketId: string | null;
  status: string;
  missingFields: string[];
  message: string | null;
  receivedAt: string;
}

export async function recordServiceNowIntegrationEvent(event: ServiceNowIntegrationEventInput) {
  try {
    const [{ getDb }, { serviceNowIntegrationEvents }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    await getDb()
      .insert(serviceNowIntegrationEvents)
      .values({
        id: crypto.randomUUID(),
        status: event.status,
        externalTicketId: event.externalTicketId ?? null,
        missingFields: event.missingFields?.join(",") ?? null,
        message: event.message ?? null,
      })
      .run();
  } catch {
    // Health logging must not block webhook ingestion.
  }
}

export async function getServiceNowIntegrationHealth(requestUrl: string): Promise<ServiceNowIntegrationHealth> {
  const webhookUrl = new URL("/api/integrations/servicenow/fcr", requestUrl).toString();
  const secretConfigured = await hasWebhookSecret();

  try {
    const [{ getDb }, { serviceNowIntegrationEvents }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const rows = await getDb()
      .select()
      .from(serviceNowIntegrationEvents)
      .orderBy(desc(serviceNowIntegrationEvents.receivedAt))
      .limit(100);

    return summarizeEvents(webhookUrl, secretConfigured, rows, false);
  } catch {
    return summarizeEvents(webhookUrl, secretConfigured, demoEvents(), true);
  }
}

export async function getRecentItsmIntegrationEvents(): Promise<{ events: ItsmIntegrationEventSummary[]; sampleMode: boolean }> {
  try {
    const [{ getDb }, { serviceNowIntegrationEvents }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const rows = await getDb()
      .select()
      .from(serviceNowIntegrationEvents)
      .orderBy(desc(serviceNowIntegrationEvents.receivedAt))
      .limit(25);

    return { events: rows.map(toItsmEventSummary), sampleMode: false };
  } catch {
    return { events: demoEvents().map(toItsmEventSummary), sampleMode: true };
  }
}

async function hasWebhookSecret() {
  try {
    const { env } = await import("cloudflare:workers");
    return Boolean((env as unknown as { ITSM_WEBHOOK_SECRET?: string }).ITSM_WEBHOOK_SECRET);
  } catch {
    return false;
  }
}

function summarizeEvents(
  webhookUrl: string,
  secretConfigured: boolean,
  rows: Array<{ status: string; missingFields: string | null; receivedAt: Date }>,
  sampleMode: boolean
) {
  const lastEvent = rows[0]?.receivedAt?.toISOString() ?? null;
  const lastSuccessfulEvent = rows.find((row) => row.status === "accepted" || row.status === "duplicate")?.receivedAt?.toISOString() ?? null;
  const missingFields = [...new Set(rows.flatMap((row) => (row.missingFields ? row.missingFields.split(",") : [])))].filter(Boolean);

  return {
    webhookUrl,
    secretConfigured,
    lastEventReceived: lastEvent,
    lastSuccessfulEvent,
    rejectedEvents: rows.filter((row) => row.status === "rejected" || row.status === "missing_fields").length,
    missingFields,
    duplicateUpdates: rows.filter((row) => row.status === "duplicate").length,
    failedAuthCount: rows.filter((row) => row.status === "failed_auth").length,
    sampleMode,
  };
}

function demoEvents() {
  const now = Date.now();
  return [
    { id: "demo-accepted", status: "accepted", externalTicketId: "zendesk:481516", missingFields: null, message: null, receivedAt: new Date(now - 18 * 60_000) },
    { id: "demo-duplicate", status: "duplicate", externalTicketId: "servicenow:INC0012048", missingFields: null, message: null, receivedAt: new Date(now - 42 * 60_000) },
    { id: "demo-missing", status: "missing_fields", externalTicketId: null, missingFields: "opened_at", message: "opened_at is required", receivedAt: new Date(now - 2 * 60 * 60_000) },
    { id: "demo-auth", status: "failed_auth", externalTicketId: null, missingFields: null, message: "Unauthorized ITSM webhook request", receivedAt: new Date(now - 4 * 60 * 60_000) },
  ];
}

function toItsmEventSummary(row: {
  id: string;
  status: string;
  externalTicketId: string | null;
  missingFields: string | null;
  message: string | null;
  receivedAt: Date;
}): ItsmIntegrationEventSummary {
  const { provider, externalTicketId } = parseProviderTicket(row.externalTicketId);
  return {
    id: row.id,
    provider,
    externalTicketId,
    status: row.status,
    missingFields: row.missingFields ? row.missingFields.split(",").filter(Boolean) : [],
    message: row.message,
    receivedAt: row.receivedAt.toISOString(),
  };
}

function parseProviderTicket(value: string | null) {
  if (!value) return { provider: "unknown", externalTicketId: null };
  const separatorIndex = value.indexOf(":");
  if (separatorIndex === -1) return { provider: "servicenow", externalTicketId: value };
  return {
    provider: value.slice(0, separatorIndex),
    externalTicketId: value.slice(separatorIndex + 1) || null,
  };
}