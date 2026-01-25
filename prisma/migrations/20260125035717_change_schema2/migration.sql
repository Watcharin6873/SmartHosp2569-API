/*
  Warnings:

  - You are about to drop the column `cratedAt` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ChatMessage` DROP COLUMN `cratedAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
