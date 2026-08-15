"use client";

import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { mockCases } from "@/lib/mockData";

const sidebarItems = [
  { icon: "◫", label: "Cases", href: "/dashboard" },
  { icon: "⌁", label: "Workflows", href: "/workflows" },
  { icon: "◎", label: "Evidence", href: "/evidence" },
  { icon: "◇", label: "Policies", href: "/policies" },
  { icon: "↗", label: "Telemetry", href: "/telemetry" },
  { icon: "▶", label: "Demo Guide", href: "/demo", active: true },
  { icon: "✓", label: "Test Status", href: "/status" },
];

const flagshipCaseIds = ["CZ-1842", "CZ-1917"];
const flagshipCases = mockCases.filter((c) => flagshipCaseIds.includes(c.caseId));
const secondaryCases = mockCases.filter((c) => !flagshipCaseIds.includes(c.caseId));

const steps = [
  {
    title: "Open the dashboard and explain the model",
    description: "Walk through the Detect → Diagnose → Decide → Act → Verify stages before opening any single case.",
    links: [{ label: "Open dashboard", href: "/dashboard" }],
  },
  {
    title: "Lead with the flagship case",
    description: "Open Checkout API degradation or Certificate expiry — pick whichever fits the audience (engineering vs. infrastructure/compliance).",
    links: flagshipCases.map((c) => ({ label: `${c.caseId} — ${c.title}`, href: `/case/${c.id}` })),
  },
  {
    title: "Walk through evidence and the rollback story",
    description: "Inside the case: evidence, recommendation, bounded scope, approval gate, verification, and immediate rollback path.",
    links: [],
  },
  {
    title: "Show governance, trust, and outcome validation",
    description: "Use Policies to show governance, Evidence to show trust, and Telemetry to show outcome validation.",
    links: [
      { label: "Policies", href: "/policies" },
      { label: "Evidence", href: "/evidence" },
      { label: "Telemetry", href: "/telemetry" },
    ],
  },
  {
    title: "Prove reusability with a secondary case",
    description: "Pick one or two more cases to show the same pattern applies across incidents, security, data, and customer operations.",
    links: secondaryCases.map((c) => ({ label: `${c.caseId} — ${c.title}`, href: `/case/${c.id}` })),
  },
  {
    title: "Close on enterprise fit",
    description: "CaseZero sits on top of existing systems and becomes the control layer for safe operational action — it's not another dashboard.",
    links: [],
  },
];

export default function DemoGuidePage() {
  const [completed, setCompleted] = useState<boolean[]>(() => steps.map(() => false));

  const toggleStep = (index: number) => {
    setCompleted((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <div className="app-layout flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userName="Ravi Nair" />

      <main className="app-workspace flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Demo guide</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Recommended demo sequence</h1>
          <p className="mt-2 text-gray-600">A six-step script for walking a client through CaseZero live. Check off each step as you go.</p>

          <ol className="mt-8 space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={completed[index]}
                    onChange={() => toggleStep(index)}
                    className="mt-1.5 h-4 w-4 rounded border-gray-300"
                    aria-label={`Mark step ${index + 1} complete`}
                  />
                  <div className={completed[index] ? "opacity-50" : undefined}>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{index + 1}</span>
                      <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                    {step.links.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
