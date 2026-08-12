"use client";

import { useEffect, useMemo, useState } from "react";
import { advanceRun, approveRun, createRun, enableFailureMode, rejectRun, statusLabel } from "./simulation.js";

type ScenarioKey = "certificate" | "incident" | "database" | "support" | "access" | "pipeline";

const scenarios = {
  certificate: {
    id: "CZ-1917", type: "CERTIFICATE RISK", severity: "EXPIRES IN 6 DAYS", title: "api.casezero.ai certificate expiry",
    subtitle: <>Public TLS certificate expires Aug 15 at 23:59 UTC · <code>prod-edge-tls</code></>, opened: "Opened 11 min ago",
    confidence: "High confidence · 96%", sources: 12, activity: 9,
    diagnosisTitle: "Renewal automation lost access to the DNS validation zone",
    diagnosis: "The certificate is healthy today, but its scheduled renewal failed twice because the ACME service account can no longer create the required DNS challenge. Without intervention, customer API traffic will fail TLS negotiation at expiry.",
    chain: ["IAM policy changed", "DNS write denied", "Renewal failed", "TLS outage risk"],
    recommendationTitle: "Issue replacement certificate and rotate at the edge",
    recommendation: "Create with the approved CA, validate on a shadow hostname, shift one edge region, then continue only if TLS and synthetic checks pass.",
    actionLabel: "Approve staged certificate rotation", riskValue: "1 region", riskLabel: "first-stage scope", actionStep: "Staged rotation", verifyStep: "TLS + synthetic",
    note: "Proceed with staged certificate rotation. Preserve the existing certificate for immediate rollback.",
    approvedNotice: "Rotation approved. A replacement certificate is being validated in one edge region.", rejectedNotice: "Rotation rejected. Expiry monitoring and owner escalation remain active.",
    checks: [
      ["Replacement identity verified", "SANs match api.casezero.ai and required aliases"],
      ["Private key remains non-exportable", "Generated and retained inside the managed vault"],
      ["Rollback is immediate", "Existing certificate remains active during validation"],
    ],
    stops: ["TLS handshake success falls below 99.95%", "Certificate chain differs from approved CA", "Synthetic API checks fail in the canary region"],
    metrics: [["Time to expiry", "6d 7h", "urgent", "warn"], ["Covered endpoints", "18", "all mapped", "neutral"], ["Renewal attempts", "2 failed", "last 24h", "danger"]],
    evidence: [
      ["C", "Certificate monitor", "api.casezero.ai expires Aug 15 at 23:59 UTC", "16:31:04", "blue"],
      ["V", "Vault inventory", "Replacement key policy is available and compliant", "16:32:19", "purple"],
      ["D", "DNS audit log", "ACME service account denied dns.records.create", "16:33:02", "green"],
    ],
    activities: ["CaseZero correlated the expiry alert with two failed renewal jobs.", "CaseZero mapped 18 endpoints and their current certificate chain.", "Policy engine required approval before changing edge TLS configuration."],
    policyRows: [["SECRET-ROTATION-07", "Dual-control approval"], ["CERT-CANARY-03", "One region first"]],
  },
  incident: {
    id: "CZ-1842", type: "PRODUCTION INCIDENT", severity: "SEV-2", title: "Checkout API degradation",
    subtitle: <>Elevated 5xx responses after deployment <code>checkout-api@2.18.0</code></>, opened: "Opened 18 min ago",
    confidence: "High confidence · 91%", sources: 14, activity: 8,
    diagnosisTitle: "Connection pool exhaustion in the payment adapter",
    diagnosis: "Version 2.18.0 increased concurrent payment-provider calls while retaining the previous pool limit. Saturation began within four minutes of deployment and aligns with the 5xx spike.",
    chain: ["Deploy 2.18.0", "Concurrency +40%", "Pool saturation", "Checkout failures"],
    recommendationTitle: "Roll back checkout-api to 2.17.4",
    recommendation: "Apply to 10% of traffic, observe for 5 minutes, then continue only if error rate falls below 3%.",
    actionLabel: "Approve bounded rollback", riskValue: "10%", riskLabel: "traffic capped", actionStep: "Bounded rollback", verifyStep: "Health + synthetic",
    note: "Proceed with bounded rollback. Monitor payment success rate.",
    approvedNotice: "Mitigation approved. Rollback queued with a 10% traffic limit.", rejectedNotice: "Action rejected. Incident remains in observe mode.",
    checks: [["Rollback target verified", "2.17.4 passed last production health check"], ["Scope is bounded", "Traffic cap and automatic stop conditions set"], ["Evidence is reproducible", "14 sources retained in the case audit"]],
    stops: ["Error rate rises above 15%", "Latency increases for two minutes", "Payment success rate falls below 92%"],
    metrics: [["Error rate", "12.8%", "+10.7%", "danger"], ["p95 latency", "3.4s", "+2.1s", "warn"], ["Affected requests", "18,420", "last 18m", "neutral"]],
    evidence: [["M", "Datadog monitor", "checkout-api.5xx_rate breached 5% threshold", "16:24:08", "blue"], ["D", "Deployment event", "checkout-api@2.18.0 promoted to production", "16:20:11", "purple"], ["L", "Log correlation", "HikariPool timeout found in 1,284 requests", "16:25:42", "green"]],
    activities: ["CaseZero assembled evidence and proposed a bounded rollback.", "Maya Jones confirmed customer impact in the incident channel.", "Policy engine required human approval for production mutation."],
    policyRows: [["PROD-MUTATION-04", "Human approval"], ["BLAST-RADIUS-02", "≤ 10% traffic"]],
  },
  database: {
    id: "CZ-2031", type: "DATABASE CAPACITY", severity: "SEV-2", title: "Orders database connection saturation",
    subtitle: <>Primary pool is at 96% utilization · <code>orders-prod-us-east</code></>, opened: "Opened 9 min ago", confidence: "High confidence · 93%", sources: 16, activity: 11,
    diagnosisTitle: "A reporting query is holding connections beyond its timeout", diagnosis: "A newly scheduled revenue export opens parallel full-table scans and retains idle transactions. CPU and storage remain healthy, isolating the pressure to connection lifecycle rather than database capacity.",
    chain: ["Export scheduled", "Idle transactions", "Pool at 96%", "Order timeouts"], recommendationTitle: "Cancel the export and raise the pool limit by 10%", recommendation: "Stop the offending query, apply a temporary 10% pool increase to one application replica, then continue only if wait time and error rate recover.",
    actionLabel: "Approve bounded DB remediation", riskValue: "+10%", riskLabel: "one replica", actionStep: "Query + pool", verifyStep: "Load + integrity", note: "Cancel the identified export and canary the temporary pool increase on one replica.", approvedNotice: "Database remediation approved. The export is being stopped before a one-replica pool canary.", rejectedNotice: "Remediation rejected. The database remains in observe and escalation mode.",
    checks: [["Query identity verified", "Session and application tags match the export job"], ["Change is reversible", "Pool setting expires automatically after 30 minutes"], ["Capacity remains safe", "Memory headroom supports the bounded increase"]], stops: ["Database memory exceeds 75%", "Replica lag rises above 10 seconds", "Transaction error rate fails to improve in 3 minutes"],
    metrics: [["Pool utilization", "96%", "+34%", "danger"], ["Connection wait", "2.8s", "+2.3s", "warn"], ["Idle transactions", "47", "export-owned", "neutral"]], evidence: [["D", "Database telemetry", "Connection pool sustained above 90% for 7 minutes", "16:42:11", "blue"], ["Q", "Query activity", "Revenue export owns 47 idle transactions", "16:43:02", "purple"], ["A", "Application traces", "Order requests wait on connection checkout", "16:43:38", "green"]], activities: ["CaseZero isolated the pressure to connection lifecycle.", "CaseZero verified CPU, memory, storage, and replication headroom.", "Policy engine bounded the temporary configuration change."], policyRows: [["DB-CHANGE-09", "Reversible change"], ["CAPACITY-CANARY-02", "One replica first"]],
  },
  support: {
    id: "CZ-2044", type: "CUSTOMER RESOLUTION", severity: "PRIORITY CUSTOMER", title: "Duplicate annual subscription charge",
    subtitle: <>Enterprise customer reports two charges for renewal · <code>ACCT-48291</code></>, opened: "Opened 14 min ago", confidence: "High confidence · 97%", sources: 10, activity: 7,
    diagnosisTitle: "A payment retry succeeded after the original authorization completed", diagnosis: "The first renewal completed, but a delayed webhook caused the billing worker to retry before reconciliation. Both charges settled against the same invoice; the customer has one active entitlement and is owed one full refund.",
    chain: ["Webhook delayed", "Retry submitted", "Two settlements", "Duplicate charge"], recommendationTitle: "Refund the duplicate charge and notify the customer", recommendation: "Refund only the second settlement, retain the active subscription, send a reviewed response, and verify the customer ledger returns to zero balance.",
    actionLabel: "Approve refund and response", riskValue: "$12,000", riskLabel: "single charge", actionStep: "Refund + reply", verifyStep: "Ledger + receipt", note: "Approve refund of the second settlement only and send the reviewed customer response.", approvedNotice: "Resolution approved. The duplicate settlement is queued for refund with a reviewed customer response.", rejectedNotice: "Resolution rejected. The case remains open for billing review.",
    checks: [["Duplicate proven", "Both settlements map to the same invoice and term"], ["Entitlement protected", "Active subscription remains unchanged"], ["Response reviewed", "Amount and timing are stated without unsupported promises"]], stops: ["Refund target differs from the second settlement", "Subscription entitlement would be modified", "Ledger reconciliation produces a non-zero balance"],
    metrics: [["Refund amount", "$12,000", "full duplicate", "warn"], ["Evidence matched", "10/10", "complete", "neutral"], ["Customer age", "6 years", "enterprise", "neutral"]], evidence: [["B", "Billing ledger", "Two settled payments reference invoice INV-99318", "15:18:04", "blue"], ["P", "Payment processor", "Second settlement resulted from retry idempotency miss", "15:19:12", "purple"], ["C", "CRM record", "One active subscription and no prior refund abuse", "15:20:06", "green"]], activities: ["CaseZero matched the complaint to billing and payment records.", "CaseZero drafted a refund recommendation and customer response.", "Policy engine required finance approval above the refund threshold."], policyRows: [["REFUND-LIMIT-05", "Finance approval"], ["CUSTOMER-COMMS-02", "Reviewed response"]],
  },
  access: {
    id: "CZ-2058", type: "ACCESS REVIEW", severity: "HIGH RISK", title: "Dormant contractor retains production admin",
    subtitle: <>Identity has not authenticated for 94 days · <code>alex.chen-ext</code></>, opened: "Opened 22 min ago", confidence: "High confidence · 95%", sources: 13, activity: 10,
    diagnosisTitle: "Offboarding closed the HR record but missed a nested admin group", diagnosis: "The contractor engagement ended 61 days ago. Direct access was removed, but membership in platform-operators still grants production administration through a nested group. No recent use or active exception was found.",
    chain: ["Contract ended", "Nested group missed", "Admin persists", "Unauthorized access"], recommendationTitle: "Remove nested membership and revoke active sessions", recommendation: "Remove only the inherited production-admin path, revoke existing sessions, retain the evidence snapshot, and verify unrelated historical records remain unchanged.",
    actionLabel: "Approve access revocation", riskValue: "1 identity", riskLabel: "2 entitlements", actionStep: "Revoke + sessions", verifyStep: "Access graph", note: "Approve removal of the two inherited production entitlements and revoke active sessions.", approvedNotice: "Revocation approved. Two inherited entitlements and active sessions are being removed.", rejectedNotice: "Revocation rejected. The identity remains blocked from new sessions pending owner review.",
    checks: [["Employment status verified", "HR and vendor systems confirm the engagement ended"], ["Entitlements mapped", "Only two nested production grants are targeted"], ["No active exception", "No approved break-glass or extension record exists"]], stops: ["Identity resolves to an active employee record", "Target expands beyond mapped entitlements", "Removal affects a shared service identity"],
    metrics: [["Dormant period", "94 days", "no sign-in", "warn"], ["Risky grants", "2", "production", "danger"], ["Resources exposed", "37", "via nesting", "neutral"]], evidence: [["I", "Identity provider", "Last successful sign-in occurred 94 days ago", "14:02:19", "blue"], ["H", "HR system", "Contract ended Jun 9 with no extension", "14:03:11", "purple"], ["G", "Access graph", "platform-operators grants two production roles", "14:04:27", "green"]], activities: ["CaseZero reconciled identity, HR, vendor, and entitlement records.", "CaseZero traced the nested permission path to 37 resources.", "Policy engine required resource-owner approval for revocation."], policyRows: [["ACCESS-REVOKE-04", "Owner approval"], ["IDENTITY-SCOPE-03", "Exact grants only"]],
  },
  pipeline: {
    id: "CZ-2072", type: "DATA RELIABILITY", severity: "SLA AT RISK", title: "Daily revenue pipeline failed",
    subtitle: <>Transformation stopped after schema drift · <code>revenue_daily_v4</code></>, opened: "Opened 17 min ago", confidence: "High confidence · 92%", sources: 15, activity: 12,
    diagnosisTitle: "A renamed source field broke the currency normalization step", diagnosis: "The payments feed renamed currency_code to settlement_currency without a compatible contract version. Ingestion completed, but transformation failed before publication, so the warehouse remains consistent but one day stale.",
    chain: ["Field renamed", "Contract mismatch", "Transform failed", "Revenue data stale"], recommendationTitle: "Apply the compatibility mapping and replay one partition", recommendation: "Patch the field mapping, replay only today’s quarantined partition, compare row counts and control totals, then publish if completeness reaches 100%.",
    actionLabel: "Approve partition replay", riskValue: "1 partition", riskLabel: "quarantined", actionStep: "Patch + replay", verifyStep: "Counts + totals", note: "Approve the compatibility mapping and replay only the quarantined daily partition.", approvedNotice: "Replay approved. The compatibility patch is running against one quarantined partition.", rejectedNotice: "Replay rejected. The partition remains quarantined and downstream publishing stays paused.",
    checks: [["No partial publish", "Failed partition never reached downstream tables"], ["Replay is isolated", "Only 2026-08-08 partition is targeted"], ["Controls available", "Source counts and finance totals provide independent verification"]], stops: ["Replay row count differs from source by more than 0.1%", "Control total variance exceeds $1", "Any downstream table changes before verification"],
    metrics: [["Rows quarantined", "8.42M", "one partition", "warn"], ["Completeness", "92.4%", "daily SLA", "danger"], ["Published impact", "0 rows", "safely paused", "neutral"]], evidence: [["O", "Orchestrator", "currency_normalize task failed on missing field", "05:14:03", "blue"], ["S", "Schema registry", "settlement_currency replaced currency_code", "05:15:21", "purple"], ["W", "Warehouse audit", "No rows from failed partition were published", "05:16:07", "green"]], activities: ["CaseZero traced the failure to a single incompatible schema change.", "CaseZero confirmed the failed partition is isolated and unpublished.", "Policy engine required data-owner approval before replay."], policyRows: [["DATA-REPLAY-06", "Partition scope"], ["QUALITY-GATE-08", "100% completeness"]],
  },
} as const;

export default function Home() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("certificate");
  const [runs, setRuns] = useState(() => Object.fromEntries((Object.keys(scenarios) as ScenarioKey[]).map(key => [key, createRun(key)])) as Record<ScenarioKey, ReturnType<typeof createRun>>);
  const [tab, setTab] = useState<"evidence" | "activity">("evidence");
  const [notice, setNotice] = useState("");
  const scenario = scenarios[scenarioKey];
  const run = runs[scenarioKey];

  useEffect(() => {
    if (run.status !== "executing" && run.status !== "verifying") return;
    const timer = window.setTimeout(() => {
      setRuns(old => ({ ...old, [scenarioKey]: advanceRun(old[scenarioKey]) }));
    }, run.status === "executing" ? 700 : 850);
    return () => window.clearTimeout(timer);
  }, [run.status, scenarioKey]);

  const steps = useMemo(() => [
    ["Detect", "Alert correlated", "complete"], ["Diagnose", "Evidence assembled", "complete"],
    ["Decide", run.status === "review" ? "Approval required" : statusLabel(run.status), run.status === "review" ? "active" : "complete"],
    ["Act", scenario.actionStep, run.status === "executing" ? "active" : (["verifying", "resolved", "rolled_back"].includes(run.status) ? "complete" : "pending")],
    ["Verify", scenario.verifyStep, run.status === "verifying" ? "active" : (["resolved", "rolled_back"].includes(run.status) ? "complete" : "pending")],
  ] as const, [run.status, scenario]);

  function choose(next: ScenarioKey) { setScenarioKey(next); setTab("evidence"); setNotice(""); }
  function approve() { setRuns(old => ({ ...old, [scenarioKey]: approveRun(old[scenarioKey]) })); setNotice(scenario.approvedNotice); }
  function reject() { setRuns(old => ({ ...old, [scenarioKey]: rejectRun(old[scenarioKey]) })); setNotice(scenario.rejectedNotice); }
  function reset() { setRuns(old => ({ ...old, [scenarioKey]: createRun(scenarioKey) })); setNotice("Simulation reset to the approval gate."); setTab("activity"); }
  function failSafely() { setRuns(old => ({ ...old, [scenarioKey]: enableFailureMode(old[scenarioKey]) })); setNotice("Failure mode enabled. Approval will trigger a stop condition and automatic rollback."); }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">C</span><span>CASEZERO <b>AI</b></span></div>
      <nav aria-label="Primary"><a className="nav-item active" href="#case"><span>◫</span> Cases <em>8</em></a><a className="nav-item" href="#workflows"><span>⌁</span> Workflows</a><a className="nav-item" href="#evidence"><span>◎</span> Evidence</a><a className="nav-item" href="#policies"><span>◇</span> Policies</a><a className="nav-item" href="#telemetry"><span>↗</span> Telemetry</a></nav>
      <div className="sidebar-bottom"><div className="environment"><span className="dot" /> Production <b>US-EAST</b></div><div className="profile"><span className="avatar">RN</span><span>Ravi Nair<small>Incident approver</small></span><button aria-label="More account options">•••</button></div></div>
    </aside>

    <section className="workspace" id="case">
      <header className="topbar"><div><span className="crumb">Cases /</span> {scenario.id}</div><div className="top-actions"><button className="icon-btn" aria-label="Search">⌕</button><button className="icon-btn" aria-label="Notifications">♢</button><span className={`status ${run.status}`}>{statusLabel(run.status)}</span></div></header>
      <div className="content">
        <div className="case-switcher" aria-label="Choose demonstration case">
          <button className={scenarioKey === "certificate" ? "active" : ""} onClick={() => choose("certificate")}><span className="case-symbol certificate">◇</span><span><b>Certificate expiry</b><small>api.casezero.ai · 6 days</small></span><em>NEW</em></button>
          <button className={scenarioKey === "incident" ? "active" : ""} onClick={() => choose("incident")}><span className="case-symbol incident">↗</span><span><b>API degradation</b><small>checkout-api · SEV-2</small></span></button>
          <button className={scenarioKey === "database" ? "active" : ""} onClick={() => choose("database")}><span className="case-symbol database">DB</span><span><b>Database saturation</b><small>orders-prod · 96%</small></span><em>NEW</em></button>
          <button className={scenarioKey === "support" ? "active" : ""} onClick={() => choose("support")}><span className="case-symbol support">CS</span><span><b>Customer resolution</b><small>duplicate charge</small></span><em>NEW</em></button>
          <button className={scenarioKey === "access" ? "active" : ""} onClick={() => choose("access")}><span className="case-symbol access">AR</span><span><b>Access remediation</b><small>dormant admin</small></span><em>NEW</em></button>
          <button className={scenarioKey === "pipeline" ? "active" : ""} onClick={() => choose("pipeline")}><span className="case-symbol pipeline">DP</span><span><b>Failed data pipeline</b><small>revenue_daily_v4</small></span><em>NEW</em></button>
          <div className="portfolio-proof"><strong>6</strong><span>workflows prove the<br/>portable resolution core</span></div>
        </div>

        <section className="simulation-bar" aria-label="Simulation controls"><div><span className="sim-dot"/><b>Deterministic simulation</b><small>No database · no external APIs · resettable fixtures</small></div><div><button onClick={failSafely} disabled={run.status !== "review" || run.failureMode}>{run.failureMode ? "Failure mode enabled" : "Test stop condition"}</button><button onClick={reset}>Reset case</button></div></section>

        <section className="case-head"><div><div className="eyebrow">{scenario.type} <span>{scenario.severity}</span></div><h1>{scenario.title}</h1><p>{scenario.subtitle}</p></div><div className="case-meta"><span>{scenario.opened}</span><div className="owners"><i>MJ</i><i>SK</i><i>+2</i></div></div></section>
        <section className="stepper" aria-label="Resolution workflow">{steps.map((step, index) => <div className={`step ${step[2]}`} key={step[0]}><div className="step-index">{step[2] === "complete" ? "✓" : index + 1}</div><div><b>{step[0]}</b><small>{step[1]}</small></div></div>)}</section>
        {notice && <div className="notice" role="status"><span>✓</span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}

        <div className="main-grid"><div className="primary-column">
          <section className="panel diagnosis">
            <div className="panel-title"><div><span className="spark">✦</span><h2>CaseZero diagnosis</h2><small>Generated from {scenario.sources} bounded evidence sources</small></div><span className="confidence">{scenario.confidence}</span></div>
            <div className="diagnosis-copy"><h3>{scenario.diagnosisTitle}</h3><p>{scenario.diagnosis}</p></div>
            <div className="causal-chain">{scenario.chain.map((item, index) => <span key={item} className={index === 3 ? "danger-text" : ""}>{item}{index < 3 && <b className="chain-arrow">→</b>}</span>)}</div>
            <div className="recommendation"><div><span className="rec-icon">↻</span><div><small>RECOMMENDED ACTION</small><h3>{scenario.recommendationTitle}</h3><p>{scenario.recommendation}</p></div></div><div className="risk"><small>BLAST RADIUS</small><strong>{scenario.riskValue}</strong><span>{scenario.riskLabel}</span></div></div>
          </section>

          <section className="panel"><div className="tabs"><button className={tab === "evidence" ? "active" : ""} onClick={() => setTab("evidence")}>Evidence <span>{scenario.sources}</span></button><button className={tab === "activity" ? "active" : ""} onClick={() => setTab("activity")}>Activity <span>{scenario.activity}</span></button></div>
            {tab === "evidence" ? <><div className="metric-grid">{scenario.metrics.map(item => <div className="metric" key={item[0]}><small>{item[0]}</small><strong>{item[1]}</strong><span className={item[3]}>{item[2]}</span></div>)}</div><div className="evidence-list">{scenario.evidence.map(item => <div key={item[1]}><span className={`source-icon ${item[4]}`}>{item[0]}</span><div><b>{item[1]}</b><small>{item[2]}</small></div><time>{item[3]}</time></div>)}</div></> : <div className="activity-list">{scenario.activities.map((item, i) => <p key={item}><b>{i === 2 ? "Policy engine" : "CaseZero"}</b> {item.replace(/^CaseZero |^Policy engine /, "")}</p>)}<div className="audit-divider">SIMULATION AUDIT TRAIL</div>{run.audit.map((item, index) => <p key={`${item.type}-${index}`}><b>{item.type}</b> {item.message}</p>)}</div>}
          </section>
        </div>

        <aside className="decision-column"><section className="panel decision-panel"><div className="decision-title"><span>◆</span><div><h2>{statusLabel(run.status)}</h2><p>The proposed action is policy-gated and fully auditable.</p></div></div>
          <div className="policy-checks">{scenario.checks.map(check => <div key={check[0]}><span>✓</span><p><b>{check[0]}</b><small>{check[1]}</small></p></div>)}</div>
          <div className="stop-conditions"><small>AUTOMATIC STOP CONDITIONS</small><ul>{scenario.stops.map(stop => <li key={stop}>{stop}</li>)}</ul></div>
          <label className="comment-label">Decision note<textarea key={scenarioKey} defaultValue={scenario.note}/></label>
          <button className="approve" onClick={approve} disabled={run.status !== "review"}>{run.status === "review" ? scenario.actionLabel : statusLabel(run.status)} <span>⌘↵</span></button><button className="reject" onClick={reject} disabled={run.status !== "review"}>Reject and keep observing</button><p className="audit-note">Every decision, mock tool call, verification result, and rollback is written to the in-memory audit trail.</p>
        </section>
        <section className="panel compact-panel"><div className="mini-head"><h3>Policy evaluation</h3><span>Passed 6/6</span></div>{scenario.policyRows.map(row => <div className="policy-row" key={row[0]}><span>{row[0]}</span><b>{row[1]}</b></div>)}<a href="#policies">View evaluation details →</a></section></aside>
        </div>
      </div>
    </section>
  </main>;
}
