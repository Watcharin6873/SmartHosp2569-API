-- CreateTable
CREATE TABLE `EvaluateAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluate_id` INTEGER NOT NULL,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `sub_question_id` INTEGER NOT NULL,
    `choice_id` INTEGER NOT NULL,
    `answer_id` INTEGER NOT NULL,
    `text_value` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EvaluateAnswer_evaluate_id_idx`(`evaluate_id`),
    INDEX `EvaluateAnswer_sub_question_id_idx`(`sub_question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_evaluate_id_fkey` FOREIGN KEY (`evaluate_id`) REFERENCES `Evaluate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `Choice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_answer_id_fkey` FOREIGN KEY (`answer_id`) REFERENCES `Answer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
