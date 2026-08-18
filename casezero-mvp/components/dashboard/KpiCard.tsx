import { Card } from "@/components/ui/Card";

interface KpiCardProps {
  label: string;
  value: string | number;
  helper: string;
  tone?: "neutral" | "info" | "warning" | "danger";
}

const toneAccent: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "cz-kpi-neutral",
  info: "cz-kpi-info",
  warning: "cz-kpi-warning",
  danger: "cz-kpi-danger",
};

export function KpiCard({ label, value, helper, tone = "neutral" }: KpiCardProps) {
  return (
    <Card>
      <p className="cz-muted text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${toneAccent[tone]}`}>{value}</p>
      <p className="cz-muted mt-2 text-sm">{helper}</p>
    </Card>
  );
}
