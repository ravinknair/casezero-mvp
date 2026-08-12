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
