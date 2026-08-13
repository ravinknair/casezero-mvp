import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { mockCases } from "@/lib/mockData";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "⌁", label: "Workflows", href: "/workflows" },
  { icon: "◎", label: "Evidence", href: "/evidence", count: mockCases.reduce((sum, item) => sum + (item.recommendation?.evidence?.length ?? 0), 0) },
  { icon: "◇", label: "Policies", href: "/policies", count: mockCases.length },
  { icon: "↗", label: "Telemetry", href: "/telemetry", active: true },
];

export default function TelemetryPage() {
  const telemetryRows = mockCases.flatMap((item) =>
    (item.recommendation?.metrics ?? []).map(([name, value, change, status], index) => ({
      id: `${item.id}-metric-${index}`,
      caseId: item.caseId,
      caseTitle: item.title,
      name,
      value,
      change,
      status,
    }))
  );

  return (
    <div className="app-layout flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userName="Ravi Nair" caseCount={mockCases.length} />

      <main className="app-workspace flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Telemetry</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Signal overview</h1>
            <p className="mt-2 text-gray-600">Incidents, guardrails, and change rates across the current system view.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {telemetryRows.map((row) => (
              <div key={row.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{row.caseId}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${row.status === "danger" ? "bg-red-100 text-red-700" : row.status === "warn" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                    {row.status}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">{row.name}</h2>
                <div className="mt-3 text-3xl font-bold text-gray-900">{row.value}</div>
                <div className="mt-2 text-sm text-gray-600">{row.change}</div>
                <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-500">
                  {row.caseTitle}
                </div>
                <div className="mt-2">
                  <Link href={`/case/${mockCases.find((item) => item.caseId === row.caseId)?.id ?? row.caseId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Open case
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
