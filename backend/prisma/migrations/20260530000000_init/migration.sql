-- CreateTable
CREATE TABLE `auth_users` (
    `user_id` VARCHAR(64) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `user_name` VARCHAR(50) NOT NULL,
    `avatar_url` VARCHAR(255) NULL DEFAULT '',
    `last_login_at` DATETIME(3) NULL,
    `last_login_device_info` TEXT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'user',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `auth_users_phone_key`(`phone`),
    INDEX `idx_auth_users_role`(`role`),
    INDEX `idx_auth_users_status`(`status`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_user_id` VARCHAR(64) NULL,
    `action` VARCHAR(50) NOT NULL,
    `target_user_id` VARCHAR(64) NULL,
    `detail` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_admin_audit_admin_user_id`(`admin_user_id`),
    INDEX `idx_admin_audit_target_user_id`(`target_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `user_id` VARCHAR(64) NOT NULL,
    `role_type` VARCHAR(16) NOT NULL DEFAULT 'passenger',
    `real_name` VARCHAR(50) NULL,
    `gender` VARCHAR(16) NULL,
    `age` INTEGER NULL,
    `nationality` VARCHAR(32) NULL,
    `accessibility_needs` JSON NULL,
    `social_mode` VARCHAR(16) NOT NULL DEFAULT 'efficiency',
    `credit_score` INTEGER NOT NULL DEFAULT 100,
    `total_completed_orders` INTEGER NOT NULL DEFAULT 0,
    `rating_avg` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    `accumulated_savings` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `level` INTEGER NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `real_name_auths` (
    `auth_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `real_name` VARCHAR(50) NOT NULL,
    `id_type` VARCHAR(30) NOT NULL DEFAULT 'id_card',
    `id_number_hash` VARCHAR(255) NOT NULL,
    `id_number_mask` VARCHAR(40) NOT NULL,
    `verify_status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `verified_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `real_name_auths_user_id_key`(`user_id`),
    INDEX `idx_real_name_auth_verify_status`(`verify_status`),
    PRIMARY KEY (`auth_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `emergency_contacts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `contact_name` VARCHAR(50) NOT NULL,
    `contact_phone` VARCHAR(20) NOT NULL,
    `relation_type` VARCHAR(30) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_emergency_contacts_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `driver_credentials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `driver_license_no` VARCHAR(64) NOT NULL,
    `driver_license_image_url` VARCHAR(255) NULL,
    `driver_license_expire_at` DATETIME(3) NULL,
    `vehicle_license_no` VARCHAR(64) NOT NULL,
    `vehicle_license_image_url` VARCHAR(255) NULL,
    `vehicle_license_expire_at` DATETIME(3) NULL,
    `verify_status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `reject_reason` VARCHAR(255) NULL,
    `reviewed_by` VARCHAR(64) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `driver_credentials_user_id_key`(`user_id`),
    UNIQUE INDEX `driver_credentials_driver_license_no_key`(`driver_license_no`),
    UNIQUE INDEX `driver_credentials_vehicle_license_no_key`(`vehicle_license_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `vehicle_id` VARCHAR(64) NOT NULL,
    `owner_user_id` VARCHAR(64) NOT NULL,
    `plate_number` VARCHAR(20) NOT NULL,
    `brand` VARCHAR(50) NULL,
    `model` VARCHAR(50) NULL,
    `color` VARCHAR(20) NULL,
    `seat_total` INTEGER NOT NULL DEFAULT 4,
    `has_accessibility_support` BOOLEAN NOT NULL DEFAULT false,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_non_smoking` BOOLEAN NOT NULL DEFAULT true,
    `has_air_conditioner` BOOLEAN NOT NULL DEFAULT true,
    `vehicle_status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `verify_status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `image_url` VARCHAR(255) NULL,
    `tags_json` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `vehicles_plate_number_key`(`plate_number`),
    INDEX `idx_vehicles_owner_user_id`(`owner_user_id`),
    INDEX `idx_vehicles_verify_status`(`verify_status`),
    PRIMARY KEY (`vehicle_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `user_locations` (
    `location_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'other',
    `label` VARCHAR(50) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_user_locations_user_id`(`user_id`),
    INDEX `idx_user_locations_type`(`type`),
    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `rides` (
    `ride_id` VARCHAR(64) NOT NULL,
    `driver_id` VARCHAR(64) NOT NULL,
    `vehicle_id` VARCHAR(64) NULL,
    `from_text` VARCHAR(255) NOT NULL,
    `from_detail` VARCHAR(255) NULL,
    `from_lat` DECIMAL(10, 7) NULL,
    `from_lng` DECIMAL(10, 7) NULL,
    `to_text` VARCHAR(255) NOT NULL,
    `to_detail` VARCHAR(255) NULL,
    `to_lat` DECIMAL(10, 7) NULL,
    `to_lng` DECIMAL(10, 7) NULL,
    `depart_at` DATETIME(3) NOT NULL,
    `seats_total` INTEGER NOT NULL DEFAULT 1,
    `seats_left` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `duration_text` VARCHAR(30) NULL,
    `distance_text` VARCHAR(30) NULL,
    `stops_json` JSON NULL,
    `notes` TEXT NULL,
    `tags_json` JSON NULL,
    `recurring_rules` JSON NULL,
    `ride_status` VARCHAR(20) NOT NULL DEFAULT 'open',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_rides_driver_id`(`driver_id`),
    INDEX `idx_rides_vehicle_id`(`vehicle_id`),
    INDEX `idx_rides_status_depart_at`(`ride_status`, `depart_at`),
    INDEX `idx_rides_status_from_depart`(`ride_status`, `from_text`, `depart_at`),
    INDEX `idx_rides_status_to_depart`(`ride_status`, `to_text`, `depart_at`),
    PRIMARY KEY (`ride_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `trip_participants` (
    `trip_id` VARCHAR(64) NOT NULL,
    `ride_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'upcoming',
    `booked_seats` INTEGER NOT NULL DEFAULT 1,
    `is_rated` BOOLEAN NOT NULL DEFAULT false,
    `cancel_reason` VARCHAR(255) NULL,
    `joined_at` TIMESTAMP(0) NOT NULL,
    `cancelled_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_trip_participants_user_status`(`user_id`, `status`),
    UNIQUE INDEX `trip_participants_ride_id_user_id_key`(`ride_id`, `user_id`),
    PRIMARY KEY (`trip_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `ride_requests` (
    `request_id` VARCHAR(64) NOT NULL,
    `passenger_user_id` VARCHAR(64) NOT NULL,
    `origin_text` VARCHAR(255) NOT NULL,
    `destination_text` VARCHAR(255) NOT NULL,
    `origin_lat` DECIMAL(10, 7) NULL,
    `origin_lng` DECIMAL(10, 7) NULL,
    `destination_lat` DECIMAL(10, 7) NULL,
    `destination_lng` DECIMAL(10, 7) NULL,
    `depart_at` DATETIME(3) NOT NULL,
    `passenger_count` INTEGER NOT NULL DEFAULT 1,
    `request_status` VARCHAR(20) NOT NULL DEFAULT 'open',
    `expires_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_ride_requests_passenger_user_id`(`passenger_user_id`),
    INDEX `idx_ride_requests_request_status`(`request_status`),
    INDEX `idx_ride_requests_depart_at`(`depart_at`),
    PRIMARY KEY (`request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `ride_orders` (
    `order_id` VARCHAR(64) NOT NULL,
    `request_id` VARCHAR(64) NOT NULL,
    `passenger_user_id` VARCHAR(64) NOT NULL,
    `driver_user_id` VARCHAR(64) NOT NULL,
    `vehicle_id` VARCHAR(64) NULL,
    `order_status` VARCHAR(24) NOT NULL DEFAULT 'pending_accept',
    `route_overlap_rate` DECIMAL(6, 3) NULL,
    `compliance_region_code` VARCHAR(30) NULL,
    `cancellation_reason` VARCHAR(255) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_ride_orders_request_id`(`request_id`),
    INDEX `idx_ride_orders_passenger_user_id`(`passenger_user_id`),
    INDEX `idx_ride_orders_driver_user_id`(`driver_user_id`),
    INDEX `idx_ride_orders_order_status`(`order_status`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `trip_locations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(64) NOT NULL,
    `latitude` DECIMAL(10, 7) NOT NULL,
    `longitude` DECIMAL(10, 7) NOT NULL,
    `deviation_flag` BOOLEAN NOT NULL DEFAULT false,
    `recorded_at` DATETIME(3) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_trip_locations_order_id_recorded_at`(`order_id`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `safety_alerts` (
    `alert_id` VARCHAR(64) NOT NULL,
    `order_id` VARCHAR(64) NOT NULL,
    `alert_type` VARCHAR(30) NOT NULL,
    `alert_level` VARCHAR(20) NOT NULL DEFAULT 'warn',
    `alert_message` VARCHAR(255) NOT NULL,
    `alert_status` VARCHAR(20) NOT NULL DEFAULT 'triggered',
    `triggered_at` DATETIME(3) NOT NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_safety_alerts_order_id`(`order_id`),
    INDEX `idx_safety_alerts_alert_status`(`alert_status`),
    PRIMARY KEY (`alert_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `method_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `method_type` VARCHAR(30) NOT NULL,
    `display_name` VARCHAR(80) NOT NULL,
    `bind_summary` VARCHAR(80) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `extra_json` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_payment_methods_user_id`(`user_id`),
    PRIMARY KEY (`method_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `order_payments` (
    `payment_id` VARCHAR(64) NOT NULL,
    `order_id` VARCHAR(64) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `toll_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `passenger_payable` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `driver_income` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `payment_status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `payment_method` VARCHAR(80) NULL,
    `transaction_id` VARCHAR(80) NULL,
    `paid_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `order_payments_order_id_key`(`order_id`),
    UNIQUE INDEX `order_payments_transaction_id_key`(`transaction_id`),
    INDEX `idx_order_payments_payment_status`(`payment_status`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `receipts` (
    `receipt_id` VARCHAR(64) NOT NULL,
    `payment_id` VARCHAR(64) NOT NULL,
    `merchant` VARCHAR(100) NOT NULL,
    `receipt_status` VARCHAR(30) NOT NULL,
    `route_from` VARCHAR(255) NULL,
    `route_to` VARCHAR(255) NULL,
    `issued_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `receipts_payment_id_key`(`payment_id`),
    PRIMARY KEY (`receipt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `notification_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `content` TEXT NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'info',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_notifications_user_read`(`user_id`, `is_read`),
    INDEX `idx_notifications_category`(`category`),
    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `badge_code` VARCHAR(50) NOT NULL,
    `label` VARCHAR(50) NOT NULL,
    `emoji` VARCHAR(16) NULL,
    `unlocked` BOOLEAN NOT NULL DEFAULT false,
    `unlocked_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_badges_user_id_badge_code_key`(`user_id`, `badge_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `invite_codes` (
    `invite_code` VARCHAR(20) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_invite_codes_user_id`(`user_id`),
    PRIMARY KEY (`invite_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `invite_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `invite_code` VARCHAR(20) NOT NULL,
    `invitee_user_id` VARCHAR(64) NULL,
    `reward_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `reward_status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `rewarded_at` DATETIME(3) NULL,

    INDEX `idx_invite_records_invitee_user_id`(`invitee_user_id`),
    UNIQUE INDEX `invite_records_invite_code_invitee_user_id_key`(`invite_code`, `invitee_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `share_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `platform` VARCHAR(30) NOT NULL,
    `scene` VARCHAR(30) NOT NULL DEFAULT 'invite',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_share_events_user_created_at`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `help_categories` (
    `category_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(60) NOT NULL,
    `icon_name` VARCHAR(60) NOT NULL,
    `bg_color` VARCHAR(30) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'enabled',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_help_categories_status_sort`(`status`, `sort_order`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `help_questions` (
    `question_id` VARCHAR(64) NOT NULL,
    `category_id` VARCHAR(64) NULL,
    `question` VARCHAR(255) NOT NULL,
    `answer` TEXT NOT NULL,
    `is_hot` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'enabled',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `idx_help_questions_category_id`(`category_id`),
    INDEX `idx_help_questions_hot_status`(`is_hot`, `status`),
    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `user_violations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `order_id` VARCHAR(64) NULL,
    `violation_type` VARCHAR(40) NOT NULL,
    `penalty_points` INTEGER NOT NULL DEFAULT 0,
    `penalty_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_violations_user_id`(`user_id`),
    INDEX `idx_user_violations_order_id`(`order_id`),
    INDEX `idx_user_violations_user_type`(`user_id`, `violation_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `order_ratings` (
    `rating_id` VARCHAR(64) NOT NULL,
    `order_id` VARCHAR(64) NOT NULL,
    `from_user_id` VARCHAR(64) NOT NULL,
    `to_user_id` VARCHAR(64) NOT NULL,
    `score` INTEGER NOT NULL,
    `comment_text` VARCHAR(255) NULL,
    `tags_json` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_order_ratings_to_user_id`(`to_user_id`),
    UNIQUE INDEX `order_ratings_order_id_from_user_id_to_user_id_key`(`order_id`, `from_user_id`, `to_user_id`),
    PRIMARY KEY (`rating_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `user_preference_tags` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `tag_type` VARCHAR(30) NOT NULL,
    `tag_value` VARCHAR(30) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_preference_tags_user_id`(`user_id`),
    UNIQUE INDEX `user_preference_tags_user_id_tag_type_tag_value_key`(`user_id`, `tag_type`, `tag_value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `compliance_region_rules` (
    `rule_id` VARCHAR(64) NOT NULL,
    `region_code` VARCHAR(30) NOT NULL,
    `region_name` VARCHAR(60) NOT NULL,
    `daily_driver_order_limit` INTEGER NOT NULL DEFAULT 2,
    `max_passenger_count` INTEGER NOT NULL DEFAULT 4,
    `rule_status` VARCHAR(20) NOT NULL DEFAULT 'enabled',
    `policy_json` JSON NULL,
    `updated_by` VARCHAR(64) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `compliance_region_rules_region_code_key`(`region_code`),
    PRIMARY KEY (`rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `carbon_accounts` (
    `user_id` VARCHAR(64) NOT NULL,
    `carbon_points` INTEGER NOT NULL DEFAULT 0,
    `total_reduced_kg` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- CreateTable
CREATE TABLE `carbon_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `order_id` VARCHAR(64) NULL,
    `points_delta` INTEGER NOT NULL,
    `reduced_kg` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `biz_type` VARCHAR(30) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_carbon_transactions_user_id`(`user_id`),
    INDEX `idx_carbon_transactions_order_id`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- AddForeignKey
ALTER TABLE `admin_audit_logs` ADD CONSTRAINT `admin_audit_logs_admin_user_id_fkey` FOREIGN KEY (`admin_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_audit_logs` ADD CONSTRAINT `admin_audit_logs_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `real_name_auths` ADD CONSTRAINT `real_name_auths_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_contacts` ADD CONSTRAINT `emergency_contacts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `driver_credentials` ADD CONSTRAINT `driver_credentials_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `auth_users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `driver_credentials` ADD CONSTRAINT `driver_credentials_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_owner_user_id_fkey` FOREIGN KEY (`owner_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_locations` ADD CONSTRAINT `user_locations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rides` ADD CONSTRAINT `rides_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rides` ADD CONSTRAINT `rides_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`vehicle_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_participants` ADD CONSTRAINT `trip_participants_ride_id_fkey` FOREIGN KEY (`ride_id`) REFERENCES `rides`(`ride_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_participants` ADD CONSTRAINT `trip_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ride_requests` ADD CONSTRAINT `ride_requests_passenger_user_id_fkey` FOREIGN KEY (`passenger_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ride_orders` ADD CONSTRAINT `ride_orders_compliance_region_code_fkey` FOREIGN KEY (`compliance_region_code`) REFERENCES `compliance_region_rules`(`region_code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ride_orders` ADD CONSTRAINT `ride_orders_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `ride_requests`(`request_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ride_orders` ADD CONSTRAINT `ride_orders_passenger_user_id_fkey` FOREIGN KEY (`passenger_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ride_orders` ADD CONSTRAINT `ride_orders_driver_user_id_fkey` FOREIGN KEY (`driver_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ride_orders` ADD CONSTRAINT `ride_orders_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`vehicle_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_locations` ADD CONSTRAINT `trip_locations_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ride_orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `safety_alerts` ADD CONSTRAINT `safety_alerts_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ride_orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_payments` ADD CONSTRAINT `order_payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ride_orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `order_payments`(`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invite_codes` ADD CONSTRAINT `invite_codes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invite_records` ADD CONSTRAINT `invite_records_invite_code_fkey` FOREIGN KEY (`invite_code`) REFERENCES `invite_codes`(`invite_code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invite_records` ADD CONSTRAINT `invite_records_invitee_user_id_fkey` FOREIGN KEY (`invitee_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `share_events` ADD CONSTRAINT `share_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `help_questions` ADD CONSTRAINT `help_questions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `help_categories`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_violations` ADD CONSTRAINT `user_violations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_violations` ADD CONSTRAINT `user_violations_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ride_orders`(`order_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_ratings` ADD CONSTRAINT `order_ratings_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ride_orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_ratings` ADD CONSTRAINT `order_ratings_from_user_id_fkey` FOREIGN KEY (`from_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_ratings` ADD CONSTRAINT `order_ratings_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preference_tags` ADD CONSTRAINT `user_preference_tags_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compliance_region_rules` ADD CONSTRAINT `compliance_region_rules_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `auth_users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carbon_accounts` ADD CONSTRAINT `carbon_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carbon_transactions` ADD CONSTRAINT `carbon_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carbon_transactions` ADD CONSTRAINT `carbon_transactions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `ride_orders`(`order_id`) ON DELETE SET NULL ON UPDATE CASCADE;

