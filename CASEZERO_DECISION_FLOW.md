# CaseZero Decision Flow

## Overview

CaseZero is a portfolio-style incident response dashboard that demonstrates how AI-assisted operations can support fast, evidence-driven decision-making while keeping humans in control. Each case follows a structured workflow designed to model safe operational execution.

## Core workflow

Every case moves through the following loop:

1. Detect
   - The system identifies a problem pattern or anomaly.
   - Signals may include certificate expiry, API degradation, failed pipelines, or access issues.

2. Diagnose
   - The app presents a root-cause narrative based on evidence.
   - Severity, confidence, and relevant evidence sources are surfaced to help the operator understand the problem.

3. Decide
   - The system proposes a bounded action and highlights the current risk level.
   - The operator evaluates whether the recommendation is appropriate before approving.

4. Act
   - The approved action is executed within controlled limits.
   - Scope is intentionally narrow to reduce blast radius and preserve rollback options.

5. Verify
   - The system checks whether the mitigation is working.
   - If the result remains within acceptable thresholds, the case stays in a resolved state.
   - If not, the workflow is designed to stop and rollback before damage escalates.

## Why this matters

This model represents a safer version of AI automation in operations. Instead of a fully autonomous system, the app emphasizes:

- Evidence-first reasoning
- Human approval before action
- Bounded execution scope
- Verification after action
- Rollback readiness when risk thresholds are crossed

## Example cases in the dashboard

### 1. Certificate expiry
- Problem: certificate is approaching expiry and renewal automation has failed.
- Decision: issue a replacement certificate and validate before wider rollout.
- Safety emphasis: contain scope, validate on a limited edge footprint, and preserve rollback readiness.

### 2. Production incident
- Problem: checkout API sees elevated 5xx responses after a deployment.
- Decision: revert to the last known stable version with bounded traffic rollout.
- Safety emphasis: keep rollback fast while monitoring error and latency thresholds.

### 3. Database saturation
- Problem: connection pool is nearing full saturation.
- Decision: reduce load, investigate queue growth, and stabilize capacity before broader changes.
- Safety emphasis: limit impact while gathering evidence for safe mitigation.

### 4. Customer issue
- Problem: duplicate charge or customer-impacting incident has been reported.
- Decision: identify root cause and resolve with a targeted customer-safe remediation path.
- Safety emphasis: investigate before broad rollout and confirm no repeat regressions.

### 5. Access remediation
- Problem: stale or dormant admin credentials remain active beyond policy windows.
- Decision: rotate or revoke access and confirm the change is tracked.
- Safety emphasis: ensure compliance while minimizing operational disruption.

### 6. Data pipeline failure
- Problem: revenue aggregation pipeline has failed or is delayed.
- Decision: stabilize the pipeline and validate downstream impact before re-enabling full flow.
- Safety emphasis: isolate data reliability issues and prevent silent corruption.

## Design principle

CaseZero is meant to show that AI can be operationally useful when it is transparent, bounded, and reviewable. The product is not simply a chatbot or a dashboard; it is a workflow simulation for trustworthy incident response.

## How the UI maps to the workflow

- Dashboard view: aggregate incident portfolio and status overview
- Case detail page: diagnosis, evidence, recommendation, risk framing
- Approval flow: human sign-off before action is taken
- Metrics and evidence panels: show why the action is recommended
- Safety checks and condition gates: enforce operational guardrails

## Summary

The real story behind CaseZero is not just that it can detect issues; it is that it creates a safer operating model for AI in critical systems. That is why it is useful as a product-demo and portfolio story.
