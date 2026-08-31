#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const shop='https://t.me/ManguoShop_bot',root=path.resolve('.'),articleRoot=path.join(root,'articles'),slugs=fs.readdirSync(articleRoot,{withFileTypes:true}).filter(entry=>entry.isDirectory()&&fs.existsSync(path.join(articleRoot,entry.name,'index.html'))).map(entry=>entry.name).sort(),index=fs.readFileSync(path.join(articleRoot,'README.md'),'utf8');
assert.ok(slugs.length>=15,'all 15 baseline HTML articles must remain present');
for(const slug of slugs){const htmlPath=path.join(articleRoot,slug,'index.html'),readmePath=path.join(articleRoot,slug,'README.md');assert.ok(fs.statSync(htmlPath).size>200,'existing HTML must remain intact');assert.ok(fs.existsSync(readmePath),`${slug}: README.md missing`);const markdown=fs.readFileSync(readmePath,'utf8'),h1=markdown.match(/^#\s+(.+)$/m)?.[1],keywords=markdown.match(/^关键词：(.+)$/m)?.[1]||'';assert.ok(h1,`${slug}: H1 missing`);assert.ok((markdown.match(/^##\s+/gm)||[]).length>=2,`${slug}: H2 structure missing`);assert.match(markdown,/^## 常见问题$/m,`${slug}: FAQ missing`);assert.equal(markdown.includes(shop),true,`${slug}: TG CTA missing`);assert.ok(keywords.length>=2,`${slug}: searchable keywords missing`);for(const keyword of keywords.split('、').filter(Boolean).slice(0,3))assert.equal(markdown.includes(keyword),true,`${slug}: keyword is not indexable text`);assert.equal(index.includes(`./${slug}/`),true,`${slug}: absent from article index`)}
const rootReadme=fs.readFileSync(path.join(root,'README.md'),'utf8');assert.match(rootReadme,/\.\/articles\//);assert.equal(rootReadme.includes(shop),true);assert.equal(index.includes(shop),true);
console.log(`GITHUB_MARKDOWN_PASS article_readmes=${slugs.length} tg_cta=${shop}`);
