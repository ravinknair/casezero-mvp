import { Card } from "@/components/ui/Card";

export interface FcrMetrics {
  rate: number | null;
  resolvedCases: number;
  eligibleCases: number;
  trackedCases: number;
  pendingValidation: number;
  repeatWindowDays: number;
  targetRate: number;
  byChannel: Array<{
    channel: string;
    rate: number | null;
    trackedCases: number;
    pendingValidation: number;
    resolvedCases: number;
    eligibleCases: number;
  }>;
  failureReasons: Array<{ label: string; value: number }>;
}

const channelBenchmarks: Record<string, string> = {
  Phone: "70-75%",
  "Live Chat": "65-75%",
  Email: "50-65%",
  "Self-Service / Portal": "40-60%",
};

export function FcrReport({ metrics }: { metrics: FcrMetrics }) {
  const targetMet = metrics.rate !== null && metrics.rate >= metrics.targetRate;

  return (
    <div className="space-y-6">
      <section className="border-b border-gray-200 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Support effectiveness</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">First Contact Resolution</h2>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              Cases resolved during the initial interaction without escalation, reopening, or repeat contact within {metrics.repeatWindowDays} days.
            </p>
          </div>
          <span className={`rounded px-3 py-1 text-xs font-semibold ${targetMet ? "cz-badge-success" : "cz-badge-warning"}`}>
            {metrics.rate === null ? "Collecting cohort" : targetMet ? "Target met" : "Below target"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="FCR rate" value={metrics.rate === null ? "N/A" : `${metrics.rate}%`} emphasis />
          <Metric label="Leadership target" value={`${metrics.targetRate}%`} />
          <Metric label="First-contact resolutions" value={metrics.resolvedCases} />
          <Metric label="Eligible cohort" value={metrics.eligibleCases} />
          <Metric label="Pending validation" value={metrics.pendingValidation} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Support channel mix" subtitle="How users contacted support, with validated FCR shown separately">
          {metrics.byChannel.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="pb-3 font-semibold">Channel</th>
                    <th className="pb-3 font-semibold">Tracked</th>
                    <th className="pb-3 font-semibold">Pending</th>
                    <th className="pb-3 font-semibold">FCR</th>
                    <th className="pb-3 font-semibold">Resolved</th>
                    <th className="pb-3 font-semibold">Eligible</th>
                    <th className="pb-3 font-semibold">Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metrics.byChannel.map((item) => (
                    <tr key={item.channel}>
                      <td className="py-4 font-semibold text-gray-900">{item.channel}</td>
                      <td className="py-4 text-gray-700">{item.trackedCases}</td>
                      <td className="py-4 text-gray-700">{item.pendingValidation}</td>
                      <td className="py-4">
                        {item.rate === null ? (
                          <span className="cz-badge-info rounded px-2 py-1 text-xs font-semibold">Pending</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded bg-gray-100" aria-hidden="true">
                              <div className="h-full bg-blue-600" style={{ width: `${item.rate}%` }} />
                            </div>
                            <span className="font-semibold text-gray-900">{item.rate}%</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-gray-700">{item.resolvedCases}</td>
                      <td className="py-4 text-gray-700">{item.eligibleCases}</td>
                      <td className="py-4 text-gray-600">{channelBenchmarks[item.channel] ?? "Internal target"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Channel activity will appear after the first support interaction is received.</p>
          )}
        </Card>

        <Card title="Resolution leakage" subtitle="Reasons otherwise eligible cases did not qualify">
          {metrics.failureReasons.length ? (
            <div className="space-y-4">
              {metrics.failureReasons.map((reason) => (
                <div key={reason.label} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-gray-700">{reason.label}</span>
                  <span className="cz-badge-warning rounded px-2 py-1 text-xs font-bold">{reason.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No disqualifying events in the eligible cohort.</p>
          )}
        </Card>
      </div>

      <Card title="Measurement policy" subtitle="Auditable rules used for leadership reporting">
        <div className="grid gap-4 text-sm text-gray-700 md:grid-cols-3">
          <Policy label="Numerator" text="Resolved during the initial interaction with no escalation, reopen, or repeat contact." />
          <Policy label="Denominator" text={`All tracked contacts old enough to complete the ${metrics.repeatWindowDays}-day validation window.`} />
          <Policy label="Fresh contacts" text="Shown as pending validation and excluded until the repeat-contact window closes." />
        </div>
        <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
          Formula: first-contact resolutions / eligible received contacts x 100. Tracked contacts: {metrics.trackedCases}.
        </p>
      </Card>
    </div>
  );
}

function Metric({ label, value, emphasis = false }: { label: string; value: string | number; emphasis?: boolean }) {
  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 font-bold ${emphasis ? "text-3xl text-blue-700" : "text-2xl text-gray-900"}`}>{value}</p>
    </div>
  );
}

function Policy({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="mt-1 leading-6">{text}</p>
    </div>
  );
}