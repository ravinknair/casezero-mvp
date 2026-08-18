"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { CaseFilters } from "@/components/case/CaseFilters";
import { CaseRow, type CaseRowData } from "@/components/case/CaseRow";

interface CaseListProps {
  items: CaseRowData[];
  onOpenCase: (id: CaseRowData["id"]) => void;
}

export function CaseList({ items, onOpenCase }: CaseListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.caseId.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || item.status.toLowerCase() === status;
      const matchesSeverity =
        severity === "all" || item.severity.toLowerCase().includes(severity.toLowerCase());
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [items, search, severity, status]);

  return (
    <Card title="Active Cases" subtitle="Filter and open active incidents">
      <CaseFilters
        search={search}
        status={status}
        severity={severity}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSeverityChange={setSeverity}
      />
      <div className="mt-4">
        <Table headers={["Case", "Title", "Type", "Severity", "Status", "Confidence", "Action"]}>
          {filteredItems.map((item) => (
            <CaseRow key={item.id} item={item} onOpen={onOpenCase} />
          ))}
        </Table>
        {filteredItems.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No matching cases for selected filters.</p>
        ) : null}
      </div>
    </Card>
  );
}
