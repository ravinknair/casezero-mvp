import { Badge } from "@/components/ui/Badge";

export interface CaseRowData {
  id: string;
  caseId: string;
  title: string;
  severity: string;
  status: string;
  type: string;
  confidence: number;
  sources: number;
}

interface CaseRowProps {
  item: CaseRowData;
  onOpen: (id: CaseRowData["id"]) => void;
}

function severityTone(severity: string): "danger" | "warning" | "info" | "neutral" {
  const normalized = severity.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("sev-1")) return "danger";
  if (normalized.includes("high") || normalized.includes("sev-2")) return "warning";
  if (normalized.includes("medium")) return "info";
  return "neutral";
}

export function CaseRow({ item, onOpen }: CaseRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{item.caseId}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.title}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.type}</td>
      <td className="px-4 py-3 text-sm">
        <Badge tone={severityTone(item.severity)}>{item.severity}</Badge>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.status}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.confidence.toFixed(0)}%</td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onOpen(item.id)}
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          Open
        </button>
      </td>
    </tr>
  );
}
