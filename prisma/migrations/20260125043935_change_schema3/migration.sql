/*
  Warnings:

  - You are about to drop the column `isRead` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `createdAT` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `ChatRoom` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[topic_id,room_type,province_code,zone_code]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ChatMessage` DROP COLUMN `isRead`,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `ChatRoom` DROP COLUMN `createdAT`,
    DROP COLUMN `province`,
    DROP COLUMN `zone`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `province_code` VARCHAR(191) NULL,
    ADD COLUMN `zone_code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ChatRoomMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ChatRoomMember_room_id_user_id_key`(`room_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ChatRead_message_id_user_id_key`(`message_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ChatRoom_topic_id_room_type_province_code_zone_code_key` ON `ChatRoom`(`topic_id`, `room_type`, `province_code`, `zone_code`);

-- AddForeignKey
ALTER TABLE `ChatRoomMember` ADD CONSTRAINT `ChatRoomMember_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `ChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomMember` ADD CONSTRAINT `ChatRoomMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRead` ADD CONSTRAINT `ChatRead_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `ChatMessage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRead` ADD CONSTRAINT `ChatRead_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
