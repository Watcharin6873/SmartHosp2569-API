/*
  Warnings:

  - You are about to drop the column `survey_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the `Survey` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `evaluate_id` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_survey_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey` DROP FOREIGN KEY `Survey_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey` DROP FOREIGN KEY `Survey_choice_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey` DROP FOREIGN KEY `Survey_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey` DROP FOREIGN KEY `Survey_topic_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey` DROP FOREIGN KEY `Survey_user_id_fkey`;

-- DropIndex
DROP INDEX `Comment_survey_id_fkey` ON `Comment`;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `survey_id`,
    ADD COLUMN `evaluate_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Survey`;

-- CreateTable
CREATE TABLE `Score_survey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evaluate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `choice_id` INTEGER NOT NULL,
    `status_check` BOOLEAN NOT NULL DEFAULT false,
    `hospital_code` VARCHAR(191) NOT NULL,
    `hospital_name` VARCHAR(191) NOT NULL,
    `hospital_type` VARCHAR(191) NOT NULL,
    `alert_id` VARCHAR(191) NULL,
    `file_name` VARCHAR(191) NULL,
    `ssj_approve` BOOLEAN NOT NULL DEFAULT false,
    `zone_approve` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Score_survey` ADD CONSTRAINT `Score_survey_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `Choice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_evaluate_id_fkey` FOREIGN KEY (`evaluate_id`) REFERENCES `Evaluate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
