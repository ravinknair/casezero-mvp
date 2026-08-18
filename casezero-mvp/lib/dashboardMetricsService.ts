import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { activities, cases, evidence } from "@/db/schema";
import { buildDashboardMetrics } from "@/lib/dashboardMetrics";
import type { SupportTelemetryEvent } from "@/lib/externalSupport";

export async function getDatabaseDashboardMetrics(supportEvents: SupportTelemetryEvent[]) {
  const db = getDb();
  const [caseRows, evidenceRows, activityRows] = await Promise.all([
    db.select().from(cases),
    db.select({ caseId: evidence.caseId }).from(evidence),
    db.select().from(activities).orderBy(desc(activities.createdAt)).limit(6),
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
  const recentActivity = activityRows.map((item) => {
    const relatedCase = casesById.get(item.caseId);
    return {
      id: item.id,
      message: `${relatedCase?.caseId ?? item.caseId}: ${item.description}`,
      timestamp: item.createdAt.toISOString(),
      tone: relatedCase && /critical|sev-1|high/i.test(relatedCase.severity) ? ("danger" as const) : ("info" as const),
    };
  });

  return buildDashboardMetrics(dashboardCases, supportEvents, recentActivity);
}
