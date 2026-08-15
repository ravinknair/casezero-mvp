/**
 * Minimal Azure Application Insights client using the raw ingestion REST API
 * (fetch-based) so it works in the Cloudflare Workers runtime, where the
 * official `applicationinsights` Node SDK is not compatible.
 *
 * Set APPLICATIONINSIGHTS_CONNECTION_STRING (format:
 * "InstrumentationKey=...;IngestionEndpoint=https://<region>.in.applicationinsights.azure.com/")
 * as an environment variable / Cloudflare secret. If unset, telemetry calls
 * are no-ops so local/dev usage never breaks.
 */

type Properties = Record<string, string | number | boolean | null | undefined>;
type Measurements = Record<string, number>;

function getConnectionString(): string | undefined {
  // Cloudflare Workers expose bindings via `cloudflare:workers`; fall back to
  // process.env for local/node runs.
  const fromProcess = typeof process !== "undefined" ? process.env.APPLICATIONINSIGHTS_CONNECTION_STRING : undefined;
  return fromProcess;
}

function parseConnectionString(connectionString: string) {
  const parts = Object.fromEntries(
    connectionString.split(";").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
  );
  return {
    instrumentationKey: parts.InstrumentationKey,
    ingestionEndpoint: (parts.IngestionEndpoint ?? "https://dc.services.visualstudio.com").replace(/\/$/, ""),
  };
}

async function send(envelopeName: string, data: Record<string, unknown>) {
  const connectionString = getConnectionString();
  if (!connectionString) return; // telemetry disabled unless configured

  const { instrumentationKey, ingestionEndpoint } = parseConnectionString(connectionString);
  if (!instrumentationKey) return;

  const envelope = {
    name: envelopeName,
    time: new Date().toISOString(),
    iKey: instrumentationKey,
    data: {
      baseType: envelopeName.split(".").pop(),
      baseData: { ver: 2, ...data },
    },
  };

  try {
    await fetch(`${ingestionEndpoint}/v2/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    });
  } catch {
    // Never let telemetry failures break the request path.
  }
}

export function trackEvent(name: string, properties?: Properties, measurements?: Measurements) {
  return send("Microsoft.ApplicationInsights.Event", {
    name,
    properties,
    measurements,
  });
}

export function trackMetric(name: string, value: number, properties?: Properties) {
  return send("Microsoft.ApplicationInsights.Metric", {
    metrics: [{ name, value, kind: 0 }],
    properties,
  });
}

export function trackException(error: unknown, properties?: Properties) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  return send("Microsoft.ApplicationInsights.Exception", {
    exceptions: [{ typeName: "Error", message, hasFullStack: !!stack, stack }],
    properties,
  });
}
