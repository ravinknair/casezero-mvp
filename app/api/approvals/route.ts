import { db } from "@/db";
import { approvals, cases } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (caseId) {
      const caseApprovals = await db
        .select()
        .from(approvals)
        .where(eq(approvals.caseId, caseId));
      return Response.json(caseApprovals);
    }

    const allApprovals = await db.select().from(approvals);
    return Response.json(allApprovals);
  } catch (error) {
    return Response.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, recommendationId, status, approvedBy, approvalNotes } = body;

    const newApproval = {
      id: `approval-${Date.now()}`,
      caseId,
      recommendationId,
      status,
      approvedBy,
      approvalNotes,
      decidedAt: status !== "pending" ? new Date() : null,
    };

    await db.insert(approvals).values(newApproval);

    // Update case status based on approval
    if (status === "approved") {
      await db.update(cases).set({ status: "act" }).where(eq(cases.id, caseId));
    } else if (status === "rejected") {
      await db.update(cases).set({ status: "rejected" }).where(eq(cases.id, caseId));
    }

    return Response.json(newApproval, { status: 201 });
  } catch (error) {
    console.error("Error creating approval:", error);
    return Response.json({ error: "Failed to create approval" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, approvedBy, approvalNotes } = body;

    await db.update(approvals).set({
      status,
      approvedBy,
      approvalNotes,
      decidedAt: new Date(),
    }).where(eq(approvals.id, id));

    const updated = await db.select().from(approvals).where(eq(approvals.id, id));
    return Response.json(updated[0]);
  } catch (error) {
    console.error("Error updating approval:", error);
    return Response.json({ error: "Failed to update approval" }, { status: 500 });
  }
}
