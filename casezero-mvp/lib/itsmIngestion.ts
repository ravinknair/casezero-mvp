import { and, eq, or } from "drizzle-orm";
import { recordServiceNowIntegrationEvent } from "@/lib/serviceNowIntegrationHealth";
import { normalizeItsmFcrPayload } from "@/lib/itsmFcr";
import { resolveWorkspaceIntegration } from "@/lib/workspaceIntegrations";

export async function ingestItsmFcrRequest(request: Request, fallbackProvider = "servicenow") {
  try {
    const payload = await request.json();
    const record = normalizeItsmFcrPayload(payload, fallbackProvider);
    const token = request.headers.get("x-casezero-connector-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const workspaceId = token ? await resolveWorkspaceIntegration(token, record.provider) : null;
    if (!workspaceId) {
      await recordServiceNowIntegrationEvent({ status: "failed_auth", message: "Unauthorized ITSM connector token" });
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return ingestItsmFcrPayload(payload, fallbackProvider, workspaceId);
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

export async function ingestItsmFcrPayload(payload: unknown, fallbackProvider = "servicenow", workspaceId?: string) {
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
          .where(and(eq(cases.workspaceId, workspaceId ?? ""), or(eq(cases.id, record.caseId), eq(cases.caseId, record.caseId))))
          .limit(1)
      : [];
    const now = new Date();
    const existingInteraction = await db
      .select({ id: supportInteractions.id })
      .from(supportInteractions)
      .where(
        and(
          eq(supportInteractions.workspaceId, workspaceId ?? ""),
          eq(supportInteractions.provider, record.provider),
          eq(supportInteractions.externalTicketId, record.externalTicketId),
        ),
      )
      .limit(1);

    const interactionValues = {
        id: crypto.randomUUID(),
        provider: record.provider,
        caseId: linkedCase[0]?.id ?? null,
        externalTicketId: record.externalTicketId,
        workspaceId,
        channel: record.contactChannel,
        receivedAt: record.firstContactAt,
        firstResolvedAt: record.firstResolvedAt,
        resolvedOnFirstContact: record.resolvedOnFirstContact,
        escalationCount: record.escalationCount,
        reopenCount: record.reopenCount,
        repeatContactAt: record.repeatContactAt,
        updatedAt: now,
    };
    if (existingInteraction.length) {
      await db.update(supportInteractions).set({
        caseId: interactionValues.caseId, workspaceId, channel: interactionValues.channel,
        receivedAt: interactionValues.receivedAt, firstResolvedAt: interactionValues.firstResolvedAt,
        resolvedOnFirstContact: interactionValues.resolvedOnFirstContact, escalationCount: interactionValues.escalationCount,
        reopenCount: interactionValues.reopenCount, repeatContactAt: interactionValues.repeatContactAt, updatedAt: now,
      }).where(and(eq(supportInteractions.id, existingInteraction[0].id), eq(supportInteractions.workspaceId, workspaceId))).run();
    } else {
      await db.insert(supportInteractions).values(interactionValues).run();
    }

    await recordServiceNowIntegrationEvent({
      status: existingInteraction.length ? "duplicate" : "accepted",
      externalTicketId: `${record.provider}:${record.externalTicketId}`,
    }, workspaceId);

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
    }, workspaceId);
    return Response.json({ error: message }, { status: isValidationError ? 400 : 500 });
  }
}
