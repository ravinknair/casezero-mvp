import { mockCases } from "@/lib/mockData";
import { audit, requireAuth } from "@/lib/auth";

function normalizeEvidence(
  rawEvidence: Array<[string, string, string, string, string?]> | undefined
) {
  return (rawEvidence ?? []).map(([type, title, description, timestamp, color]) => ({
    type,
    title,
    description,
    timestamp,
    color: color ?? "blue",
  }));
}

function normalizeMetrics(
  rawMetrics: Array<[string, string, string, "neutral" | "warn" | "danger"]> | undefined
) {
  return (rawMetrics ?? []).map(([name, value, change, status]) => ({
    name,
    value,
    change,
    status,
  }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
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
      evidence: normalizeEvidence(caseFound.recommendation?.evidence),
      activities: [],
      approvals: [],
      metrics: normalizeMetrics(caseFound.recommendation?.metrics),
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
    const caseFound = mockCases.find((item) => item.id === id || item.caseId === id);

    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    caseFound.status = body.status || caseFound.status;
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
    const caseIndex = mockCases.findIndex((item) => item.id === id || item.caseId === id);

    if (caseIndex === -1) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    const [deletedCase] = mockCases.splice(caseIndex, 1);
    await audit(auth, "case.delete", id);
    return Response.json({ deleted: true, id: deletedCase.id });
  } catch {
    return Response.json({ error: "Failed to delete case" }, { status: 500 });
  }
}
