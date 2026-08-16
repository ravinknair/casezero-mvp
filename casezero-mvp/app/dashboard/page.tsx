"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CaseCard } from "@/components/CaseCard";
import { Sidebar } from "@/components/Sidebar";

interface Case {
  id: string;
  caseId: string;
  type: string;
  severity: string;
  title: string;
  status: string;
  confidence: number;
  sources: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportEventCount, setSupportEventCount] = useState(0);

  const fetchCases = useCallback(async () => {
    try {
      const response = await fetch("/api/cases");
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCases();
  }, [fetchCases]);

  const fetchSupportEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/telemetry/events");
      if (!response.ok) {
        throw new Error("Failed to fetch support telemetry");
      }
      const data = (await response.json()) as Array<{ id: string }>;
      setSupportEventCount(data.length);
    } catch (error) {
      console.error("Failed to fetch support telemetry:", error);
    }
  }, []);

  useEffect(() => {
    void fetchSupportEvents();
  }, [fetchSupportEvents]);

  useEffect(() => {
    const handleFocus = () => {
      void fetchCases();
      void fetchSupportEvents();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchCases, fetchSupportEvents]);

  const sidebarItems = [
    { icon: "◫", label: "Cases", href: "/dashboard", count: cases.length, active: true },
    { icon: "⌁", label: "Workflows", href: "/workflows", count: 6 },
    { icon: "◎", label: "Evidence", href: "/evidence", count: 42 },
    { icon: "◇", label: "Policies", href: "/policies", count: 8 },
    { icon: "↗", label: "Telemetry", href: "/telemetry" },
  ];

  const statusCounts = {
    detect: cases.filter((c) => c.status === "detect").length,
    diagnose: cases.filter((c) => c.status === "diagnose").length,
    decide: cases.filter((c) => c.status === "decide").length,
    act: cases.filter((c) => c.status === "act").length,
    verify: cases.filter((c) => c.status === "verify").length,
  };

  const openNewCaseWindow = () => {
    window.open("/case/new", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app-layout flex">
      <Sidebar items={sidebarItems} userName="Ravi Nair" caseCount={cases.length} />

      <div className="app-workspace flex-1">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="app-main-brand flex items-center gap-3">
              <Image
                src="/casezero-logo.svg"
                alt="CaseZero"
                width={128}
                height={24}
                className="h-6 w-auto"
              />
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-2xl font-bold text-gray-900">Incident Resolution</h1>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
              onClick={() => {
                openNewCaseWindow();
              }}
            >
              New Case
            </button>
          </div>
        </div>

        {/* Status overview */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-4">
          <div className="grid grid-cols-5 gap-4">
            {[
              ["Detect", statusCounts.detect, "bg-blue-50"],
              ["Diagnose", statusCounts.diagnose, "bg-purple-50"],
              ["Decide", statusCounts.decide, "bg-yellow-50"],
              ["Act", statusCounts.act, "bg-orange-50"],
              ["Verify", statusCounts.verify, "bg-green-50"],
            ].map(([label, count, bgClass]) => (
              <Link
                key={label}
                href={`/workflows#${String(label).toLowerCase()}`}
                className={`${bgClass} p-3 rounded border border-gray-300 block hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">External Support Evidence Pack Tracking</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Track evidence collection actions for Azure, AWS, Salesforce, Oracle, IBM, GitHub, and communication channels from the main dashboard.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {supportEventCount} tracked actions
                </span>
                <button
                  type="button"
                  onClick={() => {
                    router.push("/telemetry");
                  }}
                  className="px-3 py-2 rounded bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                >
                  Open telemetry log
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading cases...</div>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No cases yet</h2>
              <p className="text-gray-600 mb-4">Create your first incident case to get started.</p>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                onClick={() => {
                  openNewCaseWindow();
                }}
              >
                Create Case
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Incident Cases ({cases.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((caseItem) => (
                  <CaseCard
                    key={caseItem.id}
                    {...caseItem}
                    onClick={() => {
                      router.push(`/case/${caseItem.id}`);
                    }}
                  />
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-3">
                  Case-level support actions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cases.map((caseItem) => (
                    <button
                      key={`support-${caseItem.id}`}
                      type="button"
                      className="px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 hover:border-blue-400 hover:text-blue-700"
                      onClick={() => {
                        router.push(`/case/${caseItem.id}`);
                      }}
                    >
                      Open {caseItem.caseId} support pack
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
