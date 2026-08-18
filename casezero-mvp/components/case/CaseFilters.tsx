interface CaseFiltersProps {
  search: string;
  status: string;
  severity: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
}

export function CaseFilters({
  search,
  status,
  severity,
  onSearchChange,
  onStatusChange,
  onSeverityChange,
}: CaseFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search case id or title"
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <select value={status} onChange={(event) => onStatusChange(event.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
        <option value="all">All statuses</option>
        <option value="detect">Detect</option>
        <option value="diagnose">Diagnose</option>
        <option value="decide">Decide</option>
        <option value="act">Act</option>
        <option value="verify">Verify</option>
      </select>
      <select value={severity} onChange={(event) => onSeverityChange(event.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
        <option value="all">All severities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
