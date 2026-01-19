/*
  Warnings:

  - You are about to drop the column `sub_quest_id` on the `Approve_answers` table. All the data in the column will be lost.
  - Added the required column `sub_question_id` to the `Approve_answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Approve_answers` DROP FOREIGN KEY `Approve_answers_sub_quest_id_fkey`;

-- DropIndex
DROP INDEX `Approve_answers_sub_quest_id_fkey` ON `Approve_answers`;

-- AlterTable
ALTER TABLE `Approve_answers` DROP COLUMN `sub_quest_id`,
    ADD COLUMN `sub_question_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
