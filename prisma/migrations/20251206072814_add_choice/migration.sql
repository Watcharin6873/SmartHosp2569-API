/*
  Warnings:

  - You are about to drop the column `choice_name` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the column `score_1` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the column `score_2` on the `Choice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Evaluate` DROP FOREIGN KEY `Evaluate_choice_id_fkey`;

-- DropIndex
DROP INDEX `Evaluate_choice_id_fkey` ON `Evaluate`;

-- AlterTable
ALTER TABLE `Choice` DROP COLUMN `choice_name`,
    DROP COLUMN `score_1`,
    DROP COLUMN `score_2`;

-- CreateTable
CREATE TABLE `Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `choice_id` INTEGER NOT NULL,
    `choice_text` VARCHAR(191) NOT NULL,
    `choice_value` INTEGER NOT NULL DEFAULT 0,
    `choice_required` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `Choice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
