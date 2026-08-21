import { and, eq, or } from "drizzle-orm";
import { audit, requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    const [{ getDb }, { cases, evidence, activities }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const rows = await db.select().from(cases).where(and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, id), eq(cases.caseId, id)))).limit(1);
    const caseFound = rows[0];

    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const [evidenceRows, activityRows] = await Promise.all([
      db.select().from(evidence).where(eq(evidence.caseId, caseFound.id)),
      db.select().from(activities).where(eq(activities.caseId, caseFound.id)),
    ]);

    return Response.json({
      case: caseFound,
      diagnoses: [],
      recommendations: [],
      evidence: evidenceRows,
      activities: activityRows,
      approvals: [],
      metrics: [],
    });
  } catch {
    return Response.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const [{ getDb }, { cases }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const rows = await db.select().from(cases).where(and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, id), eq(cases.caseId, id)))).limit(1);
    const caseFound = rows[0];

    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const nextStatus = body.status || caseFound.status;
    await db.update(cases).set({ status: nextStatus, resolvedAt: nextStatus === "resolved" ? new Date() : caseFound.resolvedAt, updatedAt: new Date() }).where(and(eq(cases.id, caseFound.id), eq(cases.workspaceId, auth.workspaceId))).run();
    caseFound.status = nextStatus;
    await audit(auth, "case.update", id, { status: caseFound.status });
    return Response.json(caseFound);
  } catch {
    return Response.json({ error: "Failed to update case" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "admin");
  if (auth instanceof Response) return auth;
  try {
    const { id } = await params;
    const [{ getDb }, { cases, evidence, incidents, activities }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const rows = await db.select({ id: cases.id }).from(cases).where(and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, id), eq(cases.caseId, id)))).limit(1);
    const caseFound = rows[0];
    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }
    await db.delete(evidence).where(eq(evidence.caseId, caseFound.id)).run();
    await db.delete(activities).where(eq(activities.caseId, caseFound.id)).run();
    await db.delete(incidents).where(eq(incidents.caseId, caseFound.id)).run();
    await db.delete(cases).where(and(eq(cases.id, caseFound.id), eq(cases.workspaceId, auth.workspaceId))).run();
    await audit(auth, "case.delete", id);
    return Response.json({ deleted: true, id: caseFound.id });
  } catch {
    return Response.json({ error: "Failed to delete case" }, { status: 500 });
  }
}
