import { relations, sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const createdAt = () =>
	integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`);

const updatedAt = () =>
	integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`);

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	role: text("role").notNull().default("operator"),
	workspaceId: text("workspace_id"),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const workspaces = sqliteTable("workspaces", {
	id: text("id").primaryKey(),
	tenantId: text("tenant_id").notNull().unique(),
	name: text("name").notNull(),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const workspaceMembers = sqliteTable("workspace_members", {
	workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
	userId: text("user_id").notNull().references(() => users.id),
	role: text("role").notNull().default("viewer"),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
}, (table) => [primaryKey({ columns: [table.workspaceId, table.userId] })]);

export const workspaceInvitations = sqliteTable("workspace_invitations", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
	email: text("email").notNull(),
	role: text("role").notNull().default("viewer"),
	tokenHash: text("token_hash").notNull().unique(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	invitedBy: text("invited_by").notNull().references(() => users.id),
	acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
	revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
	createdAt: createdAt(),
}, (table) => [uniqueIndex("workspace_invitations_workspace_email_unique").on(table.workspaceId, table.email)]);

export const workspaceIntegrations = sqliteTable("workspace_integrations", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
	provider: text("provider").notNull(),
	tokenHash: text("token_hash").notNull().unique(),
	active: integer("active", { mode: "boolean" }).notNull().default(true),
	createdBy: text("created_by").notNull().references(() => users.id),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
}, (table) => [uniqueIndex("workspace_integrations_workspace_provider_unique").on(table.workspaceId, table.provider)]);

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.id),
	workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	createdAt: createdAt(),
});

export const auditLogs = sqliteTable("audit_logs", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id").references(() => workspaces.id),
	userId: text("user_id").references(() => users.id),
	action: text("action").notNull(),
	resource: text("resource"),
	metadata: text("metadata"),
	createdAt: createdAt(),
});

export const sites = sqliteTable("sites", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	code: text("code").notNull().unique(),
	environment: text("environment").notNull().default("production"),
	region: text("region"),
	workspaceId: text("workspace_id").references(() => workspaces.id),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const cases = sqliteTable("cases", {
	id: text("id").primaryKey(),
	caseId: text("case_id").notNull().unique(),
	siteId: text("site_id").references(() => sites.id),
	createdBy: text("created_by").references(() => users.id),
	ownerId: text("owner_id").references(() => users.id),
	assignedTo: text("assigned_to").references(() => users.id),
	workspaceId: text("workspace_id").references(() => workspaces.id),
	type: text("type").notNull(),
	severity: text("severity").notNull(),
	title: text("title").notNull(),
	description: text("description"),
	status: text("status").notNull().default("detect"),
	confidence: integer("confidence").notNull().default(0),
	openedAt: integer("opened_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const incidents = sqliteTable("incidents", {
	id: text("id").primaryKey(),
	caseId: text("case_id")
		.notNull()
		.references(() => cases.id),
	externalId: text("external_id"),
	source: text("source").notNull(),
	title: text("title").notNull(),
	severity: text("severity").notNull(),
	status: text("status").notNull().default("open"),
	detectedAt: integer("detected_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
	createdAt: createdAt(),
});

export const evidence = sqliteTable("evidence", {
	id: text("id").primaryKey(),
	caseId: text("case_id")
		.notNull()
		.references(() => cases.id),
	type: text("type").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	timestamp: text("timestamp").notNull(),
	color: text("color").notNull().default("blue"),
	createdAt: createdAt(),
});

export const activities = sqliteTable("activities", {
	id: text("id").primaryKey(),
	caseId: text("case_id")
		.notNull()
		.references(() => cases.id),
	description: text("description").notNull(),
	createdBy: text("created_by").references(() => users.id),
	createdAt: createdAt(),
});

export const approvals = sqliteTable("approvals", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
	caseId: text("case_id").notNull().references(() => cases.id),
	recommendationId: text("recommendation_id"),
	status: text("status").notNull(),
	approvedBy: text("approved_by").notNull().references(() => users.id),
	approvalNotes: text("approval_notes"),
	decidedAt: integer("decided_at", { mode: "timestamp_ms" }),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const supportInteractions = sqliteTable(
	"support_interactions",
	{
		id: text("id").primaryKey(),
		caseId: text("case_id").references(() => cases.id),
		provider: text("provider").notNull().default("servicenow"),
		externalTicketId: text("external_ticket_id").notNull(),
		workspaceId: text("workspace_id").references(() => workspaces.id),
		channel: text("channel").notNull(),
		receivedAt: integer("received_at", { mode: "timestamp_ms" }).notNull(),
		firstResolvedAt: integer("first_resolved_at", { mode: "timestamp_ms" }),
		resolvedOnFirstContact: integer("resolved_on_first_contact", { mode: "boolean" })
			.notNull()
			.default(false),
		escalationCount: integer("escalation_count").notNull().default(0),
		reopenCount: integer("reopen_count").notNull().default(0),
		repeatContactAt: integer("repeat_contact_at", { mode: "timestamp_ms" }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [uniqueIndex("support_interactions_workspace_provider_external_ticket_id_unique").on(table.workspaceId, table.provider, table.externalTicketId)],
);

export const serviceNowIntegrationEvents = sqliteTable("servicenow_integration_events", {
	id: text("id").primaryKey(),
	status: text("status").notNull(),
	externalTicketId: text("external_ticket_id"),
	missingFields: text("missing_fields"),
	message: text("message"),
	receivedAt: integer("received_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	workspaceId: text("workspace_id").references(() => workspaces.id),
});

export const usersRelations = relations(users, ({ many }) => ({
	createdCases: many(cases, { relationName: "createdCases" }),
	ownedCases: many(cases, { relationName: "ownedCases" }),
	assignedCases: many(cases, { relationName: "assignedCases" }),
}));

export const sitesRelations = relations(sites, ({ many }) => ({
	cases: many(cases),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
	site: one(sites, {
		fields: [cases.siteId],
		references: [sites.id],
	}),
	creator: one(users, {
		relationName: "createdCases",
		fields: [cases.createdBy],
		references: [users.id],
	}),
	owner: one(users, {
		relationName: "ownedCases",
		fields: [cases.ownerId],
		references: [users.id],
	}),
	assignee: one(users, {
		relationName: "assignedCases",
		fields: [cases.assignedTo],
		references: [users.id],
	}),
	incidents: many(incidents),
	evidence: many(evidence),
	activities: many(activities),
	supportInteractions: many(supportInteractions),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
	case: one(cases, {
		fields: [incidents.caseId],
		references: [cases.id],
	}),
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
	case: one(cases, {
		fields: [evidence.caseId],
		references: [cases.id],
	}),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
	case: one(cases, {
		fields: [activities.caseId],
		references: [cases.id],
	}),
	creator: one(users, {
		fields: [activities.createdBy],
		references: [users.id],
	}),
}));

export const supportInteractionsRelations = relations(supportInteractions, ({ one }) => ({
	case: one(cases, {
		fields: [supportInteractions.caseId],
		references: [cases.id],
	}),
}));
