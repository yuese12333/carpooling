/**
 * 打包后端为 dist 目录，用于上传到服务器部署。
 * 不包含 node_modules，服务器上需执行 npm install --production。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

const toCopy = ['src', 'package.json', 'package-lock.json', 'prisma'];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true });
}
fs.mkdirSync(dist, { recursive: true });

for (const name of toCopy) {
  const srcPath = path.join(root, name);
  if (!fs.existsSync(srcPath)) continue;
  copyRecursive(srcPath, path.join(dist, name));
}

console.log('Backend packed to dist/');
console.log('Contents:', fs.readdirSync(dist).join(', '));
