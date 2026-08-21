import { eq } from "drizzle-orm";
import { createSession, sessionCookie } from "@/lib/auth";

export async function GET(request: Request) {
	const { env } = await import("cloudflare:workers");
	const config = env as unknown as { GITHUB_CLIENT_ID?: string; GITHUB_CLIENT_SECRET?: string };
	const callbackUrl = new URL(request.url);
	const code = callbackUrl.searchParams.get("code");
	const returnedState = callbackUrl.searchParams.get("state");
	const stateCookie = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("casezero_oauth_state="))?.slice("casezero_oauth_state=".length);
	if (!config.GITHUB_CLIENT_ID || !config.GITHUB_CLIENT_SECRET || !code || !returnedState || returnedState !== stateCookie) return Response.redirect(new URL("/login?error=oauth", request.url), 302);
	const tokenResponse = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: config.GITHUB_CLIENT_ID, client_secret: config.GITHUB_CLIENT_SECRET, code }) });
	const token = (await tokenResponse.json()) as { access_token?: string };
	if (!token.access_token) return Response.redirect(new URL("/login?error=oauth", request.url), 302);
	const profileResponse = await fetch("https://api.github.com/user", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token.access_token}`, "User-Agent": "CaseZero" } });
	const profile = (await profileResponse.json()) as { id?: number; login?: string; name?: string; email?: string | null };
	if (!profile.id) return Response.redirect(new URL("/login?error=profile", request.url), 302);
	const email = profile.email ?? `${profile.id}@users.noreply.github.com`;
	const [{ getDb }, { users, workspaces, workspaceMembers }] = await Promise.all([import("@/db"), import("@/db/schema")]);
	const db = getDb();
	const userId = `github-${profile.id}`;
	const workspaceId = `workspace-${profile.id}`;
	await db.insert(users).values({ id: userId, email, name: profile.name ?? profile.login ?? email, role: "admin", workspaceId }).onConflictDoUpdate({ target: users.email, set: { name: profile.name ?? profile.login ?? email, workspaceId } }).run();
	const user = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
	const resolvedUserId = user[0]?.id ?? userId;
	await db.insert(workspaces).values({ id: workspaceId, tenantId: workspaceId, name: `${profile.login ?? "GitHub"}'s workspace` }).onConflictDoNothing().run();
	await db.insert(workspaceMembers).values({ workspaceId, userId: resolvedUserId, role: "admin" }).onConflictDoNothing().run();
	return new Response(null, { status: 302, headers: { Location: "/dashboard", "Set-Cookie": sessionCookie(await createSession(resolvedUserId, workspaceId)) } });
}