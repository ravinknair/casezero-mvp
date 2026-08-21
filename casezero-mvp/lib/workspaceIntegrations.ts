import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { workspaceIntegrations } from "@/db/schema";
import type { ConnectorProvider } from "@/lib/connectors";

export async function hashIntegrationToken(token: string) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createWorkspaceIntegration(workspaceId: string, createdBy: string, provider: ConnectorProvider) {
	const token = `cz_${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
	await getDb().insert(workspaceIntegrations).values({
		id: crypto.randomUUID(), workspaceId, provider, tokenHash: await hashIntegrationToken(token), createdBy,
	}).onConflictDoUpdate({
		target: [workspaceIntegrations.workspaceId, workspaceIntegrations.provider],
		set: { tokenHash: await hashIntegrationToken(token), active: true, createdBy, updatedAt: new Date() },
	}).run();
	return token;
}

export async function resolveWorkspaceIntegration(token: string, provider: ConnectorProvider) {
	const rows = await getDb().select({ workspaceId: workspaceIntegrations.workspaceId })
		.from(workspaceIntegrations)
		.where(and(eq(workspaceIntegrations.tokenHash, await hashIntegrationToken(token)), eq(workspaceIntegrations.provider, provider), eq(workspaceIntegrations.active, true)))
		.limit(1);
	return rows[0]?.workspaceId ?? null;
}