import { Badge } from "@/components/ui/Badge";

interface CaseHeaderProps {
  caseId: string;
  title: string;
  subtitle?: string;
  severity: string;
}

function severityTone(severity: string): "danger" | "warning" | "info" | "neutral" {
  const normalized = severity.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("sev-1")) return "danger";
  if (normalized.includes("high") || normalized.includes("sev-2")) return "warning";
  if (normalized.includes("medium")) return "info";
  return "neutral";
}

export function CaseHeader({ caseId, title, subtitle, severity }: CaseHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-600">{caseId}</p>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-gray-600">{subtitle}</p> : null}
      </div>
      <Badge tone={severityTone(severity)}>{severity}</Badge>
    </div>
  );
}
