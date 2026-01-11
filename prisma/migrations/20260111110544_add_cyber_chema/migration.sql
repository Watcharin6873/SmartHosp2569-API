-- CreateTable
CREATE TABLE `Cyber_risk_level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hcode5` VARCHAR(191) NULL,
    `hcode9` VARCHAR(191) NULL,
    `province` VARCHAR(191) NOT NULL,
    `hname_th` VARCHAR(191) NOT NULL,
    `hosp_level` VARCHAR(191) NOT NULL,
    `cyber_level` VARCHAR(191) NOT NULL,
    `cyber_levelname` VARCHAR(191) NOT NULL,
    `zone_name` VARCHAR(191) NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `usersId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
