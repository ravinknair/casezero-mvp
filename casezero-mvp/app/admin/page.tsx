"use client";

import { Sidebar } from "@/components/Sidebar";
import { UserTable, type AdminUser } from "@/components/admin/UserTable";
import { RoleManager } from "@/components/admin/RoleManager";

export default function AdminPage() {
  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard" },
    { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
    { icon: "⌁", label: "Workflows", href: "/workflows", count: 6 },
    { icon: "◎", label: "Evidence", href: "/evidence", count: 42 },
    { icon: "◇", label: "Policies", href: "/policies", count: 8 },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
    { icon: "⚙", label: "Admin", href: "/admin", active: true },
  ];

  const users: AdminUser[] = [
    { id: "1", name: "Ravi Nair", email: "raknair@outlook.com", role: "Admin", status: "active" },
    { id: "2", name: "Iranga Subasinghe", email: "prasadsmy@gmail.com", role: "Admin", status: "active" },
    { id: "3", name: "Mandar Pophali", email: "mandar@manuvaconsulting.com", role: "Admin", status: "active" },
    { id: "4", name: "Field Operator - Alberta", email: "operator.ab@example.com", role: "Viewer", status: "invited" },
  ];

  const roles = [
    { name: "Admin", users: 3, permissions: "Full platform access, policy and role management" },
    { name: "Approver", users: 0, permissions: "Approve/reject recommended actions, read evidence and metrics" },
    { name: "Viewer", users: 1, permissions: "Read-only access to dashboard, case list, and reports" },
  ];

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 space-y-6 p-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
          <p className="mt-2 text-sm text-gray-600">User access and role controls for enterprise operations.</p>
        </header>
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">User table</h2>
          <UserTable users={users} />
        </section>
        <section>
          <RoleManager roles={roles} />
        </section>
      </main>
    </div>
  );
}
