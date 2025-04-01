CREATE TABLE `ebooks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`progress` text NOT NULL
);