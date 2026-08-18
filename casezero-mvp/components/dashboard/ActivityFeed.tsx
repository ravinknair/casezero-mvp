import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card title="Activity feed" subtitle="Recent case and support operations events">
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded border border-gray-100 p-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.message}</p>
                <p className="mt-1 text-xs text-gray-500">{item.timestamp}</p>
              </div>
              <Badge tone={item.tone ?? "neutral"}>Event</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
