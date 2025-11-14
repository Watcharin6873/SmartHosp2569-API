/*
  Warnings:

  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Score_survey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Answer` DROP FOREIGN KEY `Answer_score_surveyId_fkey`;

-- DropForeignKey
ALTER TABLE `Score_survey` DROP FOREIGN KEY `Score_survey_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Score_survey` DROP FOREIGN KEY `Score_survey_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `Score_survey` DROP FOREIGN KEY `Score_survey_topic_id_fkey`;

-- DropTable
DROP TABLE `Answer`;

-- DropTable
DROP TABLE `Score_survey`;
