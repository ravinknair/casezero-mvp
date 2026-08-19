export const mockCases = [
  {
    id: "case-cert-1",
    caseId: "CZ-1917",
    type: "CERTIFICATE RISK",
    severity: "EXPIRES IN 6 DAYS",
    title: "api.casezero.ai certificate expiry",
    subtitle: "Public TLS certificate expires Aug 15 at 23:59 UTC · prod-edge-tls",
    status: "decide",
    confidence: 96,
    sources: 12,
    activity: 9,
    useCase: {
      name: "Certificate risk prevention",
      clientProblem: "A public certificate is nearing expiry because automated renewal lost access to the DNS validation path.",
      primaryActor: "Platform engineer, infrastructure owner, operations approver",
      trigger: "Certificate monitor detects impending expiry and failed renewal attempts.",
      integrations: ["Certificate monitoring", "DNS provider", "Vault / KMS", "Edge delivery platform", "Synthetic monitoring"],
      mvpBuildScope: "Build case creation from expiry signals, policy checks, staged approval flow, and canary verification.",
      demoValue: "Strong governance-focused demo for infrastructure, reliability, and enterprise control conversations.",
    },
    diagnosis: {
      title: "Renewal automation lost access to the DNS validation zone",
      description:
        "The certificate is healthy today, but its scheduled renewal failed twice because the ACME service account can no longer create the required DNS challenge. Without intervention, customer API traffic will fail TLS negotiation at expiry.",
      chain: ["IAM policy changed", "DNS write denied", "Renewal failed", "TLS outage risk"],
    },
    recommendation: {
      title: "Issue replacement certificate and rotate at the edge",
      description:
        "Create with the approved CA, validate on a shadow hostname, shift one edge region, then continue only if TLS and synthetic checks pass.",
      actionLabel: "Approve staged certificate rotation",
      riskValue: "1 region",
      riskLabel: "first-stage scope",
      note: "Proceed with staged certificate rotation. Preserve the existing certificate for immediate rollback.",
      checks: [
        ["Replacement identity verified", "SANs match api.casezero.ai and required aliases"],
        ["Private key remains non-exportable", "Generated and retained inside the managed vault"],
        ["Rollback is immediate", "Existing certificate remains active during validation"],
      ],
      stops: [
        "TLS handshake success falls below 99.95%",
        "Certificate chain differs from approved CA",
        "Synthetic API checks fail in the canary region",
      ],
      metrics: [
        ["Time to expiry", "6d 7h", "urgent", "warn"],
        ["Covered endpoints", "18", "all mapped", "neutral"],
        ["Renewal attempts", "2 failed", "last 24h", "danger"],
      ],
      evidence: [
        ["C", "Certificate monitor", "api.casezero.ai expires Aug 15 at 23:59 UTC", "16:31:04", "blue"],
        ["V", "Vault inventory", "Replacement key policy is available and compliant", "16:32:19", "purple"],
        ["D", "DNS audit log", "ACME service account denied dns.records.create", "16:33:02", "green"],
      ],
    },
  },
  {
    id: "case-incident-1",
    caseId: "CZ-1842",
    type: "PRODUCTION INCIDENT",
    severity: "SEV-2",
    title: "Checkout API degradation",
    subtitle: "Elevated 5xx responses after deployment checkout-api@2.18.0",
    status: "act",
    confidence: 91,
    sources: 14,
    activity: 8,
    useCase: {
      name: "Production incident rollback",
      clientProblem: "A production deployment causes elevated 5xx errors and degraded checkout performance. Teams need to act fast without making the incident worse.",
      primaryActor: "Incident commander, SRE lead, engineering manager",
      trigger: "Monitoring detects a post-deploy spike in error rate, latency, and failed transactions.",
      integrations: ["Datadog", "Grafana", "Deployment system", "Service logs", "Incident management tools"],
      mvpBuildScope: "Detection, diagnosis summary, approval screen, bounded rollback action, verification dashboard.",
      demoValue: "Best flagship demo for engineering and operations buyers because it shows urgency, AI guidance, and controlled execution.",
    },
    diagnosis: {
      title: "Connection pool exhaustion in the payment adapter",
      description:
        "Version 2.18.0 increased concurrent payment-provider calls while retaining the previous pool limit. Saturation began within four minutes of deployment and aligns with the 5xx spike.",
      chain: ["Deploy 2.18.0", "Concurrency +40%", "Pool saturation", "Checkout failures"],
    },
    recommendation: {
      title: "Roll back checkout-api to 2.17.4",
      description:
        "Apply to 10% of traffic, observe for 5 minutes, then continue only if error rate falls below 3%.",
      actionLabel: "Approve bounded rollback",
      riskValue: "10%",
      riskLabel: "traffic capped",
      note: "Proceed with bounded rollback. Monitor payment success rate.",
      checks: [
        ["Rollback target verified", "2.17.4 passed last production health check"],
        ["Scope is bounded", "Traffic cap and automatic stop conditions set"],
        ["Evidence is reproducible", "14 sources retained in the case audit"],
      ],
      stops: [
        "Error rate rises above 15%",
        "Latency increases for two minutes",
        "Payment success rate falls below 92%",
      ],
      metrics: [
        ["Error rate", "12.8%", "+10.7%", "danger"],
        ["p95 latency", "3.4s", "+2.1s", "warn"],
        ["Affected requests", "18,420", "last 18m", "neutral"],
      ],
      evidence: [
        ["M", "Datadog monitor", "checkout-api.5xx_rate breached 5% threshold", "16:24:08", "blue"],
        ["D", "Deployment event", "checkout-api@2.18.0 promoted to production", "16:20:11", "purple"],
        ["L", "Log correlation", "HikariPool timeout found in 1,284 requests", "16:25:42", "green"],
      ],
    },
  },
  {
    id: "case-db-1",
    caseId: "CZ-1831",
    type: "DATABASE SATURATION",
    severity: "SEV-1",
    title: "Orders database saturation",
    subtitle: "Connection pool at 96% utilization with growing queue depth",
    status: "diagnose",
    confidence: 88,
    sources: 18,
    activity: 12,
    useCase: {
      name: "Database saturation response",
      clientProblem: "The orders database is saturating under load and background jobs are making the problem worse.",
      primaryActor: "Database reliability engineer, platform team, incident approver",
      trigger: "Pool utilization, queue depth, and replica lag breach safe thresholds.",
      integrations: ["Database telemetry", "Query observability", "Background job scheduler", "Infrastructure scaling controls"],
      mvpBuildScope: "Build multi-signal diagnosis, suggested recovery action, drain window controls, and verification metrics.",
      demoValue: "Good proof that CaseZero can handle complicated platform decisions, not only simple alerts.",
    },
    diagnosis: {
      title: "Replica lag and queue backlog are amplifying DB saturation",
      description:
        "The write pool has been above 90% utilization for 7 minutes. Database queue depth is climbing because the background inventory sync is still writing with the previous concurrency profile after a schema rollout.",
      chain: ["Schema rollout", "Write amplification", "Queue saturation", "Checkout and inventory delay"],
    },
    recommendation: {
      title: "Scale read replicas and drain the write queue",
      description:
        "Add a temporary replica, pause the expensive inventory sync, and shift non-critical read traffic away from the primary node while the backlog drains.",
      actionLabel: "Approve database failover and drain",
      riskValue: "2 replicas",
      riskLabel: "temporary capacity",
      note: "Use the existing failover path and keep the drain window under 15 minutes.",
      checks: [
        ["Replica is healthy", "One staging replica is ready to accept reads"],
        ["Queue drain window is bounded", "Background sync will halt for 10 minutes"],
        ["No critical write path is blocked", "Inventory writes remain on primary and are monitored"],
      ],
      stops: [
        "Primary latency exceeds 3.5s for more than 2 minutes",
        "Replica lag exceeds 30s",
        "Deadlocks appear in the orders write path",
      ],
      metrics: [
        ["Pool utilization", "96%", "+34%", "danger"],
        ["Queue depth", "2,880", "+1,420", "warn"],
        ["Replica lag", "21s", "+8s", "neutral"],
      ],
      evidence: [
        ["D", "Database telemetry", "Connection pool sustained above 90% for 7 minutes", "16:42:11", "blue"],
        ["Q", "Query metrics", "Inventory sync dominates the top 5 write queries", "16:45:06", "purple"],
        ["R", "Replication monitor", "Lag rose from 9s to 21s after the schema update", "16:48:50", "green"],
      ],
    },
  },
  {
    id: "case-support-1",
    caseId: "CZ-1825",
    type: "CUSTOMER ISSUE",
    severity: "SEV-3",
    title: "Duplicate charge resolution",
    subtitle: "Customer report of duplicate transaction in checkout flow",
    status: "detect",
    confidence: 78,
    sources: 5,
    activity: 3,
    useCase: {
      name: "Customer financial exception handling",
      clientProblem: "A customer is charged twice due to a retry-path failure and the business needs to resolve it accurately and safely.",
      primaryActor: "Customer operations lead, finance approver, billing support team",
      trigger: "Support case, payment event anomaly, or duplicate settlement detection.",
      integrations: ["Billing platform", "Payment gateway", "CRM / support system", "Notification tooling"],
      mvpBuildScope: "Build evidence review, approval workflow, refund action logging, and customer communication checkpoint.",
      demoValue: "Useful to show that CaseZero applies beyond infrastructure into customer and finance operations.",
    },
    diagnosis: {
      title: "Idempotency key mismatch caused a second settlement request",
      description:
        "The payment gateway retried the settlement after a timeout. The retry path reused a partially failed request ID without a matching ledger lock, creating a duplicate charge for one customer.",
      chain: ["Gateway timeout", "Retry without lock", "Second settlement", "Billing incident"],
    },
    recommendation: {
      title: "Refund the duplicate settlement and send reviewed response",
      description:
        "Approve the refund for the second settlement only, send the reviewed customer message, and keep the ledger in a strict verification state until the refund is confirmed.",
      actionLabel: "Approve refund and response",
      riskValue: "$12,000",
      riskLabel: "single charge",
      note: "Approve only the duplicate settlement and keep all other charges untouched.",
      checks: [
        ["Settlement identified", "The duplicate charge matches the same order hash"],
        ["Customer response reviewed", "Notification text is approved by billing ops"],
        ["Ledger lock is active", "All settlement activity is frozen until refund confirmation"],
      ],
      stops: [
        "More than one duplicate charge is found in the same order",
        "Refund exceeds the original charge amount",
        "Customer communication lacks billing approval",
      ],
      metrics: [
        ["Refund amount", "$12,000", "full duplicate", "warn"],
        ["Evidence matched", "10/10", "complete", "neutral"],
        ["Customer age", "6 years", "enterprise", "neutral"],
      ],
      evidence: [
        ["B", "Billing ledger", "Two settlements were created for order #99491 in a 31s window", "14:06:42", "blue"],
        ["P", "Payment gateway", "Retry fired after timeout without finalization lock", "14:08:13", "purple"],
        ["C", "Customer email", "Review copy approved by billing operations", "14:10:02", "green"],
      ],
    },
  },
  {
    id: "case-access-1",
    caseId: "CZ-1820",
    type: "ACCESS REMEDIATION",
    severity: "COMPLIANCE",
    title: "Dormant admin credential audit",
    subtitle: "Unused admin credentials active for >90 days require immediate rotation",
    status: "verify",
    confidence: 100,
    sources: 8,
    activity: 6,
    useCase: {
      name: "Access remediation and credential revocation",
      clientProblem: "Dormant administrative access remains active after a contractor or employee should have been removed.",
      primaryActor: "Security operations lead, IAM owner, compliance approver",
      trigger: "Access review, dormant identity detection, or HR offboarding mismatch.",
      integrations: ["Okta / Entra / IAM tools", "HR systems", "PAM tools", "Session management"],
      mvpBuildScope: "Build entitlement evidence, approval controls, narrow revoke action, and verification workflow.",
      demoValue: "Strong for CISO and compliance audiences because it highlights governed AI rather than autonomous AI.",
    },
    diagnosis: {
      title: "Nested production-admin path remained active after contract closure",
      description:
        "Access review flagged a service account with a nested production-admin grant that had not been revoked when the contractor left the organization. The identity remains active despite 94 days without a valid sign-in.",
      chain: ["Contract ended", "Nested group missed", "Admin persists", "Unauthorized access"],
    },
    recommendation: {
      title: "Remove nested membership and revoke active sessions",
      description:
        "Remove only the inherited production-admin path, revoke existing sessions, retain the evidence snapshot, and verify unrelated historical records remain unchanged.",
      actionLabel: "Approve access revocation",
      riskValue: "1 identity",
      riskLabel: "2 entitlements",
      note: "Approve removal of the two inherited production grants and revoke active sessions.",
      checks: [
        ["Identity confirmed inactive", "HR and vendor systems confirm the engagement ended"],
        ["Entitlements mapped", "Only two nested production grants are targeted"],
        ["No active exception", "There is no approved break-glass or extension record"],
      ],
      stops: [
        "Identity resolves to an active employee record",
        "Target expands beyond mapped entitlements",
        "Removal affects a shared service identity",
      ],
      metrics: [
        ["Inactive duration", "94 days", "no sign-in", "warn"],
        ["Risky grants", "2", "production", "danger"],
        ["Resources exposed", "37", "via nesting", "neutral"],
      ],
      evidence: [
        ["I", "Identity provider", "Last successful sign-in occurred 94 days ago", "14:02:19", "blue"],
        ["H", "HR sync", "Contract expired and vendor access was marked inactive", "14:03:46", "purple"],
        ["S", "Session log", "Three active tokens were still issuing bearer credentials", "14:08:20", "green"],
      ],
    },
  },
  {
    id: "case-pipeline-1",
    caseId: "CZ-1810",
    type: "DATA PIPELINE",
    severity: "SEV-2",
    title: "Failed data pipeline revenue_daily_v4",
    subtitle: "Daily revenue aggregation pipeline failed at 02:47 UTC",
    status: "resolved",
    confidence: 92,
    sources: 11,
    activity: 7,
    useCase: {
      name: "Data pipeline recovery",
      clientProblem: "A revenue pipeline fails due to schema drift, and replaying data without validation could create downstream business errors.",
      primaryActor: "Data platform engineer, analytics engineering lead, business operations approver",
      trigger: "Pipeline orchestrator failure, schema mismatch, or reconciliation failure.",
      integrations: ["Airflow / Dagster / dbt", "Schema registry", "Data quality tooling", "Warehouse telemetry"],
      mvpBuildScope: "Build failure case intake, compatibility validation, replay approval, and reconciliation reporting.",
      demoValue: "Good expansion story for data teams and business operations stakeholders.",
    },
    diagnosis: {
      title: "Schema drift on the revenue aggregate field map caused the daily job to fail",
      description:
        "The pipeline expected a pre-validated field set from the upstream revenue event feed. A data contract change introduced a missing field, which stopped the daily partition from landing and triggered a downstream pause.",
      chain: ["Schema drift", "Missing field", "Partition fail", "Revenue pause"],
    },
    recommendation: {
      title: "Replay the quarantined daily partition after the compatibility patch",
      description:
        "Approve the compatibility mapping and replay only the quarantined daily partition. Keep publishing paused until counts and totals match the upstream snapshot.",
      actionLabel: "Approve partition replay",
      riskValue: "1 partition",
      riskLabel: "quarantined",
      note: "Replay the quarantined partition only, then validate totals before re-enabling publishing.",
      checks: [
        ["Compatibility patch verified", "The staging contract matches the expected revenue schema"],
        ["Partition is quarantined", "Only the failed daily partition is replayed"],
        ["Totals reconcile", "Published counts match upstream snapshot within tolerance"],
      ],
      stops: [
        "Daily totals differ from upstream snapshot by more than 0.5%",
        "Unknown columns remain in the replay target set",
        "Downstream publishing resumes before reconciliation complete",
      ],
      metrics: [
        ["Pipeline success", "92.4%", "daily SLA", "danger"],
        ["Partition size", "8.42M", "one partition", "warn"],
        ["Published impact", "0 rows", "safely paused", "neutral"],
      ],
      evidence: [
        ["O", "Orchestrator", "currency_normalize task failed on missing field", "05:14:03", "blue"],
        ["S", "Schema registry", "Field contract changed on upstream revenue event feed", "05:16:11", "purple"],
        ["T", "Totals audit", "Counts matched after replay and before publish resumed", "05:42:04", "green"],
      ],
    },
  },
];

export const mockApprovals: Array<{
  id: string;
  caseId: string;
  recommendationId?: string | null;
  status: string;
  approvedBy?: string | null;
  approvalNotes?: string | null;
  decidedAt?: string | null;
}> = [
  {
    id: "approval-001",
    caseId: "case-cert-1",
    recommendationId: "recommendation-cert-1",
    status: "approved",
    approvedBy: "ravi.nair",
    approvalNotes: "Approved staged rotation with rollback preserved.",
    decidedAt: "2026-08-12T21:10:00Z",
  },
  {
    id: "approval-002",
    caseId: "case-access-1",
    recommendationId: "recommendation-access-1",
    status: "rejected",
    approvedBy: "maya.jones",
    approvalNotes: "Escalated for security review before revocation.",
    decidedAt: "2026-08-12T20:28:00Z",
  },
];

export const mockSupportInteractions = [
  { id: "support-001", caseId: "case-support-1", externalTicketId: "HD-8041", contactChannel: "Phone", firstContactAt: "2026-08-01T09:04:00Z", firstResolvedAt: "2026-08-01T09:31:00Z", resolvedOnFirstContact: true, escalationCount: 0, reopenCount: 0, repeatContactAt: null },
  { id: "support-002", caseId: null, externalTicketId: "HD-8048", contactChannel: "Phone", firstContactAt: "2026-08-02T11:12:00Z", firstResolvedAt: "2026-08-02T11:41:00Z", resolvedOnFirstContact: true, escalationCount: 0, reopenCount: 0, repeatContactAt: null },
  { id: "support-003", caseId: "case-incident-1", externalTicketId: "HD-8055", contactChannel: "Phone", firstContactAt: "2026-08-03T14:20:00Z", firstResolvedAt: "2026-08-03T18:05:00Z", resolvedOnFirstContact: false, escalationCount: 1, reopenCount: 0, repeatContactAt: null },
  { id: "support-004", caseId: null, externalTicketId: "HD-8062", contactChannel: "Live Chat", firstContactAt: "2026-08-04T08:44:00Z", firstResolvedAt: "2026-08-04T09:02:00Z", resolvedOnFirstContact: true, escalationCount: 0, reopenCount: 0, repeatContactAt: null },
  { id: "support-005", caseId: null, externalTicketId: "HD-8069", contactChannel: "Live Chat", firstContactAt: "2026-08-05T10:18:00Z", firstResolvedAt: "2026-08-05T10:39:00Z", resolvedOnFirstContact: true, escalationCount: 0, reopenCount: 0, repeatContactAt: null },
  { id: "support-006", caseId: "case-access-1", externalTicketId: "HD-8076", contactChannel: "Live Chat", firstContactAt: "2026-08-06T16:03:00Z", firstResolvedAt: "2026-08-06T16:27:00Z", resolvedOnFirstContact: true, escalationCount: 0, reopenCount: 1, repeatContactAt: "2026-08-09T13:08:00Z" },
  { id: "support-007", caseId: "case-pipeline-1", externalTicketId: "HD-8083", contactChannel: "Email", firstContactAt: "2026-08-07T07:54:00Z", firstResolvedAt: "2026-08-07T09:16:00Z", resolvedOnFirstContact: true, escalationCount: 0, reopenCount: 0, repeatContactAt: null },
  { id: "support-008", caseId: "case-db-1", externalTicketId: "HD-8090", contactChannel: "Email", firstContactAt: "2026-08-08T12:31:00Z", firstResolvedAt: null, resolvedOnFirstContact: false, escalationCount: 1, reopenCount: 0, repeatContactAt: null },
  { id: "support-009", caseId: "case-cert-1", externalTicketId: "HD-8097", contactChannel: "Self-Service / Portal", firstContactAt: "2026-08-09T15:42:00Z", firstResolvedAt: null, resolvedOnFirstContact: false, escalationCount: 0, reopenCount: 0, repeatContactAt: null },
  { id: "support-010", caseId: null, externalTicketId: "HD-8111", contactChannel: "Live Chat", firstContactAt: "2026-08-16T10:15:00Z", firstResolvedAt: "2026-08-16T10:29:00Z", resolvedOnFirstContact: true, escalationCount: 0, reopenCount: 0, repeatContactAt: null },
];
