import { mockCases } from "@/lib/mockData";
import { trackEvent } from "@/lib/telemetry";
import { audit, requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  return Response.json(mockCases);
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const {
      caseId,
      type,
      severity,
      title,
      subtitle,
      externalProvider,
      clientEnvironment,
      zippedLogsPlaceholder,
      chatEvidencePlaceholder,
      confidence,
      sources,
      activity,
    } = body;

    const supportNotes = [
      externalProvider ? `provider=${externalProvider}` : null,
      clientEnvironment ? `client-env=${clientEnvironment}` : null,
      zippedLogsPlaceholder ? `logs=${zippedLogsPlaceholder}` : null,
      chatEvidencePlaceholder ? `chat=${chatEvidencePlaceholder}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const newCase = {
      id: `case-${Date.now()}`,
      caseId: caseId || `CZ-${Math.round(Math.random() * 9000 + 1000)}`,
      type: type || "PRODUCTION INCIDENT",
      severity: severity || "SEV-2",
      title: title || "New incident",
      clientEnvironment: typeof clientEnvironment === "string" ? clientEnvironment.trim() : undefined,
      subtitle:
        [subtitle || "Created from the local preview environment", supportNotes]
          .filter(Boolean)
          .join(" · "),
      status: "detect",
      confidence: typeof confidence === "number" ? confidence : 75,
      sources: typeof sources === "number" ? sources : 0,
      activity: typeof activity === "number" ? activity : 0,
    };

    mockCases.unshift(newCase);
    await trackEvent("CaseCreated", {
      caseId: newCase.caseId,
      type: newCase.type,
      severity: newCase.severity,
    }, { confidence: newCase.confidence, sources: newCase.sources });
    await audit(auth, "case.create", newCase.caseId);
    return Response.json(newCase, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create case" }, { status: 500 });
  }
}
