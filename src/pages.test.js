/**
 * 站点约束测试（DEMO-REQ-105）
 *
 * 断言要点：
 *   1. 站点必需文件存在（docs/index.html、docs/guide.html、docs/404.html、docs/.nojekyll、根 index.html、workflow）；
 *   2. 页面具备基本 meta（charset / viewport / title / description）与可访问性锚点；
 *   3. 不引用任何外部 CDN（http(s) 外链仅允许指向仓库与官方站点地址）；
 *   4. 站内链接必须是相对路径（GitHub Pages 走子路径，绝对路径会 404）；
 *   5. 仓库根单文件版 index.html 与 docs/index.html 保持同步。
 *
 * @ahtor wangrc
 */
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderRootIndex } from '../scripts/build-pages.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_FILES = [
  'docs/index.html',
  'docs/guide.html',
  'docs/404.html',
  'docs/.nojekyll',
  'docs/robots.txt',
  'index.html',
  '.github/workflows/pages.yml',
  'scripts/build-pages.mjs',
  'scripts/serve-docs.mjs',
];

for (const file of REQUIRED_FILES) {
  assert.ok(existsSync(resolve(ROOT, file)), `缺少站点必需文件：${file}`);
}

const docsIndex = readFileSync(resolve(ROOT, 'docs/index.html'), 'utf8');
const guideIndex = readFileSync(resolve(ROOT, 'docs/guide.html'), 'utf8');
const notFound = readFileSync(resolve(ROOT, 'docs/404.html'), 'utf8');
const rootIndex = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const workflow = readFileSync(resolve(ROOT, '.github/workflows/pages.yml'), 'utf8');

/* 1. 基本 meta 与结构 */
for (const [name, html] of [['docs/index.html', docsIndex], ['docs/guide.html', guideIndex], ['index.html', rootIndex]]) {
  assert.match(html, /<meta charset="UTF-8"/i, `${name} 缺少 charset`);
  assert.match(html, /name="viewport"/i, `${name} 缺少 viewport`);
  assert.match(html, /<title>[^<]+<\/title>/i, `${name} 缺少 title`);
  assert.match(html, /name="description"/i, `${name} 缺少 description`);
  assert.match(html, /<html[^>]+lang="zh-CN"/i, `${name} 缺少 lang 声明`);
  assert.match(html, /@ahtor wangrc/, `${name} 缺少作者署名`);
}

/* 2. 可访问性：跳转链接 + 语义化标签 */
assert.match(docsIndex, /class="skip-link"/, '首页缺少「跳到主要内容」链接');
assert.match(docsIndex, /<main id="main">/, '首页缺少 main 语义标签');
assert.match(docsIndex, /aria-label=/, '首页缺少 aria-label 描述');

/* 3. 站点关键内容：7 步闭环 / 分支策略 / 真实架构 */
for (const keyword of ['7 步研发闭环', 'release/v1.0.0', 'feat/v1.0.0-DEMO-REQ-105', '真实架构', 'GitHub Pages']) {
  assert.ok(docsIndex.includes(keyword), `首页缺少关键内容：${keyword}`);
}

/* 4. 不得引用外部 CDN 资源（样式 / 脚本 / 字体 / 图片） */
const EXTERNAL_ASSET = /(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+["']/gi;
const ALLOWED_EXTERNAL = [
  'https://wangruchao-github.github.io/aiworker-demo-app',
  'https://github.com/wangruchao-github/aiworker-demo-app',
];
for (const [name, html] of [['docs/index.html', docsIndex], ['docs/guide.html', guideIndex], ['index.html', rootIndex], ['docs/404.html', notFound]]) {
  const hits = html.match(EXTERNAL_ASSET) || [];
  for (const hit of hits) {
    const allowed = ALLOWED_EXTERNAL.some((prefix) => hit.includes(prefix));
    assert.ok(allowed, `${name} 存在未授权的外部资源引用：${hit}`);
  }
}

/* 5. 站内链接必须为相对路径（子路径 Pages 兼容） */
assert.ok(!/href="\/(?!\/)/.test(docsIndex), 'docs/index.html 存在以 / 开头的绝对路径链接');
assert.ok(!/src="\/(?!\/)/.test(docsIndex), 'docs/index.html 存在以 / 开头的绝对路径资源');
assert.ok(docsIndex.includes('href="guide.html"'), '首页应使用相对路径指向子页 guide.html');
assert.ok(rootIndex.includes('href="docs/guide.html"'), '根 index.html 应使用相对路径指向 docs/guide.html');
assert.ok(notFound.includes('href="./guide.html"'), '404 页应使用相对路径');

/* 6. 根 index.html 必须与 docs/index.html 同步（由 scripts/build-pages.mjs 生成） */
assert.strictEqual(rootIndex, renderRootIndex(docsIndex), '根 index.html 与 docs/index.html 不同步，请执行 npm run pages:build');

/* 7. Pages 工作流必须存在且指向 docs/ */
assert.match(workflow, /actions\/upload-pages-artifact@v3/, 'pages.yml 缺少 upload-pages-artifact');
assert.match(workflow, /path:\s*docs/, 'pages.yml 未发布 docs/ 目录');
assert.match(workflow, /actions\/deploy-pages@v4/, 'pages.yml 缺少 deploy-pages');
assert.match(workflow, /workflow_dispatch/, 'pages.yml 缺少手动重发入口');

console.log('✓ Site constraint tests passed for aiworker-demo-app (docs/ + pages.yml)');
