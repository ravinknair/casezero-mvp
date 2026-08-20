"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";

interface ServiceNowHealth {
  webhookUrl: string;
  secretConfigured: boolean;
  lastEventReceived: string | null;
  lastSuccessfulEvent: string | null;
  rejectedEvents: number;
  missingFields: string[];
  duplicateUpdates: number;
  failedAuthCount: number;
  sampleMode: boolean;
}

const emptyHealth: ServiceNowHealth = {
  webhookUrl: "",
  secretConfigured: false,
  lastEventReceived: null,
  lastSuccessfulEvent: null,
  rejectedEvents: 0,
  missingFields: [],
  duplicateUpdates: 0,
  failedAuthCount: 0,
  sampleMode: true,
};

const samplePayload = `{
  "number": "INC0012048",
  "contact_type": "virtual_agent",
  "opened_at": "2026-08-01 09:04:00",
  "resolved_at": "2026-08-01 09:31:00",
  "u_resolved_on_first_contact": "true",
  "reassignment_count": "0",
  "reopen_count": "0",
  "u_repeat_contact_at": "",
  "u_casezero_case_id": "CZ-1825"
}`;

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
  { icon: "▣", label: "Reports", href: "/reports" },
  { icon: "▤", label: "Brief", href: "/reports/leadership-brief" },
  { icon: "⌁", label: "Integrations", href: "/admin/integrations" },
  { icon: "⌁", label: "ServiceNow", href: "/admin/integrations/servicenow", active: true },
  { icon: "◈", label: "Security", href: "/security" },
  { icon: "⚙", label: "Admin", href: "/admin" },
];

export default function ServiceNowIntegrationPage() {
  const [health, setHealth] = useState<ServiceNowHealth>(emptyHealth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await fetch("/api/integrations/servicenow/health");
        if (!response.ok) throw new Error("Failed to load ServiceNow health");
        setHealth((await response.json()) as ServiceNowHealth);
      } catch (error) {
        console.error("Failed to load ServiceNow health:", error);
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
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Productized onboarding</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">ServiceNow FCR integration</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              Connect incident updates, validate required fields, and monitor ingestion health before turning off demo mode.
            </p>
            <a href="/admin/integrations" className="mt-3 inline-flex rounded border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:border-blue-400 hover:bg-blue-50">
              View all integrations
            </a>
          </header>

          {health.sampleMode ? (
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="font-semibold">Sample mode is active</div>
              <p className="mt-1">The health panel is showing realistic example events until a D1-backed ServiceNow stream is available.</p>
            </section>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <HealthMetric label="Secret status" value={health.secretConfigured ? "Configured" : "Missing"} tone={health.secretConfigured ? "success" : "warning"} />
            <HealthMetric label="Last event" value={formatDate(health.lastEventReceived)} />
            <HealthMetric label="Last success" value={formatDate(health.lastSuccessfulEvent)} tone="success" />
            <HealthMetric label="Rejected" value={health.rejectedEvents} tone={health.rejectedEvents ? "warning" : "neutral"} />
            <HealthMetric label="Failed auth" value={health.failedAuthCount} tone={health.failedAuthCount ? "danger" : "neutral"} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card title="Webhook setup" subtitle="Use this endpoint from an outbound REST Message or Business Rule.">
              <div className="rounded border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 break-all">
                {health.webhookUrl || "/api/integrations/servicenow/fcr"}
              </div>
              <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <SetupStep label="Method" value="POST" />
                <SetupStep label="Auth header" value="X-CaseZero-Webhook-Secret" />
                <SetupStep label="Idempotency" value="Upsert by incident number" />
                <SetupStep label="Demo data" value="Available before connection" />
              </div>
            </Card>

            <Card title="Integration health" subtitle="Operational counters from recent webhook attempts.">
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span>Duplicate updates</span>
                  <strong className="text-gray-900">{health.duplicateUpdates}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span>Missing fields seen</span>
                  <strong className="text-gray-900">{health.missingFields.length}</strong>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Recent missing fields</p>
                  <p className="mt-1 text-gray-600">{health.missingFields.length ? health.missingFields.join(", ") : "None in recent events"}</p>
                </div>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card title="Field validation" subtitle="Minimum payload required for FCR reporting.">
              <div className="space-y-3">
                <FieldStatus name="number" detail="Required external incident ID" valid={!health.missingFields.includes("number")} />
                <FieldStatus name="contact_type" detail="Required support channel" valid={!health.missingFields.includes("contact_type")} />
                <FieldStatus name="opened_at" detail="Required first contact timestamp" valid={!health.missingFields.includes("opened_at")} />
                <FieldStatus name="resolved_at" detail="Optional resolution timestamp" valid />
                <FieldStatus name="reassignment_count / reopen_count" detail="Optional leakage signals, default to 0" valid />
                <FieldStatus name="u_repeat_contact_at" detail="Optional repeat-contact disqualifier" valid />
              </div>
            </Card>

            <Card title="Sample payload" subtitle="Copy this shape into the ServiceNow REST Message body.">
              <pre className="overflow-x-auto rounded border border-gray-200 bg-gray-950 p-4 text-xs leading-6 text-gray-100">{samplePayload}</pre>
            </Card>
          </section>

          {loading ? <p className="text-sm text-gray-600">Loading integration status...</p> : null}
        </div>
      </main>
    </div>
  );
}

function HealthMetric({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const toneClass = {
    neutral: "text-gray-900",
    success: "text-green-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  }[tone];

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function SetupStep({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-gray-100 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FieldStatus({ name, detail, valid }: { name: string; detail: string; valid: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded border border-gray-100 p-3">
      <div>
        <p className="font-mono text-sm font-semibold text-gray-900">{name}</p>
        <p className="mt-1 text-sm text-gray-600">{detail}</p>
      </div>
      <span className={`rounded px-2 py-1 text-xs font-semibold ${valid ? "cz-badge-success" : "cz-badge-warning"}`}>{valid ? "Valid" : "Missing"}</span>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not received";
  return new Date(value).toLocaleString();
}