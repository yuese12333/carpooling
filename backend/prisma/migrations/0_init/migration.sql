CREATE TABLE IF NOT EXISTS `auth_users` (
  `user_id` VARCHAR(64) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT '',
  `last_login_at` DATETIME NULL,
  `last_login_device_info` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_auth_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
