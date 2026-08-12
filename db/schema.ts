import { sql } from "drizzle-orm";
import { integer, sqliteTable as table, text, real } from "drizzle-orm/sqlite-core";

// Users table for multi-user support
export const users = table("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["viewer", "creator", "approver", "admin"] }).default("viewer"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Cases/Incidents table
export const cases = table("cases", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().unique(), // e.g., "CZ-1917"
  type: text("type").notNull(), // "CERTIFICATE RISK", "PRODUCTION INCIDENT", etc.
  severity: text("severity").notNull(), // "EXPIRES IN 6 DAYS", "SEV-2", etc.
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  status: text("status", { enum: ["detect", "diagnose", "decide", "act", "verify", "resolved", "rejected"] }).default("detect"),
  confidence: real("confidence").default(0), // 0-100 percentage
  sources: integer("sources").default(0),
  activity: integer("activity").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  createdBy: text("created_by").notNull().references(() => users.id),
});

// Diagnosis/Analysis
export const diagnoses = table("diagnoses", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  chain: text("chain").notNull(), // JSON array of causal chain steps
  rootCause: text("root_cause"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Recommendations/Actions
export const recommendations = table("recommendations", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  actionLabel: text("action_label").notNull(),
  riskValue: text("risk_value"), // "1 region", "10%", etc.
  riskLabel: text("risk_label"),
  actionStep: text("action_step"),
  verifyStep: text("verify_step"),
  note: text("note"),
  approvedNotice: text("approved_notice"),
  rejectedNotice: text("rejected_notice"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Checks/Verifications
export const checks = table("checks", {
  id: text("id").primaryKey(),
  recommendationId: text("recommendation_id").notNull().references(() => recommendations.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "passed", "failed"] }).default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Automatic stop conditions
export const stopConditions = table("stop_conditions", {
  id: text("id").primaryKey(),
  recommendationId: text("recommendation_id").notNull().references(() => recommendations.id),
  condition: text("condition").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Metrics/KPIs
export const metrics = table("metrics", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  name: text("name").notNull(),
  value: text("value").notNull(),
  change: text("change"), // "+10.7%", etc.
  status: text("status", { enum: ["neutral", "warn", "danger"] }).default("neutral"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Evidence/Audit trail
export const evidence = table("evidence", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  type: text("type").notNull(), // "C" for Certificate, "V" for Vault, "D" for DNS, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull(),
  color: text("color").default("blue"), // "blue", "purple", "green", etc.
  sourceData: text("source_data"), // JSON raw evidence
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Activities/Timeline
export const activities = table("activities", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  createdBy: text("created_by").notNull().references(() => users.id),
});

// Policies
export const policies = table("policies", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  policyCode: text("policy_code").notNull(), // "SECRET-ROTATION-07", etc.
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "passed", "failed"] }).default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Approval workflow
export const approvals = table("approvals", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  recommendationId: text("recommendation_id").references(() => recommendations.id),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  approvedBy: text("approved_by").references(() => users.id),
  approvalNotes: text("approval_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  decidedAt: integer("decided_at", { mode: "timestamp" }),
});
