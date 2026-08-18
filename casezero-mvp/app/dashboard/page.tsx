"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportEventCount, setSupportEventCount] = useState(0);

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

  const fetchSupportEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/telemetry/events");
      if (!response.ok) {
        throw new Error("Failed to fetch support telemetry");
      }
      const data = (await response.json()) as Array<{ id: string }>;
      setSupportEventCount(data.length);
    } catch (error) {
      console.error("Failed to fetch support telemetry:", error);
    }
  }, []);

  useEffect(() => {
    void fetchCases();
    void fetchSupportEvents();
  }, [fetchCases, fetchSupportEvents]);

  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard", count: cases.length, active: true },
    { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
    { icon: "⌁", label: "Workflows", href: "/workflows", count: 6 },
    { icon: "◎", label: "Evidence", href: "/evidence", count: 42 },
    { icon: "◇", label: "Policies", href: "/policies", count: 8 },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
    { icon: "▣", label: "Reports", href: "/reports", count: 3 },
    { icon: "⚙", label: "Admin", href: "/admin" },
  ];

  const criticalCases = cases.filter((item) => /critical|sev-1|high|sev-2/i.test(item.severity)).length;
  const pastDueCases = cases.filter((item) => ["decide", "act", "verify"].includes(item.status)).length;
  const avgResolutionHours = useMemo(() => {
    if (cases.length === 0) return "0h";
    const modeledHours = Math.max(1, Math.round(cases.reduce((sum, item) => sum + item.confidence, 0) / cases.length / 12));
    return `${modeledHours}h`;
  }, [cases]);

  const casesBySeverity = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of cases) {
      counts.set(item.severity, (counts.get(item.severity) ?? 0) + 1);
    }
    return [...counts.entries()].map(([label, value]) => ({ label, value }));
  }, [cases]);

  const casesByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of cases) {
      counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    }
    return [...counts.entries()].map(([label, value]) => ({ label, value }));
  }, [cases]);

  const activityItems = cases.slice(0, 6).map((item) => ({
    id: item.id,
    message: `${item.caseId}: ${item.title}`,
    timestamp: `${item.status.toUpperCase()} · ${item.sources} evidence sources`,
    tone: /critical|sev-1|high/i.test(item.severity) ? ("danger" as const) : ("info" as const),
  }));

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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Open cases" value={cases.length} helper="Cases currently in progress" />
            <KpiCard label="Critical cases" value={criticalCases} helper="Need immediate leadership attention" tone="danger" />
            <KpiCard label="Past due" value={pastDueCases} helper="Cases stalled in decide/act/verify" tone="warning" />
            <KpiCard label="Avg resolution time" value={avgResolutionHours} helper="Modeled from current operational dataset" tone="info" />
            <KpiCard label="Support events" value={supportEventCount} helper="Cloud-provider evidence tracking events" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <CaseTable items={cases} onOpenCase={openCase} />
            <div className="space-y-6">
              <SummaryWidget title="Cases by severity" subtitle="Current distribution by risk level" items={casesBySeverity} />
              <SummaryWidget title="Cases by site/type" subtitle="Operational concentration by case type" items={casesByType} />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <ActivityFeed items={activityItems} />
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
