# CaseZero Copilot Scaffold Prompt

Copy the prompt below into VS Code Copilot Chat when scaffolding or rebuilding CaseZero.

```text
You are scaffolding CaseZero, a Next.js App Router application for evidence-driven incident resolution.

Use the existing repository conventions:
- Next.js App Router with TypeScript
- React client components only where interactivity requires them
- Tailwind CSS
- Drizzle ORM with SQLite / Cloudflare D1
- Cloudflare Workers and the existing D1 binding named DB
- The existing @/* import alias
- The existing mock data as the local fallback when D1 is unavailable

Preserve the current CaseZero visual language and do not replace working features with placeholders.

Create or preserve these routes:
- /dashboard
- /case/[id]
- /case/new
- /demo
- /evidence
- /policies
- /operations
- /reports
- /telemetry
- /workflows
- /admin
- /status

Create or preserve these shared components:
- Sidebar
- CaseCard
- CreateCaseForm
- DiagnosisSection
- RecommendationSection
- EvidenceSection
- MetricsCard
- PoliciesSection

Create or preserve these dashboard components:
- DashboardLayout
- KpiCard
- SummaryWidget
- ActivityFeed
- CaseTable

Create or preserve these case components:
- CaseHeader
- CaseMetadata
- CaseActions
- CaseList
- CaseFilters
- CaseRow
- CaseTimeline

Create or preserve these admin and report components:
- UserTable
- RoleManager
- ReportCard

Use the existing UI primitives where available:
- Button
- Badge
- Card
- Table

Implement the CaseZero workflow exactly as:
Detect -> Diagnose -> Decide -> Act -> Verify

A case supports:
- case identifier, title, subtitle, type, severity, and status
- confidence score and evidence-source count
- diagnosis and causal chain
- recommended action
- bounded execution scope
- approval gate
- verification metrics
- stop conditions
- rollback readiness
- activity history

Use these API routes:
- GET and POST /api/cases
- GET and PATCH /api/cases/[id]
- GET and POST /api/evidence
- GET and POST /api/activities
- GET and PATCH /api/approvals
- GET /api/dashboard/metrics
- GET /api/telemetry/events
- POST and GET /api/seed

The dashboard metrics endpoint returns:
{
  openCases: number,
  criticalCases: number,
  pastDueCases: number,
  averageResolutionHours: number,
  supportEvents: number,
  casesBySeverity: Array<{ label: string; value: number }>,
  casesByType: Array<{ label: string; value: number }>,
  recentActivity: Array<{
    id: string;
    message: string;
    timestamp: string;
    tone: "info" | "danger";
  }>
}

Use Drizzle tables for users, sites, cases, and incidents. Keep foreign-key relationships explicit:
- a site has many cases
- a case belongs to an optional site
- a case has many incidents
- a user can create, own, and be assigned cases

Keep persistence behind API or service code. The UI must continue to work with mockCases and in-memory telemetry when the D1 binding is unavailable. Do not make a missing database binding break the dashboard.

Use typed request and response objects, accessible controls, loading states, empty states, and error states. Keep business calculations in server-side or shared service code rather than duplicating them in the dashboard component.

The demo flow must use CZ-1842 (Checkout API degradation) as the default engineering and operations case, and CZ-1917 (Certificate expiry) as the default infrastructure and compliance case. The demo must explain evidence, recommendation, bounded scope, approval, verification, and rollback.

Before finishing:
- run the linter
- run the focused tests
- generate and review the Drizzle migration
- run the production build
- verify that the dashboard still renders without a D1 binding
```
```

The prompt is intentionally explicit about the current app structure so a rebuild does not drift into a different routing or persistence model.
