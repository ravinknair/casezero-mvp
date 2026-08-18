import Image from "next/image";

interface SidebarItem {
  icon: string;
  label: string;
  count?: number;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  userName?: string;
  caseCount?: number;
  approvers?: string[];
}

export function Sidebar({
  items,
  userName,
  caseCount,
  approvers = ["Iranga Subasinghe", "Mandar Pophali"],
}: SidebarProps) {
  return (
    <div className="app-sidebar cz-sidebar w-64 text-white h-screen flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="cz-sidebar-border border-b p-6">
        <Image
          src="/casezero-logo.svg"
          alt="CaseZero"
          width={192}
          height={36}
          className="mb-4 h-auto w-full max-w-[192px]"
          priority
        />
        {userName && (
          <div className="text-xs text-gray-400">
            <div>{userName}</div>
            <div>Incident approver</div>
          </div>
        )}
        <div className="cz-sidebar-border mt-4 border-t pt-4">
          <div className="text-xs text-[#98a2b3]">APPROVERS</div>
          <div className="mt-2 space-y-1">
            {approvers.map((approver) => (
              <div key={approver} className="text-sm text-[#d0d5dd]">
                {approver}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main sections */}
      <nav className="app-sidebar-nav flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item, index) => {
          const classes = `cz-sidebar-item w-full border text-left px-4 py-3 rounded transition flex items-center justify-between ${
            item.active ? "cz-sidebar-item-active" : ""
          }`;

          if (item.href) {
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="app-sidebar-label font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="app-sidebar-count cz-sidebar-count px-2 py-0.5 rounded text-xs font-semibold">
                    {item.count}
                  </span>
                )}
              </a>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={item.onClick}
              className={classes}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                  <span className="app-sidebar-label font-medium">{item.label}</span>
              </div>
              {item.count !== undefined && (
                  <span className="app-sidebar-count cz-sidebar-count px-2 py-0.5 rounded text-xs font-semibold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer stats */}
      <div className="cz-sidebar-border border-t p-4">
        <div className="mb-3 text-xs text-[#98a2b3]">CASES</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{caseCount || 0}</span>
          <span className="text-[#98a2b3]">cases</span>
        </div>
      </div>
    </div>
  );
}
