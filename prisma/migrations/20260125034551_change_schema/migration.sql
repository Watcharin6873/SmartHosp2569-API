/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reply_comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_evaluate_id_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Reply_comment` DROP FOREIGN KEY `Reply_comment_comment_id_fkey`;

-- DropForeignKey
ALTER TABLE `Reply_comment` DROP FOREIGN KEY `Reply_comment_user_id_fkey`;

-- DropTable
DROP TABLE `Comment`;

-- DropTable
DROP TABLE `Reply_comment`;

-- CreateTable
CREATE TABLE `ChatRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `room_type` ENUM('HOSPITAL_PROVINCE', 'PROVINCE_REGION') NOT NULL,
    `province` VARCHAR(191) NULL,
    `zone` VARCHAR(191) NULL,
    `createdAT` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `content` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isRead` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `ChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
