import { mockCases } from "@/lib/mockData";

export const externalSupportProviders = [
  "Azure",
  "AWS",
  "Salesforce",
  "Oracle",
  "IBM",
  "Google Cloud",
  "GitHub",
];

export const communicationChannels = [
  "Microsoft Teams",
  "Slack",
  "Cisco Webex",
  "SMS Broadcast",
  "Connecteam",
  "TeamWherx",
  "DeskAlerts",
];

export type SupportActionType = "collect_source" | "collect_all_sources" | "prepare_ticket_bundle";
export type SupportSourceType = "provider" | "channel";

export interface SupportSourceStatus {
  type: SupportSourceType;
  name: string;
  collected: boolean;
  collectedAt: string | null;
  collectedBy: string | null;
}

export interface CaseSupportPack {
  caseId: string;
  clientEnvironment: string | null;
  providers: SupportSourceStatus[];
  communicationChannels: SupportSourceStatus[];
  bundleReady: boolean;
  ticketBundleId?: string;
  lastUpdatedAt: string;
}

export interface SupportTelemetryEvent {
  id: string;
  caseId: string;
  eventType: SupportActionType;
  actor: string;
  targetType: SupportSourceType | "bundle" | "all_sources";
  targetName: string;
  status: "recorded" | "ready" | "blocked";
  message: string;
  createdAt: string;
  metadata: Record<string, string | number>;
}

const supportPacks: CaseSupportPack[] = [];
const supportTelemetryEvents: SupportTelemetryEvent[] = [];

function resolveCaseId(inputCaseId: string): string | null {
  const caseFound = mockCases.find((item) => item.id === inputCaseId || item.caseId === inputCaseId);
  return caseFound?.id ?? null;
}

function addTelemetryEvent(event: Omit<SupportTelemetryEvent, "id" | "createdAt">): SupportTelemetryEvent {
  const telemetryEvent: SupportTelemetryEvent = {
    id: `telemetry-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    ...event,
  };

  supportTelemetryEvents.unshift(telemetryEvent);
  return telemetryEvent;
}

function createSupportPack(caseId: string): CaseSupportPack {
  return {
    caseId,
    clientEnvironment: null,
    providers: externalSupportProviders.map((name) => ({
      type: "provider",
      name,
      collected: false,
      collectedAt: null,
      collectedBy: null,
    })),
    communicationChannels: communicationChannels.map((name) => ({
      type: "channel",
      name,
      collected: false,
      collectedAt: null,
      collectedBy: null,
    })),
    bundleReady: false,
    lastUpdatedAt: new Date().toISOString(),
  };
}

function ensureSupportPack(caseId: string): CaseSupportPack {
  const existing = supportPacks.find((item) => item.caseId === caseId);
  if (existing) {
    return existing;
  }

  const created = createSupportPack(caseId);
  supportPacks.unshift(created);
  return created;
}

function isComprehensive(pack: CaseSupportPack): boolean {
  return (
    pack.providers.every((source) => source.collected) &&
    pack.communicationChannels.every((source) => source.collected)
  );
}

function updateSourceCollection(
  sources: SupportSourceStatus[],
  sourceName: string,
  createdBy: string
): SupportSourceStatus | null {
  const source = sources.find((item) => item.name === sourceName);
  if (!source) {
    return null;
  }

  source.collected = true;
  source.collectedAt = new Date().toISOString();
  source.collectedBy = createdBy;
  return source;
}

export function getSupportTracking(caseId: string): { pack: CaseSupportPack; events: SupportTelemetryEvent[] } {
  const resolvedCaseId = resolveCaseId(caseId);
  if (!resolvedCaseId) {
    throw new Error("Case not found");
  }

  const pack = ensureSupportPack(resolvedCaseId);
  return {
    pack,
    events: supportTelemetryEvents.filter((event) => event.caseId === resolvedCaseId),
  };
}

export function getSupportTelemetryEvents(): SupportTelemetryEvent[] {
  return supportTelemetryEvents;
}

export function collectSupportSource(
  caseId: string,
  sourceType: SupportSourceType,
  sourceName: string,
  createdBy: string,
  clientEnvironment: string
): { pack: CaseSupportPack; event: SupportTelemetryEvent } {
  const resolvedCaseId = resolveCaseId(caseId);
  if (!resolvedCaseId) {
    throw new Error("Case not found");
  }

  const pack = ensureSupportPack(resolvedCaseId);
  pack.clientEnvironment = clientEnvironment;
  const updatedSource =
    sourceType === "provider"
      ? updateSourceCollection(pack.providers, sourceName, createdBy)
      : updateSourceCollection(pack.communicationChannels, sourceName, createdBy);

  if (!updatedSource) {
    throw new Error("Unsupported source");
  }

  pack.bundleReady = false;
  pack.ticketBundleId = undefined;
  pack.lastUpdatedAt = new Date().toISOString();

  const event = addTelemetryEvent({
    caseId: resolvedCaseId,
    actor: createdBy,
    eventType: "collect_source",
    targetType: sourceType,
    targetName: sourceName,
    status: "recorded",
    message: `Collected ${sourceType === "provider" ? "provider log source" : "communication channel"}: ${sourceName}.`,
    metadata: {
      providersCollected: pack.providers.filter((item) => item.collected).length,
      channelsCollected: pack.communicationChannels.filter((item) => item.collected).length,
      clientEnvironment,
    },
  });

  return { pack, event };
}

export function collectAllSupportSources(
  caseId: string,
  createdBy: string,
  clientEnvironment: string
): { pack: CaseSupportPack; event: SupportTelemetryEvent } {
  const resolvedCaseId = resolveCaseId(caseId);
  if (!resolvedCaseId) {
    throw new Error("Case not found");
  }

  const pack = ensureSupportPack(resolvedCaseId);
  pack.clientEnvironment = clientEnvironment;
  const collectedAt = new Date().toISOString();

  for (const source of [...pack.providers, ...pack.communicationChannels]) {
    source.collected = true;
    source.collectedAt = collectedAt;
    source.collectedBy = createdBy;
  }

  pack.bundleReady = false;
  pack.ticketBundleId = undefined;
  pack.lastUpdatedAt = collectedAt;

  const event = addTelemetryEvent({
    caseId: resolvedCaseId,
    actor: createdBy,
    eventType: "collect_all_sources",
    targetType: "all_sources",
    targetName: "all providers and channels",
    status: "recorded",
    message: "Collected all configured provider logs and communication channels.",
    metadata: {
      providerCount: pack.providers.length,
      channelCount: pack.communicationChannels.length,
      providersCollected: pack.providers.filter((item) => item.collected).length,
      channelsCollected: pack.communicationChannels.filter((item) => item.collected).length,
      clientEnvironment,
    },
  });

  return { pack, event };
}

export function prepareTicketBundle(
  caseId: string,
  createdBy: string,
  clientEnvironment: string
): { pack: CaseSupportPack; event: SupportTelemetryEvent } {
  const resolvedCaseId = resolveCaseId(caseId);
  if (!resolvedCaseId) {
    throw new Error("Case not found");
  }

  const pack = ensureSupportPack(resolvedCaseId);
  if (!pack.clientEnvironment) {
    pack.clientEnvironment = clientEnvironment;
  }
  if (!isComprehensive(pack)) {
    const missingProviders = pack.providers.filter((item) => !item.collected).map((item) => item.name);
    const missingChannels = pack.communicationChannels
      .filter((item) => !item.collected)
      .map((item) => item.name);

    throw new Error(
      `Comprehensive evidence pack incomplete. Missing providers: ${missingProviders.join(", ") || "none"}. Missing channels: ${missingChannels.join(", ") || "none"}.`
    );
  }

  pack.bundleReady = true;
  pack.ticketBundleId = `bundle-${Date.now()}`;
  pack.lastUpdatedAt = new Date().toISOString();

  const event = addTelemetryEvent({
    caseId: resolvedCaseId,
    actor: createdBy,
    eventType: "prepare_ticket_bundle",
    targetType: "bundle",
    targetName: pack.ticketBundleId,
    status: "ready",
    message: "Prepared comprehensive external support evidence bundle.",
    metadata: {
      providerCount: pack.providers.length,
      channelCount: pack.communicationChannels.length,
      ticketBundleId: pack.ticketBundleId,
      clientEnvironment: pack.clientEnvironment ?? clientEnvironment,
    },
  });

  return { pack, event };
}
