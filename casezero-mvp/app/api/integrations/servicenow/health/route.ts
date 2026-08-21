import { getServiceNowIntegrationHealth } from "@/lib/serviceNowIntegrationHealth";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  return Response.json(await getServiceNowIntegrationHealth(request.url, auth.workspaceId));
}