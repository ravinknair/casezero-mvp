import { and, eq, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    const [{ getDb }, { cases, evidence }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const results = await db.select({ evidence }).from(evidence).innerJoin(cases, eq(evidence.caseId, cases.id)).where(
      caseId
        ? and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, caseId), eq(cases.caseId, caseId)))
        : eq(cases.workspaceId, auth.workspaceId),
    );
    return Response.json(results.map((row) => row.evidence));
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
    const [{ getDb }, { cases, evidence }] = await Promise.all([import("@/db"), import("@/db/schema")]);
    const db = getDb();
    const caseRows = await db.select({ id: cases.id }).from(cases).where(and(eq(cases.workspaceId, auth.workspaceId), or(eq(cases.id, caseId), eq(cases.caseId, caseId)))).limit(1);
    if (!caseRows[0]) return Response.json({ error: "Case not found" }, { status: 404 });
    const newEvidence = { id: crypto.randomUUID(), caseId: caseRows[0].id, type, title, description, timestamp, color: color ?? "blue" };
    await db.insert(evidence).values(newEvidence).run();
    return Response.json(newEvidence, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create evidence" }, { status: 500 });
  }
}
