import { and, eq, gt } from "drizzle-orm";

export type Role = "admin" | "operator" | "viewer";
export type Permission = "read" | "write" | "admin";
export type AuthContext = { userId: string; email: string; name: string; role: Role; workspaceId: string; tenantId: string };

const COOKIE_NAME = "casezero_session";
const SESSION_DAYS = 7;

async function envValue(name: string) {
	const { env } = await import("cloudflare:workers");
	return (env as unknown as Record<string, string | undefined>)[name];
}

function encode(value: string) {
	return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decode(value: string) {
	return atob(value.replaceAll("-", "+").replaceAll("_", "/"));
}

async function sign(value: string) {
	const secret = await envValue("CASEZERO_SESSION_SECRET");
	if (!secret) throw new Error("CASEZERO_SESSION_SECRET is not configured");
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
	return encode(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)))));
}

async function verify(value: string, signature: string) {
	const secret = await envValue("CASEZERO_SESSION_SECRET");
	if (!secret) return false;
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
	try {
		return await crypto.subtle.verify("HMAC", key, Uint8Array.from(decode(signature), (char) => char.charCodeAt(0)), new TextEncoder().encode(value));
	} catch {
		return false;
	}
}

export async function createSession(userId: string, workspaceId: string) {
	const id = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
	const [{ getDb }, { sessions }] = await Promise.all([import("@/db"), import("@/db/schema")]);
	await getDb().insert(sessions).values({ id, userId, workspaceId, expiresAt }).run();
	const payload = encode(JSON.stringify({ id, exp: expiresAt.getTime() }));
	return `${payload}.${await sign(payload)}`;
}

export function sessionCookie(value: string, maxAge = SESSION_DAYS * 86400) {
	return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
	return sessionCookie("", 0);
}

export async function getAuth(request: Request): Promise<AuthContext | null> {
	const raw = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
	if (!raw) return null;
	const [payload, signature] = raw.split(".");
	if (!payload || !signature || !(await verify(payload, signature))) return null;
	try {
		const session = JSON.parse(decode(payload)) as { id: string; exp: number };
		if (session.exp < Date.now()) return null;
		const [{ getDb }, { sessions, users, workspaces, workspaceMembers }] = await Promise.all([import("@/db"), import("@/db/schema")]);
		const rows = await getDb().select({ userId: users.id, email: users.email, name: users.name, role: workspaceMembers.role, workspaceId: workspaces.id, tenantId: workspaces.tenantId }).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).innerJoin(workspaces, eq(workspaces.id, sessions.workspaceId)).innerJoin(workspaceMembers, and(eq(workspaceMembers.workspaceId, sessions.workspaceId), eq(workspaceMembers.userId, users.id))).where(and(eq(sessions.id, session.id), gt(sessions.expiresAt, new Date()))).limit(1);
		const row = rows[0];
		if (!row) return null;
		return { ...row, role: (row.role as Role) ?? "viewer" };
	} catch {
		return null;
	}
}

export function hasPermission(role: Role, permission: Permission) {
	return permission === "read" || (permission === "write" && role !== "viewer") || (permission === "admin" && role === "admin");
}

export async function requireAuth(request: Request, permission: Permission = "read") {
	const auth = await getAuth(request);
	if (!auth) return Response.json({ error: "Authentication required", login: "/login" }, { status: 401 });
	if (!hasPermission(auth.role, permission)) return Response.json({ error: "Insufficient permissions" }, { status: 403 });
	return auth;
}

export async function audit(auth: AuthContext, action: string, resource?: string, metadata?: unknown) {
	try {
		const [{ getDb }, { auditLogs }] = await Promise.all([import("@/db"), import("@/db/schema")]);
		await getDb().insert(auditLogs).values({ id: crypto.randomUUID(), workspaceId: auth.workspaceId, userId: auth.userId, action, resource: resource ?? null, metadata: metadata ? JSON.stringify(metadata) : null }).run();
	} catch {
		// Auditing must not break the user-facing operation.
	}
}