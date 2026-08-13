import { mockCases } from "@/lib/mockData";

export async function POST() {
  return Response.json({
    success: true,
    message: `Mock data already in memory — ${mockCases.length} cases available`,
  });
}

export async function GET() {
  return Response.json({
    cases: mockCases.length,
    message: "Mock database is populated",
  });
}
