import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (caseId) {
      const caseActivities = await db
        .select()
        .from(activities)
        .where(eq(activities.caseId, caseId));
      return Response.json(caseActivities);
    }

    const allActivities = await db.select().from(activities);
    return Response.json(allActivities);
  } catch (error) {
    return Response.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, description, createdBy } = body;

    const newActivity = {
      id: `activity-${Date.now()}`,
      caseId,
      description,
      createdBy: createdBy || "user-default",
    };

    await db.insert(activities).values(newActivity);
    return Response.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return Response.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
