const on=id=>$('on-'+id).checked,sync=id=>$('b-'+id).classList.toggle('hidden',!on(id));
const nov=h=>`<div class="card text-center py-10"><div class="text-xl font-bold">No value</div><p class="text-sm mt-1" style="color:var(--muted)">${h}</p></div>`,HINT='Fill in the loan details in Normal Calculation first.';
const GO=(id,l)=>`<button type="button" class="lnk" data-go="${id}">${l}</button>`;
const rv=n=>document.querySelector(`input[name=${n}]:checked`).value,sy=()=>{$('yn-w').classList.toggle('hidden',rv('yf')!=='0')};
const kpi=(i,l,val,sub)=>`<div class="card kpi"><div class="lbl flex items-center gap-2" style="margin:0">${ic(i,'w-4 h-4')}<span>${l}</span></div><div class="val">${val}</div><div class="sub">${sub}</div></div>`;
const adv=(c,i,t,h,b,f,x='')=>`<div class="adv ${c}"><div class="flex items-center gap-2 font-semibold t">${ic(i)}<span>${t}</span></div><div class="text-xl font-bold mt-2 t">${h}</div><p class="text-sm mt-1">${b}</p>${x}<p class="text-xs mt-2" style="color:var(--muted)">${f}</p></div>`;

const head=(t,s)=>`<div><h3 class="font-semibold text-lg">${t}</h3><p class="text-xs" style="color:var(--muted)">${s}</p></div>`;
const g3=(...a)=>`<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${a.join('')}</div>`;
const msg=t=>`<p class="text-sm font-semibold" style="color:var(--r)">${t}</p>`;
const note=t=>`<div class="card flex items-center gap-2 text-sm">${ic('info')}<span>${t}</span></div>`;

/* ---- view 1: normal ---- */
function vNormal(){
  const {P,E,n,r,S,paid,int,base}=ST,rb=base>0?solve(base,E,n):NaN,ok=isFinite(rb)&&base>0,pi=int/paid*100;
  return `<div class="card"><div class="lbl" style="margin:0">You will pay in total</div><div class="text-3xl font-extrabold mt-1">${inr(paid)}</div>
    <div class="bar" role="img" aria-label="${(100-pi).toFixed(0)}% loan, ${pi.toFixed(0)}% interest"><i style="width:${100-pi}%"></i></div>
    <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm"><span class="flex items-center gap-2"><svg class="w-3 h-3" viewBox="0 0 8 8" style="color:var(--acc)" aria-hidden="true"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>Loan ${inr(P)}</span><span class="flex items-center gap-2"><svg class="w-3 h-3" viewBox="0 0 8 8" style="color:var(--a)" aria-hidden="true"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>Interest ${inr(int)}</span></div></div>`+
    `<div class="grid grid-cols-2 lg:grid-cols-3 gap-3">`+
    kpi('rupee','Monthly EMI',inr(E),`for ${n} months`)+
    kpi('trend','Total interest',inr(int),`${pi.toFixed(1)}% of what you pay`)+
    kpi('pct','Yearly interest rate',(r*1200).toFixed(2)+'%','on the reducing balance')+`</div>`+
    (ok?note(`On the ${inr(base)} you actually received, the real cost is about ${(rb*1200).toFixed(1)}% a year`+(P>base?` because ${inr(P-base)} of charges were added to the loan.`:'.')):'')+
    head('Month-by-month schedule',`How each EMI is split between interest and principal. ${SET}`)+stable(S,'EMI')+durBox('normal',dRows(S));
}

function vPre(){
  const {n,S,paid}=ST,f=v('fc'),L=Math.round(v('lock'));
  if([f,L].some(x=>!isFinite(x)||x<0))return msg('Please enter valid, positive numbers.');
  const uM=$('pim').checked,uY=$('piy').checked,lk=uM||uY,wn=[];
  let rows,X=0,Q=null,pl=null;
  if(!lk)rows=preRows(S,paid,f,L);
  else{
    if(uM){
      X=v('extra');
      if(!isFinite(X)||X<0)return msg('Please enter a valid, positive extra amount in Partly Payment, or switch off the monthly option here.');
      if(!(X>0))wn.push('Monthly Partly Payment is switched on, but no extra amount is set. Enter one in Partly Payment.');
    }
    if(uY){
      Q=yrInputs();
      if(Q.err)return msg(`Yearly Part-Payment: ${Q.err} Fix it in Yearly Optimizer, or switch off the yearly option here.`);
      if(!Q.xs.some(r=>r.some(x=>x>0)))wn.push('Yearly Part-Payment is switched on, but no payment amounts are entered. Add them in Yearly Optimizer.');
    }
    const o=preRowsL(f,L,X,Q);rows=o.rows;pl=o.p;
    const h=Q&&Q.bad.find(b=>slotMo(b.y,b.j,Q.fq)<=pl.len);
    if(h)return msg(`Yearly Part-Payment: please enter a valid amount for Year ${h.y} - Payment ${h.j+1} in Yearly Optimizer.`);
  }
  const W=wn.map(t=>note(t)).join('');
  if(!rows.length)return W+note(lk?`You cannot pre-close: with your part-payments the loan ends in ${pl.len} months, before closing is allowed (after ${Math.max(1,L)} EMIs).`:'You cannot pre-close: the loan ends before closing is allowed.');
  const mx=Math.max(...rows.map(x=>x.net));
  rows.forEach(x=>x.z=(mx<=0||x.net<=0||x.net<.1*mx)?'r':x.net>=.5*mx?'g':'a');
  const best=rows.find(x=>x.net===mx),G=rows.filter(x=>x.z=='g'),B=rows.filter(x=>x.z=='r'),be=rows.find(x=>x.net<=0),lab={g:'Recommended',a:'Fair',r:'Not worth it'};
  /* what is actually added on top of the EMIs (only options that have an amount) */
  const mOn=uM&&X>0,yOn=!!Q&&Q.xs.some(r=>r.some(x=>x>0)),inc=[mOn?`${inr(X)} extra every month`:'',yOn?`your year-wise part-payments (${Q.fq} time${s_(Q.fq)} a year)`:''].filter(Boolean),
    cx=inc.length>0,cc=yOn&&Q.ch>0;
  const kx=cx?g3(
      kpi('layers','Extra paid before closing',inr(best.ex),[mOn?`${inr(best.cm)} monthly`:'',yOn?`${inr(best.ce)} yearly`:''].filter(Boolean).join(' + ')),
      kpi('rupee','Total you pay in all',inr(best.cum+best.lump),`instead of ${inr(paid)} on the regular plan`),
      kpi('alert','Total charges',inr(best.cf+best.fee),`${inr(best.fee)} closing + ${inr(best.cf)} part-payment`)):'';
  const hd=['Month','Balance left','Settled amount'].concat(cx?['Part-payments paid']:[],cc?['Part-pay charge']:[],[`Charge (${f}%)`,'Pay to close','Interest saved','You save','Verdict']);
  return W+g3(kpi('cal','Best month to close','Month '+best.m,`after paying ${best.m} EMIs`),
      kpi('rupee','Amount to pay that month',inr(best.lump),`${inr(best.b)} balance + ${inr(best.fee)} charge`),
      kpi('trend','Interest you save',sn(best.net),lk?'after all charges':'after the closing charge'))+kx+
    `<div class="grid md:grid-cols-2 gap-3">`+
    adv('g','check','Good months to close',G.length?rng(G.map(x=>x.m)):'None',
      `Closing in month ${best.m} saves the most: ${sn(best.net)} compared with ${lk?`your regular loan (all ${n} EMIs, no part-payments)`:`paying all ${n} EMIs`}.`,'The earlier you close, the more interest you avoid.')+
    adv('r','alert','Not worth it',B.length?rng(B.map(x=>x.m)):'None',
      B.length?`From month ${B[0].m}, the ${f}% charge is about as much as the interest left to pay.`+(be?` After month ${be.m} the charge is higher than the remaining interest.`:''):'Closing early saves money in every allowed month.',
      'In these months, keep paying your regular EMI.')+`</div>`+
    head('Pre-close schedule',`You can close after ${Math.max(1,L)} EMIs.${cx?` Every month up to the closing month includes ${lst(inc)}.`:''} “You save” is the interest avoided${lk?' compared with your regular loan':''} minus ${lk?'all charges':'the closing charge'}. ${SET}`)+
    tbl(hd,
      rows.map(x=>`<tr class="${x===best?'best':''}">`+td([x.m,inr(x.b),inr(x.sp)].concat(cx?[inr(x.ex)]:[],cc?[inr(x.cf)]:[],[inr(x.fee),inr(x.lump),inr(x.gross),sn(x.net),`<span class="bdg ${x.z}">${DOT}${lab[x.z]}</span>`]),2)+`</tr>`).join(''),'',2)+
    durBox('pre',dRows(lk?pl.A:S),`Type a duration to see the interest and principal paid from month 1 of your payments before you close (EMIs${lk?' and your part-payments':''}). The closing payment itself is not counted. Days use a 30-day month.`);
}

/* ---- view 3: partly payment ---- */
function vPart(){
  const {P,E,n,r,int:si}=ST,X=v('extra');
  if(!isFinite(X)||X<0)return msg('Please enter a valid, positive amount.');
  if(!(X>0))return note('Enter an extra monthly amount above to see how much sooner you finish.');
  const A=sched(P,r,E+X,0),nt=A.length,sv=n-nt,ia=sum(A,'i');
  return g3(kpi('clock','New loan length',nt+' months',`instead of ${n} months`),
      kpi('cal','Time saved',sv+' months',`${(sv/12).toFixed(1)} years sooner`),
      kpi('trend','Interest you save',inr(si-ia),`${inr(si)} down to ${inr(ia)}`))+
    head('Your new schedule',`Every month you pay ${inr(E)} EMI + ${inr(X)} extra, starting from month 1. ${SET}`)+stable(A,'You pay')+durBox('part',dRows(A));
}

/* ---- view 4: custom year ---- */
function vCust(){
  const {P,E,n,r,int:si}=ST,cy=v('cy'),cm=v('cm');
  if([cy,cm].some(x=>!isFinite(x)||x<0))return msg('Please enter valid, positive numbers.');
  const tm=cy*12+cm,T=Math.round(tm);
  if(!(tm>0))return note('Enter years and months above (for example 1 year and 6 months).');
  if(T<1)return msg('The target must be at least 1 month.');
  if(T>=n)return adv('a','info','No extra payment needed',`${dur(T)} is not shorter than ${dur(n)}`,`Your regular EMI already ends the loan in ${n} months.`,'Enter a shorter target to see the extra amount you need.');
  const M=r>1e-12?P*r/(1-Math.pow(1+r,-T)):P/T,x=M-E,A=sched(P,r,M,T),ia=sum(A,'i');
  return g3(kpi('rupee','Extra needed every month',inr2(x),`${inr2(M)} in total (${inr(E)} EMI + extra)`),
      kpi('clock','Loan ends in',dur(T),`${n-T} months sooner than ${n}`),
      kpi('trend','Interest you save',inr(si-ia),`${inr(si)} down to ${inr(ia)}`))+
    head(`Schedule to finish in ${dur(T)}`,`Pay ${inr2(x)} extra with every EMI from month 1. Rounding up to ${inr(Math.ceil(x))} also finishes on time. ${SET}`)+stable(A,'You pay')+durBox('cust',dRows(A));
}

function vYr(){
  const p=yrPlan(),{n}=ST;
  if(p.err)return msg(p.err);if(p.none)return note(p.none);
  const {len,ia,fees,exs,cnt,gross,net,fq,ch,si}=p,pl=yrWhat(p);
  return (net>0?adv('g','check','Worth it',`You save ${inr(net)}`,`Paying ${pl}, in ${yrMo(fq)}, ends the loan ${n-len} months sooner.`,`Charges of ${inr(fees)} are already taken off the interest saved.`)
    :adv('r','alert','Not worth it','Charges cost more than they save',`The ${ch}% charge adds up to ${inr(fees)}, which is not less than the ${inr(gross)} of interest avoided.`,'Keep paying your regular EMI, or check whether the charge can be waived.'))+
    `<div class="grid grid-cols-2 lg:grid-cols-3 gap-3">`+
    kpi('clock','New loan duration',len+' months',`instead of ${n} months`)+
    kpi('cal','Time saved',(n-len)+' months',`${((n-len)/12).toFixed(1)} years sooner`)+
    kpi('alert','Total charges paid',inr(fees),`${ch}% on ${inr(exs)} prepaid`)+
    kpi('trend','Gross interest saved',inr(gross),`${inr(si)} down to ${inr(ia)}`)+
    kpi('check','Net interest saved',sn(net),'after all charges')+
    kpi('layers','Part-payments made',cnt+(cnt===1?' time':' times'),`${inr(exs)} extra in total`)+`</div>`+
    head('Year-wise plan',`Each of the ${fq} payment${s_(fq)} a year uses its own amount. Years with extra payments are highlighted.`)+yrYearTbl(p)+
    head('Month-by-month schedule',`Months with an extra part-payment are highlighted. The ${fq} payment${s_(fq)} a year are spread evenly, starting early in each loan year so the savings last longer. ${SET}`)+yrTable(p)+durBox('yr',dRows(p.A));
}
const R={normal:vNormal,pre:vPre,part:vPart,yr:vYr,cust:vCust,spec:vSpec};
