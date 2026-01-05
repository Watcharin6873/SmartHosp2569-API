/*
  Warnings:

  - You are about to drop the column `choice_id` on the `Evaluate` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `EvaluateAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `text_value` on the `EvaluateAnswer` table. All the data in the column will be lost.
  - Added the required column `score` to the `EvaluateAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `EvaluateAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `EvaluateAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `EvaluateAnswer` DROP FOREIGN KEY `EvaluateAnswer_sub_question_id_fkey`;

-- DropIndex
DROP INDEX `EvaluateAnswer_sub_question_id_idx` ON `EvaluateAnswer`;

-- AlterTable
ALTER TABLE `Evaluate` DROP COLUMN `choice_id`,
    ADD COLUMN `is_draft` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `EvaluateAnswer` DROP COLUMN `createdAt`,
    DROP COLUMN `text_value`,
    ADD COLUMN `answer_text` TEXT NULL,
    ADD COLUMN `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `score` DOUBLE NOT NULL,
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    MODIFY `sub_question_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
