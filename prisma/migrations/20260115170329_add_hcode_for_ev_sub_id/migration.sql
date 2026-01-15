/*
  Warnings:

  - Added the required column `hcode9` to the `Evidence_sub_id` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Evidence_sub_id` ADD COLUMN `hcode9` VARCHAR(191) NOT NULL;
