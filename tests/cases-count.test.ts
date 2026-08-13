import test from "node:test";
import assert from "node:assert/strict";

const routeModule = await import("../app/api/cases/route.ts");
const response = await routeModule.GET();
const data = await response.json();

assert.equal(Array.isArray(data), true, "cases route should return an array");
assert.equal(data.length, 6, "dashboard should expose all 6 seeded cases");
assert.ok(data.some((item: { id: string }) => item.id === "case-access-1"), "missing access remediation case");
assert.ok(data.some((item: { id: string }) => item.id === "case-pipeline-1"), "missing pipeline case");

test("dashboard returns all six seeded cases", () => {
  assert.equal(data.length, 6);
});

test("case detail route handles cases without a recommendation payload", async () => {
  const routeModule = await import("../app/api/cases/[id]/route.ts");
  const response = await routeModule.GET(
    new Request("http://localhost/api/cases/case-pipeline-1"),
    { params: Promise.resolve({ id: "case-pipeline-1" }) }
  );

  assert.equal(response.status, 200, "pipeline case should load without crashing");
  const payload = await response.json();
  assert.equal(payload.case.id, "case-pipeline-1");
  assert.deepEqual(payload.recommendations, []);
  assert.deepEqual(payload.evidence, []);
  assert.deepEqual(payload.metrics, []);
});

test("approvals route can approve a case without the D1 database", async () => {
  const routeModule = await import("../app/api/approvals/route.ts");
  const response = await routeModule.POST(
    new Request("http://localhost/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: "case-cert-1",
        status: "approved",
        approvedBy: "user-default",
        approvalNotes: "Proceeding with recommended action",
      }),
    })
  );

  assert.equal(response.status, 201, "approval POST should succeed");
  const payload = await response.json();
  assert.equal(payload.status, "approved");
  assert.equal(payload.caseId, "case-cert-1");
});
