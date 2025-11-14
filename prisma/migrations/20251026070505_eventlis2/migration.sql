/*
  Warnings:

  - The values [ssj_approve,zone_approve] on the enum `LogEvent_eventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `LogEvent` MODIFY `eventType` ENUM('register', 'signin', 'signout', 'create', 'read', 'update', 'change_status', 'delete', 'upload', 'approve', 'unapprove', 'cancel', 'none') NOT NULL DEFAULT 'none';
