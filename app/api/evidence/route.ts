import { db } from "@/db";
import { evidence } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (caseId) {
      const caseEvidence = await db
        .select()
        .from(evidence)
        .where(eq(evidence.caseId, caseId));
      return Response.json(caseEvidence);
    }

    const allEvidence = await db.select().from(evidence);
    return Response.json(allEvidence);
  } catch (error) {
    return Response.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, type, title, description, timestamp, color, sourceData } = body;

    const newEvidence = {
      id: `evidence-${Date.now()}`,
      caseId,
      type,
      title,
      description,
      timestamp,
      color,
      sourceData,
    };

    await db.insert(evidence).values(newEvidence);
    return Response.json(newEvidence, { status: 201 });
  } catch (error) {
    console.error("Error creating evidence:", error);
    return Response.json({ error: "Failed to create evidence" }, { status: 500 });
  }
}
