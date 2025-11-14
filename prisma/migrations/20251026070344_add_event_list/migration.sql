-- AlterTable
ALTER TABLE `LogEvent` MODIFY `eventType` ENUM('register', 'signin', 'signout', 'create', 'read', 'update', 'change_status', 'delete', 'upload', 'ssj_approve', 'zone_approve', 'cancel', 'none') NOT NULL DEFAULT 'none';
