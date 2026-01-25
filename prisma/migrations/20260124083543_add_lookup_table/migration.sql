-- AlterTable
ALTER TABLE `LogEvent` MODIFY `table_name` ENUM('Users', 'Topic', 'Category', 'Question', 'Evaluate', 'Choice', 'Survey', 'Evidence_all', 'Comment', 'Reply_comment', 'Notification', 'Hospitals', 'None') NOT NULL DEFAULT 'None';
