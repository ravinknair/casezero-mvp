import { audit, requireAuth } from "@/lib/auth";
import { acceptWorkspaceInvitation, createWorkspaceInvitation, type InvitationRole } from "@/lib/workspaceInvitations";
import { and, eq, gt, isNull } from "drizzle-orm";

export async function GET(request: Request) {
	const auth = await requireAuth(request, "read");
	if (auth instanceof Response) return auth;
	try {
		const [{ getDb }, { users, workspaceInvitations, workspaceMembers }] = await Promise.all([import("@/db"), import("@/db/schema")]);
		const db = getDb();
		const [members, invitations] = await Promise.all([
			db.select({ id: users.id, name: users.name, email: users.email, role: workspaceMembers.role }).from(workspaceMembers).innerJoin(users, eq(workspaceMembers.userId, users.id)).where(eq(workspaceMembers.workspaceId, auth.workspaceId)),
			db.select({ id: workspaceInvitations.id, email: workspaceInvitations.email, role: workspaceInvitations.role, expiresAt: workspaceInvitations.expiresAt }).from(workspaceInvitations).where(and(eq(workspaceInvitations.workspaceId, auth.workspaceId), isNull(workspaceInvitations.acceptedAt), isNull(workspaceInvitations.revokedAt), gt(workspaceInvitations.expiresAt, new Date()))),
		]);
		return Response.json({ members, invitations });
	} catch {
		return Response.json({ members: [], invitations: [] });
	}
}

export async function POST(request: Request) {
	const auth = await requireAuth(request, "admin");
	if (auth instanceof Response) return auth;
	try {
		const body = await request.json() as { email?: string; role?: InvitationRole };
		const role = body.role ?? "viewer";
		if (!["admin", "operator", "viewer"].includes(role)) return Response.json({ error: "Invalid role" }, { status: 400 });
		const invitation = await createWorkspaceInvitation(auth.workspaceId, auth.userId, body.email ?? "", role);
		await audit(auth, "workspace.invitation.created", invitation.email, { role: invitation.role });
		return Response.json({ ...invitation, invitationUrl: `/login?invitation=${encodeURIComponent(invitation.token)}` }, { status: 201 });
	} catch (error) {
		return Response.json({ error: error instanceof Error ? error.message : "Failed to create invitation" }, { status: 400 });
	}
}

export async function PUT(request: Request) {
	const auth = await requireAuth(request, "read");
	if (auth instanceof Response) return auth;
	try {
		const body = await request.json() as { token?: string };
		if (!body.token) return Response.json({ error: "Invitation token is required" }, { status: 400 });
		const workspaceId = await acceptWorkspaceInvitation(body.token, auth.userId, auth.email);
		await audit(auth, "workspace.invitation.accepted", workspaceId);
		return Response.json({ accepted: true, workspaceId });
	} catch (error) {
		return Response.json({ error: error instanceof Error ? error.message : "Failed to accept invitation" }, { status: 400 });
	}
}

export async function DELETE(request: Request) {
	const auth = await requireAuth(request, "admin");
	if (auth instanceof Response) return auth;
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return Response.json({ error: "Invitation id is required" }, { status: 400 });
		const [{ getDb }, { workspaceInvitations }] = await Promise.all([import("@/db"), import("@/db/schema")]);
		const result = await getDb().update(workspaceInvitations).set({ revokedAt: new Date() }).where(and(eq(workspaceInvitations.id, id), eq(workspaceInvitations.workspaceId, auth.workspaceId), isNull(workspaceInvitations.acceptedAt), isNull(workspaceInvitations.revokedAt))).run();
		if (!result.meta.changes) return Response.json({ error: "Invitation not found" }, { status: 404 });
		await audit(auth, "workspace.invitation.revoked", id);
		return Response.json({ revoked: true, id });
	} catch (error) {
		return Response.json({ error: error instanceof Error ? error.message : "Failed to revoke invitation" }, { status: 400 });
	}
}