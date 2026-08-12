const finalStates = new Set(["resolved", "rejected", "rolled_back"]);

function event(type, message) {
  return { type, message, at: new Date().toISOString() };
}

export function createRun(scenarioKey) {
  return {
    scenarioKey,
    status: "review",
    failureMode: false,
    audit: [event("case.loaded", "Fixture loaded from the local scenario catalog")],
  };
}

export function approveRun(run) {
  if (run.status !== "review") return run;
  return {
    ...run,
    status: "executing",
    audit: [...run.audit, event("decision.approved", "Human approval recorded"), event("action.started", "Mock adapter accepted the bounded action")],
  };
}

export function rejectRun(run) {
  if (run.status !== "review") return run;
  return { ...run, status: "rejected", audit: [...run.audit, event("decision.rejected", "Human rejection recorded; no action executed")] };
}

export function enableFailureMode(run) {
  if (run.status !== "review") return run;
  return { ...run, failureMode: true, audit: [...run.audit, event("simulation.configured", "Automatic stop-condition failure enabled")] };
}

export function advanceRun(run) {
  if (run.status === "executing") {
    return { ...run, status: "verifying", audit: [...run.audit, event("action.completed", "Mock adapter returned a successful bounded-action result"), event("verification.started", "Independent verification checks started")] };
  }
  if (run.status === "verifying" && run.failureMode) {
    return { ...run, status: "rolled_back", audit: [...run.audit, event("verification.failed", "A configured stop condition was triggered"), event("rollback.completed", "Mock rollback restored the original state")] };
  }
  if (run.status === "verifying") {
    return { ...run, status: "resolved", audit: [...run.audit, event("verification.passed", "All scenario controls and outcome checks passed"), event("case.resolved", "Case closed with reproducible evidence")] };
  }
  return run;
}

export function isFinal(run) { return finalStates.has(run.status); }

export function statusLabel(status) {
  return ({ review: "Awaiting approval", executing: "Executing", verifying: "Verifying", resolved: "Resolved", rejected: "Rejected", rolled_back: "Rolled back" })[status] ?? status;
}
