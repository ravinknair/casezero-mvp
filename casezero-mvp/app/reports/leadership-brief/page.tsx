"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import type { FcrMetrics } from "@/components/reports/FcrReport";

interface DashboardMetrics {
  sampleMode?: boolean;
  firstContactResolution: FcrMetrics;
}

const emptyFcrMetrics: FcrMetrics = {
  rate: null,
  resolvedCases: 0,
  eligibleCases: 0,
  trackedCases: 0,
  pendingValidation: 0,
  repeatWindowDays: 7,
  targetRate: 70,
  byChannel: [],
  failureReasons: [],
};

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
  { icon: "▣", label: "Reports", href: "/reports" },
  { icon: "▤", label: "Brief", href: "/reports/leadership-brief", active: true },
  { icon: "⌁", label: "Integrations", href: "/admin/integrations" },
  { icon: "◈", label: "Security", href: "/security" },
  { icon: "⚙", label: "Admin", href: "/admin" },
];

export default function LeadershipBriefPage() {
  const [metrics, setMetrics] = useState<FcrMetrics>(emptyFcrMetrics);
  const [sampleMode, setSampleMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch("/api/dashboard/metrics");
        if (!response.ok) throw new Error("Failed to load leadership brief metrics");
        const data = (await response.json()) as DashboardMetrics;
        setMetrics(data.firstContactResolution);
        setSampleMode(Boolean(data.sampleMode));
      } catch (error) {
        console.error("Failed to load leadership brief:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadMetrics();
  }, []);

  const topChannel = metrics.byChannel[0];
  const lowestChannel = metrics.byChannel.filter((item) => item.rate !== null).sort((left, right) => (left.rate ?? 0) - (right.rate ?? 0))[0];
  const targetMet = metrics.rate !== null && metrics.rate >= metrics.targetRate;

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="border-b border-gray-200 pb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Leadership brief</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">FCR intelligence for AI-assisted support operations</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              A one-page view of validated FCR, leakage, channel performance, and recommended next actions for support leadership.
            </p>
          </header>

          {sampleMode ? (
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="font-semibold">Demo mode is active</div>
              <p className="mt-1">This brief uses realistic ServiceNow-like sample data until a production integration is connected.</p>
            </section>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BriefMetric label="FCR rate" value={metrics.rate === null ? "N/A" : `${metrics.rate}%`} tone={targetMet ? "success" : "warning"} />
            <BriefMetric label="Leadership target" value={`${metrics.targetRate}%`} />
            <BriefMetric label="Eligible cohort" value={metrics.eligibleCases} />
            <BriefMetric label="Pending validation" value={metrics.pendingValidation} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card title="Executive readout" subtitle="What leadership should know now.">
              <div className="space-y-4 text-sm text-gray-700">
                <p>
                  Validated FCR is <strong className="text-gray-900">{metrics.rate === null ? "still collecting" : `${metrics.rate}%`}</strong> against a {metrics.targetRate}% target across {metrics.trackedCases} tracked contacts.
                </p>
                <p>
                  {topChannel ? `${topChannel.channel} has the highest tracked volume with ${topChannel.trackedCases} contacts.` : "Channel performance will populate after support interactions arrive."}
                </p>
                <p>
                  {lowestChannel ? `${lowestChannel.channel} is the channel to inspect first at ${lowestChannel.rate}% validated FCR.` : "A complete eligible cohort is needed before ranking channel performance."}
                </p>
              </div>
            </Card>

            <Card title="Recommended actions" subtitle="Next operational moves based on the current cohort.">
              <ul className="space-y-3 text-sm text-gray-700">
                {recommendedActions(metrics).map((action) => (
                  <li key={action} className="rounded border border-gray-100 p-3">{action}</li>
                ))}
              </ul>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Card title="Channel performance" subtitle="Tracked volume, pending validation, and validated FCR by channel.">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="pb-3 font-semibold">Channel</th>
                      <th className="pb-3 font-semibold">Tracked</th>
                      <th className="pb-3 font-semibold">Pending</th>
                      <th className="pb-3 font-semibold">Eligible</th>
                      <th className="pb-3 font-semibold">FCR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {metrics.byChannel.map((item) => (
                      <tr key={item.channel}>
                        <td className="py-4 font-semibold text-gray-900">{item.channel}</td>
                        <td className="py-4 text-gray-700">{item.trackedCases}</td>
                        <td className="py-4 text-gray-700">{item.pendingValidation}</td>
                        <td className="py-4 text-gray-700">{item.eligibleCases}</td>
                        <td className="py-4 font-semibold text-gray-900">{item.rate === null ? "Pending" : `${item.rate}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Leakage reasons" subtitle="Why contacts missed validated FCR.">
              <div className="space-y-3">
                {metrics.failureReasons.length ? metrics.failureReasons.map((reason) => (
                  <div key={reason.label} className="flex items-center justify-between rounded border border-gray-100 p-3 text-sm">
                    <span className="text-gray-700">{reason.label}</span>
                    <strong className="text-amber-700">{reason.value}</strong>
                  </div>
                )) : <p className="text-sm text-gray-600">No disqualifying events in the eligible cohort.</p>}
              </div>
            </Card>
          </section>

          {loading ? <p className="text-sm text-gray-600">Loading leadership brief...</p> : null}
        </div>
      </main>
    </div>
  );
}

function recommendedActions(metrics: FcrMetrics) {
  const actions = ["Keep the seven-day repeat-contact validation window before declaring AI-assisted resolution gains." ];
  if (metrics.rate !== null && metrics.rate < metrics.targetRate) actions.push("Inspect the largest leakage reason and tune the matching support workflow before expanding automation volume.");
  if (metrics.failureReasons.some((reason) => /Escalated/i.test(reason.label))) actions.push("Review escalated contacts for missing knowledge articles or approval gates that slow first-contact closure.");
  if (metrics.failureReasons.some((reason) => /Reopened|repeat/i.test(reason.label))) actions.push("Audit reopened and repeat-contact tickets for false FCR and update channel coaching rules.");
  if (metrics.pendingValidation > 0) actions.push(`Hold ${metrics.pendingValidation} fresh contacts out of the numerator until the validation window closes.`);
  return actions;
}

function BriefMetric({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "neutral" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "text-green-700" : tone === "warning" ? "text-amber-700" : "text-gray-900";
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}