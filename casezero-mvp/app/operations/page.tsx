"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type PageKey = "dashboard" | "connections" | "automations" | "incidents" | "knowledge" | "agents" | "communications" | "audit";
type ScenarioMode = "approval" | "auto";
type ExecutionStatus = "failed" | "waiting approval" | "completed";
type SeverityTone = "good" | "warn" | "bad" | "blue";

interface Tenant {
  id: string;
  name: string;
}

interface HealthState {
  build_version: string;
  cross_tenant_evidence: {
    configured: boolean;
    auth: string;
    home_tenant_id: string;
  };
  platform_identity: {
    evidence_app_client_id: string;
  };
}

interface ConnectionSource {
  id: string;
  name: string;
  status: "healthy" | "configured" | "disabled";
  authType: string;
  signalCount: number;
  webhookSecret: string;
  webhookPath: string;
  config: {
    workspace_id?: string;
    app_service_resource_id?: string;
    remediation_mode?: "disabled" | "approval" | "live";
    tenant_relationship?: string;
    connection_type?: string;
    threshold?: number;
    evaluation_window_minutes?: number;
  };
}

interface KnowledgeSource {
  id: string;
  name: string;
  status: "healthy" | "configured" | "disabled";
  authType: string;
  sourceType: "azure_blob";
  config: {
    container: string;
  };
}

interface KnowledgeDocument {
  id: string;
  title: string;
  source_ref: string;
  category: string;
  sensitivity: string;
  content: string;
}

interface WorkflowNode {
  type: string;
  name: string;
  action?: string;
}

interface Workflow {
  id: string;
  name: string;
  definition: {
    nodes: WorkflowNode[];
  };
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  origin: string;
  enabled: boolean;
  mode: ScenarioMode;
  trigger: { cooldown_minutes: number };
  workflow_id: string;
}

interface Signal {
  id: string;
  title: string;
  resource: string;
  service: string;
  receivedAt: number;
  severity: SeverityTone;
  monitor_condition: string;
  environment: string;
}

interface ExecutionEvent {
  event_type: string;
  message: string;
  created_at: number;
  data?: Record<string, string | number>;
}

interface Execution {
  id: string;
  scenario_id: string;
  scenario_name: string;
  workflow_name: string;
  status: ExecutionStatus;
  started_at: number;
  context: {
    signal: {
      title: string;
      service: string;
      resource: string;
    };
    scenario_mode: ScenarioMode;
    verification: { status: string };
    actions: Array<{ type: string; label: string }>;
    agent_outputs?: Record<string, unknown>;
  };
  events: ExecutionEvent[];
}

interface Agent {
  id: string;
  name: string;
  description: string;
  model_profile: string;
  status: string;
  version: number;
  tools: string[];
  rag: { enabled: boolean };
}

interface AuditEvent {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  created_at: number;
}

interface Broadcast {
  id: string;
  subject: string;
  body: string;
  incident: string;
  audience: string;
  recipient_count: number;
  sent_at: number;
  status: "sent";
}

interface TenantState {
  health: HealthState;
  sources: ConnectionSource[];
  knowledgeSources: KnowledgeSource[];
  documents: KnowledgeDocument[];
  scenarios: Scenario[];
  workflows: Workflow[];
  signals: Signal[];
  executions: Execution[];
  agents: Agent[];
  broadcasts: Broadcast[];
  auditEvents: AuditEvent[];
  impact: {
    avg_time_to_first_agent_minutes: number;
    assumptions: { manual_triage_minutes_per_verified_recovery: number };
  };
}

interface RagResult {
  title: string;
  category: string;
  source_ref: string;
  snippet: string;
  score: number;
}

const PAGE_TABS: Array<{ key: PageKey; label: string; icon: string }> = [
  { key: "dashboard", label: "Overview", icon: "◫" },
  { key: "connections", label: "Connections", icon: "⌁" },
  { key: "automations", label: "Automations", icon: "⌘" },
  { key: "incidents", label: "Incidents", icon: "◎" },
  { key: "knowledge", label: "Knowledge", icon: "◇" },
  { key: "agents", label: "Agents", icon: "✦" },
  { key: "communications", label: "Communications", icon: "✉" },
  { key: "audit", label: "Audit", icon: "≡" },
];

const TENANTS: Tenant[] = [
  { id: "contoso-retail", name: "Contoso Retail" },
  { id: "northwind-health", name: "Northwind Health" },
];

function fmtAge(epochSeconds: number): string {
  const seconds = Math.max(0, Date.now() / 1000 - epochSeconds);
  if (seconds < 60) return `${Math.round(seconds)}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}

function fmtTime(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleString();
}

function toneClass(tone: SeverityTone): string {
  return tone === "good"
    ? "border-emerald-700 bg-emerald-950/70 text-emerald-300"
    : tone === "warn"
      ? "border-amber-700 bg-amber-950/70 text-amber-300"
      : tone === "bad"
        ? "border-rose-700 bg-rose-950/70 text-rose-300"
        : "border-sky-700 bg-sky-950/70 text-sky-300";
}

function badgeTone(status: string): SeverityTone {
  const normalized = status.toLowerCase();
  if (["healthy", "completed", "published", "passed", "succeeded"].includes(normalized)) return "good";
  if (["failed", "rejected", "rolled_back", "disabled", "blocked"].includes(normalized)) return "bad";
  if (["waiting approval", "configured", "warning"].includes(normalized)) return "warn";
  return "blue";
}

function highlightSnippet(content: string, query: string): string {
  if (!query.trim()) return content.slice(0, 180);
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
  const lower = content.toLowerCase();
  const index = terms.reduce((best, term) => {
    const found = lower.indexOf(term);
    return found >= 0 && (best < 0 || found < best) ? found : best;
  }, -1);
  if (index < 0) return content.slice(0, 180);
  const start = Math.max(0, index - 60);
  return `${start > 0 ? "…" : ""}${content.slice(start, start + 180)}${start + 180 < content.length ? "…" : ""}`;
}

function scoreDocuments(query: string, documents: KnowledgeDocument[]): RagResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  return documents
    .map((document) => {
      const haystack = `${document.title} ${document.source_ref} ${document.category} ${document.content}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return score
        ? {
            title: document.title,
            category: document.category,
            source_ref: document.source_ref,
            snippet: highlightSnippet(document.content, query),
            score,
          }
        : null;
    })
    .filter((item): item is RagResult => item !== null)
    .sort((left, right) => right.score - left.score);
}

function buildOnboardingCommand({
  appClientId,
  customerTenantId,
  tenantRelationship,
  appInsightsResourceId,
  appServiceResourceId,
  storageAccountResourceId,
  blobContainerName,
  webhookUrl,
  loginFailureThreshold,
  evaluationWindowMinutes,
  enableAppServiceRemediation,
}: {
  appClientId: string;
  customerTenantId: string;
  tenantRelationship: string;
  appInsightsResourceId: string;
  appServiceResourceId: string;
  storageAccountResourceId: string;
  blobContainerName: string;
  webhookUrl: string;
  loginFailureThreshold: string;
  evaluationWindowMinutes: string;
  enableAppServiceRemediation: boolean;
}): string {
  return [
    ".\\scripts\\onboard-azure-customer-mvp.ps1 \\",
    `  -EvidenceAppClientId "${appClientId}" \\`,
    `  -CustomerTenantId "${customerTenantId}" \\`,
    `  -TenantRelationship "${tenantRelationship}" \\`,
    `  -ApplicationInsightsResourceId "${appInsightsResourceId}" \\`,
    `  -AppServiceResourceId "${appServiceResourceId}" \\`,
    `  -StorageAccountResourceId "${storageAccountResourceId}" \\`,
    `  -BlobContainerName "${blobContainerName}" \\`,
    `  -CaseZeroWebhookUrl "${webhookUrl}" \\`,
    `  -LoginFailureThreshold ${loginFailureThreshold} \\`,
    `  -EvaluationWindowMinutes ${evaluationWindowMinutes}${enableAppServiceRemediation ? " \\\n  -EnableAppServiceRemediation" : ""}`,
  ].join("\n");
}

function createSeededTenantState(tenantName: string): TenantState {
  const isContoso = tenantName === "Contoso Retail";
  const sourceId = isContoso ? "src_3161500953c5" : "src_9c4c6fbc6d91";
  const scenarioLogin = isContoso ? "scenario_5d62c735d88e" : "scenario_1d4d6e90c11a";
  const scenarioApi = isContoso ? "scenario_8d8bb02fa5d2" : "scenario_6c8cd5b5f1f7";
  const workflowLogin = isContoso ? "workflow_login_failures" : "workflow_health_failures";
  const workflowApi = isContoso ? "workflow_api_degradation" : "workflow_api_degradation_alt";

  const health: HealthState = {
    build_version: "2.0.0-mvp",
    cross_tenant_evidence: {
      configured: true,
      auth: "Federation ready",
      home_tenant_id: "11111111-1111-1111-1111-111111111111",
    },
    platform_identity: {
      evidence_app_client_id: "casezero-evidence-app-client-id",
    },
  };

  const sources: ConnectionSource[] = isContoso
    ? [
        {
          id: sourceId,
          name: `${tenantName} Azure Monitor`,
          status: "healthy",
          authType: "cross_tenant_federated",
          signalCount: 6,
          webhookSecret: "token_7b0f3c2e",
          webhookPath: `/api/webhooks/${sourceId}`,
          config: {
            workspace_id: "f565fa43-2eb1-40af-a604-d8fd8d9642fb",
            remediation_mode: "disabled",
            connection_type: "azure_mvp",
            tenant_relationship: "external",
          },
        },
      ]
    : [];

  const broadcasts: Broadcast[] = isContoso
    ? [
        {
          id: "broadcast-1",
          subject: "Resolved: Checkout API performance degradation",
          body:
            "The checkout API degradation has been resolved. Bounded rollback restored service, verification passed, and no further action is required.",
          incident: "Production API degradation",
          audience: "All employees",
          recipient_count: 1423,
          sent_at: (Date.now() / 1000) - 6800,
          status: "sent",
        },
      ]
    : [];

  const knowledgeSources: KnowledgeSource[] = isContoso
    ? [
        {
          id: "ks_44e7239d7c7d",
          name: `${tenantName} Blob Knowledge`,
          status: "healthy",
          authType: "storage_blob_reader",
          sourceType: "azure_blob",
          config: { container: "casezero-runbooks" },
        },
      ]
    : [];

  const documents: KnowledgeDocument[] = isContoso
    ? [
        {
          id: "doc_11b2b98326e9",
          title: "App Service Login Recovery Runbook",
          source_ref: "demo://app-service-login-runbook",
          category: "Identity & Access",
          sensitivity: "Internal",
          content:
            "If Azure App Service starts returning 401 or 403 responses, verify token audience, app settings, managed identity permissions, and outbound IP changes before applying bounded restart or slot swap remediation.",
        },
        {
          id: "doc_44e7239d7c7d",
          title: "Checkout API Recovery Runbook",
          source_ref: "demo://checkout-runbook",
          category: "Application Reliability",
          sensitivity: "Internal",
          content:
            "For elevated checkout API errors, confirm deployment health, inspect recent telemetry spikes, compare change windows, and recommend rollback only after evidence shows the regression started after the current release.",
        },
      ]
    : [];

  const workflows: Workflow[] = isContoso
    ? [
        {
          id: workflowLogin,
          name: "Login failure workflow",
          definition: {
            nodes: [
              { type: "scope", name: "Establish login impact" },
              { type: "agent", name: "Diagnose authentication failures" },
              { type: "agent", name: "Select bounded remediation" },
              { type: "approval", name: "Production change approval" },
              { type: "action", name: "Restart affected App Service", action: "azure_app_service_restart" },
              { type: "verify", name: "Verify login recovery" },
              { type: "communication", name: "Prepare verified update" },
              { type: "vendor", name: "Recommend cloud escalation if unresolved" },
            ],
          },
        },
        {
          id: workflowApi,
          name: "API degradation workflow",
          definition: {
            nodes: [
              { type: "scope", name: "Scope incident" },
              { type: "agent", name: "Troubleshoot with telemetry + tenant knowledge" },
              { type: "approval", name: "Human approval" },
              { type: "action", name: "Bounded rollback", action: "demo_rollback" },
              { type: "verify", name: "Verify recovery" },
              { type: "communication", name: "Communicate result" },
            ],
          },
        },
      ]
    : [];

  const scenarios: Scenario[] = isContoso
    ? [
        {
          id: scenarioLogin,
          name: "App Service Login Failures",
          description:
            "Starts when the customer's Azure Monitor login-failure threshold fires. Approval is required by default; auto mode is opt-in.",
          origin: "system",
          enabled: true,
          mode: "approval",
          trigger: { cooldown_minutes: 10 },
          workflow_id: workflowLogin,
        },
        {
          id: scenarioApi,
          name: "Production API degradation",
          description: "Starts when high-severity application error signals indicate production degradation.",
          origin: "system",
          enabled: true,
          mode: "approval",
          trigger: { cooldown_minutes: 15 },
          workflow_id: workflowApi,
        },
      ]
    : [];

  const signals: Signal[] = isContoso
    ? [
        {
          id: "sig_880f489b15bc",
          title: "Application login failures exceeded threshold",
          resource: "customer-login",
          service: "Azure Monitor",
          receivedAt: (Date.now() / 1000) - 1980,
          severity: "bad",
          monitor_condition: "Fired",
          environment: "production",
        },
        {
          id: "sig_a844f8bf2d04",
          title: "Checkout API error rate spiked",
          resource: "checkout-api",
          service: "Azure Monitor",
          receivedAt: (Date.now() / 1000) - 7280,
          severity: "warn",
          monitor_condition: "Fired",
          environment: "production",
        },
        {
          id: "sig_eb7c5a953eae",
          title: "Operational signal correlated with recent deployment",
          resource: "checkout-api",
          service: "Azure Monitor",
          receivedAt: (Date.now() / 1000) - 15000,
          severity: "blue",
          monitor_condition: "Evaluated",
          environment: "production",
        },
      ]
    : [];

  const executions: Execution[] = isContoso
    ? [
        {
          id: "exec_90ba7a44e0e8",
          scenario_id: scenarioLogin,
          scenario_name: "App Service Login Failures",
          workflow_name: "Login failure workflow",
          status: "failed",
          started_at: (Date.now() / 1000) - 1980,
          context: {
            signal: {
              title: "Application login failures exceeded threshold",
              service: "Azure Monitor",
              resource: "customer-login",
            },
            scenario_mode: "approval",
            verification: { status: "failed" },
            actions: [{ type: "restart_app_service", label: "Restart affected App Service" }],
            agent_outputs: {
              scoping: "Login impact localized to customer-login",
              remediation: "Bounded App Service restart selected",
            },
          },
          events: [
            {
              event_type: "signal.received",
              message: "Azure Monitor signal received",
              created_at: (Date.now() / 1000) - 1975,
              data: { severity: "bad" },
            },
            {
              event_type: "execution.started",
              message: "Workflow execution created",
              created_at: (Date.now() / 1000) - 1968,
            },
            {
              event_type: "approval.denied",
              message: "Approval was denied for safety review",
              created_at: (Date.now() / 1000) - 1955,
            },
            {
              event_type: "execution.failed",
              message: "Incident stopped safely",
              created_at: (Date.now() / 1000) - 1950,
            },
          ],
        },
        {
          id: "exec_c9fa318728f2",
          scenario_id: scenarioApi,
          scenario_name: "Production API degradation",
          workflow_name: "API degradation workflow",
          status: "completed",
          started_at: (Date.now() / 1000) - 7200,
          context: {
            signal: {
              title: "Checkout API error rate spiked",
              service: "Azure Monitor",
              resource: "checkout-api",
            },
            scenario_mode: "approval",
            verification: { status: "passed" },
            actions: [{ type: "demo_rollback", label: "Bounded rollback" }],
            agent_outputs: {
              scoping: "Checkout API rollback eligible",
              verification: "Recovered after bounded rollback",
            },
          },
          events: [
            {
              event_type: "signal.received",
              message: "Azure Monitor signal received",
              created_at: (Date.now() / 1000) - 7195,
            },
            {
              event_type: "execution.started",
              message: "Workflow execution started",
              created_at: (Date.now() / 1000) - 7188,
            },
            {
              event_type: "approval.granted",
              message: "Human approval granted",
              created_at: (Date.now() / 1000) - 7170,
            },
            {
              event_type: "action.completed",
              message: "Bounded rollback executed",
              created_at: (Date.now() / 1000) - 7160,
            },
            {
              event_type: "verification.passed",
              message: "Recovery verified",
              created_at: (Date.now() / 1000) - 7150,
            },
            {
              event_type: "execution.completed",
              message: "Execution completed successfully",
              created_at: (Date.now() / 1000) - 7145,
            },
          ],
        },
        {
          id: "exec_79c7cf8dcaa4",
          scenario_id: scenarioApi,
          scenario_name: "Production API degradation",
          workflow_name: "API degradation workflow",
          status: "waiting approval",
          started_at: (Date.now() / 1000) - 10800,
          context: {
            signal: {
              title: "Application error correlation detected",
              service: "Azure Monitor",
              resource: "checkout-api",
            },
            scenario_mode: "approval",
            verification: { status: "—" },
            actions: [{ type: "rollback", label: "Bounded rollback" }],
          },
          events: [
            {
              event_type: "signal.received",
              message: "Azure Monitor signal received",
              created_at: (Date.now() / 1000) - 10795,
            },
            {
              event_type: "execution.started",
              message: "Workflow execution waiting for approval",
              created_at: (Date.now() / 1000) - 10788,
            },
          ],
        },
      ]
    : [];

  const agents: Agent[] = isContoso
    ? [
        {
          id: "agent_comm",
          name: "Communication Agent",
          description: "Produces verified operational updates for users and responders.",
          model_profile: "cz-fast",
          status: "published",
          version: 1,
          tools: ["query_evidence", "search_knowledge"],
          rag: { enabled: false },
        },
        {
          id: "agent_escalation",
          name: "Escalation Agent",
          description: "Packages verified evidence and recommends vendor escalation when justified.",
          model_profile: "cz-balanced",
          status: "published",
          version: 1,
          tools: ["query_evidence", "search_knowledge"],
          rag: { enabled: true },
        },
        {
          id: "agent_remediation",
          name: "Remediation Agent",
          description: "Selects a bounded, policy-compliant recovery tool or stops safely.",
          model_profile: "cz-balanced",
          status: "published",
          version: 1,
          tools: ["restart_app_service"],
          rag: { enabled: true },
        },
        {
          id: "agent_scoping",
          name: "Scoping Agent",
          description: "Establishes blast radius, impact and missing evidence.",
          model_profile: "cz-fast",
          status: "published",
          version: 1,
          tools: ["query_evidence", "search_knowledge"],
          rag: { enabled: false },
        },
        {
          id: "agent_troubleshooting",
          name: "Troubleshooting Agent",
          description: "Uses telemetry plus tenant RAG to identify likely causes and safe next actions.",
          model_profile: "cz-balanced",
          status: "published",
          version: 1,
          tools: ["query_evidence", "search_knowledge"],
          rag: { enabled: true },
        },
      ]
    : [];

  const auditEvents: AuditEvent[] = isContoso
    ? [
        { id: "audit-1", action: "scenario.updated", entity_type: "scenario", entity_id: scenarioLogin, actor: "demo-admin", created_at: (Date.now() / 1000) - 120 },
        { id: "audit-2", action: "scenario.updated", entity_type: "scenario", entity_id: scenarioLogin, actor: "demo-admin", created_at: (Date.now() / 1000) - 180 },
        { id: "audit-3", action: "source.tested", entity_type: "source", entity_id: sourceId, actor: "demo-admin", created_at: (Date.now() / 1000) - 260 },
        { id: "audit-4", action: "signal.workflows_evaluated", entity_type: "signal", entity_id: "sig_880f489b15bc", actor: "demo-admin", created_at: (Date.now() / 1000) - 310 },
        { id: "audit-5", action: "signal.received", entity_type: "signal", entity_id: "sig_880f489b15bc", actor: "demo-admin", created_at: (Date.now() / 1000) - 330 },
        { id: "audit-6", action: "signal.workflows_evaluated", entity_type: "signal", entity_id: "sig_a844f8bf2d04", actor: "demo-admin", created_at: (Date.now() / 1000) - 360 },
        { id: "audit-7", action: "signal.received", entity_type: "signal", entity_id: "sig_a844f8bf2d04", actor: "demo-admin", created_at: (Date.now() / 1000) - 380 },
        { id: "audit-8", action: "signal.workflows_evaluated", entity_type: "signal", entity_id: "sig_eb7c5a953eae", actor: "demo-admin", created_at: (Date.now() / 1000) - 430 },
        { id: "audit-9", action: "execution.started", entity_type: "execution", entity_id: "exec_90ba7a44e0e8", actor: "demo-admin", created_at: (Date.now() / 1000) - 470 },
        { id: "audit-10", action: "source.tested", entity_type: "source", entity_id: sourceId, actor: "demo-admin", created_at: (Date.now() / 1000) - 520 },
        { id: "audit-11", action: "knowledge.indexed", entity_type: "document", entity_id: "doc_11b2b98326e9", actor: "demo-admin", created_at: (Date.now() / 1000) - 580 },
        { id: "audit-12", action: "execution.started", entity_type: "execution", entity_id: "exec_79c7cf8dcaa4", actor: "demo-admin", created_at: (Date.now() / 1000) - 620 },
        { id: "audit-13", action: "source.tested", entity_type: "source", entity_id: sourceId, actor: "demo-admin", created_at: (Date.now() / 1000) - 660 },
        { id: "audit-14", action: "source.tested", entity_type: "source", entity_id: sourceId, actor: "demo-admin", created_at: (Date.now() / 1000) - 700 },
        { id: "audit-15", action: "execution.completed", entity_type: "execution", entity_id: "exec_c9fa318728f2", actor: "demo-admin", created_at: (Date.now() / 1000) - 760 },
        { id: "audit-16", action: "execution.started", entity_type: "execution", entity_id: "exec_c9fa318728f2", actor: "demo-admin", created_at: (Date.now() / 1000) - 790 },
        { id: "audit-17", action: "source.tested", entity_type: "source", entity_id: sourceId, actor: "demo-admin", created_at: (Date.now() / 1000) - 830 },
        { id: "audit-18", action: "signal.workflows_evaluated", entity_type: "signal", entity_id: "sig_833abe463f80", actor: "demo-admin", created_at: (Date.now() / 1000) - 880 },
        { id: "audit-19", action: "signal.received", entity_type: "signal", entity_id: "sig_833abe463f80", actor: "demo-admin", created_at: (Date.now() / 1000) - 900 },
        { id: "audit-20", action: "source.tested", entity_type: "source", entity_id: sourceId, actor: "demo-admin", created_at: (Date.now() / 1000) - 950 },
        { id: "audit-21", action: "source.azure_monitor.external_onboarding_completed", entity_type: "source", entity_id: sourceId, actor: "external-azure-onboarding", created_at: (Date.now() / 1000) - 1000 },
        { id: "audit-22", action: "source.created", entity_type: "source", entity_id: sourceId, actor: "demo-admin", created_at: (Date.now() / 1000) - 1050 },
        { id: "audit-23", action: "knowledge.indexed", entity_type: "document", entity_id: "doc_44e7239d7c7d", actor: "demo-admin", created_at: (Date.now() / 1000) - 1120 },
      ]
    : [];

  return {
    health,
    sources,
    knowledgeSources,
    documents,
    scenarios,
    workflows,
    signals,
    executions,
    agents,
    broadcasts,
    auditEvents,
    impact: {
      avg_time_to_first_agent_minutes: 4,
      assumptions: { manual_triage_minutes_per_verified_recovery: 45 },
    },
  };
}

const INITIAL_TENANT_STATES: Record<string, TenantState> = {
  "contoso-retail": createSeededTenantState("Contoso Retail"),
  "northwind-health": {
    health: {
      build_version: "2.0.0-mvp",
      cross_tenant_evidence: {
        configured: false,
        auth: "Identity setup needed",
        home_tenant_id: "",
      },
      platform_identity: {
        evidence_app_client_id: "casezero-evidence-app-client-id",
      },
    },
    sources: [],
    knowledgeSources: [],
    documents: [],
    scenarios: [],
    workflows: [],
    signals: [],
    executions: [],
    agents: [],
    broadcasts: [],
    auditEvents: [],
    impact: {
      avg_time_to_first_agent_minutes: 0,
      assumptions: { manual_triage_minutes_per_verified_recovery: 45 },
    },
  },
};

function buildInitialTenantState(tenantId: string): TenantState {
  return INITIAL_TENANT_STATES[tenantId] ?? INITIAL_TENANT_STATES["contoso-retail"];
}

export default function OperationsPage() {
  const [authenticated, setAuthenticated] = useState(true);
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [selectedTenantId, setSelectedTenantId] = useState(TENANTS[0].id);
  const [tenantStates, setTenantStates] = useState<Record<string, TenantState>>(() => ({
    "contoso-retail": buildInitialTenantState("contoso-retail"),
    "northwind-health": buildInitialTenantState("northwind-health"),
  }));
  const [toastMessage, setToastMessage] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [drawerExecutionId, setDrawerExecutionId] = useState<string | null>(null);
  const [ragQuery, setRagQuery] = useState("How should we respond to App Service login 401 and 403 failures?");
  const [ragResults, setRagResults] = useState<RagResult[]>([]);
  const [sourceSecret, setSourceSecret] = useState<{ id: string; secret: string; path: string } | null>(null);
  const [broadcastDraft, setBroadcastDraft] = useState({
    subject: "",
    body: "",
    incident: "",
    audience: "All employees",
  });
  const [connectionForm, setConnectionForm] = useState({
    name: "Production Azure",
    relationship: "external",
    customerTenant: "",
    appInsights: "",
    appService: "",
    storage: "",
    container: "casezero-runbooks",
    threshold: "10",
    window: "5",
    remediation: false,
  });
  const toastTimer = useRef<number | null>(null);

  const tenantState = tenantStates[selectedTenantId];
  const setTenantState = useCallback((updater: (state: TenantState) => TenantState) => {
    setTenantStates((previous) => ({
      ...previous,
      [selectedTenantId]: updater(previous[selectedTenantId]),
    }));
  }, [selectedTenantId]);

  const notify = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => {
      setToastMessage("");
      toastTimer.current = null;
    }, 2800);
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, [toastMessage]);

  useEffect(() => {
    if (!authenticated) return;
    const timer = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const signalId = `sig_${now.toString(16)}`;
      setTenantState((state) => {
        const liveSignal: Signal = {
          id: signalId,
          title: "Automated signal received",
          resource: "customer-login",
          service: "Azure Monitor",
          receivedAt: now,
          severity: "warn",
          monitor_condition: "Fired",
          environment: "production",
        };
        return {
          ...state,
          signals: [liveSignal, ...state.signals],
          auditEvents: [
            {
              id: `audit-${signalId}`,
              action: "signal.received",
              entity_type: "signal",
              entity_id: signalId,
              actor: "demo-admin",
              created_at: now,
            },
            ...state.auditEvents,
          ],
        };
      });
      notify("New operational signal received");
    }, 60000);

    return () => window.clearInterval(timer);
  }, [authenticated, notify, selectedTenantId, setTenantState]);

  const verifiedRecoveries = useMemo(
    () => tenantState.executions.filter((execution) => execution.status === "completed").length,
    [tenantState.executions]
  );
  const incidentCount = tenantState.executions.length;

  const currentDrawerExecution = useMemo(
    () => tenantState.executions.find((execution) => execution.id === drawerExecutionId) ?? null,
    [drawerExecutionId, tenantState.executions]
  );

  useEffect(() => {
    if (broadcastDraft.subject || broadcastDraft.body || broadcastDraft.incident) {
      return;
    }
    const latestCompleted = [...tenantState.executions].find((execution) => execution.status === "completed");
    if (!latestCompleted) {
      return;
    }
    setBroadcastDraft({
      subject: `Resolved: ${latestCompleted.scenario_name}`,
      body: `${latestCompleted.context.signal.title} has been resolved. Verification passed and no further action is required.`,
      incident: latestCompleted.scenario_name,
      audience: "All employees",
    });
  }, [broadcastDraft.body, broadcastDraft.incident, broadcastDraft.subject, tenantState.executions]);

  const openExecution = (executionId: string) => {
    setDrawerExecutionId(executionId);
  };

  const updateExecution = (executionId: string, updater: (execution: Execution) => Execution) => {
    setTenantState((state) => ({
      ...state,
      executions: state.executions.map((execution) => (execution.id === executionId ? updater(execution) : execution)),
    }));
  };

  const appendAudit = (action: string, entityType: string, entityId: string, actor = "demo-admin") => {
    setTenantState((state) => ({
      ...state,
      auditEvents: [
        {
          id: `audit-${Date.now().toString(16)}`,
          action,
          entity_type: entityType,
          entity_id: entityId,
          actor,
          created_at: Math.floor(Date.now() / 1000),
        },
        ...state.auditEvents,
      ],
    }));
  };

  const simulateLoginAlert = () => {
    const now = Math.floor(Date.now() / 1000);
    const signalId = `sig_${Date.now().toString(16)}`;
    const executionId = `exec_${Date.now().toString(16)}`;
    const loginScenario = tenantState.scenarios[0];
    if (!loginScenario) {
      notify("No scenario matched");
      return;
    }

    const signal: Signal = {
      id: signalId,
      title: "Login failure threshold fired",
      resource: "customer-login",
      service: "Azure Monitor",
      receivedAt: now,
      severity: "bad",
      monitor_condition: "Fired",
      environment: "production",
    };

    const execution: Execution = {
      id: executionId,
      scenario_id: loginScenario.id,
      scenario_name: loginScenario.name,
      workflow_name: loginScenario.name,
      status: loginScenario.mode === "auto" ? "completed" : "waiting approval",
      started_at: now,
      context: {
        signal: {
          title: signal.title,
          service: signal.service,
          resource: signal.resource,
        },
        scenario_mode: loginScenario.mode,
        verification: { status: loginScenario.mode === "auto" ? "passed" : "—" },
        actions: [{ type: "restart_app_service", label: "Restart affected App Service" }],
        agent_outputs: {
          scoping: "Login impact localized to customer-login",
          remediation: "Bounded App Service restart selected",
        },
      },
      events: [
        {
          event_type: "signal.received",
          message: "Azure Monitor signal received",
          created_at: now,
          data: { severity: "bad" },
        },
        {
          event_type: "execution.started",
          message: "Workflow execution started",
          created_at: now + 4,
        },
        ...(loginScenario.mode === "auto"
          ? [
              {
                event_type: "approval.auto_granted",
                message: "Auto-remediation permitted by scenario policy",
                created_at: now + 8,
              },
              {
                event_type: "action.completed",
                message: "Restart action completed",
                created_at: now + 18,
              },
              {
                event_type: "verification.passed",
                message: "Login recovery verified",
                created_at: now + 30,
              },
              {
                event_type: "execution.completed",
                message: "Execution completed successfully",
                created_at: now + 35,
              },
            ]
          : [
              {
                event_type: "waiting_approval",
                message: "Waiting for production approval",
                created_at: now + 8,
              },
            ]),
      ],
    };

    setTenantState((state) => ({
      ...state,
      signals: [signal, ...state.signals],
      executions: [execution, ...state.executions],
    }));
    appendAudit("signal.received", "signal", signalId);
    appendAudit("signal.workflows_evaluated", "signal", signalId);
    appendAudit("execution.started", "execution", executionId);
    notify("Login incident workflow started");
    setActivePage("incidents");
    openExecution(executionId);
  };

  const testSource = (sourceId: string) => {
    appendAudit("source.tested", "source", sourceId);
    notify("Evidence query succeeded");
  };

  const testRemediation = (sourceId: string) => {
    appendAudit("source.remediation_tested", "source", sourceId);
    notify("App Service permission validated");
  };

  const testKnowledge = (knowledgeId: string) => {
    appendAudit("knowledge.tested", "document", knowledgeId);
    notify("Blob container is readable");
  };

  const syncKnowledge = (knowledgeId: string) => {
    appendAudit("knowledge.indexed", "document", knowledgeId);
    notify("Indexed 1 document");
  };

  const rotateToken = (sourceId: string) => {
    const secret = `token_${Math.random().toString(16).slice(2, 10)}`;
    const path = `/api/webhooks/${sourceId}`;
    setSourceSecret({ id: sourceId, secret, path });
    setTenantState((state) => ({
      ...state,
      sources: state.sources.map((source) =>
        source.id === sourceId ? { ...source, webhookSecret: secret, webhookPath: path } : source
      ),
    }));
    appendAudit("source.token_rotated", "source", sourceId);
    notify("Receiver token rotated");
  };

  const setScenarioMode = (scenarioId: string, mode: ScenarioMode) => {
    setTenantState((state) => ({
      ...state,
      scenarios: state.scenarios.map((scenario) => (scenario.id === scenarioId ? { ...scenario, mode } : scenario)),
    }));
    appendAudit("scenario.updated", "scenario", scenarioId);
    notify(mode === "auto" ? "Auto-remediation enabled" : "Approval gate enabled");
  };

  const approveExecution = (executionId: string) => {
    updateExecution(executionId, (execution) => ({
      ...execution,
      status: "completed",
      context: {
        ...execution.context,
        verification: { status: "passed" },
      },
      events: [
        ...execution.events,
        {
          event_type: "approval.granted",
          message: "Human approval granted",
          created_at: Math.floor(Date.now() / 1000),
        },
        {
          event_type: "action.completed",
          message: "Bounded remediation executed",
          created_at: Math.floor(Date.now() / 1000) + 10,
        },
        {
          event_type: "verification.passed",
          message: "Recovery verified",
          created_at: Math.floor(Date.now() / 1000) + 20,
        },
        {
          event_type: "execution.completed",
          message: "Execution completed successfully",
          created_at: Math.floor(Date.now() / 1000) + 25,
        },
      ],
    }));
    appendAudit("execution.approved", "execution", executionId);
    notify("Approval granted");
  };

  const denyExecution = (executionId: string) => {
    updateExecution(executionId, (execution) => ({
      ...execution,
      status: "failed",
      context: {
        ...execution.context,
        verification: { status: "failed" },
      },
      events: [
        ...execution.events,
        {
          event_type: "approval.denied",
          message: "Workflow stopped safely",
          created_at: Math.floor(Date.now() / 1000),
        },
        {
          event_type: "execution.failed",
          message: "Execution halted before remediation",
          created_at: Math.floor(Date.now() / 1000) + 6,
        },
      ],
    }));
    appendAudit("execution.denied", "execution", executionId);
    notify("Workflow stopped safely");
  };

  const reverifyExecution = (executionId: string) => {
    updateExecution(executionId, (execution) => ({
      ...execution,
      context: {
        ...execution.context,
        verification: { status: "passed" },
      },
      events: [
        ...execution.events,
        {
          event_type: "verification.passed",
          message: "Verification query completed",
          created_at: Math.floor(Date.now() / 1000),
        },
      ],
    }));
    appendAudit("execution.verified", "execution", executionId);
    notify("Verification query completed");
  };

  const draftResolutionBroadcast = (execution: Execution) => {
    setBroadcastDraft({
      subject: `Resolved: ${execution.scenario_name}`,
      body: `${execution.context.signal.title} has been resolved. Verification passed and no further action is required.`,
      incident: execution.scenario_name,
      audience: "All employees",
    });
    setActivePage("communications");
    notify("Broadcast draft prepared");
  };

  const sendBroadcast = () => {
    const now = Math.floor(Date.now() / 1000);
    const draftSubject = broadcastDraft.subject.trim();
    const draftBody = broadcastDraft.body.trim();
    if (!draftSubject || !draftBody) {
      notify("Subject and body are required");
      return;
    }

    const newBroadcast: Broadcast = {
      id: `broadcast-${Date.now().toString(16)}`,
      subject: draftSubject,
      body: draftBody,
      incident: broadcastDraft.incident.trim() || "Resolved incident",
      audience: broadcastDraft.audience,
      recipient_count: 1423,
      sent_at: now,
      status: "sent",
    };

    setTenantState((state) => ({
      ...state,
      broadcasts: [newBroadcast, ...state.broadcasts],
      auditEvents: [
        {
          id: `audit-${Date.now().toString(16)}`,
          action: "broadcast.sent",
          entity_type: "broadcast",
          entity_id: newBroadcast.id,
          actor: "demo-admin",
          created_at: now,
        },
        ...state.auditEvents,
      ],
    }));

    setBroadcastDraft({
      subject: "",
      body: "",
      incident: "",
      audience: "All employees",
    });
    notify("Company-wide update sent");
  };

  const runRagSearch = () => {
    const results = scoreDocuments(ragQuery, tenantState.documents);
    setRagResults(results);
    appendAudit("knowledge.search", "query", `rag:${Date.now().toString(16)}`);
  };

  const createReceiver = () => {
    const sourceId = `src_${Date.now().toString(16)}`;
    const secret = `token_${Math.random().toString(16).slice(2, 10)}`;
    const path = `/api/webhooks/${selectedTenantId}/${sourceId}`;
    const webhookUrl = `${window.location.origin}${path}?token=${encodeURIComponent(secret)}`;

    setTenantState((state) => ({
      ...state,
      sources: [
        {
          id: sourceId,
          name: connectionForm.name || "Production Azure",
          status: "healthy",
          authType: "cross_tenant_federated",
          signalCount: 0,
          webhookSecret: secret,
          webhookPath: path,
          config: {
            workspace_id: connectionForm.appInsights || "f565fa43-2eb1-40af-a604-d8fd8d9642fb",
            app_service_resource_id: connectionForm.appService || undefined,
            remediation_mode: connectionForm.remediation ? "approval" : "disabled",
            tenant_relationship: connectionForm.relationship,
            connection_type: "azure_mvp",
            threshold: Number(connectionForm.threshold) || 10,
            evaluation_window_minutes: Number(connectionForm.window) || 5,
          },
        },
        ...state.sources,
      ],
      auditEvents: [
        {
          id: `audit-${Date.now().toString(16)}`,
          action: "source.created",
          entity_type: "source",
          entity_id: sourceId,
          actor: "demo-admin",
          created_at: Math.floor(Date.now() / 1000),
        },
        ...state.auditEvents,
      ],
    }));

    setSourceSecret({ id: sourceId, secret, path });
    setShowConnectModal(false);
    appendAudit("source.azure_monitor.external_onboarding_completed", "source", sourceId, "external-azure-onboarding");
    notify("Customer receiver created");
    void navigator.clipboard.writeText(
      buildOnboardingCommand({
        appClientId: tenantState.health.platform_identity.evidence_app_client_id,
        customerTenantId: connectionForm.customerTenant || "<CUSTOMER-TENANT-ID>",
        tenantRelationship: connectionForm.relationship,
        appInsightsResourceId: connectionForm.appInsights || "<APP-INSIGHTS-RESOURCE-ID>",
        appServiceResourceId: connectionForm.appService || "<APP-SERVICE-RESOURCE-ID>",
        storageAccountResourceId: connectionForm.storage || "<STORAGE-ACCOUNT-RESOURCE-ID>",
        blobContainerName: connectionForm.container || "casezero-runbooks",
        webhookUrl,
        loginFailureThreshold: connectionForm.threshold || "10",
        evaluationWindowMinutes: connectionForm.window || "5",
        enableAppServiceRemediation: connectionForm.remediation,
      })
    );
  };

  const recentExecutions = [...tenantState.executions].sort((left, right) => right.started_at - left.started_at);
  const latestSignals = [...tenantState.signals].sort((left, right) => right.receivedAt - left.receivedAt);
  const estimatedAvoided = verifiedRecoveries * tenantState.impact.assumptions.manual_triage_minutes_per_verified_recovery;
  const platformReady = tenantState.health.cross_tenant_evidence.configured;
  const ragSearchResults = ragResults.length ? ragResults : scoreDocuments(ragQuery, tenantState.documents).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-950/95 p-5 lg:sticky lg:top-0 lg:h-screen">
          <div className="flex items-center gap-3 pb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 font-black text-slate-950">CZ</div>
            <div>
              <div className="font-bold">CaseZero</div>
              <div className="text-xs text-slate-400">Support Operations</div>
            </div>
          </div>
          <nav className="space-y-2">
            {PAGE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActivePage(tab.key)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                  activePage === tab.key
                    ? "border-emerald-400 bg-slate-900 text-white"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  {tenantState.health.build_version} · {platformReady ? "Federation ready" : "Identity setup needed"}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300"
              onClick={() => setAuthenticated(false)}
            >
              Pause live updates
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">AUTONOMOUS SUPPORT OPERATIONS</div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  {PAGE_TABS.find((tab) => tab.key === activePage)?.label ?? "Overview"}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                  value={selectedTenantId}
                  onChange={(event) => {
                    setSelectedTenantId(event.target.value);
                    setDrawerExecutionId(null);
                    setRagResults([]);
                  }}
                >
                  {TENANTS.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium"
                  onClick={simulateLoginAlert}
                >
                  Simulate login alert
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950"
                  onClick={() => setShowConnectModal(true)}
                >
                  Connect Azure customer
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1500px] px-5 py-7">
            {activePage === "dashboard" ? (
              <div className="space-y-5">
                <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">RESOLVE BEFORE YOU ESCALATE</div>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">From threshold breach to verified recovery.</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                      CaseZero turns customer telemetry into an auditable agentic workflow: scope the incident, pull live
                      evidence, retrieve customer runbooks, choose a bounded action, enforce approval policy, and verify the
                      result before escalation.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 self-center">
                    {["Azure Monitor", "Evidence", "RAG", "Agents", "Action", "Verify"].map((pill, index) => (
                      <div key={pill} className="flex items-center gap-2">
                        <span className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200">{pill}</span>
                        {index < 5 ? <span className="text-slate-600">→</span> : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-4">
                  <MetricCard
                    tone="blue"
                    label="Incidents detected"
                    value={incidentCount}
                    sub="Workflow executions from real/demo signals"
                  />
                  <MetricCard
                    tone="good"
                    label="Verified recoveries"
                    value={verifiedRecoveries}
                    sub="Passed telemetry verification"
                  />
                  <MetricCard
                    tone="blue"
                    label="Time to first agent"
                    value={tenantState.impact.avg_time_to_first_agent_minutes}
                    suffix="m"
                    sub="Observed workflow timing"
                  />
                  <MetricCard
                    tone="warn"
                    label="Estimated toil avoided"
                    value={estimatedAvoided}
                    suffix="m"
                    sub={`MVP estimate · ${tenantState.impact.assumptions.manual_triage_minutes_per_verified_recovery}m/verified recovery`}
                  />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
                  <Card>
                    <SectionHead title="Recent incident runs" description="Every agent, tool call, approval and verification is traceable." />
                    <div className="divide-y divide-slate-800">
                      {recentExecutions.slice(0, 6).map((execution) => (
                        <button
                          key={execution.id}
                          type="button"
                          onClick={() => openExecution(execution.id)}
                          className="grid w-full grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr] gap-3 py-4 text-left hover:bg-slate-950/60"
                        >
                          <div>
                            <div className="font-semibold text-slate-100">{execution.scenario_name}</div>
                            <div className="mt-1 text-xs text-slate-400">{execution.context.signal.resource} · {fmtAge(execution.started_at)}</div>
                          </div>
                          <Badge label={execution.status} tone={badgeTone(execution.status)} />
                          <div className="text-sm text-slate-300">{execution.context.verification.status || "—"}</div>
                          <div className="text-sm text-slate-300">{execution.context.actions.length} action</div>
                        </button>
                      ))}
                      {!recentExecutions.length ? <EmptyState text="No incidents yet. Azure Monitor signals will appear here." /> : null}
                    </div>
                  </Card>

                  <Card>
                    <SectionHead title="Operational readiness" description="Minimum connected loop for the MVP." />
                    <ReadinessRow name="Azure Monitor signal + evidence" ok={tenantState.sources.some((source) => source.status === "healthy")} detail={tenantState.sources[0]?.status ?? "not configured"} />
                    <ReadinessRow
                      name="App Service remediation target"
                      ok={Boolean(tenantState.sources[0]?.config.app_service_resource_id)}
                      detail={tenantState.sources[0]?.config.remediation_mode ?? "not configured"}
                    />
                    <ReadinessRow
                      name="Azure Blob customer knowledge"
                      ok={tenantState.knowledgeSources.some((source) => source.sourceType === "azure_blob")}
                      detail={tenantState.knowledgeSources[0]?.status ?? "not configured"}
                    />
                    <ReadinessRow
                      name="Cross-tenant workload identity"
                      ok={tenantState.health.cross_tenant_evidence.configured}
                      detail={tenantState.health.cross_tenant_evidence.auth}
                    />
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
                      Impact is shown as observed workflow metrics plus explicitly labeled MVP estimates; replace assumptions with
                      customer baseline data for production ROI reporting.
                    </div>
                  </Card>
                </div>

                <Card>
                  <SectionHead title="Latest signals" description="Normalized events entering the CaseZero control loop." />
                  <div className="divide-y divide-slate-800">
                    {latestSignals.slice(0, 6).map((signal) => (
                      <div key={signal.id} className="grid grid-cols-1 gap-3 py-4 md:grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr] md:items-center">
                        <div>
                          <div className="font-semibold text-slate-100">{signal.title}</div>
                          <div className="mt-1 text-xs text-slate-400">{signal.service} · {fmtAge(signal.receivedAt)}</div>
                        </div>
                        <Badge label={signal.severity} tone={badgeTone(signal.severity)} />
                        <div className="text-sm text-slate-300">{signal.monitor_condition}</div>
                        <div className="text-sm text-slate-300">{signal.environment}</div>
                      </div>
                    ))}
                    {!latestSignals.length ? <EmptyState text="Waiting for customer signals." /> : null}
                  </div>
                </Card>
              </div>
            ) : null}

            {activePage === "connections" ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <SectionHead
                    title="Customer connection plane"
                    description="Signals, read-only evidence, bounded remediation and knowledge are scoped to the customer tenant."
                  />
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
                    onClick={() => setShowConnectModal(true)}
                  >
                    Connect customer
                  </button>
                </div>
                <div className="grid gap-4 xl:grid-cols-3">
                  <Card>
                    <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">OBSERVABILITY</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-100">{tenantState.sources[0]?.name ?? "Azure Monitor / App Insights"}</h3>
                    <div className="mt-1 text-sm text-slate-400">Azure Monitor / App Insights</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge label={tenantState.sources[0]?.status ?? "configured"} tone={badgeTone(tenantState.sources[0]?.status ?? "configured")} />
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{tenantState.sources[0]?.authType ?? "cross_tenant_federated"}</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-300">
                      Workspace: {tenantState.sources[0]?.config.workspace_id ?? "Awaiting onboarding"}
                      <br />
                      Signals received: {tenantState.sources[0]?.signalCount ?? 0}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button type="button" className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={() => testSource(tenantState.sources[0]?.id ?? sourceIdFallback())}>
                        Test evidence
                      </button>
                      <button type="button" className="rounded-xl border border-slate-700 px-3 py-2 text-sm" onClick={() => rotateToken(tenantState.sources[0]?.id ?? sourceIdFallback())}>
                        Rotate token
                      </button>
                    </div>
                  </Card>

                  <Card>
                    <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">REMEDIATION</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-100">App Service</h3>
                    <div className="mt-1 text-sm text-slate-400">Bounded production tool</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge label={tenantState.sources[0]?.config.app_service_resource_id ? "healthy" : "configured"} tone={badgeTone(tenantState.sources[0]?.config.app_service_resource_id ? "healthy" : "configured")} />
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                        {tenantState.sources[0]?.config.remediation_mode ?? "disabled"}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-300">
                      {tenantState.sources[0]?.config.app_service_resource_id ?? "No App Service resource ID configured"}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-50"
                        disabled={!tenantState.sources[0]?.config.app_service_resource_id}
                        onClick={() => testRemediation(tenantState.sources[0]?.id ?? sourceIdFallback())}
                      >
                        Test permission
                      </button>
                    </div>
                  </Card>

                  <Card>
                    <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">CUSTOMER KNOWLEDGE</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-100">{tenantState.knowledgeSources[0]?.name ?? "Azure Blob Knowledge"}</h3>
                    <div className="mt-1 text-sm text-slate-400">Azure Blob Storage</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge label={tenantState.knowledgeSources[0]?.status ?? "configured"} tone={badgeTone(tenantState.knowledgeSources[0]?.status ?? "configured")} />
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{tenantState.knowledgeSources[0]?.authType ?? "storage_blob_reader"}</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-300">{tenantState.knowledgeSources[0]?.config.container ?? "casezero-runbooks"}</p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-slate-700 px-3 py-2 text-sm"
                        onClick={() => testKnowledge(tenantState.documents[0]?.id ?? "doc_11b2b98326e9")}
                      >
                        Test blob
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-slate-700 px-3 py-2 text-sm"
                        onClick={() => syncKnowledge(tenantState.documents[0]?.id ?? "doc_11b2b98326e9")}
                      >
                        Sync
                      </button>
                    </div>
                  </Card>
                </div>
                {sourceSecret ? (
                  <Card>
                    <SectionHead title="Receiver token rotated" description="Update the Azure Action Group webhook." />
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                      <div className="font-semibold text-slate-100">Receiver path</div>
                      <div className="mt-1 font-mono text-xs break-all">{sourceSecret.path}</div>
                      <div className="mt-4 font-semibold text-slate-100">Secret</div>
                      <div className="mt-1 font-mono text-xs break-all">{sourceSecret.secret}</div>
                    </div>
                  </Card>
                ) : null}
              </div>
            ) : null}

            {activePage === "automations" ? (
              <div className="space-y-5">
                <SectionHead title="Autonomous scenarios" description="Detection is deterministic; agents reason inside a policy-controlled workflow." />
                <div className="space-y-4">
                  {tenantState.scenarios.map((scenario) => {
                    const workflow = tenantState.workflows.find((item) => item.id === scenario.workflow_id);
                    return (
                      <Card key={scenario.id}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">{scenario.origin} scenario</div>
                            <h3 className="mt-1 text-2xl font-semibold text-slate-100">{scenario.name}</h3>
                            <p className="mt-2 max-w-3xl text-sm text-slate-300">{scenario.description}</p>
                          </div>
                          <select
                            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                            value={scenario.mode}
                            onChange={(event) => setScenarioMode(scenario.id, event.target.value as ScenarioMode)}
                          >
                            <option value="approval">Approval gated</option>
                            <option value="auto">Auto-remediation</option>
                          </select>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">cooldown {scenario.trigger.cooldown_minutes}m</span>
                          <Badge label={scenario.enabled ? "healthy" : "disabled"} tone={badgeTone(scenario.enabled ? "healthy" : "disabled")} />
                          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                            {scenario.workflow_id ? "workflow linked" : "no workflow"}
                          </span>
                        </div>
                        {workflow ? (
                          <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-2">
                            {workflow.definition.nodes.map((node, index) => (
                              <div key={`${workflow.id}-${index}`} className="flex items-center gap-2">
                                {index > 0 ? <span className="text-slate-600">→</span> : null}
                                <div className="min-w-[160px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-3">
                                  <div className="text-xs text-slate-500">{node.type}</div>
                                  <div className="mt-1 text-sm font-semibold text-slate-100">{node.name}</div>
                                  {node.action ? <div className="mt-1 text-xs text-slate-400">{node.action}</div> : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activePage === "incidents" ? (
              <div className="space-y-5">
                <SectionHead title="Incident runs" description="One execution = one auditable attempt to resolve before escalation." />
                <Card>
                  <div className="divide-y divide-slate-800">
                    {recentExecutions.map((execution) => (
                      <button
                        key={execution.id}
                        type="button"
                        onClick={() => openExecution(execution.id)}
                        className="grid w-full grid-cols-1 gap-3 py-4 text-left md:grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr]"
                      >
                        <div>
                          <div className="font-semibold text-slate-100">{execution.scenario_name}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            {execution.context.signal.resource} · {fmtAge(execution.started_at)}
                          </div>
                        </div>
                        <Badge label={execution.status} tone={badgeTone(execution.status)} />
                        <div className="text-sm text-slate-300">{execution.context.verification.status}</div>
                        <div className="text-sm text-slate-300">{execution.context.actions.length} action</div>
                      </button>
                    ))}
                    {!recentExecutions.length ? <EmptyState text="No incident runs yet." /> : null}
                  </div>
                </Card>
              </div>
            ) : null}

            {activePage === "knowledge" ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
                <div className="space-y-5">
                  <SectionHead title="Customer knowledge sources" description="RAG content remains tenant-scoped and is retrieved as untrusted evidence." />
                  <div className="grid gap-4">
                    {tenantState.knowledgeSources.length ? (
                      tenantState.knowledgeSources.map((knowledgeSource) => (
                        <Card key={knowledgeSource.id}>
                          <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">NOT CONNECTED</div>
                          <h3 className="mt-2 text-xl font-semibold text-slate-100">{knowledgeSource.name}</h3>
                          <div className="mt-1 text-sm text-slate-400">Azure Blob Storage</div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge label={knowledgeSource.status} tone={badgeTone(knowledgeSource.status)} />
                            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{knowledgeSource.authType}</span>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <EmptyState text="Connect an Azure Blob container to sync customer runbooks." />
                    )}
                  </div>

                  <Card>
                    <SectionHead title="Indexed documents" description={`${tenantState.documents.length} documents`} />
                    <div className="divide-y divide-slate-800">
                      {tenantState.documents.map((document) => (
                        <div key={document.id} className="grid grid-cols-[1.5fr_0.7fr_0.7fr] gap-3 py-4">
                          <div>
                            <div className="font-semibold text-slate-100">{document.title}</div>
                            <div className="mt-1 text-xs text-slate-400">{document.source_ref}</div>
                          </div>
                          <div className="text-sm text-slate-300">{document.category}</div>
                          <div className="text-sm text-slate-300">{document.sensitivity}</div>
                        </div>
                      ))}
                      {!tenantState.documents.length ? <EmptyState text="No indexed knowledge yet." /> : null}
                    </div>
                  </Card>
                </div>

                <Card>
                  <SectionHead title="RAG retrieval test" description="See exactly what an agent can retrieve for this tenant." />
                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none"
                      value={ragQuery}
                      onChange={(event) => setRagQuery(event.target.value)}
                    />
                    <button type="button" className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950" onClick={runRagSearch}>
                      Search
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {ragSearchResults.length ? (
                      ragSearchResults.map((result) => (
                        <div key={`${result.title}-${result.source_ref}`} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold text-slate-100">{result.title}</div>
                            <div className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{result.score}</div>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {result.category} · {result.source_ref}
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">{result.snippet}</p>
                        </div>
                      ))
                    ) : (
                      <EmptyState text="No relevant chunks." />
                    )}
                  </div>
                </Card>
              </div>
            ) : null}

            {activePage === "agents" ? (
              <div className="space-y-5">
                <SectionHead title="Agent mesh" description="Specialized agents operate inside explicit model, RAG and tool contracts." />
                <div className="grid gap-4 xl:grid-cols-3">
                  {tenantState.agents.map((agent) => (
                    <Card key={agent.id}>
                      <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">{agent.model_profile}</div>
                      <h3 className="mt-2 text-xl font-semibold text-slate-100">{agent.name}</h3>
                      <p className="mt-2 text-sm text-slate-300">{agent.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge label={agent.status} tone={badgeTone(agent.status)} />
                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">v{agent.version}</span>
                      </div>
                      <div className="mt-4 text-sm text-slate-300">
                        Tools: {agent.tools.join(", ")}
                        <br />
                        RAG: {agent.rag.enabled ? "enabled" : "disabled"}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            {activePage === "audit" ? (
              <div className="space-y-5">
                <SectionHead title="Audit trail" description="Connector changes, signals, agents, approvals, tool calls and vendor actions." />
                <Card>
                  <div className="divide-y divide-slate-800">
                    {tenantState.auditEvents.map((event) => (
                      <div key={event.id} className="grid grid-cols-1 gap-3 py-4 md:grid-cols-[1fr_1fr_0.7fr]">
                        <div>
                          <div className="font-semibold text-slate-100">{event.action}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            {event.entity_type} · {event.entity_id}
                          </div>
                        </div>
                        <div className="text-sm text-slate-300">{event.actor}</div>
                        <div className="text-sm text-slate-300">{fmtAge(event.created_at)}</div>
                      </div>
                    ))}
                    {!tenantState.auditEvents.length ? <EmptyState text="No audit events captured yet." /> : null}
                  </div>
                </Card>
              </div>
            ) : null}

            {activePage === "communications" ? (
              <div className="space-y-5">
                <SectionHead
                  title="Company-wide broadcasts"
                  description="Send a resolution notice to the organization once the issue is verified as resolved."
                />
                <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <Card>
                    <div className="grid gap-4">
                      <InputField
                        label="Subject"
                        value={broadcastDraft.subject}
                        onChange={(value) => setBroadcastDraft((current) => ({ ...current, subject: value }))}
                        placeholder="Resolved: Checkout API degradation"
                      />
                      <InputField
                        label="Resolved incident"
                        value={broadcastDraft.incident}
                        onChange={(value) => setBroadcastDraft((current) => ({ ...current, incident: value }))}
                        placeholder="Production API degradation"
                      />
                      <InputField
                        label="Audience"
                        value={broadcastDraft.audience}
                        onChange={(value) => setBroadcastDraft((current) => ({ ...current, audience: value }))}
                        placeholder="All employees"
                      />
                      <label className="block text-sm text-slate-300">
                        <span>Message</span>
                        <textarea
                          className="mt-2 min-h-44 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                          value={broadcastDraft.body}
                          onChange={(event) => setBroadcastDraft((current) => ({ ...current, body: event.target.value }))}
                          placeholder="Add the resolution summary, verification status, and any follow-up context."
                        />
                      </label>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-400">
                        This is the company-wide announcement channel for resolved incidents.
                      </div>
                      <button
                        type="button"
                        className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
                        onClick={sendBroadcast}
                      >
                        Send company-wide email
                      </button>
                    </div>
                  </Card>

                  <Card>
                    <SectionHead title="Recent broadcasts" description="Verified resolution notices already sent." />
                    <div className="space-y-3">
                      {tenantState.broadcasts.map((broadcast) => (
                        <div key={broadcast.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold text-slate-100">{broadcast.subject}</div>
                              <div className="mt-1 text-xs text-slate-400">
                                {broadcast.audience} · {broadcast.recipient_count} recipients · {fmtAge(broadcast.sent_at)}
                              </div>
                            </div>
                            <Badge label={broadcast.status} tone="good" />
                          </div>
                          <div className="mt-3 text-sm text-slate-300">{broadcast.body}</div>
                        </div>
                      ))}
                      {!tenantState.broadcasts.length ? <EmptyState text="No broadcasts sent yet." /> : null}
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {showConnectModal ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/80 p-6 backdrop-blur">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">CUSTOMER ONBOARDING</div>
                <h2 className="mt-1 text-2xl font-semibold text-slate-100">Connect Azure workload</h2>
              </div>
              <button type="button" className="rounded-xl border border-slate-800 px-3 py-2" onClick={() => setShowConnectModal(false)}>
                ×
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["1", "Create CaseZero receiver"],
                ["2", "Run customer script"],
                ["3", "Verify connections"],
              ].map(([step, label]) => (
                <div key={step} className={`rounded-2xl border px-4 py-3 ${step === "1" ? "border-emerald-400 bg-slate-950" : "border-slate-800 bg-slate-950"}`}>
                  <div className="text-lg font-bold text-emerald-400">{step}</div>
                  <div className="mt-1 text-sm text-slate-200">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InputField label="Connection name" value={connectionForm.name} onChange={(value) => setConnectionForm((current) => ({ ...current, name: value }))} />
              <SelectField
                label="Tenant relationship"
                value={connectionForm.relationship}
                onChange={(value) => setConnectionForm((current) => ({ ...current, relationship: value }))}
                options={[
                  ["external", "External Entra tenant"],
                  ["same", "Same Entra tenant"],
                ]}
              />
              <InputField
                label="Customer Entra tenant ID"
                value={connectionForm.customerTenant}
                onChange={(value) => setConnectionForm((current) => ({ ...current, customerTenant: value }))}
                placeholder="00000000-0000-0000-0000-000000000000"
              />
              <InputField
                label="Application Insights resource ID"
                value={connectionForm.appInsights}
                onChange={(value) => setConnectionForm((current) => ({ ...current, appInsights: value }))}
                placeholder="/subscriptions/.../providers/microsoft.insights/components/..."
              />
              <InputField
                label="App Service resource ID"
                value={connectionForm.appService}
                onChange={(value) => setConnectionForm((current) => ({ ...current, appService: value }))}
                placeholder="/subscriptions/.../providers/Microsoft.Web/sites/..."
              />
              <InputField
                label="Knowledge storage account resource ID"
                value={connectionForm.storage}
                onChange={(value) => setConnectionForm((current) => ({ ...current, storage: value }))}
                placeholder="/subscriptions/.../providers/Microsoft.Storage/storageAccounts/..."
              />
              <InputField
                label="Blob container"
                value={connectionForm.container}
                onChange={(value) => setConnectionForm((current) => ({ ...current, container: value }))}
              />
              <InputField
                label="Login failure threshold"
                value={connectionForm.threshold}
                onChange={(value) => setConnectionForm((current) => ({ ...current, threshold: value }))}
                type="number"
              />
              <SelectField
                label="Evaluation window"
                value={connectionForm.window}
                onChange={(value) => setConnectionForm((current) => ({ ...current, window: value }))}
                options={[
                  ["5", "5 minutes"],
                  ["10", "10 minutes"],
                  ["15", "15 minutes"],
                ]}
              />
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={connectionForm.remediation}
                aria-label="Enable live App Service restart"
                onChange={(event) => setConnectionForm((current) => ({ ...current, remediation: event.target.checked }))}
              />
              <span>
                <b className="block text-slate-100">Enable live App Service restart</b>
                <small className="block text-slate-400">Still approval-gated by default in CaseZero.</small>
              </span>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950" onClick={createReceiver}>
                Create receiver &amp; command
              </button>
            </div>
            {sourceSecret ? (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">CASEZERO RECEIVER CREATED</div>
                <h3 className="mt-1 text-xl font-semibold text-slate-100">Run this in the customer Azure tenant</h3>
                <p className="mt-2 text-sm text-slate-300">
                  The script provisions the enterprise application, assigns workspace/blob access, optionally grants the narrow App Service restart custom role,
                  creates the login-failure alert, and calls CaseZero back with the customer resource metadata.
                </p>
                <pre className="mt-4 overflow-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
{buildOnboardingCommand({
  appClientId: tenantState.health.platform_identity.evidence_app_client_id,
  customerTenantId: connectionForm.customerTenant || "<CUSTOMER-TENANT-ID>",
  tenantRelationship: connectionForm.relationship,
  appInsightsResourceId: connectionForm.appInsights || "<APP-INSIGHTS-RESOURCE-ID>",
  appServiceResourceId: connectionForm.appService || "<APP-SERVICE-RESOURCE-ID>",
  storageAccountResourceId: connectionForm.storage || "<STORAGE-ACCOUNT-RESOURCE-ID>",
  blobContainerName: connectionForm.container || "casezero-runbooks",
  webhookUrl: `${window.location.origin}${sourceSecret.path}?token=${sourceSecret.secret}`,
  loginFailureThreshold: connectionForm.threshold || "10",
  evaluationWindowMinutes: connectionForm.window || "5",
  enableAppServiceRemediation: connectionForm.remediation,
})}
                </pre>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-800 px-3 py-2 text-sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        buildOnboardingCommand({
                          appClientId: tenantState.health.platform_identity.evidence_app_client_id,
                          customerTenantId: connectionForm.customerTenant || "<CUSTOMER-TENANT-ID>",
                          tenantRelationship: connectionForm.relationship,
                          appInsightsResourceId: connectionForm.appInsights || "<APP-INSIGHTS-RESOURCE-ID>",
                          appServiceResourceId: connectionForm.appService || "<APP-SERVICE-RESOURCE-ID>",
                          storageAccountResourceId: connectionForm.storage || "<STORAGE-ACCOUNT-RESOURCE-ID>",
                          blobContainerName: connectionForm.container || "casezero-runbooks",
                          webhookUrl: `${window.location.origin}${sourceSecret.path}?token=${sourceSecret.secret}`,
                          loginFailureThreshold: connectionForm.threshold || "10",
                          evaluationWindowMinutes: connectionForm.window || "5",
                          enableAppServiceRemediation: connectionForm.remediation,
                        })
                      );
                      notify("Command copied");
                    }}
                  >
                    Copy command
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {currentDrawerExecution ? (
        <div className="fixed inset-0 z-30 bg-slate-950/80 p-4 backdrop-blur">
          <div className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
              <div>
                <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">INCIDENT RUN</div>
                <h2 className="mt-1 text-2xl font-semibold text-slate-100">
                  {currentDrawerExecution.context.signal.title || "Incident execution"}
                </h2>
              </div>
              <button type="button" className="rounded-xl border border-slate-800 px-3 py-2" onClick={() => setDrawerExecutionId(null)}>
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-6">
              <div className="flex flex-wrap gap-2">
                <Badge label={currentDrawerExecution.status} tone={badgeTone(currentDrawerExecution.status)} />
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                  {currentDrawerExecution.context.scenario_mode}
                </span>
                {currentDrawerExecution.context.verification.status ? (
                  <Badge label={currentDrawerExecution.context.verification.status} tone={badgeTone(currentDrawerExecution.context.verification.status)} />
                ) : null}
              </div>
              <Card className="mt-4">
                <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">SIGNAL</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-100">{currentDrawerExecution.context.signal.title}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {currentDrawerExecution.context.signal.resource} · {currentDrawerExecution.context.signal.service}
                </p>
              </Card>
              {currentDrawerExecution.status === "waiting approval" ? (
                <Card className="mt-4">
                  <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">ACTION REQUIRED</div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-100">Production approval</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    The remediation agent has selected a bounded tool. Approve to continue or deny to stop safely.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button type="button" className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950" onClick={() => approveExecution(currentDrawerExecution.id)}>
                      Approve
                    </button>
                    <button type="button" className="rounded-xl border border-rose-700 px-4 py-2 text-sm text-rose-300" onClick={() => denyExecution(currentDrawerExecution.id)}>
                      Deny
                    </button>
                  </div>
                </Card>
              ) : null}
              {currentDrawerExecution.status === "completed" ? (
                <Card className="mt-4">
                  <div className="text-[10px] font-bold tracking-[0.14em] text-emerald-400">COMMUNICATIONS</div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-100">Send company-wide resolution email</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Draft a verified update for the whole organization so no one has to wonder whether the issue is still active.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
                      onClick={() => draftResolutionBroadcast(currentDrawerExecution)}
                    >
                      Draft email blast
                    </button>
                  </div>
                </Card>
              ) : null}
              <div className="mt-5 flex items-center justify-between gap-3">
                <SectionHead title="Execution trace" description={`${currentDrawerExecution.events.length} auditable events`} />
                <button
                  type="button"
                  className="rounded-xl border border-slate-800 px-3 py-2 text-sm"
                  onClick={() => reverifyExecution(currentDrawerExecution.id)}
                >
                  Re-verify
                </button>
              </div>
              <div className="mt-3 space-y-4 border-l border-slate-800 pl-5">
                {currentDrawerExecution.events.map((event) => {
                  const good = ["agent.completed", "action.completed", "verification.passed", "execution.completed", "approval.granted", "approval.auto_granted"].includes(
                    event.event_type
                  );
                  const bad = ["execution.failed", "verification.failed", "approval.denied"].includes(event.event_type);
                  return (
                    <div key={`${event.event_type}-${event.created_at}`} className={`relative rounded-2xl border p-4 ${good ? "border-emerald-700 bg-emerald-950/30" : bad ? "border-rose-700 bg-rose-950/30" : "border-slate-800 bg-slate-950"}`}>
                      <div className="absolute -left-[23px] top-5 h-3 w-3 rounded-full border-2 border-slate-500 bg-slate-950" />
                      <h4 className="font-semibold text-slate-100">{event.message}</h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {fmtTime(event.created_at)} · {event.event_type}
                      </p>
                      {event.data && Object.keys(event.data).length ? (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-slate-400">Details</summary>
                          <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {currentDrawerExecution.context.agent_outputs ? (
                <Card className="mt-5">
                  <SectionHead title="Agent outputs" description="" />
                  <pre className="mt-3 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
                    {JSON.stringify(currentDrawerExecution.context.agent_outputs, null, 2)}
                  </pre>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {toastMessage ? <div className="fixed bottom-6 right-6 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm shadow-xl">{toastMessage}</div> : null}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg ${className}`}>{children}</div>;
}

function SectionHead({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: SeverityTone }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneClass(tone)}`}>{label.replaceAll("_", " ")}</span>;
}

function MetricCard({
  label,
  value,
  suffix,
  sub,
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
  sub: string;
  tone: SeverityTone;
}) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-[0.08em] text-slate-400">{label}</div>
      <div className={`mt-2 text-4xl font-bold ${tone === "good" ? "text-emerald-300" : tone === "warn" ? "text-amber-300" : tone === "blue" ? "text-sky-300" : "text-rose-300"}`}>
        {value}
        {suffix ? <small className="text-lg font-semibold text-slate-400">{suffix}</small> : null}
      </div>
      <div className="mt-2 text-xs text-slate-400">{sub}</div>
    </Card>
  );
}

function ReadinessRow({ name, ok, detail }: { name: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-800 py-3 first:border-t-0">
      <div className="text-sm font-medium text-slate-100">{name}</div>
      <div className="flex items-center gap-2">
        <Badge label={ok ? "healthy" : "configured"} tone={ok ? "good" : "warn"} />
        <span className="text-xs text-slate-400">{detail}</span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-800 px-4 py-6 text-center text-sm text-slate-400">{text}</div>;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-slate-300">
      <span>{label}</span>
      <input
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block text-sm text-slate-300">
      <span>{label}</span>
      <select
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function sourceIdFallback(): string {
  return "src_fallback";
}
