import { ingestItsmFcrRequest } from "@/lib/itsmIngestion";

export async function POST(request: Request) {
  return ingestItsmFcrRequest(request, "servicenow");
}