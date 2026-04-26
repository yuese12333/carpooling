const {
  createRequestId,
  buildFailureResponse,
} = require('../utils/response');
const { logger } = require('../utils/logger');

const DEFAULT_APPLY_COOLDOWN_MS = 5 * 60 * 1000;
let lastApplyTimestamp = 0;

function parseClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string' && xForwardedFor.trim()) {
    return xForwardedFor.split(',')[0].trim();
  }
  return (req.ip || req.socket?.remoteAddress || '').trim();
}

function normalizeIp(ip) {
  if (!ip) return '';
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
}

function isPrivateIpv4(ip) {
  if (!ip) return false;
  if (ip === '127.0.0.1') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;

  const parts = ip.split('.').map((segment) => Number(segment));
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    return parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31;
  }

  return false;
}

function isPrivateIpv6(ip) {
  if (!ip) return false;
  const lower = ip.toLowerCase();
  return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd');
}

function isInternalRequest(req) {
  const rawIp = parseClientIp(req);
  const ip = normalizeIp(rawIp);
  return isPrivateIpv4(ip) || isPrivateIpv6(ip);
}

function hasAdminToken(req) {
  const expected = process.env.SCHEMA_INIT_TOKEN;
  if (!expected) return false;
  const incoming = req.headers['x-schema-init-token'];
  return typeof incoming === 'string' && incoming.length > 0 && incoming === expected;
}

function getAction(req) {
  const action = (req.body && req.body.action) || 'check';
  if (typeof action !== 'string') return 'check';
  return action.trim().toLowerCase();
}

function schemaInitGuard(req, res, next) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const action = getAction(req);
  const internal = isInternalRequest(req);
  const admin = hasAdminToken(req);

  if (!internal && !admin) {
    logger.warn({
      module: 'schema-init-guard',
      operate: 'guard-check',
      requestId,
      params: { action },
      result: 'Blocked non-internal and non-admin request',
    });
    return res.status(403).json(buildFailureResponse(403, '仅内网或管理员可调用该接口', null, requestId));
  }

  if (action === 'apply' && !admin) {
    logger.warn({
      module: 'schema-init-guard',
      operate: 'guard-check',
      requestId,
      params: { action },
      result: 'Blocked apply action without admin token',
    });
    return res.status(403).json(buildFailureResponse(403, '执行建表需管理员凭证', null, requestId));
  }

  if (action === 'apply') {
    const cooldownMs = Number(process.env.SCHEMA_INIT_APPLY_COOLDOWN_MS || DEFAULT_APPLY_COOLDOWN_MS);
    const now = Date.now();
    const elapsed = now - lastApplyTimestamp;

    if (lastApplyTimestamp > 0 && elapsed < cooldownMs) {
      const retryAfterMs = cooldownMs - elapsed;
      logger.warn({
        module: 'schema-init-guard',
        operate: 'guard-cooldown',
        requestId,
        params: { cooldownMs, retryAfterMs },
        result: 'Blocked by apply cooldown',
      });
      return res.status(429).json(buildFailureResponse(429, '初始化操作过于频繁，请稍后重试', {
        retryAfterMs,
      }, requestId));
    }
  }

  req.schemaInitContext = {
    action,
    isInternal: internal,
    isAdmin: admin,
    markApplied: () => {
      lastApplyTimestamp = Date.now();
    },
  };

  return next();
}

module.exports = {
  schemaInitGuard,
};
