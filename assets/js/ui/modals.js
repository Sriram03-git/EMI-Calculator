function rateBar(){
  const f=(l,x)=>`<div class="rt"><div class="lbl" style="margin:0">${l}</div><div class="text-xl font-extrabold" style="color:var(--${ST?'acc':'muted'})">${x}</div></div>`;
  $('im-body').innerHTML=`<h2 id="im-h" class="flex items-center gap-2 font-bold pr-10" style="color:var(--acc)">${ic('pct')}<span>Interest rate worked out from your loan</span></h2><div class="grid grid-cols-2 gap-3 mt-3">${f('Monthly rate',ST?(ST.r*100).toFixed(3)+'%':'No value')}${f('Yearly rate',ST?(ST.r*1200).toFixed(2)+'%':'No value')}</div><p class="text-sm mt-3">Yearly rate = monthly rate × 12, charged on the reducing balance.</p><p class="text-xs mt-2" style="color:var(--muted)">Calculated from your agreement amount, EMI and tenure. This is the base rate for all other calculations in this app: Normal, Pre-Close, Partly Payment, Yearly Optimizer, Custom Year and Special.</p>`;
}
const IM=$('im'),IB=$('ib'),IX=$('im-x'),BAR=$('im-bar');let imT=0;
function closeIM(){clearTimeout(imT);if(!IM.classList.contains('open'))return;IM.classList.remove('open');IM.setAttribute('aria-hidden','true');BAR.classList.remove('run');IB.focus({preventScroll:true})}
function openIM(){rateBar();clearTimeout(imT);BAR.classList.remove('run');void BAR.offsetWidth;BAR.classList.add('run');IM.classList.add('open');IM.setAttribute('aria-hidden','false');IX.focus({preventScroll:true});imT=setTimeout(closeIM,10000)}
IB.onclick=()=>IM.classList.contains('open')?closeIM():openIM();
IX.onclick=closeIM;$('im-bg').onclick=closeIM;
document.addEventListener('keydown',e=>{if(!IM.classList.contains('open'))return;if(e.key==='Escape')closeIM();else if(e.key==='Tab'){e.preventDefault();IX.focus()}});
