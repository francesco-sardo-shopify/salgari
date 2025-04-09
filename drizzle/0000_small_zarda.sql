CREATE TABLE `ebooks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`location` text NOT NULL,
	`current_text` text NOT NULL
);
