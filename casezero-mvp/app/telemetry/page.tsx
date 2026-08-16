"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { mockCases } from "@/lib/mockData";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "⌁", label: "Workflows", href: "/workflows" },
  { icon: "◎", label: "Evidence", href: "/evidence", count: mockCases.reduce((sum, item) => sum + (item.recommendation?.evidence?.length ?? 0), 0) },
  { icon: "◇", label: "Policies", href: "/policies", count: mockCases.length },
  { icon: "↗", label: "Telemetry", href: "/telemetry", active: true },
];

export default function TelemetryPage() {
  const [supportEvents, setSupportEvents] = useState<
    Array<{
      id: string;
      caseId: string;
      eventType: "collect_source" | "collect_all_sources" | "prepare_ticket_bundle";
      actor: string;
      targetType: "provider" | "channel" | "bundle" | "all_sources";
      targetName: string;
      status: "recorded" | "ready" | "blocked";
      message: string;
      createdAt: string;
      metadata: Record<string, string | number>;
    }>
  >([]);

  const fetchSupportEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/telemetry/events");
      if (!response.ok) {
        throw new Error("Failed to fetch telemetry events");
      }

      const data = await response.json();
      setSupportEvents(data);
    } catch (error) {
      console.error("Failed to fetch support telemetry events:", error);
    }
  }, []);

  useEffect(() => {
    void fetchSupportEvents();
  }, [fetchSupportEvents]);

  const telemetryRows = mockCases.flatMap((item) =>
    (item.recommendation?.metrics ?? []).map(([name, value, change, status], index) => ({
      id: `${item.id}-metric-${index}`,
      caseId: item.caseId,
      caseTitle: item.title,
      name,
      value,
      change,
      status,
    }))
  );

  return (
    <div className="app-layout flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userName="Ravi Nair" caseCount={mockCases.length} />

      <main className="app-workspace flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Telemetry</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Signal overview</h1>
            <p className="mt-2 text-gray-600">Incidents, guardrails, and change rates across the current system view.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {telemetryRows.map((row) => (
              <div key={row.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{row.caseId}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${row.status === "danger" ? "bg-red-100 text-red-700" : row.status === "warn" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                    {row.status}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">{row.name}</h2>
                <div className="mt-3 text-3xl font-bold text-gray-900">{row.value}</div>
                <div className="mt-2 text-sm text-gray-600">{row.change}</div>
                <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-500">
                  {row.caseTitle}
                </div>
                <div className="mt-2">
                  <a
                    href={`/case/${mockCases.find((item) => item.caseId === row.caseId)?.id ?? row.caseId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Open case
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">External support collection events</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Tracks provider-log and collaboration-channel evidence collection before external ticket escalation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void fetchSupportEvents();
                }}
                className="px-3 py-2 rounded bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
              >
                Refresh
              </button>
            </div>

            {supportEvents.length === 0 ? (
              <div className="mt-4 text-sm text-gray-600">No external support events captured yet.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-2 pr-4 font-semibold">Time (UTC)</th>
                      <th className="py-2 pr-4 font-semibold">Case</th>
                      <th className="py-2 pr-4 font-semibold">Actor</th>
                      <th className="py-2 pr-4 font-semibold">Action</th>
                      <th className="py-2 pr-4 font-semibold">Target</th>
                      <th className="py-2 pr-4 font-semibold">Providers</th>
                      <th className="py-2 pr-4 font-semibold">Channels</th>
                      <th className="py-2 pr-4 font-semibold">Client environment</th>
                      <th className="py-2 pr-4 font-semibold">Status</th>
                      <th className="py-2 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportEvents.map((event) => (
                      <tr key={event.id} className="border-b border-gray-100 align-top">
                        <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                          {new Date(event.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                        </td>
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          <a
                            href={`/case/${event.caseId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {event.caseId}
                          </a>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{event.actor}</td>
                        <td className="py-3 pr-4 text-gray-700">
                          {event.eventType === "collect_source"
                            ? "Collect source"
                            : event.eventType === "collect_all_sources"
                              ? "Collect all sources"
                              : "Prepare ticket bundle"}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{event.targetName}</td>
                        <td className="py-3 pr-4 text-gray-700">{event.metadata.providerCount ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-700">{event.metadata.channelCount ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-700">{event.metadata.clientEnvironment ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-700">{event.status}</td>
                        <td className="py-3 text-gray-700">{event.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
