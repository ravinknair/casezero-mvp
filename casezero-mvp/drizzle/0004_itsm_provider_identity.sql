ALTER TABLE `support_interactions` ADD `provider` text DEFAULT 'servicenow' NOT NULL;
--> statement-breakpoint
DROP INDEX `support_interactions_external_ticket_id_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `support_interactions_provider_external_ticket_id_unique` ON `support_interactions` (`provider`,`external_ticket_id`);