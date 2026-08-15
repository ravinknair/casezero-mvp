import { advanceRun, approveRun, createRun, enableFailureMode, rejectRun } from "@/app/simulation";

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const scenarios = ["certificate", "incident", "database", "support", "access", "pipeline"];

function check(name: string, fn: () => { passed: boolean; message: string }): CheckResult {
  const start = Date.now();
  try {
    const { passed, message } = fn();
    return { name, passed, message, durationMs: Date.now() - start };
  } catch (error) {
    return {
      name,
      passed: false,
      message: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - start,
    };
  }
}

const expectedAudit = [
  "case.loaded",
  "decision.approved",
  "action.started",
  "action.completed",
  "verification.started",
  "verification.passed",
  "case.resolved",
];

export function runSimulationTests(): CheckResult[] {
  const results: CheckResult[] = [];

  for (const scenario of scenarios) {
    results.push(
      check(`${scenario}: approved action reaches verified resolution`, () => {
        let run = createRun(scenario);
        run = approveRun(run);
        if (run.status !== "executing") return { passed: false, message: `Expected "executing", got "${run.status}"` };
        run = advanceRun(run);
        if (run.status !== "verifying") return { passed: false, message: `Expected "verifying", got "${run.status}"` };
        run = advanceRun(run);
        if (run.status !== "resolved") return { passed: false, message: `Expected "resolved", got "${run.status}"` };
        const auditTypes = run.audit.map((item) => item.type);
        const matches = JSON.stringify(auditTypes) === JSON.stringify(expectedAudit);
        return { passed: matches, message: matches ? "Audit trail matches expected sequence" : `Unexpected audit trail: ${auditTypes.join(", ")}` };
      })
    );
  }

  results.push(
    check("rejection records a decision and never executes an action", () => {
      const run = rejectRun(createRun("support"));
      const noAction = !run.audit.some((item) => item.type.startsWith("action."));
      return {
        passed: run.status === "rejected" && noAction,
        message: run.status === "rejected" && noAction ? "Rejected with no action executed" : `Unexpected state: ${run.status}`,
      };
    })
  );

  results.push(
    check("stop-condition failure rolls back instead of resolving", () => {
      let run = enableFailureMode(createRun("database"));
      run = approveRun(run);
      run = advanceRun(run);
      run = advanceRun(run);
      const lastEvent = run.audit.at(-1)?.type;
      return {
        passed: run.status === "rolled_back" && lastEvent === "rollback.completed",
        message: run.status === "rolled_back" ? "Rolled back as expected" : `Unexpected state: ${run.status}`,
      };
    })
  );

  results.push(
    check("duplicate approval is idempotent", () => {
      const once = approveRun(createRun("access"));
      const twice = approveRun(once);
      const matches = JSON.stringify(once) === JSON.stringify(twice);
      return { passed: matches, message: matches ? "Second approval is a no-op" : "Second approval changed state" };
    })
  );

  return results;
}
