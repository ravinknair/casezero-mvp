import { clearSessionCookie } from "@/lib/auth";

function logoutResponse() {
	return new Response(null, { status: 302, headers: { "Set-Cookie": clearSessionCookie(), Location: "/login" } });
}

export async function GET() {
	return logoutResponse();
}

export async function POST() {
	return logoutResponse();
}