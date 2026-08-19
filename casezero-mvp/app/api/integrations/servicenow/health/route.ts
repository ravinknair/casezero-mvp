import { getServiceNowIntegrationHealth } from "@/lib/serviceNowIntegrationHealth";

export async function GET(request: Request) {
  return Response.json(await getServiceNowIntegrationHealth(request.url));
}