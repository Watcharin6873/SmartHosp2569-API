/*
  Warnings:

  - You are about to alter the column `choice_value` on the `Answer` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `choice_required` on the `Answer` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Answer` MODIFY `choice_value` DOUBLE NOT NULL,
    MODIFY `choice_required` DOUBLE NOT NULL;
