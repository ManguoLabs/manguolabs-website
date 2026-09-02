const patterns=[/100%解决/gu,/永不被墙/gu,/永久不封/gu];

function explicitlyNegated(text,index){
  const prefix=String(text||'').slice(Math.max(0,index-40),index).split(/[。！？；\n]/u).at(-1).trim();
  return /(?:不|未|并不|并未|从不|无法|不能)(?:会|再)?(?:承诺|保证|确保)[^，,]{0,10}$/u.test(prefix)||/(?:并非|不是|非)[^，,]{0,4}$/u.test(prefix);
}

export function findAbsolutePromises(html){
  const text=String(html||'').replace(/<[^>]+>/gu,' ').replace(/\s+/gu,' '),found=[];
  for(const pattern of patterns)for(const match of text.matchAll(pattern))if(!explicitlyNegated(text,match.index))found.push(match[0]);
  return found;
}
