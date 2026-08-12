import React from "react";

interface RecommendationProps {
  title: string;
  description: string;
  actionLabel: string;
  riskValue?: string;
  riskLabel?: string;
  checks: Array<[string, string]>;
  stops: string[];
  note?: string;
  onApprove?: () => void;
  onReject?: () => void;
  isDeciding?: boolean;
}

export function RecommendationSection({
  title,
  description,
  actionLabel,
  riskValue,
  riskLabel,
  checks,
  stops,
  note,
  onApprove,
  onReject,
  isDeciding,
}: RecommendationProps) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>

      {(riskValue || riskLabel) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm font-semibold text-yellow-900">BLAST RADIUS</div>
          <div className="text-lg font-bold text-yellow-700">{riskValue}</div>
          <div className="text-sm text-yellow-600">{riskLabel}</div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">VERIFICATION CHECKS</h3>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-green-600 font-bold text-lg mt-0.5">✓</div>
              <div>
                <div className="font-semibold text-green-900">{check[0]}</div>
                <div className="text-sm text-green-700">{check[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">AUTOMATIC STOP CONDITIONS</h3>
        <div className="space-y-2">
          {stops.map((stop, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-red-700 p-2 bg-red-50 rounded">
              <span className="text-red-500 font-bold">⚠</span>
              <span>{stop}</span>
            </div>
          ))}
        </div>
      </div>

      {note && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-6">
          <p className="text-sm text-blue-900"><strong>Decision note:</strong> {note}</p>
        </div>
      )}

      {isDeciding && (
        <div className="flex gap-3">
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
          >
            {actionLabel}
          </button>
          <button
            onClick={onReject}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 font-semibold rounded hover:bg-gray-400 transition"
          >
            Reject and keep observing
          </button>
        </div>
      )}
    </div>
  );
}
