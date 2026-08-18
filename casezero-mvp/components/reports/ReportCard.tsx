import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ReportCardProps {
  title: string;
  description: string;
  generatedAt: string;
  onOpen: () => void;
}

export function ReportCard({ title, description, generatedAt, onOpen }: ReportCardProps) {
  return (
    <Card title={title} subtitle={description}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Generated: {generatedAt}</p>
        <Button variant="secondary" onClick={onOpen}>
          Open report
        </Button>
      </div>
    </Card>
  );
}
