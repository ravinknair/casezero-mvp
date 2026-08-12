import assert from "node:assert/strict";
import test from "node:test";
import { advanceRun, approveRun, createRun, enableFailureMode, rejectRun } from "../app/simulation.js";

const scenarios = ["certificate", "incident", "database", "support", "access", "pipeline"];

for (const scenario of scenarios) {
  test(`${scenario}: approved action reaches verified resolution without a database`, () => {
    let run = createRun(scenario);
    run = approveRun(run);
    assert.equal(run.status, "executing");
    run = advanceRun(run);
    assert.equal(run.status, "verifying");
    run = advanceRun(run);
    assert.equal(run.status, "resolved");
    assert.deepEqual(run.audit.map(item => item.type), ["case.loaded", "decision.approved", "action.started", "action.completed", "verification.started", "verification.passed", "case.resolved"]);
  });
}

test("rejection records a decision and never executes an action", () => {
  const run = rejectRun(createRun("support"));
  assert.equal(run.status, "rejected");
  assert.equal(run.audit.some(item => item.type.startsWith("action.")), false);
});

test("stop-condition failure rolls back instead of resolving", () => {
  let run = enableFailureMode(createRun("database"));
  run = approveRun(run);
  run = advanceRun(run);
  run = advanceRun(run);
  assert.equal(run.status, "rolled_back");
  assert.equal(run.audit.at(-1).type, "rollback.completed");
});

test("duplicate approval is idempotent", () => {
  const once = approveRun(createRun("access"));
  const twice = approveRun(once);
  assert.deepEqual(twice, once);
});
