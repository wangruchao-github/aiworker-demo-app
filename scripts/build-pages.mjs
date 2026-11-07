#!/usr/bin/env node
/**
 * 站点同步生成器：docs/index.html → 仓库根 index.html
 *
 * 背景：
 *   1. canonical 源是 docs/index.html（GitHub Pages 发布根）；
 *   2. 仓库根 index.html 是「单文件版」，可直接双击打开（file://）离线查看；
 *   3. 两份内容由本脚本单向生成，避免手工维护两份导致内容漂移。
 *
 * 用法：
 *   node scripts/build-pages.mjs          # 生成/更新根 index.html
 *   node scripts/build-pages.mjs --check  # 只校验是否已同步（CI / npm test 使用）
 *
 * @ahtor wangrc
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(ROOT, 'docs/index.html');
const TARGET = resolve(ROOT, 'index.html');

/**
 * 由 docs/index.html 派生根目录单文件版：
 *   - docs/index.html 内的站内链接是同级相对路径（guide.html），
 *     放到仓库根后需要指向 docs/ 子目录（docs/guide.html）；
 *   - 其余内容（内联 CSS / JS / SVG）完全一致，保证「双击即看」。
 */
export function renderRootIndex(sourceHtml) {
  return sourceHtml
    .replace(/href="guide\.html"/g, 'href="docs/guide.html"')
    .replace(/href="\.\/guide\.html"/g, 'href="./docs/guide.html"');
}

function main() {
  const checkOnly = process.argv.includes('--check');

  if (!existsSync(SOURCE)) {
    console.error(`✗ 缺少站点源文件：${SOURCE}`);
    process.exit(1);
  }

  const source = readFileSync(SOURCE, 'utf8');
  const expected = renderRootIndex(source);

  if (checkOnly) {
    if (!existsSync(TARGET)) {
      console.error('✗ 根 index.html 不存在，请执行：npm run pages:build');
      process.exit(1);
    }
    const actual = readFileSync(TARGET, 'utf8');
    if (actual !== expected) {
      console.error('✗ 根 index.html 与 docs/index.html 不同步，请执行：npm run pages:build');
      process.exit(1);
    }
    console.log('✓ 根 index.html 与 docs/index.html 已同步');
    return;
  }

  writeFileSync(TARGET, expected, 'utf8');
  console.log(`✓ 已生成 ${TARGET.replace(`${ROOT}/`, '')}（来源：docs/index.html）`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
