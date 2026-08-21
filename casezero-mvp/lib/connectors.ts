export type ConnectorProvider = "servicenow" | "zendesk" | "jira_service_management" | "salesforce_service_cloud" | "freshservice" | "bmc_helix" | "ivanti_neurons" | "manageengine_service_desk_plus";

export type NormalizedRecord = {
	provider: ConnectorProvider;
	externalId: string;
	recordType: "ticket" | "incident" | "problem" | "change" | "work_order" | "comment";
	title?: string;
	description?: string;
	status?: string;
	priority?: string;
	requester?: string;
	assignee?: string;
	asset?: string;
	site?: string;
	service?: string;
	occurredAt?: Date;
	updatedAt?: Date;
	url?: string;
	metadata?: Record<string, unknown>;
};

export type ConnectionHealth = { ok: boolean; message: string; checkedAt: Date };
export type NormalizedRecordBatch = { records: NormalizedRecord[]; nextCursor?: string; hasMore: boolean };

export interface ConnectorAdapter {
	readonly provider: ConnectorProvider;
	testConnection(): Promise<ConnectionHealth>;
	pullChanges(cursor?: string): Promise<NormalizedRecordBatch>;
	normalize(record: unknown): NormalizedRecord;
}