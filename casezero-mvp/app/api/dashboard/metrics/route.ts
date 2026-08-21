import { getSupportTelemetryEvents } from "@/lib/externalSupport";
import { buildDashboardMetrics } from "@/lib/dashboardMetrics";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const provider = new URL(request.url).searchParams.get("provider") || undefined;
    const supportEvents = getSupportTelemetryEvents();

    try {
      const { getDatabaseDashboardMetrics } = await import("@/lib/dashboardMetricsService");
      return Response.json(await getDatabaseDashboardMetrics(supportEvents, auth.workspaceId, provider));
    } catch {
      return Response.json({ ...buildDashboardMetrics([], supportEvents), sampleMode: true });
    }
  } catch {
    return Response.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
