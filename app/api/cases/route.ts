import { mockCases } from "@/lib/mockData";

export async function GET() {
  return Response.json(mockCases);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      caseId,
      type,
      severity,
      title,
      subtitle,
      confidence,
      sources,
      activity,
    } = body;

    const newCase = {
      id: `case-${Date.now()}`,
      caseId: caseId || `CZ-${Math.round(Math.random() * 9000 + 1000)}`,
      type: type || "PRODUCTION INCIDENT",
      severity: severity || "SEV-2",
      title: title || "New incident",
      subtitle: subtitle || "Created from the local preview environment",
      status: "detect",
      confidence: typeof confidence === "number" ? confidence : 75,
      sources: typeof sources === "number" ? sources : 0,
      activity: typeof activity === "number" ? activity : 0,
    };

    mockCases.unshift(newCase);
    return Response.json(newCase, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Failed to create case" }, { status: 500 });
  }
}
