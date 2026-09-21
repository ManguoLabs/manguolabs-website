import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./check-contact-routing.mjs', import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'contact-routing-'));
const fixture = path.join(root, 'article.md');

function check(contents) {
  fs.writeFileSync(fixture, contents, 'utf8');
  return spawnSync(process.execPath, [script, root], { encoding: 'utf8' });
}

try {
  const allowed = check('或在 Telegram（https://t.me/ManguoShop_bot）沟通实际情况。\n');
  assert.equal(allowed.status, 0, allowed.stderr);

  const rejected = check('或在 Telegram（https://t.me/third_party_shop）沟通实际情况。\n');
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /non-allowlisted Telegram route/);

  console.log('contact routing CJK punctuation regression: PASS');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
