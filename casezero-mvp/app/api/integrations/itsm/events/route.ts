import { getRecentItsmIntegrationEvents } from "@/lib/serviceNowIntegrationHealth";

export async function GET() {
  return Response.json(await getRecentItsmIntegrationEvents());
}