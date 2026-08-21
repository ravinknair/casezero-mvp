import {
  collectAllSupportSources,
  collectSupportSource,
  getSupportTracking,
  prepareTicketBundle,
  type SupportActionType,
  type SupportSourceType,
} from "@/lib/externalSupport";
import { audit, requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request, "read");
  if (auth instanceof Response) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    if (!caseId) {
      return Response.json({ error: "caseId is required" }, { status: 400 });
    }

    return Response.json(getSupportTracking(caseId));
  } catch {
    return Response.json({ error: "Failed to fetch support tracking artifacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request, "write");
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const action = body.action as SupportActionType | undefined;
    const caseId = body.caseId as string | undefined;
    const createdBy = (body.createdBy as string | undefined) ?? "incident-approver";
    const clientEnvironment = (body.clientEnvironment as string | undefined)?.trim();
    const sourceType = body.sourceType as SupportSourceType | undefined;
    const sourceName = body.sourceName as string | undefined;

    if (!action || !caseId || !clientEnvironment) {
      return Response.json({ error: "action, caseId, and clientEnvironment are required" }, { status: 400 });
    }

    if (action !== "collect_source" && action !== "collect_all_sources" && action !== "prepare_ticket_bundle") {
      return Response.json({ error: "Unsupported support tracking action" }, { status: 400 });
    }

    const result =
      action === "collect_source"
        ? (() => {
            if ((sourceType !== "provider" && sourceType !== "channel") || !sourceName) {
              throw new Error("sourceType and sourceName are required for collect_source");
            }
            return collectSupportSource(caseId, sourceType, sourceName, createdBy, clientEnvironment);
          })()
        : action === "collect_all_sources"
          ? collectAllSupportSources(caseId, createdBy, clientEnvironment)
          : prepareTicketBundle(caseId, createdBy, clientEnvironment);

    await audit(auth, "support_tracking.write", caseId, { action });
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process support tracking action";
    const status =
      message === "Case not found" ||
      message.includes("incomplete") ||
      message === "Unsupported source" ||
      message === "sourceType and sourceName are required for collect_source"
        ? 400
        : 500;
    return Response.json({ error: message }, { status });
  }
}
