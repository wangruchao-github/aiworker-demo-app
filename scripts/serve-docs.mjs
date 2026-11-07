#!/usr/bin/env node
/**
 * 零依赖静态服务器：本机预览 docs/ 下的文档站
 *
 * 用法：
 *   npm run pages:serve              # 默认 http://localhost:5173
 *   npm run pages:serve -- --port 8080
 *
 * 说明：
 *   - 仅使用 Node.js 内置 http / fs 模块，不引入任何依赖；
 *   - 静态根目录为 docs/，与 GitHub Pages 的发布根保持一致；
 *   - 未命中路径回落到 404.html（模拟 Pages 行为）。
 *
 * @ahtor wangrc
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = resolve(ROOT, 'docs');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

function parsePort() {
  const idx = process.argv.indexOf('--port');
  if (idx !== -1 && process.argv[idx + 1]) return Number(process.argv[idx + 1]);
  if (process.env.PORT) return Number(process.env.PORT);
  return 5173;
}

const port = parsePort();

async function resolveFile(urlPath) {
  // 去掉查询串与 hash，并阻断路径穿越
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const safe = normalize(clean).replace(/^(\.\.[/\\])+/, '');
  let target = join(DOCS, safe);
  if (!target.startsWith(DOCS)) return null;

  try {
    const info = await stat(target);
    if (info.isDirectory()) target = join(target, 'index.html');
  } catch {
    return null;
  }
  return target;
}

const server = createServer(async (req, res) => {
  const target = await resolveFile(req.url || '/');

  if (target) {
    try {
      const body = await readFile(target);
      res.writeHead(200, {
        'Content-Type': MIME[extname(target).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(body);
      return;
    } catch {
      /* 落到 404 */
    }
  }

  try {
    const body = await readFile(join(DOCS, '404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(port, () => {
  console.log('▸ 文档站已启动：http://localhost:' + port);
  console.log('▸ 静态根目录：docs/');
  console.log('▸ 按 Ctrl+C 停止');
});
