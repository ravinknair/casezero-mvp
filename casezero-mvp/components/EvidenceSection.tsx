import React from "react";

interface EvidenceItem {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  color?: string;
}

interface EvidenceSectionProps {
  items: EvidenceItem[];
}

const colorClasses: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  green: "bg-green-100 text-green-800 border-green-300",
  red: "bg-red-100 text-red-800 border-red-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export function EvidenceSection({ items }: EvidenceSectionProps) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Evidence Trail</h2>

      <div className="space-y-4">
        {items.map((item, index) => {
          const colorClass = colorClasses[item.color || "blue"] || colorClasses.blue;
          return (
            <div key={index} className={`border rounded-lg p-4 ${colorClass}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="font-bold text-lg w-8 h-8 flex items-center justify-center rounded bg-opacity-30 bg-white">
                    {item.type}
                  </div>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm opacity-90">{item.description}</div>
                  </div>
                </div>
                <div className="text-xs font-mono opacity-75">{item.timestamp}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
