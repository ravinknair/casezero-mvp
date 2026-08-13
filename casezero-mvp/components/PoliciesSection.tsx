interface Policy {
  code: string;
  description: string;
  status: "pending" | "passed" | "failed";
}

interface PoliciesSectionProps {
  policies: Policy[];
}

export function PoliciesSection({ policies }: PoliciesSectionProps) {
  const statusIcons: Record<string, string> = {
    pending: "◇",
    passed: "✓",
    failed: "✗",
  };

  const statusColors: Record<string, string> = {
    pending: "text-yellow-600 bg-yellow-50",
    passed: "text-green-600 bg-green-50",
    failed: "text-red-600 bg-red-50",
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Evaluation</h2>

      <div className="space-y-3">
        {policies.map((policy, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-lg border ${statusColors[policy.status]}`}
          >
            <div className="font-bold text-lg">{statusIcons[policy.status]}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{policy.code}</div>
              <div className="text-sm text-gray-700">{policy.description}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-semibold">
        View evaluation details →
      </button>
    </div>
  );
}
