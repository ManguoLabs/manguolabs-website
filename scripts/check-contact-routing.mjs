#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const ALLOWED_TELEGRAM = 'https://t.me/ManguoShop_bot';
const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.html', '.htm', '.yml', '.yaml', '.json', '.toml', '.txt']);
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', 'vendor']);
const LEGAL_FILE = /^(license|copying|notice)(\.|$)/i;
const TECHNICAL_HOST = /^(?:[^.]+\.)?(?:github\.com|githubusercontent\.com|openai\.com|google\.com|schema\.org|w3\.org|npmjs\.com|nodejs\.org)$/i;
const CONTACT_CONTEXT = /telegram|discord|wechat|微信|qq群|qq\s*[:：群号]|交流群|作者群|社群|捐赠|赞助|donat(?:e|ion)|sponsor|buy[ -]?me[ -]?a[ -]?coffee|商业咨询|购买地址|售后|support|contact/i;

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['.'];
const failures = [];

function inspect(file, root) {
  if (LEGAL_FILE.test(file.split('/').at(-1))) return;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const location = `${relative(root, file)}:${index + 1}`;
    const telegramLinks = line.match(/https?:\/\/(?:t|telegram)\.me\/[A-Za-z0-9_+/-]+/gi) || [];
    for (const link of telegramLinks) {
      if (link !== ALLOWED_TELEGRAM) failures.push(`${location}: non-allowlisted Telegram route`);
    }
    if (/https?:\/\/(?:www\.)?discord(?:\.gg|\.com\/invite)\//i.test(line)) {
      failures.push(`${location}: Discord invite`);
    }
    if (CONTACT_CONTEXT.test(line)) {
      const links = line.match(/https?:\/\/[^\s<>)\]"']+/gi) || [];
      for (const link of links) {
        try {
          const host = new URL(link).hostname;
          if (link !== ALLOWED_TELEGRAM && !TECHNICAL_HOST.test(host) && !/(^|\.)manguolabs\.com$/i.test(host)) {
            failures.push(`${location}: third-party contact or promotion URL (${host})`);
          }
        } catch {}
      }
      if (/\b(?:T[A-Za-z0-9]{33}|0x[a-fA-F0-9]{40})\b/.test(line)) {
        failures.push(`${location}: donation wallet address`);
      }
    }
  });
}

function walk(path, root) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    if (SKIP_DIRECTORIES.has(path.split('/').at(-1))) return;
    for (const entry of readdirSync(path)) walk(join(path, entry), root);
  } else if (TEXT_EXTENSIONS.has(extname(path).toLowerCase())) {
    inspect(path, root);
  }
}

for (const input of roots) {
  const root = resolve(input);
  walk(root, root);
}

if (failures.length) {
  console.error(`Contact routing QA failed (${failures.length} finding(s)):`);
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Contact routing QA passed. Allowed commercial Telegram route: ${ALLOWED_TELEGRAM}`);
