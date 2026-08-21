"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { UserTable, type AdminUser } from "@/components/admin/UserTable";
import { RoleManager } from "@/components/admin/RoleManager";
import { InviteMemberForm } from "@/components/admin/InviteMemberForm";

export default function AdminPage() {
  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard" },
    { icon: "✦", label: "Support Ops", href: "/operations", count: 7 },
    { icon: "⌁", label: "Workflows", href: "/workflows", count: 6 },
    { icon: "◎", label: "Evidence", href: "/evidence", count: 42 },
    { icon: "◇", label: "Policies", href: "/policies", count: 8 },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
    { icon: "⌁", label: "Integrations", href: "/admin/integrations" },
    { icon: "◈", label: "Security", href: "/security" },
    { icon: "⚙", label: "Admin", href: "/admin", active: true },
  ];

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<Array<{ id: string; email: string; role: string }>>([]);
  const [seedMessage, setSeedMessage] = useState("");
  useEffect(() => {
    void fetch("/api/workspaces/invitations").then((response) => response.json()).then((data: { members: AdminUser[]; invitations: Array<{ id: string; email: string; role: string }> }) => {
      setUsers(data.members.map((user) => ({ ...user, role: user.role.replace(/^./, (letter) => letter.toUpperCase()) })));
      setInvitations(data.invitations);
    });
  }, []);

  async function loadDemoCases() {
    setSeedMessage("Loading...");
    const response = await fetch("/api/seed", { method: "POST" });
    const data = await response.json() as { message?: string; error?: string };
    setSeedMessage(data.message ?? data.error ?? "Seed completed");
  }

  const roles = [
    { name: "Admin", users: users.filter((user) => user.role === "Admin").length, permissions: "Full platform access, policy and role management" },
    { name: "Operator", users: users.filter((user) => user.role === "Operator").length, permissions: "Manage cases, evidence, workflows, and approvals" },
    { name: "Viewer", users: users.filter((user) => user.role === "Viewer").length, permissions: "Read-only access to dashboard, case list, and reports" },
  ];

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />
      <main className="app-workspace flex-1 space-y-6 p-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
          <p className="mt-2 text-sm text-gray-600">User access, integration onboarding, and role controls for FCR intelligence operations.</p>
        </header>
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">Product setup</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <a href="/admin/integrations" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-300">
              <h3 className="font-bold text-gray-900">Support platform integrations</h3>
              <p className="mt-2 text-sm text-gray-600">ServiceNow, Zendesk, Jira Service Management, Salesforce Service Cloud, and Freshservice setup.</p>
            </a>
            <a href="/security" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-300">
              <h3 className="font-bold text-gray-900">Security posture</h3>
              <p className="mt-2 text-sm text-gray-600">Stored data, excluded data, retention, secrets, auth, and deployment model.</p>
            </a>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={loadDemoCases} className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">Load demo cases</button>
            {seedMessage && <span className="text-sm text-gray-600" role="status">{seedMessage}</span>}
          </div>
        </section>
        <section>
          <InviteMemberForm />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">User table</h2>
          <UserTable users={users} />
          {invitations.length > 0 && <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"><h3 className="font-semibold text-gray-800">Pending invitations</h3>{invitations.map((invitation) => <p key={invitation.id} className="mt-2 text-sm text-gray-600">{invitation.email} · {invitation.role}</p>)}</div>}
        </section>
        <section>
          <RoleManager roles={roles} />
        </section>
      </main>
    </div>
  );
}
