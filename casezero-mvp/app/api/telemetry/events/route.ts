import { getSupportTelemetryEvents } from "@/lib/externalSupport";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    return Response.json(getSupportTelemetryEvents());
  } catch {
    return Response.json({ error: "Failed to fetch telemetry events" }, { status: 500 });
  }
}
