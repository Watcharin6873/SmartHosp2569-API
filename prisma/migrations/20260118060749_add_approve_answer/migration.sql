-- CreateTable
CREATE TABLE `Approve_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluate_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `sub_quest_id` INTEGER NOT NULL,
    `hospital_code` VARCHAR(191) NOT NULL,
    `prov_approve` BOOLEAN NOT NULL DEFAULT false,
    `zone_approve` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_evaluate_id_fkey` FOREIGN KEY (`evaluate_id`) REFERENCES `Evaluate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_sub_quest_id_fkey` FOREIGN KEY (`sub_quest_id`) REFERENCES `Sub_quest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
