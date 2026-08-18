CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`site_id` text,
	`created_by` text,
	`owner_id` text,
	`assigned_to` text,
	`type` text NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'detect' NOT NULL,
	`confidence` integer DEFAULT 0 NOT NULL,
	`opened_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`resolved_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cases_case_id_unique` ON `cases` (`case_id`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`external_id` text,
	`source` text NOT NULL,
	`title` text NOT NULL,
	`severity` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`detected_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`resolved_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`environment` text DEFAULT 'production' NOT NULL,
	`region` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sites_code_unique` ON `sites` (`code`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'operator' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);