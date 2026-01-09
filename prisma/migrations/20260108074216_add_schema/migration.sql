/*
  Warnings:

  - You are about to drop the column `score` on the `EvaluateAnswer` table. All the data in the column will be lost.
  - Added the required column `answer_required` to the `EvaluateAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer_value` to the `EvaluateAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EvaluateAnswer` DROP COLUMN `score`,
    ADD COLUMN `answer_required` DOUBLE NOT NULL,
    ADD COLUMN `answer_value` DOUBLE NOT NULL;
