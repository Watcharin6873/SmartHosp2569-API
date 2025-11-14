/*
  Warnings:

  - You are about to drop the column `userEvent` on the `LogEvent` table. All the data in the column will be lost.
  - Added the required column `event_rec_id` to the `LogEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LogEvent` DROP COLUMN `userEvent`,
    ADD COLUMN `detail` TEXT NULL,
    ADD COLUMN `event_rec_id` INTEGER NOT NULL,
    ADD COLUMN `table_name` ENUM('Users', 'Topic', 'Category', 'Question', 'Choice', 'Survey', 'Evidence_all', 'Comment', 'Reply_comment', 'Notification', 'Hospitals', 'None') NOT NULL DEFAULT 'None';
