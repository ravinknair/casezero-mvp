import { mockCases } from "@/lib/mockData";
import { trackEvent } from "@/lib/telemetry";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseFound = mockCases.find((item) => item.id === id || item.caseId === id);

    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const diagnoses = caseFound.diagnosis ? [caseFound.diagnosis] : [];
    const recommendations = caseFound.recommendation ? [caseFound.recommendation] : [];

    return Response.json({
      case: caseFound,
      diagnoses,
      recommendations,
      evidence: caseFound.recommendation?.evidence ?? [],
      activities: [],
      approvals: [],
      metrics: caseFound.recommendation?.metrics ?? [],
    });
  } catch {
    return Response.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const caseFound = mockCases.find((item) => item.id === id || item.caseId === id);

    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const previousStatus = caseFound.status;
    caseFound.status = body.status || caseFound.status;
    if (caseFound.status !== previousStatus) {
      await trackEvent("CaseStatusChanged", {
        caseId: caseFound.caseId,
        type: caseFound.type,
        from: previousStatus,
        to: caseFound.status,
      });
    }
    return Response.json(caseFound);
  } catch {
    return Response.json({ error: "Failed to update case" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = mockCases.findIndex((item) => item.id === id && item.caseId.startsWith("CZ-SMOKE-"));

  if (index === -1) {
    return Response.json({ error: "Smoke-test case not found" }, { status: 404 });
  }

  const [deleted] = mockCases.splice(index, 1);
  return Response.json({ deleted: deleted.caseId });
}
