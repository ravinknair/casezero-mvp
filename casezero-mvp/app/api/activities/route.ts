import { mockCases } from "@/lib/mockData";
import { requireAuth } from "@/lib/auth";

const mockActivities = mockCases.flatMap((c) =>
  (c.recommendation?.activities ?? []).map((description: string, index: number) => ({
    id: `activity-${c.id}-${index}`,
    caseId: c.id,
    description,
    createdBy: "user-default",
    createdAt: new Date().toISOString(),
  }))
);

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    const results = caseId
      ? mockActivities.filter((a) => a.caseId === caseId)
      : mockActivities;
    return Response.json(results);
  } catch {
    return Response.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { caseId, description, createdBy } = body;
    const newActivity = {
      id: `activity-${Date.now()}`,
      caseId,
      description,
      createdBy: createdBy || "user-default",
      createdAt: new Date().toISOString(),
    };
    mockActivities.unshift(newActivity);
    return Response.json(newActivity, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
