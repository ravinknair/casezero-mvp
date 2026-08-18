import { mockCases } from "@/lib/mockData";
import { getSupportTelemetryEvents } from "@/lib/externalSupport";
import { buildDashboardMetrics } from "@/lib/dashboardMetrics";
import { getDatabaseDashboardMetrics } from "@/lib/dashboardMetricsService";

export async function GET() {
  try {
    const supportEvents = getSupportTelemetryEvents();

    try {
      return Response.json(await getDatabaseDashboardMetrics(supportEvents));
    } catch {
      return Response.json(buildDashboardMetrics(mockCases, supportEvents));
    }
  } catch {
    return Response.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
