"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DiagnosisSection } from "@/components/DiagnosisSection";
import { RecommendationSection } from "@/components/RecommendationSection";
import { EvidenceSection } from "@/components/EvidenceSection";
import { MetricsCard } from "@/components/MetricsCard";
import { PoliciesSection } from "@/components/PoliciesSection";
import { Sidebar } from "@/components/Sidebar";
import { normalizeChain } from "@/lib/caseChain";
import {
  clientEnvironmentOptions,
  type ClientEnvironmentOptionValue,
} from "@/lib/clientEnvironments";

interface CaseDetailData {
  case: {
    caseId: string;
    title: string;
    subtitle?: string;
    severity: string;
    confidence: number;
    sources: number;
    activity: number;
    status: string;
  };
  diagnoses: Array<{ title: string; description: string; chain: unknown }>;
  recommendations: Array<{
    title: string;
    description: string;
    actionLabel: string;
    riskValue: string;
    riskLabel: string;
    note: string;
  }>;
  evidence: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
    color?: string;
  }>;
  metrics: Array<{
    name: string;
    value: string;
    change: string;
    status: "neutral" | "warn" | "danger";
  }>;
}

interface SupportSourceStatus {
  type: "provider" | "channel";
  name: string;
  collected: boolean;
  collectedAt: string | null;
  collectedBy: string | null;
}

interface SupportPack {
  caseId: string;
  clientEnvironment: string | null;
  providers: SupportSourceStatus[];
  communicationChannels: SupportSourceStatus[];
  bundleReady: boolean;
  ticketBundleId?: string;
  lastUpdatedAt: string;
}

interface SupportTelemetryEvent {
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
}

interface SupportTrackingResponse {
  pack: SupportPack;
  events: SupportTelemetryEvent[];
}

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<CaseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [supportPack, setSupportPack] = useState<SupportPack | null>(null);
  const [supportEvents, setSupportEvents] = useState<SupportTelemetryEvent[]>([]);
  const [supportActionLoading, setSupportActionLoading] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [clientEnvironment, setClientEnvironment] = useState<ClientEnvironmentOptionValue>("production");
  const [customClientEnvironment, setCustomClientEnvironment] = useState("");

  const fetchCaseDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (response.ok) {
        const data = await response.json();
        setCaseData(data as CaseDetailData);
      }
    } catch (error) {
      console.error("Failed to fetch case:", error);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const fetchSupportArtifacts = useCallback(async () => {
    try {
      const response = await fetch(`/api/support-tracking?caseId=${caseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch support tracking state");
      }
      const data = await response.json();
      const trackingState = data as SupportTrackingResponse;
      setSupportPack(trackingState.pack);
      setSupportEvents(trackingState.events);
      const trackedEnvironment = trackingState.pack.clientEnvironment?.trim() ?? "";
      const hasPresetEnvironment = clientEnvironmentOptions.some(
        (option) => option.value !== "custom" && option.value === trackedEnvironment
      );
      if (trackedEnvironment && !hasPresetEnvironment) {
        setClientEnvironment("custom");
        setCustomClientEnvironment(trackedEnvironment);
      } else if (trackedEnvironment) {
        setClientEnvironment(trackedEnvironment as ClientEnvironmentOptionValue);
        setCustomClientEnvironment("");
      }
      setSupportError("");
    } catch (error) {
      console.error("Failed to fetch support tracking state:", error);
      setSupportError("Unable to load external support tracking state.");
    }
  }, [caseId]);

  useEffect(() => {
    if (caseId) {
      void fetchCaseDetail();
      void fetchSupportArtifacts();
    }
  }, [caseId, fetchCaseDetail, fetchSupportArtifacts]);

  const handleApprove = async () => {
    try {
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          status: "approved",
          approvedBy: "Mandar Pophali",
          approvalNotes: "Proceeding with recommended action",
        }),
      });

      if (!response.ok) {
        throw new Error("Approval request failed");
      }

      setApprovalStatus("approved");
      await fetchCaseDetail();
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          status: "rejected",
          approvedBy: "Mandar Pophali",
          approvalNotes: "Keeping case under observation",
        }),
      });

      if (!response.ok) {
        throw new Error("Rejection request failed");
      }

      setApprovalStatus("rejected");
      await fetchCaseDetail();
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const handleSupportAction = async (
    action: "collect_source" | "collect_all_sources" | "prepare_ticket_bundle",
    sourceType?: "provider" | "channel",
    sourceName?: string
  ) => {
    const resolvedClientEnvironment =
      clientEnvironment === "custom" ? customClientEnvironment.trim() : clientEnvironment;

    if (!resolvedClientEnvironment) {
      setSupportError("Client environment is required before collecting logs.");
      return;
    }

    setSupportActionLoading(true);
    setSupportError("");
    try {
      const response = await fetch("/api/support-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          action,
          sourceType,
          sourceName,
          createdBy: "Mandar Pophali",
          clientEnvironment: resolvedClientEnvironment,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error ?? "Support tracking action failed");
      }

      await fetchSupportArtifacts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Support tracking action failed";
      console.error("Failed support tracking action:", error);
      setSupportError(message);
    } finally {
      setSupportActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading case...</div>;
  }

  if (!caseData || !caseData.case) {
    return <div className="flex items-center justify-center h-screen">Case not found</div>;
  }

  const { case: caseInfo, diagnoses, recommendations, evidence, metrics } = caseData;
  const diagnosis = diagnoses?.[0];
  const recommendation = recommendations?.[0];
  const canDecide = approvalStatus === "pending" && !["resolved", "rejected"].includes(caseInfo?.status);
  const providerSources = supportPack?.providers ?? [];
  const channelSources = supportPack?.communicationChannels ?? [];

  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard" },
    { icon: "⌁", label: "Workflows", href: "/workflows" },
    { icon: "◎", label: "Evidence", href: "/evidence", count: evidence?.length || 0 },
    { icon: "◇", label: "Policies", href: "/policies" },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
    { icon: "▶", label: "Demo Guide", href: "/demo" },
    { icon: "✓", label: "Test Status", href: "/status" },
  ];

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />

      <div className="app-workspace flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">{caseInfo.caseId}</div>
              <h1 className="text-3xl font-bold text-gray-900">{caseInfo.title}</h1>
              {caseInfo.subtitle && (
                <p className="text-gray-600 mt-1">{caseInfo.subtitle}</p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-red-50 text-red-700 font-bold rounded mb-2">
                {caseInfo.severity}
              </div>
              <div className="text-sm text-gray-600">Opened just now</div>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-600">{caseInfo.confidence.toFixed(0)}%</span>{" "}
              <span className="text-gray-600">High confidence</span>
            </div>
            <div>
              <span className="font-semibold">{caseInfo.sources}</span>{" "}
              <span className="text-gray-600">bounded evidence sources</span>
            </div>
            <div>
              <span className="font-semibold">{caseInfo.activity}</span>{" "}
              <span className="text-gray-600">activities</span>
            </div>
          </div>
        </div>

        {/* Use case brief */}
        {caseInfo.useCase && (
          <div className="bg-blue-50 border-b border-blue-100 px-8 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Use case</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">{caseInfo.useCase.name}</h2>
            <p className="mt-2 text-sm text-gray-700">{caseInfo.useCase.clientProblem}</p>
            <div className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
              <div><span className="font-semibold text-gray-900">Primary actor:</span> {caseInfo.useCase.primaryActor}</div>
              <div><span className="font-semibold text-gray-900">Trigger:</span> {caseInfo.useCase.trigger}</div>
              <div><span className="font-semibold text-gray-900">Integrations:</span> {caseInfo.useCase.integrations?.join(", ")}</div>
              <div><span className="font-semibold text-gray-900">MVP build scope:</span> {caseInfo.useCase.mvpBuildScope}</div>
            </div>
          </div>
        )}

        {/* Workflow progress */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            {["Detect", "Diagnose", "Decide", "Act", "Verify"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index <= 2
                      ? "bg-green-500 text-white"
                      : index === 3
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {index < 2 ? "✓" : index + 1}
                </div>
                <span className="app-step-label font-medium">{step}</span>
                {index < 4 && <span className="app-step-arrow text-gray-400 mx-1">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="p-8 space-y-8">
          {/* Diagnosis */}
          {diagnosis && (
            <DiagnosisSection
              title={diagnosis.title}
              description={diagnosis.description}
              chain={normalizeChain(diagnosis.chain)}
            />
          )}

          {/* Metrics */}
          {metrics && metrics.length > 0 && (
            <MetricsCard
              items={metrics.map((m) => ({
                name: m.name,
                value: m.value,
                change: m.change,
                status: m.status,
              }))}
            />
          )}

          {/* Recommendation */}
          {recommendation && (
            <RecommendationSection
              title={recommendation.title}
              description={recommendation.description}
              actionLabel={recommendation.actionLabel}
              riskValue={recommendation.riskValue}
              riskLabel={recommendation.riskLabel}
              checks={[]}
              stops={[]}
              note={recommendation.note}
              onApprove={handleApprove}
              onReject={handleReject}
              isDeciding={canDecide}
            />
          )}

          {/* Evidence */}
          {evidence && evidence.length > 0 && (
            <EvidenceSection
              items={evidence.map((e) => ({
                type: e.type,
                title: e.title,
                description: e.description,
                timestamp: e.timestamp,
                color: e.color,
              }))}
            />
          )}

          {/* Policies */}
          {diagnosis && (
            <PoliciesSection
              policies={[
                { code: "SECRET-ROTATION-07", description: "Dual-control approval", status: "passed" },
                { code: "CERT-CANARY-03", description: "One region first", status: "passed" },
              ]}
            />
          )}

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">External Support Evidence Pack</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Collect provider logs and communication records, then prepare a bundle from your selected sources for external support escalation.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={clientEnvironment}
                  onChange={(event) => {
                    setClientEnvironment(event.target.value as ClientEnvironmentOptionValue);
                  }}
                  className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-700 min-w-64"
                >
                  {clientEnvironmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {clientEnvironment === "custom" && (
                  <input
                    type="text"
                    value={customClientEnvironment}
                    onChange={(event) => {
                      setCustomClientEnvironment(event.target.value);
                    }}
                    className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-700 min-w-64"
                    placeholder="custom client environment"
                  />
                )}
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                  onClick={() => {
                    void handleSupportAction("collect_all_sources");
                  }}
                  disabled={supportActionLoading}
                >
                  {supportActionLoading ? "Processing..." : "Collect All Sources"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-emerald-300"
                  onClick={() => {
                    void handleSupportAction("prepare_ticket_bundle");
                  }}
                  disabled={supportActionLoading}
                >
                  {supportActionLoading ? "Processing..." : "Prepare Ticket Bundle"}
                </button>
              </div>
            </div>

            {supportError && (
              <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {supportError}
              </div>
            )}

            {supportPack ? (
              <div className="mt-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Providers collected</div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {providerSources.filter((item) => item.collected).length} / {providerSources.length}
                    </div>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Channels collected</div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {channelSources.filter((item) => item.collected).length} / {channelSources.length}
                    </div>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Bundle status</div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {supportPack.bundleReady ? `Ready (${supportPack.ticketBundleId})` : "In progress"}
                    </div>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Last update</div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {new Date(supportPack.lastUpdatedAt).toISOString().replace("T", " ").slice(0, 19)} UTC
                    </div>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3 md:col-span-2 xl:col-span-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Client environment</div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {supportPack.clientEnvironment ?? "Not set yet"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cloud providers (click to select/deselect)</h3>
                  <div className="flex flex-wrap gap-2">
                    {providerSources.map((source) => (
                      <button
                        key={source.name}
                        type="button"
                        className={`px-3 py-2 rounded border text-sm font-medium ${
                          source.collected
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                        }`}
                        disabled={supportActionLoading}
                        onClick={() => {
                          void handleSupportAction("collect_source", "provider", source.name);
                        }}
                      >
                        {source.collected ? `✓ ${source.name}` : `Select ${source.name}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Communication channels (click to select/deselect)</h3>
                  <div className="flex flex-wrap gap-2">
                    {channelSources.map((source) => (
                      <button
                        key={source.name}
                        type="button"
                        className={`px-3 py-2 rounded border text-sm font-medium ${
                          source.collected
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                        }`}
                        disabled={supportActionLoading}
                        onClick={() => {
                          void handleSupportAction("collect_source", "channel", source.name);
                        }}
                      >
                        {source.collected ? `✓ ${source.name}` : `Select ${source.name}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Action history (auditable)</h3>
                  {supportEvents.length === 0 ? (
                    <div className="text-sm text-gray-600">No actions recorded yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-gray-500">
                            <th className="py-2 pr-4 font-semibold">Time (UTC)</th>
                            <th className="py-2 pr-4 font-semibold">Actor</th>
                            <th className="py-2 pr-4 font-semibold">Action</th>
                            <th className="py-2 pr-4 font-semibold">Target</th>
                            <th className="py-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supportEvents.map((event) => (
                            <tr key={event.id} className="border-b border-gray-100">
                              <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">
                                {new Date(event.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                              </td>
                              <td className="py-2 pr-4 text-gray-800">{event.actor}</td>
                              <td className="py-2 pr-4 text-gray-800">{event.eventType}</td>
                              <td className="py-2 pr-4 text-gray-800">{event.targetName}</td>
                              <td className="py-2 text-gray-800">{event.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-600">
                Loading support evidence pack status...
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
