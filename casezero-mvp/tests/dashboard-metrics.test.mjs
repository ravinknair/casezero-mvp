import assert from "node:assert/strict";
import test from "node:test";
import { buildDashboardMetrics } from "../lib/dashboardMetrics.js";

const cases = [
  {
    id: "case-1",
    caseId: "CZ-1842",
    type: "PRODUCTION INCIDENT",
    severity: "SEV-2",
    title: "Checkout API degradation",
    status: "act",
    confidence: 91,
    sources: 14,
  },
  {
    id: "case-2",
    caseId: "CZ-1810",
    type: "DATA PIPELINE",
    severity: "SEV-2",
    title: "Failed data pipeline",
    status: "resolved",
    confidence: 92,
    sources: 11,
  },
  {
    id: "case-3",
    caseId: "CZ-1825",
    type: "CUSTOMER ISSUE",
    severity: "SEV-3",
    title: "Duplicate charge resolution",
    status: "detect",
    confidence: 78,
    sources: 5,
  },
];

test("dashboard metrics expose the stable response shape", () => {
  const metrics = buildDashboardMetrics(cases, [{ id: "event-1" }, { id: "event-2" }]);

  assert.deepEqual(Object.keys(metrics), [
    "openCases",
    "criticalCases",
    "pastDueCases",
    "averageResolutionHours",
    "supportEvents",
    "firstContactResolution",
    "casesBySeverity",
    "casesByType",
    "recentActivity",
  ]);
  assert.equal(metrics.openCases, 3);
  assert.equal(metrics.supportEvents, 2);
  assert.equal(metrics.averageResolutionHours, 7);
  assert.equal(metrics.recentActivity[0].tone, "info");
});

test("dashboard metrics calculate critical and past-due cases", () => {
  const metrics = buildDashboardMetrics(cases, []);

  assert.equal(metrics.criticalCases, 2);
  assert.equal(metrics.pastDueCases, 1);
  assert.deepEqual(metrics.casesBySeverity, [
    { label: "SEV-2", value: 2 },
    { label: "SEV-3", value: 1 },
  ]);
  assert.deepEqual(metrics.casesByType, [
    { label: "PRODUCTION INCIDENT", value: 1 },
    { label: "DATA PIPELINE", value: 1 },
    { label: "CUSTOMER ISSUE", value: 1 },
  ]);
});

test("empty dashboard data returns zero metrics", () => {
  const metrics = buildDashboardMetrics([], []);

  assert.equal(metrics.openCases, 0);
  assert.equal(metrics.criticalCases, 0);
  assert.equal(metrics.pastDueCases, 0);
  assert.equal(metrics.averageResolutionHours, 0);
  assert.equal(metrics.firstContactResolution.rate, null);
  assert.equal(metrics.firstContactResolution.eligibleCases, 0);
  assert.deepEqual(metrics.casesBySeverity, []);
  assert.deepEqual(metrics.recentActivity, []);
});

test("first contact resolution uses matured cases and disqualifies escalations and repeats", () => {
  const fcrCases = [
    {
      ...cases[0],
      firstContactAt: "2026-07-01T09:00:00Z",
      firstResolvedAt: "2026-07-01T09:24:00Z",
      contactChannel: "Live Chat",
      resolvedOnFirstContact: true,
      escalationCount: 0,
      reopenCount: 0,
    },
    {
      ...cases[1],
      firstContactAt: "2026-07-02T10:00:00Z",
      firstResolvedAt: "2026-07-02T11:12:00Z",
      contactChannel: "Email",
      resolvedOnFirstContact: true,
      escalationCount: 1,
      reopenCount: 0,
    },
    {
      ...cases[2],
      firstContactAt: "2026-07-03T12:00:00Z",
      firstResolvedAt: "2026-07-03T12:18:00Z",
      contactChannel: "Live Chat",
      resolvedOnFirstContact: true,
      escalationCount: 0,
      reopenCount: 1,
    },
  ];

  const metrics = buildDashboardMetrics(cases, [], [], fcrCases);

  assert.equal(metrics.firstContactResolution.rate, 33);
  assert.equal(metrics.firstContactResolution.resolvedCases, 1);
  assert.equal(metrics.firstContactResolution.eligibleCases, 3);
  assert.deepEqual(metrics.firstContactResolution.byChannel, [
    { channel: "Live Chat", rate: 50, resolvedCases: 1, eligibleCases: 2 },
    { channel: "Email", rate: 0, resolvedCases: 0, eligibleCases: 1 },
  ]);
  assert.deepEqual(metrics.firstContactResolution.failureReasons, [
    { label: "Escalated", value: 1 },
    { label: "Reopened or repeat contact", value: 1 },
  ]);
});
