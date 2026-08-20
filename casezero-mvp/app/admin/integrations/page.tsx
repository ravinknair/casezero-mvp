"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";

const genericWebhookPath = "/api/integrations/itsm/fcr";
const genericWebhookUrl = `https://casezero-mvp.raknair.workers.dev${genericWebhookPath}`;

const providers = [
  {
    name: "ServiceNow",
    provider: "servicenow",
    status: "Reference connector",
    channel: "Incident Business Rule or REST Message",
    detailHref: "/admin/integrations/servicenow",
    sample: `{
  "provider": "servicenow",
  "number": "INC0012048",
  "contact_type": "virtual_agent",
  "opened_at": "2026-08-01 09:04:00"
}`,
  },
  {
    name: "Zendesk",
    provider: "zendesk",
    status: "Supported",
    channel: "Ticket webhook",
    sample: `{
  "provider": "zendesk",
  "ticket": {
    "id": 481516,
    "via": { "channel": "chat" },
    "created_at": "2026-08-01T09:04:00Z"
  }
}`,
  },
  {
    name: "Jira Service Management",
    provider: "jira_service_management",
    status: "Supported",
    channel: "Automation webhook",
    sample: `{
  "provider": "jira_service_management",
  "issue": {
    "key": "OPS-2048",
    "fields": {
      "created": "2026-08-02T11:12:00Z"
    }
  }
}`,
  },
  {
    name: "Salesforce Service Cloud",
    provider: "salesforce_service_cloud",
    status: "Supported",
    channel: "Case outbound message or Flow",
    sample: `{
  "provider": "salesforce",
  "CaseNumber": "00001042",
  "Origin": "Phone",
  "CreatedDate": "2026-08-03T14:20:00Z"
}`,
  },
  {
    name: "Freshservice / Freshdesk",
    provider: "freshservice",
    status: "Supported",
    channel: "Ticket webhook",
    sample: `{
  "provider": "freshservice",
  "ticket": {
    "id": 90210,
    "source_name": "email",
    "created_at": "2026-08-04T08:44:00Z"
  }
}`,
  },
  {
    name: "BMC Helix ITSM",
    provider: "bmc_helix",
    status: "Supported",
    channel: "Incident webhook or integration service",
    sample: `{
  "provider": "bmc_helix",
  "incident": {
    "Incident_Number": "INC0000002048",
    "Reported_Source": "Phone",
    "Submit_Date": "2026-08-05T10:18:00Z"
  }
}`,
  },
  {
    name: "Ivanti Neurons",
    provider: "ivanti_neurons",
    status: "Supported",
    channel: "Incident webhook or integration service",
    sample: `{
  "provider": "ivanti_neurons",
  "incident": {
    "IncidentNumber": "IV-2048",
    "Source": "Portal",
    "CreatedDateTime": "2026-08-06T16:03:00Z"
  }
}`,
  },
  {
    name: "ManageEngine ServiceDesk Plus",
    provider: "manageengine_service_desk_plus",
    status: "Supported",
    channel: "Request webhook or custom trigger",
    sample: `{
  "provider": "manageengine",
  "request": {
    "display_id": "REQ-8090",
    "mode": { "name": "Email" },
    "created_time": {
      "value": "2026-08-08T12:31:00Z"
    }
  }
}`,
  },
];

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
  { icon: "▣", label: "Reports", href: "/reports" },
  { icon: "▤", label: "Brief", href: "/reports/leadership-brief" },
  { icon: "⌁", label: "ITSM", href: "/admin/integrations", active: true },
  { icon: "◈", label: "Security", href: "/security" },
  { icon: "⚙", label: "Admin", href: "/admin" },
];

export default function ItsmIntegrationsPage() {
  const [testResults, setTestResults] = useState<Record<string, ProviderTestResult>>({});
  const [recentEvents, setRecentEvents] = useState<ItsmIntegrationEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    void loadRecentEvents();
  }, []);

  async function loadRecentEvents() {
    try {
      const response = await fetch("/api/integrations/itsm/events");
      if (!response.ok) throw new Error("Failed to load recent ITSM events");
      const body = (await response.json()) as { events: ItsmIntegrationEvent[] };
      setRecentEvents(body.events);
    } catch (error) {
      console.error("Failed to load recent ITSM events:", error);
    } finally {
      setEventsLoading(false);
    }
  }

  async function sendTestPayload(provider: (typeof providers)[number]) {
    setTestResults((current) => ({
      ...current,
      [provider.provider]: { status: "pending", message: "Sending test payload..." },
    }));

    try {
      const response = await fetch("/api/integrations/itsm/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: provider.provider }),
      });
      const body = (await response.json()) as { accepted?: boolean; externalTicketId?: string; error?: string };
      if (!response.ok || !body.accepted) {
        throw new Error(body.error ?? `Request failed with ${response.status}`);
      }

      setTestResults((current) => ({
        ...current,
        [provider.provider]: {
          status: "success",
          message: `Accepted ${body.externalTicketId ?? provider.provider}`,
        },
      }));
    } catch (error) {
      setTestResults((current) => ({
        ...current,
        [provider.provider]: {
          status: "error",
          message: error instanceof Error ? error.message : "Test failed",
        },
      }));
    } finally {
      void loadRecentEvents();
    }
  }

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Integration catalog</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">ITSM and support platforms</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              Connect ServiceNow, Salesforce Service Cloud, Zendesk, Jira Service Management, Freshservice / Freshdesk, BMC Helix, Ivanti Neurons, and ManageEngine ServiceDesk Plus into one FCR reporting pipeline.
            </p>
          </header>

          <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card title="Shared webhook endpoint" subtitle="Use this endpoint for every supported provider except legacy ServiceNow-only setups.">
              <div className="rounded border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 break-all">
                {genericWebhookUrl}
              </div>
              <p className="mt-4 rounded border border-green-100 bg-green-50 p-3 text-sm text-green-800">
                Test buttons use a server-side test endpoint, so the webhook secret stays inside the Worker and is never pasted into the browser.
              </p>
              <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-3">
                <SetupFact label="Method" value="POST" />
                <SetupFact label="Auth header" value="X-CaseZero-Webhook-Secret" />
                <SetupFact label="Identity" value="provider + ticket ID" />
              </div>
            </Card>

            <Card title="How CaseZero uses it" subtitle="Vendor-specific fields are normalized before reporting.">
              <div className="space-y-3 text-sm text-gray-700">
                <StatusRow label="ServiceNow endpoint" value="Still supported" />
                <StatusRow label="Generic endpoint" value="Live" />
                <StatusRow label="Validated provider" value="Zendesk smoke test passed" />
              </div>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.provider}
                provider={provider}
                result={testResults[provider.provider]}
                onTest={() => void sendTestPayload(provider)}
              />
            ))}
          </section>

          <Card title="Recent test events" subtitle="Latest accepted, duplicate, rejected, missing-field, and auth events from the ITSM webhook.">
            <RecentEventsTable events={recentEvents} loading={eventsLoading} />
          </Card>
        </div>
      </main>
    </div>
  );
}

type ProviderTestResult = {
  status: "pending" | "success" | "error";
  message: string;
};

type ItsmIntegrationEvent = {
  id: string;
  provider: string;
  externalTicketId: string | null;
  status: string;
  missingFields: string[];
  message: string | null;
  receivedAt: string;
};

function ProviderCard({
  provider,
  result,
  onTest,
}: {
  provider: (typeof providers)[number];
  result?: ProviderTestResult;
  onTest: () => void;
}) {
  const resultClass = {
    pending: "border-blue-100 bg-blue-50 text-blue-800",
    success: "border-green-100 bg-green-50 text-green-800",
    error: "border-red-100 bg-red-50 text-red-800",
  }[result?.status ?? "pending"];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">{provider.name}</h2>
            <span className="rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">{provider.status}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{provider.channel}</p>
        </div>
        {provider.detailHref ? (
          <a href={provider.detailHref} className="rounded border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:border-blue-400 hover:bg-blue-50">
            Health page
          </a>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded border border-gray-100 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Provider value</p>
          <p className="mt-1 font-mono font-semibold text-gray-900">{provider.provider}</p>
        </div>
        <pre className="overflow-x-auto rounded border border-gray-200 bg-gray-950 p-3 text-xs leading-5 text-gray-100">{provider.sample}</pre>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onTest}
          disabled={result?.status === "pending"}
          className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {result?.status === "pending" ? "Sending..." : "Send test payload"}
        </button>
        {result ? <span className={`rounded border px-3 py-2 text-sm font-semibold ${resultClass}`}>{result.message}</span> : null}
      </div>
    </Card>
  );
}

function SetupFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-gray-100 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span>{label}</span>
      <strong className="text-gray-900">{value}</strong>
    </div>
  );
}

function RecentEventsTable({ events, loading }: { events: ItsmIntegrationEvent[]; loading: boolean }) {
  if (loading) return <p className="text-sm text-gray-600">Loading recent events...</p>;
  if (!events.length) return <p className="text-sm text-gray-600">No webhook events recorded yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="py-2 pr-4">Time</th>
            <th className="py-2 pr-4">Provider</th>
            <th className="py-2 pr-4">Ticket</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="whitespace-nowrap py-3 pr-4 text-gray-600">{formatDate(event.receivedAt)}</td>
              <td className="whitespace-nowrap py-3 pr-4 font-semibold text-gray-900">{formatProvider(event.provider)}</td>
              <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-gray-800">{event.externalTicketId ?? "-"}</td>
              <td className="whitespace-nowrap py-3 pr-4"><StatusBadge status={event.status} /></td>
              <td className="py-3 pr-4 text-gray-600">{event.message ?? (event.missingFields.length ? `Missing ${event.missingFields.join(", ")}` : "Recorded")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "accepted" || status === "duplicate" ? "bg-green-50 text-green-700" : status === "failed_auth" || status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${tone}`}>{status.replace("_", " ")}</span>;
}

function formatProvider(provider: string) {
  return providers.find((item) => item.provider === provider)?.name ?? provider.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}