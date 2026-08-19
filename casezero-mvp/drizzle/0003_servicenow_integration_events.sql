CREATE TABLE `servicenow_integration_events` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`external_ticket_id` text,
	`missing_fields` text,
	`message` text,
	`received_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);