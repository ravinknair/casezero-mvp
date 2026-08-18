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
  assert.deepEqual(metrics.casesBySeverity, []);
  assert.deepEqual(metrics.recentActivity, []);
});
