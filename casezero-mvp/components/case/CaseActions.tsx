import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface CaseActionsProps {
  canApprove: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function CaseActions({ canApprove, onApprove, onReject }: CaseActionsProps) {
  return (
    <Card title="Case actions" subtitle="Operator decisions for this incident">
      <div className="flex flex-wrap gap-2">
        <Button onClick={onApprove} disabled={!canApprove} className={!canApprove ? "opacity-60" : ""}>
          Approve action
        </Button>
        <Button variant="secondary" onClick={onReject} disabled={!canApprove} className={!canApprove ? "opacity-60" : ""}>
          Reject action
        </Button>
      </div>
    </Card>
  );
}
