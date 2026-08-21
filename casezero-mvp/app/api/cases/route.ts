import { eq } from "drizzle-orm";
import { audit, requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const [{ getDb }, { cases, evidence }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const rows = await db.select().from(cases).where(eq(cases.workspaceId, auth.workspaceId));
    const evidenceRows = await db.select({ caseId: evidence.caseId }).from(evidence).innerJoin(cases, eq(evidence.caseId, cases.id)).where(eq(cases.workspaceId, auth.workspaceId));
    const sourceCounts = new Map<string, number>();
    for (const row of evidenceRows) sourceCounts.set(row.caseId, (sourceCounts.get(row.caseId) ?? 0) + 1);
    return Response.json(rows.map((item) => ({
      id: item.id, caseId: item.caseId, type: item.type, severity: item.severity, title: item.title,
      subtitle: item.description, status: item.status, confidence: item.confidence,
      sources: sourceCounts.get(item.id) ?? 0, openedAt: item.openedAt, resolvedAt: item.resolvedAt,
    })));
  } catch {
    return Response.json([]);
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const {
      caseId,
      type,
      severity,
      title,
      subtitle,
      externalProvider,
      clientEnvironment,
      zippedLogsPlaceholder,
      chatEvidencePlaceholder,
      confidence,
      sources,
      activity,
    } = body;

    const supportNotes = [
      externalProvider ? `provider=${externalProvider}` : null,
      clientEnvironment ? `client-env=${clientEnvironment}` : null,
      zippedLogsPlaceholder ? `logs=${zippedLogsPlaceholder}` : null,
      chatEvidencePlaceholder ? `chat=${chatEvidencePlaceholder}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const [{ getDb }, { cases }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const newCase = {
      id: crypto.randomUUID(), caseId: caseId || `CZ-${Math.round(Math.random() * 9000 + 1000)}`,
      type: type || "PRODUCTION INCIDENT", severity: severity || "SEV-2", title: title || "New incident",
      description: [subtitle || "Created from the local preview environment", supportNotes].filter(Boolean).join(" · "),
      status: "detect", confidence: typeof confidence === "number" ? confidence : 75,
      workspaceId: auth.workspaceId, createdBy: auth.userId, ownerId: auth.userId, assignedTo: auth.userId,
    };
    await getDb().insert(cases).values(newCase).run();
    await audit(auth, "case.create", newCase.caseId);
    return Response.json({ ...newCase, subtitle: newCase.description, sources: sources ?? 0, activity: activity ?? 0 }, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create case" }, { status: 500 });
  }
}
