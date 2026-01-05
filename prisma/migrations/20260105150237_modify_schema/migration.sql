-- DropForeignKey
ALTER TABLE `Answer` DROP FOREIGN KEY `Answer_choice_id_fkey`;

-- DropForeignKey
ALTER TABLE `Choice` DROP FOREIGN KEY `Choice_sub_question_id_fkey`;

-- DropIndex
DROP INDEX `Answer_choice_id_fkey` ON `Answer`;

-- DropIndex
DROP INDEX `Choice_sub_question_id_fkey` ON `Choice`;

-- AlterTable
ALTER TABLE `Answer` ADD COLUMN `evaluate_id` INTEGER NULL,
    MODIFY `choice_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Choice` ADD COLUMN `has_text` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `label` TEXT NULL,
    ADD COLUMN `score` DOUBLE NULL,
    MODIFY `sub_question_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `question_type` ENUM('radio', 'checkbox') NOT NULL DEFAULT 'radio';

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `Choice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_evaluate_id_fkey` FOREIGN KEY (`evaluate_id`) REFERENCES `Evaluate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
