import { CaseList } from "@/components/case/CaseList";
import type { CaseRowData } from "@/components/case/CaseRow";

interface CaseTableProps {
  items: CaseRowData[];
  onOpenCase: (caseId: string) => void;
}

export function CaseTable({ items, onOpenCase }: CaseTableProps) {
  return <CaseList items={items} onOpenCase={onOpenCase} />;
}
