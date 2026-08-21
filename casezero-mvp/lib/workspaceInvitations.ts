import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { users, workspaceInvitations, workspaceMembers } from "@/db/schema";

export type InvitationRole = "admin" | "operator" | "viewer";

async function hashToken(token: string) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createWorkspaceInvitation(workspaceId: string, invitedBy: string, email: string, role: InvitationRole) {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail.includes("@")) throw new Error("A valid email is required");

	const db = getDb();
	const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
	if (existingUser[0]) {
		const existingMember = await db.select({ userId: workspaceMembers.userId }).from(workspaceMembers)
			.where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, existingUser[0].id))).limit(1);
		if (existingMember[0]) throw new Error("That user is already a workspace member");
	}

	const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	await db.insert(workspaceInvitations).values({
		id: crypto.randomUUID(), workspaceId, email: normalizedEmail, role,
		tokenHash: await hashToken(token), expiresAt, invitedBy,
	}).onConflictDoUpdate({
		target: [workspaceInvitations.workspaceId, workspaceInvitations.email],
		set: { tokenHash: await hashToken(token), role, expiresAt, invitedBy, revokedAt: null, acceptedAt: null },
	}).run();
	return { token, email: normalizedEmail, role, expiresAt };
}

export async function acceptWorkspaceInvitation(token: string, userId: string, email: string) {
	const db = getDb();
	const rows = await db.select().from(workspaceInvitations).where(and(
		eq(workspaceInvitations.tokenHash, await hashToken(token)),
		isNull(workspaceInvitations.acceptedAt), isNull(workspaceInvitations.revokedAt),
	)).limit(1);
	const invitation = rows[0];
	if (!invitation || invitation.expiresAt.getTime() <= Date.now() || invitation.email !== email.toLowerCase()) {
		throw new Error("Invitation is invalid, expired, or assigned to another email");
	}
	const existingMember = await db.select({ role: workspaceMembers.role }).from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, invitation.workspaceId), eq(workspaceMembers.userId, userId))).limit(1);
	const assignedRole = existingMember[0]?.role === "admin" ? "admin" : invitation.role;
	await db.insert(workspaceMembers).values({ workspaceId: invitation.workspaceId, userId, role: assignedRole }).onConflictDoUpdate({
		target: [workspaceMembers.workspaceId, workspaceMembers.userId], set: { role: assignedRole, updatedAt: new Date() },
	}).run();
	await db.update(workspaceInvitations).set({ acceptedAt: new Date() }).where(eq(workspaceInvitations.id, invitation.id)).run();
	return invitation.workspaceId;
}