CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`description` text NOT NULL,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`timestamp` text NOT NULL,
	`color` text DEFAULT 'blue' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action
);
