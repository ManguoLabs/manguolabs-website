document.querySelectorAll('.prose pre').forEach(pre=>{const code=pre.querySelector('code');if(!code)return;const button=document.createElement('button');button.type='button';button.className='copy-code';button.textContent='复制';button.setAttribute('aria-label','复制代码块');button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code.innerText);button.textContent='已复制'}catch{button.textContent='请手动选择'}setTimeout(()=>button.textContent='复制',1600)});pre.prepend(button)});

const menuButton=document.querySelector('.menu-button');
const navigation=document.querySelector('#primary-navigation');
if(menuButton&&navigation){
  const setMenu=open=>{
    document.body.classList.toggle('nav-open',open);
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'关闭导航菜单':'打开导航菜单');
  };
  menuButton.addEventListener('click',()=>setMenu(!document.body.classList.contains('nav-open')));
  menuButton.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();menuButton.click()}});
  navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});
}
