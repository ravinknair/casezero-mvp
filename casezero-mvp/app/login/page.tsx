export default function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
			<section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
				<p className="text-sm font-semibold uppercase tracking-wide text-blue-700">CaseZero</p>
				<h1 className="mt-2 text-3xl font-bold text-gray-900">Sign in to CaseZero</h1>
				<p className="mt-3 text-sm leading-6 text-gray-600">Use your GitHub account to access your workspace. Your session is stored in an HTTP-only signed cookie.</p>
				<a className="mt-6 block rounded bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-700" href="/api/auth/github">Continue with GitHub</a>
			</section>
		</main>
	);
}