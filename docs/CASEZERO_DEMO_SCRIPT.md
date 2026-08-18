# CaseZero Presenter Script

## Preparation

Start the application:

```text
npm --prefix casezero-mvp run dev
```

Open the demo guide:

```text
http://localhost:3000/demo
```

Use these case choices:

- Engineering and operations: `CZ-1842` - Checkout API degradation
- Infrastructure and compliance: `CZ-1917` - api.casezero.ai certificate expiry

The default flagship case for this script is `CZ-1842`.

## 1. Open the dashboard

Open:

```text
http://localhost:3000/dashboard
```

Say:

> CaseZero is an operational control layer for incidents and high-risk changes. It takes an incoming signal, organizes the evidence, proposes a bounded action, requires human approval, and verifies the result. The workflow is Detect, Diagnose, Decide, Act, and Verify.

Point out:

- Open cases
- Critical cases
- Past-due cases
- Average resolution time
- Support events
- The case table
- Cases grouped by severity and type
- Recent activity

Expected talking point:

> This is not just a dashboard of alerts. The important object is the case: a reviewable decision with evidence, scope, approval, verification, and rollback context.

## 2. Open the flagship case

For engineering audiences, open:

```text
http://localhost:3000/case/case-incident-1
```

Say:

> This case starts with a real operational pattern: checkout-api version 2.18.0 increased payment-provider concurrency, exhausted the connection pool, and produced a 5xx spike. CaseZero turns that signal into an explainable action.

Show:

- Case ID `CZ-1842`
- Severity `SEV-2`
- Confidence score
- Diagnosis
- Causal chain: Deploy 2.18.0 -> Concurrency +40% -> Pool saturation -> Checkout failures

Expected talking point:

> The system is not asking an operator to trust an unexplained recommendation. It shows the chain of evidence behind the diagnosis.

For infrastructure or compliance audiences, use instead:

```text
http://localhost:3000/case/case-cert-1
```

Say:

> This case shows certificate-risk prevention. Renewal automation lost access to the DNS validation zone, so the certificate is healthy today but carries a clear future outage risk.

Show the diagnosis and causal chain:

```text
IAM policy changed -> DNS write denied -> Renewal failed -> TLS outage risk
```

## 3. Explain the proposed action

For `CZ-1842`, show the recommendation:

> Roll back checkout-api to 2.17.4, begin with 10% of traffic, observe for five minutes, and continue only if the error rate falls below the defined threshold.

For `CZ-1917`, show the recommendation:

> Issue a replacement certificate, validate it on a shadow hostname, shift one edge region, and continue only if TLS and synthetic checks pass.

Point out:

- The action label
- The bounded risk value
- The verification checks
- The automatic stop conditions
- The preserved rollback path

Say:

> The recommendation is deliberately narrow. The operator can see what will change, how much will change, what must be true before continuing, and when the system must stop.

## 4. Show evidence and governance

Open:

```text
http://localhost:3000/evidence
http://localhost:3000/policies
http://localhost:3000/telemetry
```

Say:

> Evidence is retained alongside the decision. Policies make the governance checks visible, and telemetry shows the collection and outcome trail. This gives the operator and the reviewer the same record.

For the production incident, call out:

- Datadog monitor
- Deployment event
- Log correlation
- Rollback target verification
- Bounded traffic scope

For certificate risk, call out:

- Certificate monitor
- Vault inventory
- DNS audit log
- Non-exportable private key
- Immediate rollback to the existing certificate

## 5. Prove the pattern is reusable

Return to:

```text
http://localhost:3000/dashboard
```

Open one or two secondary cases:

- `CZ-1831` - Orders database saturation
- `CZ-1825` - Duplicate charge resolution
- `CZ-1820` - Dormant admin credential audit
- `CZ-1810` - Failed data pipeline revenue_daily_v4

Say:

> The pattern is reusable across infrastructure, production engineering, security, data, and customer operations. The inputs differ, but the safety model stays the same: evidence, bounded action, approval, verification, and rollback.

## 6. Close on enterprise fit

Say:

> CaseZero sits on top of existing monitoring, deployment, identity, billing, and support systems. It becomes the control layer for safe operational action without requiring those systems to be replaced.

Close with:

> The value is not autonomous action for its own sake. The value is making high-stakes operational decisions faster, more transparent, and easier to review.
