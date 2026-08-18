import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const sites = sqliteTable("sites", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	code: text("code").notNull().unique(),
	environment: text("environment").notNull().default("production"),
	region: text("region"),
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
