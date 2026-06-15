-- CreateTable
CREATE TABLE `notification_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `push_enabled` BOOLEAN NOT NULL DEFAULT true,
    `sms_enabled` BOOLEAN NOT NULL DEFAULT true,
    `email_enabled` BOOLEAN NOT NULL DEFAULT false,
    `order_notification` BOOLEAN NOT NULL DEFAULT true,
    `promotion_notification` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `notification_settings_user_id_key`(`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64),
    `event_type` VARCHAR(50) NOT NULL,
    `event_data` JSON,
    `device_info` VARCHAR(255),
    `ip_address` VARCHAR(50),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_event_logs_user_id`(`user_id`),
    INDEX `idx_event_logs_event_type`(`event_type`),
    INDEX `idx_event_logs_created_at`(`created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `error_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64),
    `error_type` VARCHAR(50) NOT NULL,
    `error_message` TEXT NOT NULL,
    `stack_trace` TEXT,
    `request_url` VARCHAR(255),
    `request_data` TEXT,
    `device_info` VARCHAR(255),
    `ip_address` VARCHAR(50),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_error_logs_user_id`(`user_id`),
    INDEX `idx_error_logs_error_type`(`error_type`),
    INDEX `idx_error_logs_created_at`(`created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `performance_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64),
    `operation_type` VARCHAR(50) NOT NULL,
    `duration_ms` INT NOT NULL,
    `request_url` VARCHAR(255),
    `device_info` VARCHAR(255),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_performance_logs_user_id`(`user_id`),
    INDEX `idx_performance_logs_operation_type`(`operation_type`),
    INDEX `idx_performance_logs_created_at`(`created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_configs` (
    `config_key` VARCHAR(64) NOT NULL,
    `config_value` TEXT NOT NULL,
    `description` VARCHAR(255),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`config_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `from_text` VARCHAR(255),
    `to_text` VARCHAR(255),
    `search_type` VARCHAR(20) NOT NULL DEFAULT 'ride',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_search_history_user_id`(`user_id`),
    INDEX `idx_search_history_created_at`(`created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `protocols` (
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `content` TEXT NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `force_update` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notification_settings` ADD CONSTRAINT `notification_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default protocols
INSERT INTO `protocols` (`type`, `title`, `content`, `version`, `force_update`, `created_at`, `updated_at`) VALUES
('user-agreement', '用户服务协议', '# 用户服务协议\n\n欢迎使用拼车服务。请仔细阅读以下条款...\n\n## 一、服务内容\n...\n\n## 二、用户责任\n...', '1.0.0', false, NOW(), NOW()),
('privacy-policy', '隐私政策', '# 隐私政策\n\n我们重视您的隐私保护...\n\n## 一、信息收集\n...\n\n## 二、信息使用\n...', '1.0.0', false, NOW(), NOW());

-- Insert default system configs
INSERT INTO `system_configs` (`config_key`, `config_value`, `description`, `created_at`, `updated_at`) VALUES
('app_version', '1.0.0', '应用版本', NOW(), NOW()),
('min_app_version', '1.0.0', '最低支持版本', NOW(), NOW()),
('force_update_version', '0.0.0', '强制更新版本', NOW(), NOW()),
('download_url_android', 'https://example.com/download/android', 'Android下载地址', NOW(), NOW()),
('download_url_ios', 'https://apps.apple.com/app/xxx', 'iOS下载地址', NOW(), NOW()),
('update_log', '1. 新功能上线\n2. 修复已知问题\n3. 优化用户体验', '更新日志', NOW(), NOW()),
('customer_service_phone', '400-123-4567', '客服电话', NOW(), NOW()),
('max_upload_size', '10485760', '最大上传文件大小(字节)', NOW(), NOW());
