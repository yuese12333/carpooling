-- ============================================================
-- 种子数据：帮助问题 + 支付方式
-- 用法（在服务器 mysql 客户端登录后执行）：
--   mysql> USE <你的库名>;
--   mysql> SOURCE /path/to/seed-help-and-methods.sql;
-- 或：
--   $ mysql -u <user> -p <db> < seed-help-and-methods.sql
--
-- 说明：
--   1. help_questions：与 help_categories 关联，用于 GET /api/help/questions
--   2. payment_methods：需要绑定 auth_users.user_id；脚本会为前 5 个已注册用户各插 3 条
--      已存在同 method_id 的会被忽略（INSERT IGNORE）
-- ============================================================

-- 0) 帮助分类（确保至少有 4 个分类）
INSERT IGNORE INTO help_categories (category_id, title, icon_name, bg_color, sort_order, status)
VALUES
  ('cat_trip',    '行程相关', 'MapPin',      '#eef2ff', 1, 'enabled'),
  ('cat_payment', '支付费用', 'CreditCard',  '#fff7ed', 2, 'enabled'),
  ('cat_account', '账号信息', 'User',        '#fef9c3', 3, 'enabled'),
  ('cat_safety',  '安全中心', 'ShieldCheck', '#fee2e2', 4, 'enabled');

-- 1) 帮助问题（覆盖 4 个分类，2 条 hot）
-- 注：created_at / updated_at 必须显式给 NOW()，否则 Prisma 读取 0000-00-00 会 500
INSERT IGNORE INTO help_questions (question_id, category_id, question, answer, is_hot, sort_order, status, created_at, updated_at)
VALUES
  ('q_trip_book',    'cat_trip',    '如何预约明天的行程？',         '在首页点击「预约」选项，选择出发时间、起点终点后确认即可发起预约行程。', 1, 1, 'enabled', NOW(), NOW()),
  ('q_trip_cancel',  'cat_trip',    '行程已发布后还能修改时间吗？', '出发前 30 分钟可在「我的行程」修改时间或取消行程，多次取消会影响信用分。', 0, 2, 'enabled', NOW(), NOW()),
  ('q_pay_refund',   'cat_payment', '行程取消了，费用多久退还？',   '取消行程后，款项通常会在 1-3 个工作日原路退回您的支付账户。',          1, 1, 'enabled', NOW(), NOW()),
  ('q_pay_invoice',  'cat_payment', '怎么获取行程电子发票？',       '在「我的行程 > 已完成」中选择行程点击「申请发票」，48 小时内开具。',     0, 2, 'enabled', NOW(), NOW()),
  ('q_acc_realname', 'cat_account', '如何修改实名认证信息？',       '由于监管要求，实名认证一旦通过无法直接修改，请联系人工客服协助。',      0, 1, 'enabled', NOW(), NOW()),
  ('q_acc_pwd',      'cat_account', '忘记密码怎么找回？',           '在登录页点击「忘记密码」，按提示输入手机号验证码后重置即可。',           0, 2, 'enabled', NOW(), NOW()),
  ('q_safe_alert',   'cat_safety',  '行程中遇到紧急情况怎么办？',   '点击行程页右上角「一键报警」按钮，系统将同步定位与紧急联系人。',         0, 1, 'enabled', NOW(), NOW());

-- 2) 支付方式：为最早的 5 个 active 用户各插入 3 条（微信/支付宝/银行卡）
SET @uids = (SELECT GROUP_CONCAT(user_id) FROM (
  SELECT user_id FROM auth_users WHERE status = 'active' ORDER BY created_at ASC LIMIT 5
) t);

INSERT IGNORE INTO payment_methods (method_id, user_id, method_type, display_name, bind_summary, is_default, status, created_at, updated_at)
SELECT CONCAT('pm_wx_',  user_id), user_id, 'wechat', '微信支付', '已绑定: *8888',     1, 'active', NOW(), NOW() FROM auth_users WHERE FIND_IN_SET(user_id, @uids);

INSERT IGNORE INTO payment_methods (method_id, user_id, method_type, display_name, bind_summary, is_default, status, created_at, updated_at)
SELECT CONCAT('pm_ali_', user_id), user_id, 'alipay', '支付宝',  '已绑定: 138****0000', 0, 'active', NOW(), NOW() FROM auth_users WHERE FIND_IN_SET(user_id, @uids);

INSERT IGNORE INTO payment_methods (method_id, user_id, method_type, display_name, bind_summary, is_default, status, created_at, updated_at)
SELECT CONCAT('pm_bank_', user_id), user_id, 'bank',  '招商银行储蓄卡', '尾号 4210',     0, 'active', NOW(), NOW() FROM auth_users WHERE FIND_IN_SET(user_id, @uids);

-- 3) 修复历史脏数据（如果之前的版本插入过零日期，跑一次以下 UPDATE）
UPDATE help_questions  SET created_at = NOW() WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;
UPDATE help_questions  SET updated_at = NOW() WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;
UPDATE payment_methods SET created_at = NOW() WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;
UPDATE payment_methods SET updated_at = NOW() WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- 4) 校验
SELECT '--- help_questions ---' AS section;
SELECT category_id, question_id, question, created_at, updated_at FROM help_questions ORDER BY category_id, sort_order;
SELECT '--- payment_methods ---' AS section;
SELECT user_id, method_id, method_type, display_name, is_default, created_at, updated_at FROM payment_methods ORDER BY user_id, is_default DESC;
