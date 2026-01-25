-- AlterTable
ALTER TABLE `LogEvent` MODIFY `eventType` ENUM('register', 'signin', 'signout', 'create', 'read', 'update', 'change_status', 'request_edit', 'cancel_edit', 'delete', 'upload', 'approve', 'unapprove', 'cancel', 'none') NOT NULL DEFAULT 'none';
