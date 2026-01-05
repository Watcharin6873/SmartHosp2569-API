/*
  Warnings:

  - You are about to drop the column `evaluate_id` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Choice` table. All the data in the column will be lost.
  - Made the column `choice_id` on table `Answer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Answer` DROP FOREIGN KEY `Answer_choice_id_fkey`;

-- DropForeignKey
ALTER TABLE `Answer` DROP FOREIGN KEY `Answer_evaluate_id_fkey`;

-- DropIndex
DROP INDEX `Answer_choice_id_fkey` ON `Answer`;

-- DropIndex
DROP INDEX `Answer_evaluate_id_fkey` ON `Answer`;

-- AlterTable
ALTER TABLE `Answer` DROP COLUMN `evaluate_id`,
    MODIFY `choice_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Choice` DROP COLUMN `label`,
    DROP COLUMN `score`;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `Choice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
