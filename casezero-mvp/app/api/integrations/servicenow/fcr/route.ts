import { ingestItsmFcrRequest } from "@/lib/itsmIngestion";

export async function GET() {
  return Response.json({
    service: "CaseZero ServiceNow FCR ingestion",
    status: "ready",
    method: "POST",
    authHeader: "X-CaseZero-Connector-Token",
    message: "Send ServiceNow incident updates with POST and a workspace connector token.",
  });
}

export async function POST(request: Request) {
  return ingestItsmFcrRequest(request, "servicenow");
}