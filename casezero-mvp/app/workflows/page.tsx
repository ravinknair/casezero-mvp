import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { mockCases } from "@/lib/mockData";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "⌁", label: "Workflows", href: "/workflows", count: mockCases.length, active: true },
  { icon: "◎", label: "Evidence", href: "/evidence", count: mockCases.reduce((sum, item) => sum + (item.recommendation?.evidence?.length ?? 0), 0) },
  { icon: "◇", label: "Policies", href: "/policies", count: mockCases.length },
  { icon: "↗", label: "Telemetry", href: "/telemetry" },
];

export default function WorkflowsPage() {
  const workflowRows = mockCases.map((item) => ({
    id: item.id,
    caseId: item.caseId,
    title: item.title,
    status: item.status,
    summary: item.diagnosis?.title ?? "Review queued",
    actionLabel: item.recommendation?.actionLabel ?? "No action defined",
  }));

  return (
    <div className="app-layout flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userName="Ravi Nair" caseCount={mockCases.length} />

      <main className="app-workspace flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Operations</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="mt-2 text-gray-600">Resolution flows, decision states, and bounded actions across the active incident portfolio.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflowRows.map((row) => (
              <Link
                key={row.id}
                href={`/case/${row.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {row.caseId}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {row.status}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">{row.title}</h2>
                <p className="mt-3 text-sm text-gray-600">{row.summary}</p>

                <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-700">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recommended action</div>
                  <div className="mt-1 font-medium text-gray-900">{row.actionLabel}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
