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
  assert.equal((html.match(/class="author-card"/g)||[]).length,1,`${slug}: one author card shell`);
  assert.equal((html.match(/class="continue"/g)||[]).length,1,`${slug}: one continue-reading shell`);
  assert.ok(!html.includes('Continue reading'),`${slug}: no legacy English continue shell`);
  assert.ok(!html.includes('Explore all technical research'),`${slug}: no legacy English article link`);
  for(const token of ['Manguo Labs Research','datePublished','dateModified','预计阅读','application/ld+json','BlogPosting','article-meta','本文目录'])assert.ok(html.includes(token),`${slug}: ${token}`);
}
const sitemap=read('sitemap.xml'),robots=read('robots.txt');
for(const slug of articles)assert.ok(sitemap.includes(`https://manguolabs.com/articles/${slug}/`),`${slug} sitemap`);
assert.match(robots,/Sitemap:/);
assert.match(read('index.html'),/为复杂的技术运营问题/);
assert.match(read('articles/index.html'),/技术研究/);
assert.ok(!/🛡|🔎|🧩/.test(read('index.html')),'product icons must not be emoji');
for(const p of ['index.html','articles/index.html','node-firewall/index.html']){
  const html=read(p);
  assert.match(html,/<button class="menu-button" type="button" aria-label="打开导航菜单" aria-controls="primary-navigation" aria-expanded="false">/,`${p}: accessible mobile menu button`);
  assert.ok(!html.includes('class="nav-toggle"'),`${p}: no checkbox-only menu`);
}
assert.match(read('index.html'),/<h1><span>为复杂的技术运营问题，<\/span><em>构建可靠、可验证的解决方案。<\/em><\/h1>/,'intentional hero emphasis unit');
assert.match(read('assets/site.js'),/document\.body\.classList\.toggle\('nav-open'/,'mobile menu scroll lock');
assert.match(read('assets/style.css'),/body\.nav-open\{overflow:hidden\}/,'mobile navigation layer CSS');
console.log(`V2.1 deterministic tests passed: ${articles.length} immutable articles`);
