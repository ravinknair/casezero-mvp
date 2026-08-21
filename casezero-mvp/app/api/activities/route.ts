import { and, eq, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    const [{ getDb }, { activities, cases }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const results = await getDb().select({ activities }).from(activities).innerJoin(cases, eq(activities.caseId, cases.id)).where(
      caseId
        ? and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, caseId), eq(cases.caseId, caseId)))
        : eq(cases.workspaceId, auth.workspaceId),
    );
    return Response.json(results.map((row) => row.activities));
  } catch {
    return Response.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const { caseId, description } = body;
    const [{ getDb }, { activities, cases }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const caseRows = await db.select({ id: cases.id }).from(cases).where(and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, caseId), eq(cases.caseId, caseId)))).limit(1);
    if (!caseRows[0]) return Response.json({ error: "Case not found" }, { status: 404 });
    const newActivity = { id: crypto.randomUUID(), caseId: caseRows[0].id, description, createdBy: auth.userId };
    await db.insert(activities).values(newActivity).run();
    return Response.json(newActivity, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
