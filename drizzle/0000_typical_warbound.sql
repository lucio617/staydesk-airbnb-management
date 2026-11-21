CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`booking` text NOT NULL,
	`guest` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`key` text NOT NULL
);
