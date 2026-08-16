import { getSupportTelemetryEvents } from "@/lib/externalSupport";

export async function GET() {
  try {
    return Response.json(getSupportTelemetryEvents());
  } catch {
    return Response.json({ error: "Failed to fetch telemetry events" }, { status: 500 });
  }
}
