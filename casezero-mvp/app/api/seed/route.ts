import { mockCases } from "@/lib/mockData";
import { getDb } from "@/db";
import { activities, cases, evidence, incidents, sites, users } from "@/db/schema";

export async function POST() {
  try {
    const db = getDb();
    const now = Date.now();
    const userId = "user-default";
    const siteId = "site-production";

    await db
      .insert(users)
      .values({ id: userId, email: "operator@casezero.ai", name: "CaseZero Operator", role: "admin" })
      .onConflictDoNothing()
      .run();
    await db
      .insert(sites)
      .values({ id: siteId, name: "Production", code: "prod-primary", environment: "production", region: "global" })
      .onConflictDoNothing()
      .run();

    for (const item of mockCases) {
      const openedAt = new Date(now - 24 * 60 * 60 * 1000);
      const resolvedAt = item.status === "resolved" ? new Date(now) : null;

      await db
        .insert(cases)
        .values({
          id: item.id,
          caseId: item.caseId,
          siteId,
          createdBy: userId,
          ownerId: userId,
          assignedTo: userId,
          type: item.type,
          severity: item.severity,
          title: item.title,
          description: item.subtitle,
          status: item.status,
          confidence: item.confidence,
          openedAt,
          resolvedAt,
        })
        .onConflictDoNothing()
        .run();

      await db
        .insert(incidents)
        .values({
          id: `incident-${item.id}`,
          caseId: item.id,
          externalId: item.caseId,
          source: "casezero-seed",
          title: item.title,
          severity: item.severity,
          status: item.status === "resolved" ? "resolved" : "open",
        })
        .onConflictDoNothing()
        .run();

      for (const [index, entry] of (item.recommendation?.evidence ?? []).entries()) {
        await db
          .insert(evidence)
          .values({
            id: `evidence-${item.id}-${index}`,
            caseId: item.id,
            type: entry[0],
            title: entry[1],
            description: entry[2],
            timestamp: entry[3],
            color: entry[4] ?? "blue",
          })
          .onConflictDoNothing()
          .run();
      }

      await db
        .insert(activities)
        .values({
          id: `activity-${item.id}-seed`,
          caseId: item.id,
          description: `Case seeded with ${item.sources} evidence sources`,
          createdBy: userId,
        })
        .onConflictDoNothing()
        .run();
    }

    return Response.json({
      success: true,
      source: "d1",
      message: `D1 seeded with ${mockCases.length} cases`,
    });
  } catch {
    return Response.json({
      success: true,
      source: "mock",
      message: `Mock data already in memory — ${mockCases.length} cases available`,
    });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const result = await db.select({ id: cases.id }).from(cases);
    return Response.json({ cases: result.length, source: "d1", message: "D1 database status" });
  } catch {
    return Response.json({ cases: mockCases.length, source: "mock", message: "Mock database is populated" });
  }
}
