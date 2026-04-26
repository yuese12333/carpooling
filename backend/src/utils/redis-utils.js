/**
 * 文件功能：Redis 工具（mock）
 * 关联业务：验证码缓存、风控缓存
 */

const store = new Map();

function now() {
  return Date.now();
}

function normalize(item) {
  if (!item) return null;
  if (item.expireAt && item.expireAt <= now()) {
    return null;
  }
  return item;
}

async function setExpire(key, value, seconds) {
  const expireAt = now() + Math.max(Number(seconds) || 0, 0) * 1000;
  store.set(key, { value, expireAt });
}

async function get(key) {
  const item = normalize(store.get(key));
  if (!item) {
    store.delete(key);
    return null;
  }
  return item.value;
}

async function incrWithExpire(key, seconds) {
  const current = Number((await get(key)) || 0);
  const next = current + 1;
  await setExpire(key, next, seconds);
  return next;
}

module.exports = {
  setExpire,
  get,
  incrWithExpire,
};
