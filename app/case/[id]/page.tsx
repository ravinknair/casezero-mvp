"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DiagnosisSection } from "@/components/DiagnosisSection";
import { RecommendationSection } from "@/components/RecommendationSection";
import { EvidenceSection } from "@/components/EvidenceSection";
import { MetricsCard } from "@/components/MetricsCard";
import { PoliciesSection } from "@/components/PoliciesSection";
import { Sidebar } from "@/components/Sidebar";

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail();
    }
  }, [caseId]);

  const fetchCaseDetail = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (response.ok) {
        const data = await response.json();
        setCaseData(data);
      }
    } catch (error) {
      console.error("Failed to fetch case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          status: "approved",
          approvedBy: "user-default",
          approvalNotes: "Proceeding with recommended action",
        }),
      });
      setApprovalStatus("approved");
      fetchCaseDetail();
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async () => {
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          status: "rejected",
          approvedBy: "user-default",
          approvalNotes: "Keeping case under observation",
        }),
      });
      setApprovalStatus("rejected");
      fetchCaseDetail();
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading case...</div>;
  }

  if (!caseData || !caseData.case) {
    return <div className="flex items-center justify-center h-screen">Case not found</div>;
  }

  const { case: caseInfo, diagnoses, recommendations, evidence, activities, approvals, metrics } = caseData;
  const diagnosis = diagnoses?.[0];
  const recommendation = recommendations?.[0];
  const approval = approvals?.[0];

  const sidebarItems = [
    { icon: "◫", label: "Cases" },
    { icon: "⌁", label: "Workflows" },
    { icon: "◎", label: "Evidence", count: evidence?.length || 0 },
    { icon: "◇", label: "Policies" },
    { icon: "↗", label: "Telemetry" },
  ];

  return (
    <div className="flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />

      <div className="flex-1 ml-64">
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
                <span className="font-medium">{step}</span>
                {index < 4 && <span className="text-gray-400 mx-1">→</span>}
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
              chain={JSON.parse(diagnosis.chain)}
            />
          )}

          {/* Metrics */}
          {metrics && metrics.length > 0 && (
            <MetricsCard
              items={metrics.map((m: any) => ({
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
              isDeciding={caseInfo.status === "decide" && approvalStatus === "pending"}
            />
          )}

          {/* Evidence */}
          {evidence && evidence.length > 0 && (
            <EvidenceSection
              items={evidence.map((e: any) => ({
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
        </div>
      </div>
    </div>
  );
}
