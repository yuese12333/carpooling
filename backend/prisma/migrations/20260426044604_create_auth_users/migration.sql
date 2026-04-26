-- AlterTable
ALTER TABLE `auth_users` MODIFY `last_login_at` DATETIME(3) NULL,
    ALTER COLUMN `updated_at` DROP DEFAULT;

-- RenameIndex
ALTER TABLE `auth_users` RENAME INDEX `uk_auth_users_phone` TO `auth_users_phone_key`;
