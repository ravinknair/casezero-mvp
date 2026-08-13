"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/cases");
      if (response.ok) {
        const data = await response.json();
        setCases(data);
        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700">
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
              <div key={label} className={`${bgClass} p-3 rounded border border-gray-300`}>
                <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading cases...</div>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No cases yet</h2>
              <p className="text-gray-600 mb-4">Create your first incident case to get started.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700">
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
                      setSelectedCaseId(caseItem.id);
                      router.push(`/case/${caseItem.id}`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
