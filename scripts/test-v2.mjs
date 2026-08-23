import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const extract=(s,r)=>s.match(r)?.[1]||'';
const articles=fs.readdirSync('articles',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
const canonical=p=>`https://manguolabs.com/${p==='index.html'?'':p.replace(/index\.html$/,'')}`;
const publishedBody=html=>extract(html,/<article class="(?:content|prose article-prose)">([\s\S]*?)<div class="author-card">/i).replace(/ id="section-\d+"/g,'').trim();

for(const file of ['index.html','articles/index.html','node-firewall/index.html','xboard-security-audit/index.html','xboard-node-extension/index.html',...articles.map(x=>`articles/${x}/index.html`)]){
  const html=read(file);
  assert.equal(extract(html,/<link rel="canonical" href="([^"]+)"/),canonical(file),`${file} canonical`);
  assert.match(html,/<meta name="robots"/,`${file} robots`);
}
for(const slug of articles){
  const file=`articles/${slug}/index.html`,html=read(file),before=execFileSync('git',['show',`HEAD:${file}`],{encoding:'utf8'});
  assert.equal(publishedBody(html),publishedBody(before),`${slug}: PUBLISHED_ARTICLE_IMMUTABLE body`);
  for(const token of ['Manguo Labs Research','datePublished','dateModified','预计阅读','application/ld+json','BlogPosting','article-meta','本文目录'])assert.ok(html.includes(token),`${slug}: ${token}`);
}
const sitemap=read('sitemap.xml'),robots=read('robots.txt');
for(const slug of articles)assert.ok(sitemap.includes(`https://manguolabs.com/articles/${slug}/`),`${slug} sitemap`);
assert.match(robots,/Sitemap:/);
assert.match(read('index.html'),/为复杂的技术运营问题/);
assert.match(read('articles/index.html'),/技术研究/);
assert.ok(!/🛡|🔎|🧩/.test(read('index.html')),'product icons must not be emoji');
for(const p of ['index.html','articles/index.html','node-firewall/index.html'])assert.match(read(p),/aria-controls="primary-navigation"/);
console.log(`V2.1 deterministic tests passed: ${articles.length} immutable articles`);
