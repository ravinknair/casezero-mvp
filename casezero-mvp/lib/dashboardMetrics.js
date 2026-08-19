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
 * @property {string | number | Date} [firstContactAt]
 * @property {string | number | Date} [firstResolvedAt]
 * @property {string} [contactChannel]
 * @property {boolean} [resolvedOnFirstContact]
 * @property {number} [escalationCount]
 * @property {number} [reopenCount]
 * @property {string | number | Date} [repeatContactAt]
 */

/**
 * @typedef {Object} DashboardMetrics
 * @property {number} openCases
 * @property {number} criticalCases
 * @property {number} pastDueCases
 * @property {number} averageResolutionHours
 * @property {number} supportEvents
 * @property {FirstContactResolutionMetrics} firstContactResolution
 * @property {Array<{label: string, value: number}>} casesBySeverity
 * @property {Array<{label: string, value: number}>} casesByType
 * @property {Array<{id: string, message: string, timestamp: string, tone: "info" | "danger"}>} recentActivity
 */

/**
 * @typedef {Object} FirstContactResolutionMetrics
 * @property {number | null} rate
 * @property {number} resolvedCases
 * @property {number} eligibleCases
 * @property {number} trackedCases
 * @property {number} pendingValidation
 * @property {number} repeatWindowDays
 * @property {number} targetRate
 * @property {Array<{channel: string, rate: number, resolvedCases: number, eligibleCases: number}>} byChannel
 * @property {Array<{label: string, value: number}>} failureReasons
 */

const FCR_REPEAT_WINDOW_DAYS = 7;
const FCR_TARGET_RATE = 70;
const DAY_IN_MILLISECONDS = 86_400_000;

/**
 * @param {DashboardCase[]} cases
 * @param {Array<{id: string}>} supportEvents
 * @param {Array<{id: string, message: string, timestamp: string, tone: "info" | "danger"}>} [activityItems]
 * @param {DashboardCase[]} [fcrRecords]
 * @returns {DashboardMetrics}
 */
export function buildDashboardMetrics(cases, supportEvents, activityItems = [], fcrRecords = cases) {
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
    firstContactResolution: buildFirstContactResolution(fcrRecords),
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

/** @param {DashboardCase[]} cases */
function buildFirstContactResolution(cases) {
  const now = Date.now();
  const trackedCases = cases.filter((item) => item.firstContactAt);
  const eligibleCases = trackedCases.filter(
    (item) => now - toMilliseconds(item.firstContactAt) >= FCR_REPEAT_WINDOW_DAYS * DAY_IN_MILLISECONDS
  );
  const pendingValidation = trackedCases.filter(
    (item) => item.resolvedOnFirstContact && now - toMilliseconds(item.firstContactAt) < FCR_REPEAT_WINDOW_DAYS * DAY_IN_MILLISECONDS
  ).length;
  const resolvedCases = eligibleCases.filter(qualifiesForFirstContactResolution);
  const byChannel = [...new Set(eligibleCases.map((item) => item.contactChannel || "Unspecified"))]
    .map((channel) => {
      const channelCases = eligibleCases.filter((item) => (item.contactChannel || "Unspecified") === channel);
      const channelResolvedCases = channelCases.filter(qualifiesForFirstContactResolution).length;
      return {
        channel,
        rate: percentage(channelResolvedCases, channelCases.length),
        resolvedCases: channelResolvedCases,
        eligibleCases: channelCases.length,
      };
    })
    .sort((left, right) => right.eligibleCases - left.eligibleCases || left.channel.localeCompare(right.channel));

  const failureReasons = [
    { label: "Not resolved on initial contact", value: eligibleCases.filter((item) => !item.resolvedOnFirstContact).length },
    { label: "Escalated", value: eligibleCases.filter((item) => (item.escalationCount ?? 0) > 0).length },
    { label: "Reopened or repeat contact", value: eligibleCases.filter((item) => (item.reopenCount ?? 0) > 0 || item.repeatContactAt).length },
  ].filter((item) => item.value > 0);

  return {
    rate: eligibleCases.length ? percentage(resolvedCases.length, eligibleCases.length) : null,
    resolvedCases: resolvedCases.length,
    eligibleCases: eligibleCases.length,
    trackedCases: trackedCases.length,
    pendingValidation,
    repeatWindowDays: FCR_REPEAT_WINDOW_DAYS,
    targetRate: FCR_TARGET_RATE,
    byChannel,
    failureReasons,
  };
}

/** @param {DashboardCase} item */
function qualifiesForFirstContactResolution(item) {
  return Boolean(
    item.resolvedOnFirstContact &&
      item.firstResolvedAt &&
      (item.escalationCount ?? 0) === 0 &&
      (item.reopenCount ?? 0) === 0 &&
      !item.repeatContactAt
  );
}

function percentage(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
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
