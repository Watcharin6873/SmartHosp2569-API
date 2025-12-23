/*
  Warnings:

  - You are about to drop the column `sub_quest_id` on the `Choice` table. All the data in the column will be lost.
  - Added the required column `sub_question_id` to the `Choice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Choice` DROP FOREIGN KEY `Choice_sub_quest_id_fkey`;

-- DropIndex
DROP INDEX `Choice_sub_quest_id_fkey` ON `Choice`;

-- AlterTable
ALTER TABLE `Choice` DROP COLUMN `sub_quest_id`,
    ADD COLUMN `sub_question_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
