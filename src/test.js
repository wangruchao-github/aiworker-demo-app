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
