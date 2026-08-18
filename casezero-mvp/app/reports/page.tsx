"use client";

import { ReportCard } from "@/components/reports/ReportCard";
import { Sidebar } from "@/components/Sidebar";

export default function ReportsPage() {
  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard" },
    { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
    { icon: "⌁", label: "Workflows", href: "/workflows", count: 6 },
    { icon: "◎", label: "Evidence", href: "/evidence", count: 42 },
    { icon: "◇", label: "Policies", href: "/policies", count: 8 },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
    { icon: "▣", label: "Reports", href: "/reports", active: true },
  ];

  const reports = [
    {
      title: "Daily incident summary",
      description: "Operational overview of open, resolved, and escalated incidents by region.",
      generatedAt: "2026-08-18 08:00 UTC",
    },
    {
      title: "Compliance readiness report",
      description: "Approval trails, policy checks, and evidence completeness for audit review.",
      generatedAt: "2026-08-18 07:45 UTC",
    },
    {
      title: "Support escalation quality",
      description: "Provider response times and support bundle quality metrics.",
      generatedAt: "2026-08-17 23:10 UTC",
    },
  ];

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-600">Enterprise-ready operational and compliance reporting.</p>
        <div className="mt-6 grid gap-4">
          {reports.map((report) => (
            <ReportCard
              key={report.title}
              title={report.title}
              description={report.description}
              generatedAt={report.generatedAt}
              onOpen={() => {
                window.open("/status", "_blank", "noopener,noreferrer");
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
