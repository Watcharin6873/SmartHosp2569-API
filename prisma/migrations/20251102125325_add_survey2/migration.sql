/*
  Warnings:

  - Added the required column `category_id` to the `Score_survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `Score_survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score_name` to the `Score_survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Score_survey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Score_survey` ADD COLUMN `category_id` INTEGER NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `question_id` INTEGER NOT NULL,
    ADD COLUMN `score_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `score_value` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Survey_form` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `alert_id` VARCHAR(191) NOT NULL,
    `hcode` VARCHAR(191) NOT NULL,
    `score_value` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Survey_comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `alert_id` VARCHAR(191) NOT NULL,
    `hcode` VARCHAR(191) NOT NULL,
    `comment_string` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Score_survey` ADD CONSTRAINT `Score_survey_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Score_survey` ADD CONSTRAINT `Score_survey_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey_form` ADD CONSTRAINT `Survey_form_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey_form` ADD CONSTRAINT `Survey_form_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey_form` ADD CONSTRAINT `Survey_form_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey_comment` ADD CONSTRAINT `Survey_comment_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey_comment` ADD CONSTRAINT `Survey_comment_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey_comment` ADD CONSTRAINT `Survey_comment_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
