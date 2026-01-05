/*
  Warnings:

  - You are about to drop the column `question_type` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Question` DROP COLUMN `question_type`;

-- AlterTable
ALTER TABLE `Sub_quest` ADD COLUMN `question_type` ENUM('radio', 'checkbox') NOT NULL DEFAULT 'radio';
