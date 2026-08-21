export async function GET(request: Request) {
	const { env } = await import("cloudflare:workers");
	const clientId = (env as unknown as { GITHUB_CLIENT_ID?: string }).GITHUB_CLIENT_ID;
	if (!clientId) return Response.json({ error: "GitHub OAuth is not configured" }, { status: 503 });
	const state = crypto.randomUUID();
	const url = new URL("https://github.com/login/oauth/authorize");
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", new URL("/api/auth/github/callback", request.url).toString());
	url.searchParams.set("scope", "read:user user:email");
	url.searchParams.set("state", state);
	return new Response(null, { status: 302, headers: { Location: url.toString(), "Set-Cookie": `casezero_oauth_state=${state}; Path=/api/auth/github; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}