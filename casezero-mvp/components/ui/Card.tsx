import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className = "" }: CardProps) {
  return (
    <section className={`cz-card rounded-lg border p-5 ${className}`}>
      {title ? <h3 className="cz-heading text-base font-bold">{title}</h3> : null}
      {subtitle ? <p className="cz-muted mt-1 text-sm">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
