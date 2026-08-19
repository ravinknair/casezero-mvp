"use client";

import { useEffect, useState } from "react";
import { FcrReport, type FcrMetrics } from "@/components/reports/FcrReport";
import { Sidebar } from "@/components/Sidebar";

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

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<FcrMetrics>(emptyFcrMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch("/api/dashboard/metrics");
        if (!response.ok) throw new Error("Failed to load report metrics");
        const data = (await response.json()) as { firstContactResolution: FcrMetrics };
        setMetrics(data.firstContactResolution);
      } catch (error) {
        console.error("Failed to load FCR report:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadMetrics();
  }, []);

  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard" },
    { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
    { icon: "⌁", label: "Workflows", href: "/workflows", count: 6 },
    { icon: "◎", label: "Evidence", href: "/evidence", count: 42 },
    { icon: "◇", label: "Policies", href: "/policies", count: 8 },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
    { icon: "▣", label: "Reports", href: "/reports", active: true },
    { icon: "▤", label: "Brief", href: "/reports/leadership-brief" },
    { icon: "⌁", label: "ServiceNow", href: "/admin/integrations/servicenow" },
    { icon: "◈", label: "Security", href: "/security" },
    { icon: "⚙", label: "Admin", href: "/admin" },
  ];

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Leadership reports</h1>
            <p className="mt-2 text-sm text-gray-600">FCR intelligence, service quality, and decision-ready support performance.</p>
            <a href="/reports/leadership-brief" className="mt-4 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
              Open leadership brief
            </a>
          </div>
          {loading ? <p className="text-sm text-gray-600">Loading support performance...</p> : <FcrReport metrics={metrics} />}
        </div>
      </main>
    </div>
  );
}
