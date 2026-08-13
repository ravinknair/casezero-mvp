import { db } from "@/db";
import { cases, diagnoses, recommendations, evidence, metrics, policies, activities, users, checks, stopConditions } from "@/db/schema";
import { eq } from "drizzle-orm";

const sampleCases = [
  {
    id: "case-cert-1",
    caseId: "CZ-1917",
    type: "CERTIFICATE RISK",
    severity: "EXPIRES IN 6 DAYS",
    title: "api.casezero.ai certificate expiry",
    subtitle: "Public TLS certificate expires Aug 15 at 23:59 UTC · prod-edge-tls",
    status: "decide" as const,
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
    status: "act" as const,
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
    status: "diagnose" as const,
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
    status: "detect" as const,
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
    status: "verify" as const,
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
    status: "resolved" as const,
    confidence: 92,
    sources: 11,
    activity: 7,
  },
];

export async function POST(request: Request) {
  try {
    // Clear existing data
    await db.delete(stopConditions);
    await db.delete(checks);
    await db.delete(evidence);
    await db.delete(activities);
    await db.delete(policies);
    await db.delete(metrics);
    await db.delete(recommendations);
    await db.delete(diagnoses);
    await db.delete(cases);
    await db.delete(users);

    // Create default user
    const defaultUser = {
      id: "user-default",
      name: "Ravi Nair",
      email: "ravi@casezero.local",
      role: "admin" as const,
    };
    await db.insert(users).values(defaultUser);

    // Seed cases
    for (const caseData of sampleCases) {
      const { id, subtitle, ...rest } = caseData;
      await db.insert(cases).values({
        id,
        ...rest,
        subtitle: subtitle || null,
        createdBy: "user-default",
      });

      // Add sample diagnosis
      await db.insert(diagnoses).values({
        id: `diagnosis-${id}`,
        caseId: id,
        title: `Diagnosis for ${rest.title}`,
        description: `Analysis and root cause for the ${rest.title.toLowerCase()} incident.`,
        chain: JSON.stringify([
          "Initial detection",
          "Pattern analysis",
          "Impact assessment",
          "Root cause identified",
        ]),
      });

      // Add metrics
      const metricSets = [
        [
          { name: "Error Rate", value: "12.8%", change: "+10.7%", status: "danger" },
          { name: "p95 Latency", value: "3.4s", change: "+2.1s", status: "warn" },
          { name: "Affected", value: "18,420", change: "last 18m", status: "neutral" },
        ],
      ];

      for (const metric of metricSets[0]) {
        await db.insert(metrics).values({
          id: `metric-${id}-${metric.name}`,
          caseId: id,
          name: metric.name,
          value: metric.value,
          change: metric.change,
          status: metric.status,
        });
      }

      // Add evidence
      const evidenceItems = [
        { type: "C", title: "Certificate Monitor", description: `api.casezero.ai expires` },
        { type: "V", title: "Vault Inventory", description: "Key policy verification" },
        { type: "D", title: "DNS Audit Log", description: "ACME service access logs" },
      ];

      for (let i = 0; i < evidenceItems.length; i++) {
        await db.insert(evidence).values({
          id: `evidence-${id}-${i}`,
          caseId: id,
          type: evidenceItems[i].type,
          title: evidenceItems[i].title,
          description: evidenceItems[i].description,
          timestamp: new Date(Date.now() - i * 60000).toISOString().split("T")[1].split(".")[0],
          color: ["blue", "purple", "green"][i],
        });
      }

      // Add policies
      const policyItems = [
        { code: "SECRET-ROTATION-07", description: "Dual-control approval" },
        { code: "CERT-CANARY-03", description: "One region first" },
      ];

      for (const policy of policyItems) {
        await db.insert(policies).values({
          id: `policy-${id}-${policy.code}`,
          caseId: id,
          policyCode: policy.code,
          description: policy.description,
          status: "passed" as const,
        });
      }

      // Add activity
      await db.insert(activities).values({
        id: `activity-${id}-1`,
        caseId: id,
        description: `CaseZero correlated the incident with related events.`,
        createdBy: "user-default",
      });
    }

    return Response.json({
      success: true,
      message: `Seeded ${sampleCases.length} cases with supporting data`,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return Response.json(
      { error: "Failed to seed database", details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allCases = await db.select().from(cases);
    return Response.json({
      cases: allCases.length,
      message: "Database is populated",
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to check database", details: error },
      { status: 500 }
    );
  }
}
