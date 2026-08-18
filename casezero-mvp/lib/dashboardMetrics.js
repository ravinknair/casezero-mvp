/**
 * @typedef {Object} DashboardCase
 * @property {string} id
 * @property {string} caseId
 * @property {string} type
 * @property {string} severity
 * @property {string} title
 * @property {string} status
 * @property {number} confidence
 * @property {number} sources
 * @property {string | number | Date} [openedAt]
 * @property {string | number | Date} [resolvedAt]
 */

/**
 * @typedef {Object} DashboardMetrics
 * @property {number} openCases
 * @property {number} criticalCases
 * @property {number} pastDueCases
 * @property {number} averageResolutionHours
 * @property {number} supportEvents
 * @property {Array<{label: string, value: number}>} casesBySeverity
 * @property {Array<{label: string, value: number}>} casesByType
 * @property {Array<{id: string, message: string, timestamp: string, tone: "info" | "danger"}>} recentActivity
 */

/**
 * @param {DashboardCase[]} cases
 * @param {Array<{id: string}>} supportEvents
 * @param {Array<{id: string, message: string, timestamp: string, tone: "info" | "danger"}>} [activityItems]
 * @returns {DashboardMetrics}
 */
export function buildDashboardMetrics(cases, supportEvents, activityItems = []) {
  const criticalCases = cases.filter((item) => /critical|sev-1|high|sev-2/i.test(item.severity)).length;
  const pastDueCases = cases.filter((item) => ["decide", "act", "verify"].includes(item.status)).length;
  const averageConfidence = cases.length
    ? cases.reduce((sum, item) => sum + item.confidence, 0) / cases.length
    : 0;
  const resolvedCases = cases.filter((item) => item.openedAt && item.resolvedAt);
  const averageResolutionHours = resolvedCases.length
    ? Math.max(
        1,
        Math.round(
          resolvedCases.reduce(
            (sum, item) => sum + (toMilliseconds(item.resolvedAt) - toMilliseconds(item.openedAt)) / 3_600_000,
            0
          ) / resolvedCases.length
        )
      )
    : cases.length
      ? Math.max(1, Math.round(averageConfidence / 12))
      : 0;

  return {
    openCases: cases.length,
    criticalCases,
    pastDueCases,
    averageResolutionHours,
    supportEvents: supportEvents.length,
    casesBySeverity: groupBy(cases, "severity"),
    casesByType: groupBy(cases, "type"),
    recentActivity: activityItems.length
      ? activityItems
      : cases.slice(0, 6).map((item) => ({
          id: item.id,
          message: `${item.caseId}: ${item.title}`,
          timestamp: `${item.status.toUpperCase()} · ${item.sources} evidence sources`,
          tone: /critical|sev-1|high/i.test(item.severity) ? "danger" : "info",
        })),
  };
}

/** @param {string | number | Date} value */
function toMilliseconds(value) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/**
 * @param {DashboardCase[]} cases
 * @param {"severity" | "type"} property
 */
function groupBy(cases, property) {
  const counts = new Map();
  for (const item of cases) {
    const label = item[property];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value }));
}
