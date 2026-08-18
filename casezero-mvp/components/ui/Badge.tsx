import type { ReactNode } from "react";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "cz-badge-neutral",
  info: "cz-badge-info",
  success: "cz-badge-success",
  warning: "cz-badge-warning",
  danger: "cz-badge-danger",
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>;
}
