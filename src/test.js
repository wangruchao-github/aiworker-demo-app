/**
 * Unit Test Runner for aiworker-demo-app
 * @ahtor wangrc
 */
import assert from 'node:assert';
import { getAppStatus } from './app.js';

const res = getAppStatus();
assert.strictEqual(res.app, 'aiworker-demo-app');
assert.strictEqual(res.status, 'running');
console.log('✓ Unit tests passed for aiworker-demo-app');

// 站点约束测试（DEMO-REQ-105）：存在性 / meta / 无外链 CDN / 相对路径 / 产物同步
await import('./pages.test.js');
