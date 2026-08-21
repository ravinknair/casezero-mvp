import { audit, requireAuth } from "@/lib/auth";
import { createWorkspaceIntegration } from "@/lib/workspaceIntegrations";
import type { ConnectorProvider } from "@/lib/connectors";

const providers = ["servicenow", "zendesk", "jira_service_management", "salesforce_service_cloud", "freshservice", "bmc_helix", "ivanti_neurons", "manageengine_service_desk_plus"];

export async function POST(request: Request) {
	const auth = await requireAuth(request, "admin");
	if (auth instanceof Response) return auth;
	const { provider } = await request.json() as { provider?: string };
	if (!provider || !providers.includes(provider)) return Response.json({ error: "Unsupported connector provider" }, { status: 400 });
	const token = await createWorkspaceIntegration(auth.workspaceId, auth.userId, provider as ConnectorProvider);
	await audit(auth, "integration.token.created", provider);
	return Response.json({ provider, token, webhookPath: "/api/integrations/itsm/fcr" }, { status: 201 });
}