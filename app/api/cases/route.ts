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
  },
  {
    id: "case-db-1",
    caseId: "CZ-1831",
    type: "DATABASE SATURATION",
    severity: "SEV-1",
    title: "Orders database saturation",
    subtitle: "Connection pool at 96% utilization with growing queue depth",
    status: "diagnose",
    confidence: 88,
    sources: 18,
    activity: 12,
  },
  {
    id: "case-support-1",
    caseId: "CZ-1825",
    type: "CUSTOMER ISSUE",
    severity: "SEV-3",
    title: "Duplicate charge resolution",
    subtitle: "Customer report of duplicate transaction in checkout flow",
    status: "detect",
    confidence: 78,
    sources: 5,
    activity: 3,
  },
  {
    id: "case-access-1",
    caseId: "CZ-1820",
    type: "ACCESS REMEDIATION",
    severity: "COMPLIANCE",
    title: "Dormant admin credential audit",
    subtitle: "Unused admin credentials active for >90 days require immediate rotation",
    status: "verify",
    confidence: 100,
    sources: 8,
    activity: 6,
  },
  {
    id: "case-pipeline-1",
    caseId: "CZ-1810",
    type: "DATA PIPELINE",
    severity: "SEV-2",
    title: "Failed data pipeline revenue_daily_v4",
    subtitle: "Daily revenue aggregation pipeline failed at 02:47 UTC",
    status: "resolved",
    confidence: 92,
    sources: 11,
    activity: 7,
  },
];

export async function GET() {
  return Response.json(mockCases);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      caseId,
      type,
      severity,
      title,
      subtitle,
      confidence,
      sources,
      activity,
    } = body;

    const newCase = {
      id: `case-${Date.now()}`,
      caseId: caseId || `CZ-${Math.round(Math.random() * 9000 + 1000)}`,
      type: type || "PRODUCTION INCIDENT",
      severity: severity || "SEV-2",
      title: title || "New incident",
      subtitle: subtitle || "Created from the local preview environment",
      status: "detect",
      confidence: typeof confidence === "number" ? confidence : 75,
      sources: typeof sources === "number" ? sources : 0,
      activity: typeof activity === "number" ? activity : 0,
    };

    mockCases.unshift(newCase);
    return Response.json(newCase, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Failed to create case" }, { status: 500 });
  }
}
