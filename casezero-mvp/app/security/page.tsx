import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
  { icon: "▣", label: "Reports", href: "/reports" },
  { icon: "▤", label: "Brief", href: "/reports/leadership-brief" },
  { icon: "⌁", label: "Integrations", href: "/admin/integrations" },
  { icon: "◈", label: "Security", href: "/security", active: true },
  { icon: "⚙", label: "Admin", href: "/admin" },
];

export default function SecurityPage() {
  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Security posture</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">Data, secrets, and deployment model</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              CaseZero is designed as an FCR intelligence layer that stores only the support fields needed for measurement and audit.
            </p>
          </header>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card title="Data stored" subtitle="Fields retained for FCR measurement and leakage analysis.">
              <SecurityList items={["External incident number used as the idempotency key", "Support channel such as phone, email, portal, chat, or virtual agent", "Opened, resolved, and repeat-contact timestamps", "Reassignment and reopen counts", "Optional CaseZero case ID for linking evidence to a workflow"]} />
            </Card>
            <Card title="Data not stored" subtitle="Boundaries that keep the integration narrow.">
              <SecurityList items={["Customer message bodies or ticket descriptions", "Attachments, chat transcripts, or call recordings", "ServiceNow user passwords or OAuth refresh tokens", "Payment data, secrets, or remediation credentials", "Full ServiceNow table replicas"]} />
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card title="Retention" subtitle="Current MVP policy.">
              <p className="text-sm leading-6 text-gray-700">FCR interaction rows are retained for operational reporting and can be deleted by clearing the D1 table. A production plan should add customer-configurable retention windows before enterprise rollout.</p>
            </Card>
            <Card title="Secrets" subtitle="Webhook authentication.">
              <p className="text-sm leading-6 text-gray-700">ServiceNow uses a workspace-specific connector token. CaseZero stores only its SHA-256 hash and never displays the token again after creation.</p>
            </Card>
            <Card title="Auth" subtitle="Access model.">
              <p className="text-sm leading-6 text-gray-700">GitHub OAuth creates a signed HTTP-only session for a workspace. Admin, operator, and viewer permissions protect high-risk API writes, with audit logs recorded for authenticated mutations.</p>
            </Card>
          </section>

          <Card title="Deployment model" subtitle="How the production path is packaged today.">
            <div className="grid gap-4 text-sm text-gray-700 md:grid-cols-4">
              <SecurityFact label="Runtime" value="Cloudflare Workers via vinext" />
              <SecurityFact label="Database" value="Cloudflare D1 with Drizzle migrations" />
              <SecurityFact label="Ingestion" value="Authenticated ServiceNow webhook" />
              <SecurityFact label="Demo mode" value="Mock ServiceNow-like records when D1 is unavailable" />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SecurityList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm text-gray-700">
      {items.map((item) => <li key={item} className="rounded border border-gray-100 p-3">{item}</li>)}
    </ul>
  );
}

function SecurityFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-gray-100 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}