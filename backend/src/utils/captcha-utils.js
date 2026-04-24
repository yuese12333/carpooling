/**
 * 文件功能：图形验证码工具（mock）
 * 关联业务：下发图形验证码
 */

function generateText(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const size = Math.max(Number(length) || 4, 4);
  let result = '';
  for (let i = 0; i < size; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateImage(text) {
  const safeText = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="50"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-family="monospace" fill="#111827" letter-spacing="4">${safeText}</text></svg>`;
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

module.exports = {
  generateText,
  generateImage,
};
