import { Sidebar } from "@/components/Sidebar";
import { mockCases } from "@/lib/mockData";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "⌁", label: "Workflows", href: "/workflows" },
  { icon: "◎", label: "Evidence", href: "/evidence", count: mockCases.reduce((sum, item) => sum + (item.recommendation?.evidence?.length ?? 0), 0), active: true },
  { icon: "◇", label: "Policies", href: "/policies", count: mockCases.length },
  { icon: "↗", label: "Telemetry", href: "/telemetry" },
  { icon: "▶", label: "Demo Guide", href: "/demo" },
  { icon: "✓", label: "Test Status", href: "/status" },
];

export default function EvidencePage() {
  const evidenceItems = mockCases.flatMap((item) =>
    (item.recommendation?.evidence ?? []).map((entry, index) => ({
      id: `${item.id}-evidence-${index}`,
      caseId: item.caseId,
      caseTitle: item.title,
      type: entry[0],
      title: entry[1],
      description: entry[2],
      timestamp: entry[3],
      color: entry[4] ?? "blue",
    }))
  );

  return (
    <div className="app-layout flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userName="Ravi Nair" caseCount={mockCases.length} />

      <main className="app-workspace flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Evidence</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Evidence trail</h1>
            <p className="mt-2 text-gray-600">Bounded signals, audit events, and supporting indicators gathered for each active case.</p>
          </div>

          <div className="space-y-4">
            {evidenceItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${item.color === "green" ? "bg-green-100 text-green-700" : item.color === "purple" ? "bg-purple-100 text-purple-700" : item.color === "red" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {item.type}
                    </span>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.caseId}</div>
                      <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                    </div>
                  </div>

                  <a href={`/case/${mockCases.find((x) => x.caseId === item.caseId)?.id ?? item.caseId}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Open case
                  </a>
                </div>

                <p className="mt-3 text-gray-700">{item.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{item.caseTitle}</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
