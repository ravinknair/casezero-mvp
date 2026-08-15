"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { runApiSmokeTests } from "@/lib/apiSmokeTests";
import { runSimulationTests, type CheckResult } from "@/lib/simulationTests";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "⌁", label: "Workflows", href: "/workflows" },
  { icon: "◎", label: "Evidence", href: "/evidence" },
  { icon: "◇", label: "Policies", href: "/policies" },
  { icon: "↗", label: "Telemetry", href: "/telemetry" },
  { icon: "▶", label: "Demo Guide", href: "/demo" },
  { icon: "✓", label: "Test Status", href: "/status", active: true },
];

interface Group {
  label: string;
  results: CheckResult[];
}

export default function StatusPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [ranAt, setRanAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const runTests = async () => {
    setLoading(true);
    try {
      const simulationResults = runSimulationTests();
      const apiResults = await runApiSmokeTests();

      setGroups([
        { label: "Case workflow simulation tests", results: simulationResults },
        { label: "Live API smoke tests", results: apiResults },
      ]);
      setRanAt(new Date().toISOString());
    } catch {
      setGroups(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const allResults = groups?.flatMap((g) => g.results) ?? [];
  const passed = allResults.filter((r) => r.passed).length;
  const total = allResults.length;

  return (
    <div className="app-layout flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />

      <main className="app-workspace flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Test status</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">Live test dashboard</h1>
              <p className="mt-2 text-gray-600">Runs the full case-workflow simulation suite in-browser plus live smoke tests against this deployment&apos;s API.</p>
            </div>
            <button
              onClick={runTests}
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Running…" : "Run all tests"}
            </button>
          </div>

          {groups && (
            <div
              className={`mt-6 rounded-xl border p-5 text-lg font-bold ${
                passed === total ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {passed} / {total} checks passed
              {ranAt && <div className="mt-1 text-sm font-normal text-gray-600">Last run: {new Date(ranAt).toLocaleString()}</div>}
            </div>
          )}

          {loading && !groups && <div className="mt-6 text-gray-500">Running checks…</div>}

          {groups?.map((group) => (
            <div key={group.label} className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">{group.label}</h2>
              <div className="mt-3 space-y-3">
                {group.results.map((r) => (
                  <div
                    key={r.name}
                    className={`rounded-xl border p-4 ${r.passed ? "border-gray-200 bg-white" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={r.passed ? "text-green-600" : "text-red-600"}>{r.passed ? "✓" : "✗"}</span>
                        <span className="font-semibold text-gray-900">{r.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{r.durationMs}ms</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{r.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
