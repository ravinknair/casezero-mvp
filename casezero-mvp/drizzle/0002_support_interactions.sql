CREATE TABLE `support_interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text,
	`external_ticket_id` text NOT NULL,
	`channel` text NOT NULL,
	`received_at` integer NOT NULL,
	`first_resolved_at` integer,
	`resolved_on_first_contact` integer DEFAULT false NOT NULL,
	`escalation_count` integer DEFAULT 0 NOT NULL,
	`reopen_count` integer DEFAULT 0 NOT NULL,
	`repeat_contact_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `support_interactions_external_ticket_id_unique` ON `support_interactions` (`external_ticket_id`);