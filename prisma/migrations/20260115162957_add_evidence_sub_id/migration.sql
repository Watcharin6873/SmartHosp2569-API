-- CreateTable
CREATE TABLE `Evidence_sub_id` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluate_id` INTEGER NOT NULL,
    `sub_question_id` INTEGER NOT NULL,
    `evaluate_answer_id` INTEGER NOT NULL,
    `ev_filename` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
