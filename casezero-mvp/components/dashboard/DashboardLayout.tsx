import Image from "next/image";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  environment: string;
  userName: string;
  onCreateCase: () => void;
  children: ReactNode;
}

export function DashboardLayout({ environment, userName, onCreateCase, children }: DashboardLayoutProps) {
  return (
    <div className="app-workspace flex-1">
      <header className="cz-border border-b bg-white px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/casezero-logo.svg" alt="CaseZero" width={128} height={24} className="h-6 w-auto" />
            <span className="rounded-full border border-[var(--blue)] bg-[var(--blue-soft)] px-3 py-1 text-xs font-semibold text-[#175cd3]">
              {environment}
            </span>
            <h1 className="cz-heading text-2xl font-bold">FCR Intelligence Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{userName}</div>
            <button
              type="button"
              className="cz-primary rounded px-4 py-2 font-semibold"
              onClick={onCreateCase}
            >
              New Case
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
