/*
  Warnings:

  - You are about to drop the column `score_name` on the `Score_survey` table. All the data in the column will be lost.
  - You are about to drop the column `score_value` on the `Score_survey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Score_survey` DROP COLUMN `score_name`,
    DROP COLUMN `score_value`;

-- CreateTable
CREATE TABLE `Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `score_name` VARCHAR(191) NOT NULL,
    `score_value` INTEGER NOT NULL DEFAULT 0,
    `score_surveyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_score_surveyId_fkey` FOREIGN KEY (`score_surveyId`) REFERENCES `Score_survey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
