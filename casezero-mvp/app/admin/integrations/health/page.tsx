"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";

interface ProviderHealth {
  provider: string;
  events: number;
  accepted: number;
  rejected: number;
  failedAuth: number;
  lastEvent: string | null;
  status: "healthy" | "degraded" | "attention";
}

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
  { icon: "▣", label: "Reports", href: "/reports" },
  { icon: "▤", label: "Brief", href: "/reports/leadership-brief" },
  { icon: "⌁", label: "Integrations", href: "/admin/integrations", active: true },
  { icon: "◈", label: "Security", href: "/security" },
  { icon: "⚙", label: "Admin", href: "/admin" },
];

const providerLabels: Record<string, string> = {
  servicenow: "ServiceNow",
  zendesk: "Zendesk",
  jira_service_management: "Jira Service Management",
  salesforce_service_cloud: "Salesforce Service Cloud",
  freshservice: "Freshservice / Freshdesk",
  bmc_helix: "BMC Helix ITSM",
  ivanti_neurons: "Ivanti Neurons",
  manageengine: "ManageEngine ServiceDesk Plus",
  unknown: "Unknown provider",
};

export default function IntegrationHealthPage() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [sampleMode, setSampleMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await fetch("/api/integrations/itsm/health");
        const body = (await response.json()) as { providers?: ProviderHealth[]; sampleMode?: boolean; error?: string };
        if (!response.ok) throw new Error(body.error ?? "Failed to load provider health");
        setProviders(body.providers ?? []);
        setSampleMode(Boolean(body.sampleMode));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Failed to load provider health");
      } finally {
        setLoading(false);
      }
    }

    void loadHealth();
  }, []);

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Integration health</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">Provider health summaries</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              Shared webhook outcomes by provider. These summaries measure ingestion events, not outbound connector connectivity.
            </p>
            <a href="/admin/integrations" className="mt-3 inline-flex rounded border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:border-blue-400 hover:bg-blue-50">
              Back to integrations
            </a>
          </header>

          {sampleMode ? <p className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Sample health data is active until D1-backed events are available.</p> : null}
          {error ? <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}

          <Card title="Provider summaries" subtitle="Accepted and rejected normalized webhook events from the shared ingestion pipeline.">
            {loading ? <p className="text-sm text-gray-600">Loading provider health...</p> : null}
            {!loading && !providers.length ? <p className="text-sm text-gray-600">No provider events have been received.</p> : null}
            <div className="space-y-3">
              {providers.map((provider) => (
                <div key={provider.provider} className="grid gap-3 border-b border-gray-100 pb-3 text-sm md:grid-cols-[1.5fr_repeat(4,1fr)_auto] md:items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{providerLabels[provider.provider] ?? provider.provider}</p>
                    <p className="text-xs text-gray-500">{provider.provider === "servicenow" ? "Dedicated connector and health workflow" : "Generic normalized inbound webhook"}</p>
                  </div>
                  <Metric label="Events" value={provider.events} />
                  <Metric label="Accepted" value={provider.accepted} />
                  <Metric label="Rejected" value={provider.rejected} />
                  <Metric label="Auth failures" value={provider.failedAuth} />
                  <span className={`rounded px-2 py-1 text-center text-xs font-semibold ${provider.status === "healthy" ? "bg-green-50 text-green-700" : provider.status === "degraded" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                    {provider.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
