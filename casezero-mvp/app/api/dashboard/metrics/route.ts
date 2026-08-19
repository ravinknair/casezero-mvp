import { mockCases, mockSupportInteractions } from "@/lib/mockData";
import { getSupportTelemetryEvents } from "@/lib/externalSupport";
import { buildDashboardMetrics } from "@/lib/dashboardMetrics";

export async function GET() {
  try {
    const supportEvents = getSupportTelemetryEvents();

    try {
      const { getDatabaseDashboardMetrics } = await import("@/lib/dashboardMetricsService");
      return Response.json(await getDatabaseDashboardMetrics(supportEvents));
    } catch {
      return Response.json(buildDashboardMetrics(mockCases, supportEvents, [], mockSupportInteractions));
    }
  } catch {
    return Response.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
