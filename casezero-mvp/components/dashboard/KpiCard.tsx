import { Card } from "@/components/ui/Card";

interface KpiCardProps {
  label: string;
  value: string | number;
  helper: string;
  tone?: "neutral" | "info" | "warning" | "danger";
}

const toneAccent: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "text-gray-900",
  info: "text-blue-700",
  warning: "text-amber-700",
  danger: "text-red-700",
};

export function KpiCard({ label, value, helper, tone = "neutral" }: KpiCardProps) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${toneAccent[tone]}`}>{value}</p>
      <p className="mt-2 text-sm text-gray-600">{helper}</p>
    </Card>
  );
}
