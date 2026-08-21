import { mockCases, mockSupportInteractions } from "@/lib/mockData";
import { getSupportTelemetryEvents } from "@/lib/externalSupport";
import { buildDashboardMetrics } from "@/lib/dashboardMetrics";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const supportEvents = getSupportTelemetryEvents();

    try {
      const { getDatabaseDashboardMetrics } = await import("@/lib/dashboardMetricsService");
      return Response.json(await getDatabaseDashboardMetrics(supportEvents));
    } catch {
      return Response.json({ ...buildDashboardMetrics(mockCases, supportEvents, [], mockSupportInteractions), sampleMode: true });
    }
  } catch {
    return Response.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
