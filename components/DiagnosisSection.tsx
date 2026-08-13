import React from "react";

interface DiagnosisProps {
  title: string;
  description: string;
  chain: string[];
  rootCause?: string;
}

export function DiagnosisSection({ title, description, chain, rootCause }: DiagnosisProps) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">CAUSAL CHAIN</h3>
        <div className="flex items-center gap-3">
          {chain.map((step, index) => (
            <React.Fragment key={index}>
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm font-medium text-blue-900">
                {step}
              </div>
              {index < chain.length - 1 && (
                <div className="text-blue-400 text-lg">→</div>
              )}
            </React.Fragment>
          ))}
          <div className="text-gray-400 text-lg">↻</div>
        </div>
      </div>

      {rootCause && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-sm font-semibold text-blue-900 mb-1">ROOT CAUSE</p>
          <p className="text-blue-800">{rootCause}</p>
        </div>
      )}
    </div>
  );
}
