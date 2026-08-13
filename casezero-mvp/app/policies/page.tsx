import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { mockCases } from "@/lib/mockData";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "⌁", label: "Workflows", href: "/workflows" },
  { icon: "◎", label: "Evidence", href: "/evidence", count: mockCases.reduce((sum, item) => sum + (item.recommendation?.evidence?.length ?? 0), 0) },
  { icon: "◇", label: "Policies", href: "/policies", count: mockCases.length, active: true },
  { icon: "↗", label: "Telemetry", href: "/telemetry" },
];

export default function PoliciesPage() {
  const policyRows = mockCases.flatMap((item) => {
    const checks = item.recommendation?.checks ?? [];
    return checks.map(([title, description], index) => ({
      id: `${item.id}-policy-${index}`,
      caseId: item.caseId,
      title,
      description,
      status: "passed",
      caseTitle: item.title,
    }));
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userName="Ravi Nair" caseCount={mockCases.length} />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Governance</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Policies</h1>
            <p className="mt-2 text-gray-600">Approval conditions and safeguards enforced before any production action is executed.</p>
          </div>

          <div className="space-y-4">
            {policyRows.map((policy) => (
              <div key={policy.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{policy.caseId}</div>
                    <h2 className="mt-1 text-xl font-semibold text-gray-900">{policy.title}</h2>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                    {policy.status}
                  </span>
                </div>

                <p className="mt-3 text-gray-700">{policy.description}</p>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{policy.caseTitle}</span>
                  <Link href={`/case/${mockCases.find((item) => item.caseId === policy.caseId)?.id ?? policy.caseId}`} className="font-medium text-blue-600 hover:text-blue-700">
                    Review case
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
