/*
  Warnings:

  - You are about to drop the `Survey_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Survey_form` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_topic_id_fkey`;

-- DropForeignKey
ALTER TABLE `Choice` DROP FOREIGN KEY `Choice_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Choice` DROP FOREIGN KEY `Choice_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `Choice` DROP FOREIGN KEY `Choice_topic_id_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_topic_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey_comment` DROP FOREIGN KEY `Survey_comment_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey_comment` DROP FOREIGN KEY `Survey_comment_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey_comment` DROP FOREIGN KEY `Survey_comment_topic_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey_form` DROP FOREIGN KEY `Survey_form_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey_form` DROP FOREIGN KEY `Survey_form_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `Survey_form` DROP FOREIGN KEY `Survey_form_topic_id_fkey`;

-- DropIndex
DROP INDEX `Category_topic_id_fkey` ON `Category`;

-- DropIndex
DROP INDEX `Choice_category_id_fkey` ON `Choice`;

-- DropIndex
DROP INDEX `Choice_question_id_fkey` ON `Choice`;

-- DropIndex
DROP INDEX `Choice_topic_id_fkey` ON `Choice`;

-- DropIndex
DROP INDEX `Question_category_id_fkey` ON `Question`;

-- DropIndex
DROP INDEX `Question_topic_id_fkey` ON `Question`;

-- DropTable
DROP TABLE `Survey_comment`;

-- DropTable
DROP TABLE `Survey_form`;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
