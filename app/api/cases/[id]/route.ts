import { mockCases } from "@/lib/mockData";

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
  } catch (error) {
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

    caseFound.status = body.status || caseFound.status;
    return Response.json(caseFound);
  } catch (error) {
    return Response.json({ error: "Failed to update case" }, { status: 500 });
  }
}
