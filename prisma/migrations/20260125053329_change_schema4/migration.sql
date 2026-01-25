/*
  Warnings:

  - A unique constraint covering the columns `[hcode9]` on the table `Hospitals` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Hospitals_hcode9_key` ON `Hospitals`(`hcode9`);

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_hcode9_fkey` FOREIGN KEY (`hcode9`) REFERENCES `Hospitals`(`hcode9`) ON DELETE RESTRICT ON UPDATE CASCADE;
