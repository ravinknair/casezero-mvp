import React from "react";

interface CaseCardProps {
  id: string;
  caseId: string;
  type: string;
  severity: string;
  title: string;
  status: string;
  confidence: number;
  sources: number;
  onClick?: () => void;
}

export function CaseCard({
  caseId,
  type,
  severity,
  title,
  status,
  confidence,
  sources,
  onClick,
}: CaseCardProps) {
  const statusColors: Record<string, string> = {
    detect: "bg-blue-100 text-blue-800",
    diagnose: "bg-purple-100 text-purple-800",
    decide: "bg-yellow-100 text-yellow-800",
    act: "bg-orange-100 text-orange-800",
    verify: "bg-green-100 text-green-800",
    resolved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-600">{caseId}</div>
          <div className="text-lg font-bold text-gray-900">{title}</div>
        </div>
        <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColors[status] || "bg-gray-100"}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
          {type}
        </span>
        <span className="inline-block px-2 py-1 text-xs bg-red-50 text-red-700 rounded font-semibold">
          {severity}
        </span>
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <div>
          <span className="font-semibold">{confidence.toFixed(0)}%</span> confidence
        </div>
        <div>
          <span className="font-semibold">{sources}</span> sources
        </div>
      </div>
    </div>
  );
}
