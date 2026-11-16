/* ---- wiring ---- */
function curFmt(e){
  const el=e.target;if(!el.matches||!el.matches('[data-cur]'))return;
  const left=el.value.slice(0,el.selectionStart).replace(/[^\d.]/g,'').length;
  let t=el.value.replace(/[^\d.]/g,'');const d=t.indexOf('.');
  if(d>=0)t=t.slice(0,d+1)+t.slice(d+1).replace(/\./g,'').slice(0,2);
  const o=gIN((d>=0?t.slice(0,d):t).replace(/^0+(?=\d)/,''))+(d>=0?t.slice(d):'');
  let c=0,i=0;for(;i<o.length&&c<left;i++)if(/[\d.]/.test(o[i]))c++;
  el.value=o;try{el.setSelectionRange(i,i)}catch(x){}
}
document.addEventListener('input',curFmt,true);
function render(){
  preLbl();rateBar();yrFields();
  if(cur==='dc')return dcRun();
  if(cur==='man')return;
  const o=$('o-'+cur);
  if(cur==='normal')o.innerHTML=ST?vNormal():nov('Fill in all four loan details above.');
  else if(cur==='spec')o.innerHTML=ST?vSpec():nov(HINT);
  else o.innerHTML=!on(cur)?'':ST?R[cur]():nov(HINT);
}
['pre','part','yr','cust'].forEach(id=>$('on-'+id).addEventListener('change',()=>{sync(id);render()}));
['pim','piy'].forEach(id=>$(id).addEventListener('change',render));
function show(id,scroll){
  cur=id;
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('hidden',s.dataset.v!==id));
  document.querySelectorAll('.nv').forEach(b=>b.dataset.v===id?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
  render();
  if(scroll)innerWidth<960?$('views').scrollIntoView():scrollTo(0,0);
}
document.querySelectorAll('.nv').forEach(b=>b.onclick=()=>show(b.dataset.v,true));
document.querySelectorAll('.scn input').forEach(e=>e.addEventListener('input',render));
document.querySelectorAll('[name=yf]').forEach(e=>e.addEventListener('change',sy));
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)show(g.dataset.go,true)});
$('reset').onclick=()=>{
  ['base','prin','emi','ten','extra','cy','cm','fc','lock','dm','dy','da','yn','ypc'].forEach(id=>{const e=$(id);e.value='';e.defaultValue=''});
  YA={};YDEF='';Object.keys(DUR).forEach(k=>delete DUR[k]);SPW={src:'',d:'',m:''};SPC=null;
  ['pre','part','yr','cust'].forEach(id=>{$(`on-${id}`).checked=false;sync(id)});['pim','piy'].forEach(id=>$(id).checked=false);document.querySelector('[name=yf][value="1"]').checked=true;sy();ST=null;$('err').textContent='';undim();render();$('base').focus();
};
const SB=$('shell'),sbt=$('sbt');
function setSB(c,save){SB.classList.toggle('collapsed',c);const t=c?'Expand sidebar':'Collapse sidebar';sbt.setAttribute('aria-expanded',!c);sbt.setAttribute('aria-label',t);sbt.title=t;if(save)try{localStorage.setItem('lc-sidebar',c?'1':'0')}catch(e){}}
sbt.onclick=()=>setSB(!SB.classList.contains('collapsed'),1);
try{setSB(localStorage.getItem('lc-sidebar')==='1')}catch(e){}
show('normal');run();
