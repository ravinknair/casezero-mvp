import { mockApprovals, mockCases } from "@/lib/mockData";
import { trackEvent } from "@/lib/telemetry";
import { audit, requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (caseId) {
      return Response.json(mockApprovals.filter((item) => item.caseId === caseId));
    }

    return Response.json(mockApprovals);
  } catch {
    return Response.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { caseId, recommendationId, status, approvedBy, approvalNotes } = body;

    const newApproval = {
      id: `approval-${Date.now()}`,
      caseId,
      recommendationId: recommendationId ?? null,
      status,
      approvedBy: approvedBy ?? "user-default",
      approvalNotes: approvalNotes ?? null,
      decidedAt: status !== "pending" ? new Date().toISOString() : null,
    };

    mockApprovals.unshift(newApproval);

    const caseFound = mockCases.find((item) => item.id === caseId || item.caseId === caseId);
    if (caseFound) {
      caseFound.status = status === "approved" ? "act" : "rejected";
    }

    await trackEvent("ApprovalDecision", {
      caseId: caseFound?.caseId ?? caseId,
      status,
      approvedBy,
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
    const { id, status, approvedBy, approvalNotes } = body;

    const approvalToUpdate = mockApprovals.find((item) => item.id === id);
    if (!approvalToUpdate) {
      return Response.json({ error: "Approval not found" }, { status: 404 });
    }

    approvalToUpdate.status = status;
    approvalToUpdate.approvedBy = approvedBy ?? approvalToUpdate.approvedBy;
    approvalToUpdate.approvalNotes = approvalNotes ?? approvalToUpdate.approvalNotes;
    approvalToUpdate.decidedAt = new Date().toISOString();
    await audit(auth, "approval.update", id, { status });

    return Response.json(approvalToUpdate);
  } catch (error) {
    console.error("Error updating approval:", error);
    return Response.json({ error: "Failed to update approval" }, { status: 500 });
  }
}
