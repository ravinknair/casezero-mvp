import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activities, cases, evidence, supportInteractions } from "@/db/schema";
import { buildDashboardMetrics } from "@/lib/dashboardMetrics";
import type { SupportTelemetryEvent } from "@/lib/externalSupport";

export async function getDatabaseDashboardMetrics(supportEvents: SupportTelemetryEvent[], workspaceId: string, provider?: string) {
  const db = getDb();
  const [caseRows, evidenceRows, activityRows, supportInteractionRows] = await Promise.all([
    db.select().from(cases).where(eq(cases.workspaceId, workspaceId)),
    db.select({ caseId: evidence.caseId }).from(evidence).innerJoin(cases, eq(evidence.caseId, cases.id)).where(eq(cases.workspaceId, workspaceId)),
    db.select().from(activities).innerJoin(cases, eq(activities.caseId, cases.id)).where(eq(cases.workspaceId, workspaceId)).orderBy(desc(activities.createdAt)).limit(6),
    db.select().from(supportInteractions).where(provider
      ? and(eq(supportInteractions.workspaceId, workspaceId), eq(supportInteractions.provider, provider))
      : eq(supportInteractions.workspaceId, workspaceId)),
  ]);

  if (caseRows.length === 0) {
    throw new Error("D1 database has not been seeded");
  }

  const sourceCounts = new Map<string, number>();
  for (const row of evidenceRows) {
    sourceCounts.set(row.caseId, (sourceCounts.get(row.caseId) ?? 0) + 1);
  }

  const dashboardCases = caseRows.map((item) => ({
    id: item.id,
    caseId: item.caseId,
    type: item.type,
    severity: item.severity,
    title: item.title,
    status: item.status,
    confidence: item.confidence,
    sources: sourceCounts.get(item.id) ?? 0,
    openedAt: item.openedAt,
    resolvedAt: item.resolvedAt,
  }));

  const casesById = new Map(dashboardCases.map((item) => [item.id, item]));
  const recentActivity = activityRows.map(({ activities: item }) => {
    const relatedCase = casesById.get(item.caseId);
    return {
      id: item.id,
      message: `${relatedCase?.caseId ?? item.caseId}: ${item.description}`,
      timestamp: item.createdAt.toISOString(),
      tone: relatedCase && /critical|sev-1|high/i.test(relatedCase.severity) ? ("danger" as const) : ("info" as const),
    };
  });

  const fcrRecords = supportInteractionRows.map((item) => ({
    firstContactAt: item.receivedAt,
    firstResolvedAt: item.firstResolvedAt,
    contactChannel: item.channel,
    resolvedOnFirstContact: item.resolvedOnFirstContact,
    escalationCount: item.escalationCount,
    reopenCount: item.reopenCount,
    repeatContactAt: item.repeatContactAt,
  }));

  return { ...buildDashboardMetrics(dashboardCases, supportEvents, recentActivity, fcrRecords), sampleMode: false };
}
