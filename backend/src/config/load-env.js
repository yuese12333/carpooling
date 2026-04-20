'use strict';

/**
 * 必须在入口与其它业务模块之前执行：后续任意 require 可能在加载时就读取 process.env
 * （如 db.js、jwt-utils.js、logger.js 的 NODE_ENV）。
 * 使用相对 backend 根目录的固定路径，避免 cwd 变化时找不到 .env。
 */
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
