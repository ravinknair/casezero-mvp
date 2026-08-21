import { trackEvent } from "@/lib/telemetry";
import { and, eq, or } from "drizzle-orm";
import { audit, requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    const [{ getDb }, { approvals, cases }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const results = await getDb().select({ approvals }).from(approvals).innerJoin(cases, eq(approvals.caseId, cases.id)).where(
      caseId
        ? and(eq(approvals.workspaceId, auth.workspaceId), or(eq(cases.id, caseId), eq(cases.caseId, caseId)))
        : eq(approvals.workspaceId, auth.workspaceId),
    );
    return Response.json(results.map((row) => row.approvals));
  } catch {
    return Response.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { caseId, recommendationId, status, approvalNotes } = body;
    if (!["pending", "approved", "rejected"].includes(status)) return Response.json({ error: "Invalid approval status" }, { status: 400 });
    const [{ getDb }, { approvals, cases }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const caseRows = await db.select().from(cases).where(and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, caseId), eq(cases.caseId, caseId)))).limit(1);
    const caseFound = caseRows[0];
    if (!caseFound) return Response.json({ error: "Case not found" }, { status: 404 });
    const newApproval = {
      id: crypto.randomUUID(), workspaceId: auth.workspaceId, caseId: caseFound.id,
      recommendationId: recommendationId ?? null, status, approvedBy: auth.userId,
      approvalNotes: approvalNotes ?? null, decidedAt: status !== "pending" ? new Date() : null,
    };
    await db.insert(approvals).values(newApproval).run();
    if (status === "approved" || status === "rejected") {
      await db.update(cases).set({ status: status === "approved" ? "act" : "rejected", updatedAt: new Date() }).where(and(eq(cases.id, caseFound.id), eq(cases.workspaceId, auth.workspaceId))).run();
    }

    await trackEvent("ApprovalDecision", {
      caseId: caseFound.caseId,
      status,
      approvedBy: auth.userId,
    });
    await audit(auth, "approval.create", caseId, { status });

    return Response.json(newApproval, { status: 201 });
  } catch (error) {
    console.error("Error creating approval:", error);
    return Response.json({ error: "Failed to create approval" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { id, status, approvalNotes } = body;
    if (!["pending", "approved", "rejected"].includes(status)) return Response.json({ error: "Invalid approval status" }, { status: 400 });
    const [{ getDb }, { approvals, cases }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const rows = await db.select({ approvals, cases }).from(approvals).innerJoin(cases, eq(approvals.caseId, cases.id)).where(and(eq(approvals.id, id), eq(approvals.workspaceId, auth.workspaceId), eq(cases.workspaceId, auth.workspaceId))).limit(1);
    const approvalToUpdate = rows[0]?.approvals;
    if (!approvalToUpdate) {
      return Response.json({ error: "Approval not found" }, { status: 404 });
    }
    await db.update(approvals).set({ status, approvedBy: auth.userId, approvalNotes: approvalNotes ?? approvalToUpdate.approvalNotes, decidedAt: new Date(), updatedAt: new Date() }).where(and(eq(approvals.id, id), eq(approvals.workspaceId, auth.workspaceId))).run();
    await db.update(cases).set({ status: status === "approved" ? "act" : status === "rejected" ? "rejected" : "detect", updatedAt: new Date() }).where(and(eq(cases.id, approvalToUpdate.caseId), eq(cases.workspaceId, auth.workspaceId))).run();
    const updatedApproval = { ...approvalToUpdate, status, approvedBy: auth.userId, approvalNotes: approvalNotes ?? approvalToUpdate.approvalNotes, decidedAt: new Date() };
    await audit(auth, "approval.update", id, { status });
    return Response.json(updatedApproval);
  } catch (error) {
    console.error("Error updating approval:", error);
    return Response.json({ error: "Failed to update approval" }, { status: 500 });
  }
}
