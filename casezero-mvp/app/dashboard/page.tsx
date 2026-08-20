"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SummaryWidget } from "@/components/dashboard/SummaryWidget";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CaseTable } from "@/components/dashboard/CaseTable";
import { Card } from "@/components/ui/Card";

interface CaseItem {
  id: string;
  caseId: string;
  type: string;
  severity: string;
  title: string;
  status: string;
  confidence: number;
  sources: number;
}

interface DashboardMetrics {
  openCases: number;
  criticalCases: number;
  pastDueCases: number;
  averageResolutionHours: number;
  supportEvents: number;
  sampleMode?: boolean;
  firstContactResolution: {
    rate: number | null;
    resolvedCases: number;
    eligibleCases: number;
    trackedCases: number;
    pendingValidation: number;
    repeatWindowDays: number;
    targetRate: number;
    byChannel: Array<{
      channel: string;
      rate: number | null;
      trackedCases: number;
      pendingValidation: number;
      resolvedCases: number;
      eligibleCases: number;
    }>;
    failureReasons: Array<{ label: string; value: number }>;
  };
  casesBySeverity: Array<{ label: string; value: number }>;
  casesByType: Array<{ label: string; value: number }>;
  recentActivity: Array<{
    id: string;
    message: string;
    timestamp: string;
    tone: "info" | "danger";
  }>;
}

const emptyMetrics: DashboardMetrics = {
  openCases: 0,
  criticalCases: 0,
  pastDueCases: 0,
  averageResolutionHours: 0,
  supportEvents: 0,
  sampleMode: true,
  firstContactResolution: {
    rate: null,
    resolvedCases: 0,
    eligibleCases: 0,
    trackedCases: 0,
    pendingValidation: 0,
    repeatWindowDays: 7,
    targetRate: 70,
    byChannel: [],
    failureReasons: [],
  },
  casesBySeverity: [],
  casesByType: [],
  recentActivity: [],
};

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);

  const fetchCases = useCallback(async () => {
    try {
      const response = await fetch("/api/cases");
      if (response.ok) {
        const data = (await response.json()) as CaseItem[];
        setCases(data);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/metrics");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }
      const data = (await response.json()) as DashboardMetrics;
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error);
    }
  }, []);

  useEffect(() => {
    void fetchCases();
    void fetchDashboardMetrics();
  }, [fetchCases, fetchDashboardMetrics]);

  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard", count: cases.length, active: true },
    { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
    { icon: "⌁", label: "Workflows", href: "/workflows", count: 6 },
    { icon: "◎", label: "Evidence", href: "/evidence", count: 42 },
    { icon: "◇", label: "Policies", href: "/policies", count: 8 },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
    { icon: "▣", label: "Reports", href: "/reports", count: 3 },
    { icon: "▤", label: "Brief", href: "/reports/leadership-brief" },
    { icon: "⌁", label: "Integrations", href: "/admin/integrations" },
    { icon: "◈", label: "Security", href: "/security" },
    { icon: "⚙", label: "Admin", href: "/admin" },
  ];

  const openNewCaseWindow = () => {
    window.open("/case/new", "_blank", "noopener,noreferrer");
  };

  const openCase = (id: string) => {
    window.open(`/case/${id}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" caseCount={cases.length} />
      <DashboardLayout environment="Production" userName="Ravi Nair" onCreateCase={openNewCaseWindow}>
        <main className="space-y-6 bg-gray-50 p-8">
          {metrics.sampleMode ? (
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="font-semibold">Demo mode is active</div>
              <p className="mt-1">Prospects can explore realistic ServiceNow-like FCR data before connecting an instance.</p>
            </section>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Open cases" value={metrics.openCases} helper="Cases currently in progress" />
            <KpiCard label="Critical cases" value={metrics.criticalCases} helper="Need immediate leadership attention" tone="danger" />
            <KpiCard label="Past due" value={metrics.pastDueCases} helper="Cases stalled in decide/act/verify" tone="warning" />
            <KpiCard label="Avg resolution time" value={`${metrics.averageResolutionHours}h`} helper="Modeled from current operational dataset" tone="info" />
            <KpiCard
              label="First contact resolution"
              value={metrics.firstContactResolution.rate === null ? "N/A" : `${metrics.firstContactResolution.rate}%`}
              helper={
                metrics.firstContactResolution.rate === null
                  ? "Awaiting an eligible 7-day cohort"
                  : `${metrics.firstContactResolution.resolvedCases} of ${metrics.firstContactResolution.eligibleCases} eligible · ${metrics.firstContactResolution.targetRate}% target`
              }
              tone={
                metrics.firstContactResolution.rate === null || metrics.firstContactResolution.rate >= metrics.firstContactResolution.targetRate
                  ? "info"
                  : "warning"
              }
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <CaseTable items={cases} onOpenCase={openCase} />
            <div className="space-y-6">
              <SummaryWidget title="Cases by severity" subtitle="Current distribution by risk level" items={metrics.casesBySeverity} />
              <SummaryWidget title="Cases by site/type" subtitle="Operational concentration by case type" items={metrics.casesByType} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <ActivityFeed items={metrics.recentActivity} />
            <Card title="External support evidence tracking" subtitle="Provider and communication channel coverage">
              <p className="text-sm text-gray-700">
                Track evidence collection actions for Azure, AWS, Salesforce, Oracle, IBM, GitHub, and communications.
              </p>
              <a
                href="/telemetry"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Open telemetry log
              </a>
            </Card>
          </section>

          {loading ? <p className="text-sm text-gray-600">Loading case data...</p> : null}
        </main>
      </DashboardLayout>
    </div>
  );
}
