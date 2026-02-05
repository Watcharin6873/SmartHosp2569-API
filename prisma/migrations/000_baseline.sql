-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `title_th` VARCHAR(191) NOT NULL,
    `name_th` VARCHAR(191) NOT NULL,
    `position_id` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `hcode` VARCHAR(191) NOT NULL,
    `hcode9` VARCHAR(191) NOT NULL,
    `hname_th` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `zone` VARCHAR(191) NOT NULL,
    `user_type` ENUM('Centre', 'Zone', 'Prov', 'Unit_service') NOT NULL DEFAULT 'Unit_service',
    `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `Users_hcode9_fkey`(`hcode9`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_name` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT false,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `Topic_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_name_th` TEXT NOT NULL,
    `category_name_eng` TEXT NOT NULL,
    `fiscal_year` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Category_topic_id_fkey`(`topic_id`),
    INDEX `Category_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_name` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `Question_category_id_fkey`(`category_id`),
    INDEX `Question_topic_id_fkey`(`topic_id`),
    INDEX `Question_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sub_quest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `sub_quest_name` TEXT NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `question_type` ENUM('radio', 'checkbox') NOT NULL DEFAULT 'radio',
    `user_id` INTEGER NOT NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `Sub_quest_category_id_fkey`(`category_id`),
    INDEX `Sub_quest_question_id_fkey`(`question_id`),
    INDEX `Sub_quest_topic_id_fkey`(`topic_id`),
    INDEX `Sub_quest_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Choice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `sub_question_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `has_text` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Choice_category_id_fkey`(`category_id`),
    INDEX `Choice_question_id_fkey`(`question_id`),
    INDEX `Choice_sub_question_id_fkey`(`sub_question_id`),
    INDEX `Choice_topic_id_fkey`(`topic_id`),
    INDEX `Choice_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `choice_id` INTEGER NOT NULL,
    `choice_text` TEXT NOT NULL,
    `choice_value` DOUBLE NOT NULL,
    `choice_required` DOUBLE NOT NULL,

    INDEX `Answer_choice_id_fkey`(`choice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evaluate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `status_check` BOOLEAN NOT NULL DEFAULT false,
    `is_draft` BOOLEAN NOT NULL DEFAULT true,
    `hospital_code` VARCHAR(191) NOT NULL,
    `hospital_name` VARCHAR(191) NOT NULL,
    `hospital_type` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NULL,
    `ssj_approve` BOOLEAN NOT NULL DEFAULT false,
    `zone_approve` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `Evaluate_category_id_fkey`(`category_id`),
    INDEX `Evaluate_question_id_fkey`(`question_id`),
    INDEX `Evaluate_topic_id_fkey`(`topic_id`),
    INDEX `Evaluate_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluateAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluate_id` INTEGER NOT NULL,
    `topic_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `sub_question_id` INTEGER NULL,
    `choice_id` INTEGER NOT NULL,
    `answer_id` INTEGER NOT NULL,
    `answer_text` TEXT NULL,
    `answer_value` DOUBLE NOT NULL,
    `answer_required` DOUBLE NOT NULL,
    `prov_approve` BOOLEAN NULL,
    `zone_approve` BOOLEAN NULL,
    `user_id` INTEGER NOT NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `EvaluateAnswer_evaluate_id_idx`(`evaluate_id`),
    INDEX `EvaluateAnswer_answer_id_fkey`(`answer_id`),
    INDEX `EvaluateAnswer_category_id_fkey`(`category_id`),
    INDEX `EvaluateAnswer_choice_id_fkey`(`choice_id`),
    INDEX `EvaluateAnswer_question_id_fkey`(`question_id`),
    INDEX `EvaluateAnswer_sub_question_id_fkey`(`sub_question_id`),
    INDEX `EvaluateAnswer_topic_id_fkey`(`topic_id`),
    INDEX `EvaluateAnswer_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evidence_all` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `file_ev` VARCHAR(191) NOT NULL,
    `hcode9` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `cratedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `Evidence_all_category_id_fkey`(`category_id`),
    INDEX `Evidence_all_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evidence_sub_id` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluate_id` INTEGER NOT NULL,
    `sub_question_id` INTEGER NOT NULL,
    `evaluate_answer_id` INTEGER NOT NULL,
    `hcode9` VARCHAR(191) NOT NULL,
    `ev_filename` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Approve_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluate_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `sub_question_id` INTEGER NOT NULL,
    `hospital_code` VARCHAR(191) NOT NULL,
    `prov_status` ENUM('NONE', 'PASS', 'FAIL') NOT NULL DEFAULT 'NONE',
    `zone_status` ENUM('NONE', 'PASS', 'FAIL') NOT NULL DEFAULT 'NONE',
    `is_checked` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Approve_answers_category_id_fkey`(`category_id`),
    INDEX `Approve_answers_evaluate_id_fkey`(`evaluate_id`),
    INDEX `Approve_answers_question_id_fkey`(`question_id`),
    INDEX `Approve_answers_sub_question_id_fkey`(`sub_question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER NOT NULL,
    `room_type` ENUM('HOSPITAL_PROVINCE', 'PROVINCE_REGION') NOT NULL,
    `hcode9` VARCHAR(20) NOT NULL,
    `province_code` VARCHAR(10) NULL,
    `zone_code` VARCHAR(10) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_chatroom_v2`(`topic_id`, `room_type`, `hcode9`, `province_code`, `zone_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRoomMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `hcode9` VARCHAR(20) NOT NULL,
    `joinedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_chatroommember_user`(`user_id`),
    UNIQUE INDEX `uq_room_user`(`room_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `hcode9` VARCHAR(20) NOT NULL,
    `content` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_chatmessage_room`(`room_id`),
    INDEX `fk_chatmessage_sender`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `readAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_chatread_user`(`user_id`),
    UNIQUE INDEX `uq_message_user`(`message_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` VARCHAR(191) NOT NULL,

    INDEX `Notification_receiver_id_fkey`(`receiver_id`),
    INDEX `Notification_sender_id_fkey`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hospitals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hname_th` VARCHAR(191) NOT NULL,
    `hcode9` VARCHAR(191) NOT NULL,
    `hcode5` VARCHAR(191) NOT NULL,
    `dept_type` VARCHAR(191) NOT NULL,
    `medical_level` VARCHAR(191) NULL,
    `use_status` VARCHAR(191) NOT NULL,
    `sub_district_code` VARCHAR(191) NOT NULL,
    `sub_district` VARCHAR(191) NOT NULL,
    `district_code` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `province_code` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `zone` VARCHAR(191) NOT NULL,
    `zone_name` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NULL,

    UNIQUE INDEX `Hospitals_hcode9_key`(`hcode9`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_rec_id` INTEGER NOT NULL,
    `table_name` ENUM('Users', 'Topic', 'Category', 'Question', 'Evaluate', 'Choice', 'Survey', 'Evidence_all', 'Comment', 'Reply_comment', 'Notification', 'Hospitals', 'None') NOT NULL DEFAULT 'None',
    `eventType` ENUM('register', 'signin', 'signout', 'create', 'read', 'update', 'change_status', 'request_edit', 'cancel_edit', 'delete', 'upload', 'approve', 'unapprove', 'cancel', 'none') NOT NULL DEFAULT 'none',
    `description` TEXT NULL,
    `detail` TEXT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LogEvent_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cyber_risk_level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hcode5` VARCHAR(191) NULL,
    `hcode9` VARCHAR(191) NULL,
    `province` VARCHAR(191) NOT NULL,
    `hname_th` VARCHAR(191) NOT NULL,
    `hosp_level` VARCHAR(191) NOT NULL,
    `verify_status` VARCHAR(255) NULL,
    `cyber_level` VARCHAR(191) NOT NULL,
    `cyber_levelname` VARCHAR(191) NOT NULL,
    `zone_name` VARCHAR(191) NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `usersId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Approve_chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `sub_question_id` INTEGER NOT NULL,
    `hospital_code` VARCHAR(20) NOT NULL,
    `sender_role` ENUM('ZONE', 'PROVINCE', 'HOSPITAL') NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_sub_question_hospital`(`category_id`, `question_id`, `sub_question_id`, `hospital_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_hcode9_fkey` FOREIGN KEY (`hcode9`) REFERENCES `Hospitals`(`hcode9`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Topic` ADD CONSTRAINT `Topic_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sub_quest` ADD CONSTRAINT `Sub_quest_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sub_quest` ADD CONSTRAINT `Sub_quest_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sub_quest` ADD CONSTRAINT `Sub_quest_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sub_quest` ADD CONSTRAINT `Sub_quest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Choice` ADD CONSTRAINT `Choice_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `Choice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluate` ADD CONSTRAINT `Evaluate_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_answer_id_fkey` FOREIGN KEY (`answer_id`) REFERENCES `Answer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `Choice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_evaluate_id_fkey` FOREIGN KEY (`evaluate_id`) REFERENCES `Evaluate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateAnswer` ADD CONSTRAINT `EvaluateAnswer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidence_all` ADD CONSTRAINT `Evidence_all_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidence_all` ADD CONSTRAINT `Evidence_all_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_evaluate_id_fkey` FOREIGN KEY (`evaluate_id`) REFERENCES `Evaluate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approve_answers` ADD CONSTRAINT `Approve_answers_sub_question_id_fkey` FOREIGN KEY (`sub_question_id`) REFERENCES `Sub_quest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `fk_chatroom_topic` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ChatRoomMember` ADD CONSTRAINT `fk_chatroommember_room` FOREIGN KEY (`room_id`) REFERENCES `ChatRoom`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ChatRoomMember` ADD CONSTRAINT `fk_chatroommember_user` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `fk_chatmessage_room` FOREIGN KEY (`room_id`) REFERENCES `ChatRoom`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `fk_chatmessage_sender` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ChatRead` ADD CONSTRAINT `fk_chatread_message` FOREIGN KEY (`message_id`) REFERENCES `ChatMessage`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ChatRead` ADD CONSTRAINT `fk_chatread_user` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogEvent` ADD CONSTRAINT `LogEvent_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

