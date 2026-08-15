import type { CheckResult } from "@/lib/simulationTests";

async function timed(name: string, fn: () => Promise<{ passed: boolean; message: string }>): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { passed, message } = await fn();
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

export async function runApiSmokeTests(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  results.push(
    await timed("GET /api/cases returns a list", async () => {
      const response = await fetch("/api/cases");
      const data = await response.json();
      return {
        passed: response.ok && Array.isArray(data) && data.length > 0,
        message: response.ok ? `Received ${data.length} cases` : `HTTP ${response.status}`,
      };
    })
  );

  let createdCaseId: string | null = null;
  try {
    results.push(
      await timed("POST /api/cases creates a case", async () => {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: `CZ-SMOKE-${Date.now()}`,
          type: "SMOKE TEST",
          severity: "SEV-4",
          title: "Automated smoke test case",
        }),
      });
      const data = await response.json();
      createdCaseId = data?.id ?? null;
      return {
        passed: response.status === 201 && !!createdCaseId,
        message: createdCaseId ? `Created ${data.caseId}` : `HTTP ${response.status}`,
      };
      })
    );

    results.push(
      await timed("GET /api/cases/:id returns case detail", async () => {
      if (!createdCaseId) return { passed: false, message: "Skipped - no case was created" };
      const response = await fetch(`/api/cases/${createdCaseId}`);
      const data = await response.json();
      return {
        passed: response.ok && data?.case?.id === createdCaseId,
        message: response.ok ? "Case detail matches created case" : `HTTP ${response.status}`,
      };
      })
    );

    results.push(
      await timed("PATCH /api/cases/:id updates status", async () => {
      if (!createdCaseId) return { passed: false, message: "Skipped - no case was created" };
      const response = await fetch(`/api/cases/${createdCaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "diagnose" }),
      });
      const data = await response.json();
      return {
        passed: response.ok && data?.status === "diagnose",
        message: response.ok ? `Status is now "${data.status}"` : `HTTP ${response.status}`,
      };
      })
    );

    results.push(
      await timed("POST /api/approvals records a decision", async () => {
      if (!createdCaseId) return { passed: false, message: "Skipped - no case was created" };
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: createdCaseId, status: "approved", approvedBy: "smoke-test" }),
      });
      const data = await response.json();
      return {
        passed: response.status === 201 && data?.status === "approved",
        message: response.ok ? "Approval recorded" : `HTTP ${response.status}`,
      };
      })
    );

    for (const endpoint of ["evidence", "activities"]) {
      results.push(
        await timed(`GET /api/${endpoint} returns a list`, async () => {
        const response = await fetch(`/api/${endpoint}`);
        const data = await response.json();
        return {
          passed: response.ok && Array.isArray(data),
          message: response.ok ? `Received ${data.length} ${endpoint} records` : `HTTP ${response.status}`,
        };
        })
      );
    }
  } finally {
    if (createdCaseId) {
      await fetch(`/api/cases/${createdCaseId}`, { method: "DELETE" });
    }
  }

  return results;
}
