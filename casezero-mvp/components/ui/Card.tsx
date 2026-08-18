import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className = "" }: CardProps) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-5 ${className}`}>
      {title ? <h3 className="text-base font-bold text-gray-900">{title}</h3> : null}
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
