import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface SummaryItem {
  label: string;
  value: number;
}

interface SummaryWidgetProps {
  title: string;
  subtitle: string;
  items: SummaryItem[];
}

export function SummaryWidget({ title, subtitle, items }: SummaryWidgetProps) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded border border-gray-100 p-3">
            <span className="text-sm text-gray-700">{item.label}</span>
            <Badge tone="info">{item.value}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
