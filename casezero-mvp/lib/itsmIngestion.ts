import { and, eq, or } from "drizzle-orm";
import { recordServiceNowIntegrationEvent } from "@/lib/serviceNowIntegrationHealth";
import { normalizeItsmFcrPayload } from "@/lib/itsmFcr";

export async function ingestItsmFcrRequest(request: Request, fallbackProvider = "servicenow") {
  try {
    const { env } = await import("cloudflare:workers");
    const webhookSecret = (env as unknown as { ITSM_WEBHOOK_SECRET?: string }).ITSM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return Response.json({ error: "ITSM ingestion is not configured" }, { status: 503 });
    }

    const authorization = request.headers.get("authorization");
    const providedSecret =
      request.headers.get("x-casezero-webhook-secret") ??
      (authorization?.startsWith("Bearer ") ? authorization.slice(7) : null);
    if (!providedSecret || !(await secretsMatch(providedSecret, webhookSecret))) {
      await recordServiceNowIntegrationEvent({ status: "failed_auth", message: "Unauthorized ITSM webhook request" });
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return ingestItsmFcrPayload(await request.json(), fallbackProvider);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to ingest ITSM interaction";
    const isValidationError =
      message.includes("required") ||
      message.includes("valid timestamp") ||
      message.includes("non-negative integer") ||
      message.includes("JSON object") ||
      message.includes("Unsupported ITSM provider");
    await recordServiceNowIntegrationEvent({
      status: isValidationError && message.includes("required") ? "missing_fields" : "rejected",
      missingFields: isValidationError && message.includes("required") ? [message.replace(" is required", "")] : [],
      message,
    });
    return Response.json({ error: message }, { status: isValidationError ? 400 : 500 });
  }
}

export async function ingestItsmFcrPayload(payload: unknown, fallbackProvider = "servicenow") {
  try {
    const record = normalizeItsmFcrPayload(payload, fallbackProvider);
    const [{ getDb }, { cases, supportInteractions }] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);
    const db = getDb();
    const linkedCase = record.caseId
      ? await db
          .select({ id: cases.id })
          .from(cases)
          .where(or(eq(cases.id, record.caseId), eq(cases.caseId, record.caseId)))
          .limit(1)
      : [];
    const now = new Date();
    const existingInteraction = await db
      .select({ id: supportInteractions.id })
      .from(supportInteractions)
      .where(
        and(
          eq(supportInteractions.provider, record.provider),
          eq(supportInteractions.externalTicketId, record.externalTicketId),
        ),
      )
      .limit(1);

    await db
      .insert(supportInteractions)
      .values({
        id: crypto.randomUUID(),
        provider: record.provider,
        caseId: linkedCase[0]?.id ?? null,
        externalTicketId: record.externalTicketId,
        channel: record.contactChannel,
        receivedAt: record.firstContactAt,
        firstResolvedAt: record.firstResolvedAt,
        resolvedOnFirstContact: record.resolvedOnFirstContact,
        escalationCount: record.escalationCount,
        reopenCount: record.reopenCount,
        repeatContactAt: record.repeatContactAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [supportInteractions.provider, supportInteractions.externalTicketId],
        set: {
          caseId: linkedCase[0]?.id ?? null,
          channel: record.contactChannel,
          receivedAt: record.firstContactAt,
          firstResolvedAt: record.firstResolvedAt,
          resolvedOnFirstContact: record.resolvedOnFirstContact,
          escalationCount: record.escalationCount,
          reopenCount: record.reopenCount,
          repeatContactAt: record.repeatContactAt,
          updatedAt: now,
        },
      })
      .run();

    await recordServiceNowIntegrationEvent({
      status: existingInteraction.length ? "duplicate" : "accepted",
      externalTicketId: `${record.provider}:${record.externalTicketId}`,
    });

    return Response.json({
      accepted: true,
      source: record.provider,
      externalTicketId: record.externalTicketId,
      linkedCaseId: linkedCase[0]?.id ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to ingest ITSM interaction";
    const isValidationError =
      message.includes("required") ||
      message.includes("valid timestamp") ||
      message.includes("non-negative integer") ||
      message.includes("JSON object") ||
      message.includes("Unsupported ITSM provider");
    await recordServiceNowIntegrationEvent({
      status: isValidationError && message.includes("required") ? "missing_fields" : "rejected",
      missingFields: isValidationError && message.includes("required") ? [message.replace(" is required", "")] : [],
      message,
    });
    return Response.json({ error: message }, { status: isValidationError ? 400 : 500 });
  }
}

async function secretsMatch(provided: string, expected: string) {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const providedBytes = new Uint8Array(providedHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < providedBytes.length; index += 1) {
    difference |= providedBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}