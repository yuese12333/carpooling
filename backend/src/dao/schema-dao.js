/**
 * 文件功能：数据库核心表结构初始化
 * 关联业务：账号、订单、安全、合规、评价、积分等基础数据模型
 */
const pool = require('../config/db');
const { logger } = require('../utils/logger');

let ensureCoreSchemaPromise;

const CORE_SCHEMA_SQLS = [
  {
    name: 'auth_users',
    sql: `
      CREATE TABLE IF NOT EXISTS auth_users (
        user_id VARCHAR(64) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_name VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT '',
        last_login_at DATETIME NULL,
        last_login_device_info TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        UNIQUE KEY uk_auth_users_phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'user_profiles',
    sql: `
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(64) NOT NULL,
        role_type VARCHAR(16) NOT NULL DEFAULT 'passenger',
        real_name VARCHAR(50) NULL,
        gender VARCHAR(16) NULL,
        age INT NULL,
        nationality VARCHAR(32) NULL,
        accessibility_needs JSON NULL,
        social_mode VARCHAR(16) NOT NULL DEFAULT 'efficiency',
        credit_score INT NOT NULL DEFAULT 100,
        total_completed_orders INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        CONSTRAINT fk_user_profiles_auth_users
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'emergency_contacts',
    sql: `
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id VARCHAR(64) NOT NULL,
        contact_name VARCHAR(50) NOT NULL,
        contact_phone VARCHAR(20) NOT NULL,
        relation_type VARCHAR(30) NULL,
        is_primary TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_emergency_contacts_user_id (user_id),
        CONSTRAINT fk_emergency_contacts_auth_users
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'driver_credentials',
    sql: `
      CREATE TABLE IF NOT EXISTS driver_credentials (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id VARCHAR(64) NOT NULL,
        driver_license_no VARCHAR(64) NOT NULL,
        driver_license_image_url VARCHAR(255) NULL,
        vehicle_license_no VARCHAR(64) NOT NULL,
        vehicle_license_image_url VARCHAR(255) NULL,
        verify_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        reject_reason VARCHAR(255) NULL,
        reviewed_by VARCHAR(64) NULL,
        reviewed_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_driver_credentials_user_id (user_id),
        UNIQUE KEY uk_driver_credentials_driver_license_no (driver_license_no),
        UNIQUE KEY uk_driver_credentials_vehicle_license_no (vehicle_license_no),
        CONSTRAINT fk_driver_credentials_auth_users
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'vehicles',
    sql: `
      CREATE TABLE IF NOT EXISTS vehicles (
        vehicle_id VARCHAR(64) NOT NULL,
        owner_user_id VARCHAR(64) NOT NULL,
        plate_number VARCHAR(20) NOT NULL,
        brand VARCHAR(50) NULL,
        model VARCHAR(50) NULL,
        color VARCHAR(20) NULL,
        seat_total INT NOT NULL DEFAULT 4,
        has_accessibility_support TINYINT(1) NOT NULL DEFAULT 0,
        vehicle_status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (vehicle_id),
        UNIQUE KEY uk_vehicles_plate_number (plate_number),
        KEY idx_vehicles_owner_user_id (owner_user_id),
        CONSTRAINT fk_vehicles_auth_users
          FOREIGN KEY (owner_user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'ride_requests',
    sql: `
      CREATE TABLE IF NOT EXISTS ride_requests (
        request_id VARCHAR(64) NOT NULL,
        passenger_user_id VARCHAR(64) NOT NULL,
        origin_text VARCHAR(255) NOT NULL,
        destination_text VARCHAR(255) NOT NULL,
        origin_lat DECIMAL(10, 7) NULL,
        origin_lng DECIMAL(10, 7) NULL,
        destination_lat DECIMAL(10, 7) NULL,
        destination_lng DECIMAL(10, 7) NULL,
        depart_at DATETIME NOT NULL,
        passenger_count INT NOT NULL DEFAULT 1,
        request_status VARCHAR(20) NOT NULL DEFAULT 'open',
        expires_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (request_id),
        KEY idx_ride_requests_passenger_user_id (passenger_user_id),
        KEY idx_ride_requests_request_status (request_status),
        KEY idx_ride_requests_depart_at (depart_at),
        CONSTRAINT fk_ride_requests_auth_users
          FOREIGN KEY (passenger_user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'ride_orders',
    sql: `
      CREATE TABLE IF NOT EXISTS ride_orders (
        order_id VARCHAR(64) NOT NULL,
        request_id VARCHAR(64) NOT NULL,
        passenger_user_id VARCHAR(64) NOT NULL,
        driver_user_id VARCHAR(64) NOT NULL,
        vehicle_id VARCHAR(64) NULL,
        order_status VARCHAR(24) NOT NULL DEFAULT 'pending_accept',
        route_overlap_rate DECIMAL(5, 2) NULL,
        compliance_region_code VARCHAR(30) NULL,
        max_daily_orders_limit INT NULL,
        cancellation_reason VARCHAR(255) NULL,
        started_at DATETIME NULL,
        completed_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (order_id),
        KEY idx_ride_orders_request_id (request_id),
        KEY idx_ride_orders_passenger_user_id (passenger_user_id),
        KEY idx_ride_orders_driver_user_id (driver_user_id),
        KEY idx_ride_orders_order_status (order_status),
        CONSTRAINT fk_ride_orders_ride_requests
          FOREIGN KEY (request_id) REFERENCES ride_requests(request_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_ride_orders_passenger_auth_users
          FOREIGN KEY (passenger_user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_ride_orders_driver_auth_users
          FOREIGN KEY (driver_user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_ride_orders_vehicles
          FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'trip_locations',
    sql: `
      CREATE TABLE IF NOT EXISTS trip_locations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id VARCHAR(64) NOT NULL,
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        deviation_flag TINYINT(1) NOT NULL DEFAULT 0,
        recorded_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_trip_locations_order_id_recorded_at (order_id, recorded_at),
        CONSTRAINT fk_trip_locations_ride_orders
          FOREIGN KEY (order_id) REFERENCES ride_orders(order_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'safety_alerts',
    sql: `
      CREATE TABLE IF NOT EXISTS safety_alerts (
        alert_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64) NOT NULL,
        alert_type VARCHAR(30) NOT NULL,
        alert_level VARCHAR(20) NOT NULL DEFAULT 'warn',
        alert_message VARCHAR(255) NOT NULL,
        alert_status VARCHAR(20) NOT NULL DEFAULT 'triggered',
        triggered_at DATETIME NOT NULL,
        resolved_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (alert_id),
        KEY idx_safety_alerts_order_id (order_id),
        KEY idx_safety_alerts_alert_status (alert_status),
        CONSTRAINT fk_safety_alerts_ride_orders
          FOREIGN KEY (order_id) REFERENCES ride_orders(order_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'order_payments',
    sql: `
      CREATE TABLE IF NOT EXISTS order_payments (
        payment_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        toll_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        passenger_payable DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        driver_income DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        paid_at DATETIME NULL,
        failure_reason VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (payment_id),
        UNIQUE KEY uk_order_payments_order_id (order_id),
        KEY idx_order_payments_payment_status (payment_status),
        CONSTRAINT fk_order_payments_ride_orders
          FOREIGN KEY (order_id) REFERENCES ride_orders(order_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'user_violations',
    sql: `
      CREATE TABLE IF NOT EXISTS user_violations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64) NULL,
        violation_type VARCHAR(40) NOT NULL,
        penalty_points INT NOT NULL DEFAULT 0,
        penalty_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        description VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_user_violations_user_id (user_id),
        KEY idx_user_violations_order_id (order_id),
        CONSTRAINT fk_user_violations_auth_users
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_user_violations_ride_orders
          FOREIGN KEY (order_id) REFERENCES ride_orders(order_id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'order_ratings',
    sql: `
      CREATE TABLE IF NOT EXISTS order_ratings (
        rating_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64) NOT NULL,
        from_user_id VARCHAR(64) NOT NULL,
        to_user_id VARCHAR(64) NOT NULL,
        score INT NOT NULL,
        comment_text VARCHAR(255) NULL,
        tags_json JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (rating_id),
        UNIQUE KEY uk_order_ratings_unique_pair (order_id, from_user_id, to_user_id),
        KEY idx_order_ratings_to_user_id (to_user_id),
        CONSTRAINT fk_order_ratings_ride_orders
          FOREIGN KEY (order_id) REFERENCES ride_orders(order_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_order_ratings_from_auth_users
          FOREIGN KEY (from_user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_order_ratings_to_auth_users
          FOREIGN KEY (to_user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'user_preference_tags',
    sql: `
      CREATE TABLE IF NOT EXISTS user_preference_tags (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id VARCHAR(64) NOT NULL,
        tag_type VARCHAR(30) NOT NULL,
        tag_value VARCHAR(30) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_user_preference_tags_unique (user_id, tag_type, tag_value),
        KEY idx_user_preference_tags_user_id (user_id),
        CONSTRAINT fk_user_preference_tags_auth_users
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'compliance_region_rules',
    sql: `
      CREATE TABLE IF NOT EXISTS compliance_region_rules (
        rule_id VARCHAR(64) NOT NULL,
        region_code VARCHAR(30) NOT NULL,
        region_name VARCHAR(60) NOT NULL,
        daily_driver_order_limit INT NOT NULL DEFAULT 2,
        max_passenger_count INT NOT NULL DEFAULT 4,
        rule_status VARCHAR(20) NOT NULL DEFAULT 'enabled',
        policy_json JSON NULL,
        updated_by VARCHAR(64) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (rule_id),
        UNIQUE KEY uk_compliance_region_rules_region_code (region_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'carbon_accounts',
    sql: `
      CREATE TABLE IF NOT EXISTS carbon_accounts (
        user_id VARCHAR(64) NOT NULL,
        carbon_points INT NOT NULL DEFAULT 0,
        total_reduced_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        CONSTRAINT fk_carbon_accounts_auth_users
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'carbon_transactions',
    sql: `
      CREATE TABLE IF NOT EXISTS carbon_transactions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id VARCHAR(64) NOT NULL,
        order_id VARCHAR(64) NULL,
        points_delta INT NOT NULL,
        reduced_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        biz_type VARCHAR(30) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_carbon_transactions_user_id (user_id),
        KEY idx_carbon_transactions_order_id (order_id),
        CONSTRAINT fk_carbon_transactions_auth_users
          FOREIGN KEY (user_id) REFERENCES auth_users(user_id)
          ON DELETE CASCADE,
        CONSTRAINT fk_carbon_transactions_ride_orders
          FOREIGN KEY (order_id) REFERENCES ride_orders(order_id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
];

async function ensureCoreSchema(requestId) {
  logger.info({
    module: 'schema-dao',
    operate: 'ensure-core-schema',
    requestId,
    result: 'Start ensuring core schema tables',
  });

  for (const { name, sql } of CORE_SCHEMA_SQLS) {
    await pool.query(sql);
    logger.debug({
      module: 'schema-dao',
      operate: 'ensure-core-schema-table',
      requestId,
      params: { table: name },
      result: 'Ensured',
    });
  }

  logger.info({
    module: 'schema-dao',
    operate: 'ensure-core-schema',
    requestId,
    params: { tableCount: CORE_SCHEMA_SQLS.length },
    result: 'Core schema tables ensured',
  });

  return {
    initialized: true,
    tableCount: CORE_SCHEMA_SQLS.length,
  };
}

async function ensureCoreSchemaOnce(requestId) {
  if (!ensureCoreSchemaPromise) {
    ensureCoreSchemaPromise = ensureCoreSchema(requestId).catch((error) => {
      logger.error({
        module: 'schema-dao',
        operate: 'ensure-core-schema',
        requestId,
        error: error.message,
        errorType: 'DatabaseSchemaInitError',
      });
      ensureCoreSchemaPromise = null;
      throw error;
    });
  }

  return ensureCoreSchemaPromise;
}

module.exports = {
  ensureCoreSchemaOnce,
  ensureCoreSchema,
};
