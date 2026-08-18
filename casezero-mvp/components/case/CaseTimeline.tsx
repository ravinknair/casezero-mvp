import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface CaseTimelineItem {
  id: string;
  label: string;
  message: string;
  timestamp: string;
  status: "recorded" | "ready" | "blocked";
}

interface CaseTimelineProps {
  items: CaseTimelineItem[];
}

function toneForStatus(status: CaseTimelineItem["status"]): "info" | "success" | "warning" {
  if (status === "ready") return "success";
  if (status === "blocked") return "warning";
  return "info";
}

export function CaseTimeline({ items }: CaseTimelineProps) {
  return (
    <Card title="Case timeline" subtitle="Latest evidence and support-tracking events">
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">No timeline events yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded border border-gray-100 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <Badge tone={toneForStatus(item.status)}>{item.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">{item.message}</p>
              <p className="mt-1 text-xs text-gray-500">{item.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
