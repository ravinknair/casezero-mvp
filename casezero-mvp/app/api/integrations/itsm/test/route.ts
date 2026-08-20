import { ingestItsmFcrRequest } from "@/lib/itsmIngestion";

const testPayloads = {
  servicenow: {
    provider: "servicenow",
    number: "INC0012048",
    contact_type: "virtual_agent",
    opened_at: "2026-08-01 09:04:00",
  },
  zendesk: {
    provider: "zendesk",
    ticket: {
      id: 481516,
      via: { channel: "chat" },
      created_at: "2026-08-01T09:04:00Z",
    },
  },
  jira_service_management: {
    provider: "jira_service_management",
    issue: {
      key: "OPS-2048",
      fields: { created: "2026-08-02T11:12:00Z" },
    },
  },
  salesforce_service_cloud: {
    provider: "salesforce",
    CaseNumber: "00001042",
    Origin: "Phone",
    CreatedDate: "2026-08-03T14:20:00Z",
  },
  freshservice: {
    provider: "freshservice",
    ticket: {
      id: 90210,
      source_name: "email",
      created_at: "2026-08-04T08:44:00Z",
    },
  },
  bmc_helix: {
    provider: "bmc_helix",
    incident: {
      Incident_Number: "INC0000002048",
      Reported_Source: "Phone",
      Submit_Date: "2026-08-05T10:18:00Z",
    },
  },
  ivanti_neurons: {
    provider: "ivanti_neurons",
    incident: {
      IncidentNumber: "IV-2048",
      Source: "Portal",
      CreatedDateTime: "2026-08-06T16:03:00Z",
    },
  },
  manageengine_service_desk_plus: {
    provider: "manageengine",
    request: {
      display_id: "REQ-8090",
      mode: { name: "Email" },
      created_time: { value: "2026-08-08T12:31:00Z" },
    },
  },
} as const;

type TestProvider = keyof typeof testPayloads;

export async function POST(request: Request) {
  const { provider } = (await request.json()) as { provider?: string };
  if (!provider || !(provider in testPayloads)) {
    return Response.json({ error: "Unsupported test provider" }, { status: 400 });
  }

  const { env } = await import("cloudflare:workers");
  const webhookSecret = (env as unknown as { ITSM_WEBHOOK_SECRET?: string }).ITSM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "ITSM ingestion is not configured" }, { status: 503 });
  }

  const testRequest = new Request(new URL("/api/integrations/itsm/fcr", request.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CaseZero-Webhook-Secret": webhookSecret,
    },
    body: JSON.stringify(testPayloads[provider as TestProvider]),
  });

  return ingestItsmFcrRequest(testRequest);
}