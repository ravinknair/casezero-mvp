import React from "react";

interface MetricItem {
  name: string;
  value: string;
  change: string;
  status: "neutral" | "warn" | "danger";
}

interface MetricsProps {
  items: MetricItem[];
}

export function MetricsCard({ items }: MetricsProps) {
  const statusColors: Record<string, string> = {
    neutral: "text-gray-600",
    warn: "text-yellow-600",
    danger: "text-red-600",
  };

  const statusBg: Record<string, string> = {
    neutral: "bg-gray-50",
    warn: "bg-yellow-50",
    danger: "bg-red-50",
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Key Metrics</h3>

      <div className="grid grid-cols-3 gap-4">
        {items.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${statusBg[metric.status]} ${statusColors[metric.status]}`}
          >
            <div className="text-sm font-semibold text-gray-600 mb-1">{metric.name}</div>
            <div className="text-2xl font-bold mb-1">{metric.value}</div>
            <div className="text-xs font-semibold">{metric.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
