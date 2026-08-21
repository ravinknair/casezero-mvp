import { mockCases } from "@/lib/mockData";
import { requireAuth } from "@/lib/auth";

const mockEvidence = mockCases.flatMap((c) =>
  (c.recommendation?.evidence ?? []).map((entry: string[], index: number) => ({
    id: `evidence-${c.id}-${index}`,
    caseId: c.id,
    type: entry[0],
    title: entry[1],
    description: entry[2],
    timestamp: entry[3],
    color: entry[4] ?? "blue",
  }))
);

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    const results = caseId
      ? mockEvidence.filter((e) => e.caseId === caseId)
      : mockEvidence;
    return Response.json(results);
  } catch {
    return Response.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { caseId, type, title, description, timestamp, color } = body;
    const newEvidence = {
      id: `evidence-${Date.now()}`,
      caseId,
      type,
      title,
      description,
      timestamp,
      color,
    };
    mockEvidence.unshift(newEvidence);
    return Response.json(newEvidence, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create evidence" }, { status: 500 });
  }
}
