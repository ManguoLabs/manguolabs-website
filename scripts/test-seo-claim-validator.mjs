import assert from 'node:assert/strict';
import {findAbsolutePromises} from './seo-claim-validator.mjs';

for(const text of ['不承诺永久不封或 100% 可用','并非永不被墙','无法保证100%解决'])assert.deepEqual(findAbsolutePromises(`<p>${text}</p>`),[]);
for(const text of ['承诺永久不封','保证永不被墙','可以100%解决'])assert.equal(findAbsolutePromises(`<p>${text}</p>`).length,1);
console.log('website SEO negation-aware absolute-promise fixtures passed');
