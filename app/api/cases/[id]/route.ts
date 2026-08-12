const mockCases = [
  {
    id: "case-cert-1",
    caseId: "CZ-1917",
    type: "CERTIFICATE RISK",
    severity: "EXPIRES IN 6 DAYS",
    title: "api.casezero.ai certificate expiry",
    subtitle: "Public TLS certificate expires Aug 15 at 23:59 UTC · prod-edge-tls",
    status: "decide",
    confidence: 96,
    sources: 12,
    activity: 9,
    diagnosis: {
      title: "Renewal automation lost access to the DNS validation zone",
      description: "The certificate is healthy today, but its scheduled renewal failed twice because the ACME service account can no longer create the required DNS challenge. Without intervention, customer API traffic will fail TLS negotiation at expiry.",
      chain: ["IAM policy changed", "DNS write denied", "Renewal failed", "TLS outage risk"],
    },
    recommendation: {
      title: "Issue replacement certificate and rotate at the edge",
      description: "Create with the approved CA, validate on a shadow hostname, shift one edge region, then continue only if TLS and synthetic checks pass.",
      actionLabel: "Approve staged certificate rotation",
      riskValue: "1 region",
      riskLabel: "first-stage scope",
      note: "Proceed with staged certificate rotation. Preserve the existing certificate for immediate rollback.",
      checks: [
        ["Replacement identity verified", "SANs match api.casezero.ai and required aliases"],
        ["Private key remains non-exportable", "Generated and retained inside the managed vault"],
        ["Rollback is immediate", "Existing certificate remains active during validation"],
      ],
      stops: [
        "TLS handshake success falls below 99.95%",
        "Certificate chain differs from approved CA",
        "Synthetic API checks fail in the canary region",
      ],
      metrics: [
        ["Time to expiry", "6d 7h", "urgent", "warn"],
        ["Covered endpoints", "18", "all mapped", "neutral"],
        ["Renewal attempts", "2 failed", "last 24h", "danger"],
      ],
      evidence: [
        ["C", "Certificate monitor", "api.casezero.ai expires Aug 15 at 23:59 UTC", "16:31:04", "blue"],
        ["V", "Vault inventory", "Replacement key policy is available and compliant", "16:32:19", "purple"],
        ["D", "DNS audit log", "ACME service account denied dns.records.create", "16:33:02", "green"],
      ],
    },
  },
  {
    id: "case-incident-1",
    caseId: "CZ-1842",
    type: "PRODUCTION INCIDENT",
    severity: "SEV-2",
    title: "Checkout API degradation",
    subtitle: "Elevated 5xx responses after deployment checkout-api@2.18.0",
    status: "act",
    confidence: 91,
    sources: 14,
    activity: 8,
    diagnosis: {
      title: "Connection pool exhaustion in the payment adapter",
      description: "Version 2.18.0 increased concurrent payment-provider calls while retaining the previous pool limit. Saturation began within four minutes of deployment and aligns with the 5xx spike.",
      chain: ["Deploy 2.18.0", "Concurrency +40%", "Pool saturation", "Checkout failures"],
    },
    recommendation: {
      title: "Roll back checkout-api to 2.17.4",
      description: "Apply to 10% of traffic, observe for 5 minutes, then continue only if error rate falls below 3%.",
      actionLabel: "Approve bounded rollback",
      riskValue: "10%",
      riskLabel: "traffic capped",
      note: "Proceed with bounded rollback. Monitor payment success rate.",
      checks: [
        ["Rollback target verified", "2.17.4 passed last production health check"],
        ["Scope is bounded", "Traffic cap and automatic stop conditions set"],
        ["Evidence is reproducible", "14 sources retained in the case audit"],
      ],
      stops: [
        "Error rate rises above 15%",
        "Latency increases for two minutes",
        "Payment success rate falls below 92%",
      ],
      metrics: [
        ["Error rate", "12.8%", "+10.7%", "danger"],
        ["p95 latency", "3.4s", "+2.1s", "warn"],
        ["Affected requests", "18,420", "last 18m", "neutral"],
      ],
      evidence: [
        ["M", "Datadog monitor", "checkout-api.5xx_rate breached 5% threshold", "16:24:08", "blue"],
        ["D", "Deployment event", "checkout-api@2.18.0 promoted to production", "16:20:11", "purple"],
        ["L", "Log correlation", "HikariPool timeout found in 1,284 requests", "16:25:42", "green"],
      ],
    },
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseFound = mockCases.find((item) => item.id === id || item.caseId === id);

    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    return Response.json({
      case: caseFound,
      diagnoses: [caseFound.diagnosis],
      recommendations: [caseFound.recommendation],
      evidence: caseFound.recommendation.evidence,
      activities: [],
      approvals: [],
      metrics: caseFound.recommendation.metrics,
    });
  } catch (error) {
    return Response.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const caseFound = mockCases.find((item) => item.id === id || item.caseId === id);

    if (!caseFound) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }

    caseFound.status = body.status || caseFound.status;
    return Response.json(caseFound);
  } catch (error) {
    return Response.json({ error: "Failed to update case" }, { status: 500 });
  }
}
