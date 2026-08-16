import Link from "next/link";

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Live status</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">CaseZero status and test guidance</h1>
        <p className="mt-3 text-gray-700">
          This page is the valid status endpoint for the live site. For operational tracking, use telemetry and
          case-level support evidence actions.
        </p>

        <div className="mt-6 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Telemetry:</span>{" "}
            <Link href="/telemetry" className="text-blue-600 hover:text-blue-700">
              /telemetry
            </Link>
          </p>
          <p>
            <span className="font-semibold">Dashboard:</span>{" "}
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              /dashboard
            </Link>
          </p>
          <p>
            <span className="font-semibold">Create case:</span>{" "}
            <Link href="/case/new" className="text-blue-600 hover:text-blue-700">
              /case/new
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          The interactive local test dashboard remains available via the standalone test runner under{" "}
          <code>test-reports/</code>. It is not the same as the live production route.
        </div>
      </div>
    </main>
  );
}
