-- Add role/status to auth_users and create admin_audit_logs table

ALTER TABLE `auth_users`
  ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色: user / admin',
  ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active / disabled';

CREATE INDEX `idx_auth_users_role` ON `auth_users`(`role`);
CREATE INDEX `idx_auth_users_status` ON `auth_users`(`status`);

CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user_id` VARCHAR(64) NOT NULL COMMENT '操作管理员 ID',
  `action` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `target_user_id` VARCHAR(64) NOT NULL COMMENT '被操作用户 ID',
  `detail` JSON NULL COMMENT '操作详情',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_audit_admin_user_id` (`admin_user_id`),
  KEY `idx_admin_audit_target_user_id` (`target_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

