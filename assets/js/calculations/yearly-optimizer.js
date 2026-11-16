/* ---- yearly optimizer: one amount box for every payment of every loan year ---- */

/* YA[y][j] = amount typed for payment j+1 of loan year y (a box never typed in starts at YDEF) */
const yAmt=(y,j)=>{const r=YA[y];return String(r&&r[j]!==undefined?r[j]:YDEF).replace(/,/g,'').trim()};
const yrN=()=>ST?Math.ceil(ST.n/12):0;
const yrK=()=>{const k=+rv('yf')||v('yn');return Number.isInteger(k)&&k>=1&&k<=12?k:0};
/* loan month in which payment j+1 of loan year y falls when there are fq payments a year */
const slotMo=(y,j,fq)=>(y-1)*12+Math.floor(j*12/fq)+1;
/* every box as a number: xs[y-1][j]. A box that cannot be read counts as 0 and is listed in bad */
function yrXs(fq){
  const xs=[],bad=[],yrs=yrN();
  for(let y=1;y<=yrs;y++){const row=[];for(let j=0;j<fq;j++){const a=yAmt(y,j),t=a===''?0:Number(a);if(isFinite(t)&&t>=0)row.push(t);else{row.push(0);bad.push({y,j})}}xs.push(row)}
  return{xs,bad};
}
function yrFields(force){
  const g=$('yy-g'),q=$('yy-q');if(!g)return;
  const yrs=yrN(),k=yrK(),sig=yrs+'|'+k+'|'+(ST?ST.n:0);
  if(force||sig!==yrSig){
    yrSig=sig;
    if(!yrs){q.innerHTML='';g.innerHTML='<p class="text-sm" style="color:var(--muted)">Fill in the loan details first. The payment boxes will appear for every loan year.</p>';yrNote();return}
    q.innerHTML=[1,2,3].map(x=>`<button type="button" class="qf" data-qf="${x}">${x}× EMI</button>`).join('')+`<button type="button" class="qf" data-qf="f">Copy Year 1 to all</button><button type="button" class="qf" data-qf="c">Clear all</button>`;
    if(!k){g.innerHTML='<p class="text-sm" style="color:var(--muted)">Choose how many times a year you will pay (1 to 12) to see the payment boxes.</p>';yrNote();return}
    g.innerHTML=Array.from({length:yrs},(_,i)=>{const y=i+1,a=i*12+1,z=Math.min(y*12,ST.n);
      return `<div class="yf yb" id="yf${y}"><div class="ybh"><b>Year ${y}</b> <small>(${a===z?'month '+a:'months '+a+'–'+z})</small></div><small class="yo" id="yo${y}"></small><div class="ysg">`+
        Array.from({length:k},(_,j)=>`<div class="ys" id="ys${y}_${j}">${cfld(`yy${y}_${j}`,`Year ${y} - Payment ${j+1} <small>(month ${slotMo(y,j,k)})</small>`,yAmt(y,j))}<small class="yo"></small></div>`).join('')+`</div></div>`}).join('');
  }
  yrMark();
}
/* grey out the payment boxes that fall after the loan has already closed (they are not used) */
function yrMark(){
  const yrs=yrN(),k=yrK();if(!yrs)return;
  if(!k)return yrNote();
  const p=yrPlan(),lim=p.A?p.len:ST.n,cl=Math.ceil(lim/12);
  for(let y=1;y<=yrs;y++){
    const w=$('yf'+y);if(!w)continue;
    const offs=Array.from({length:k},(_,j)=>slotMo(y,j,k)>lim),live=offs.filter(x=>!x).length;
    offs.forEach((off,j)=>{
      const s=$(`ys${y}_${j}`),i=$(`yy${y}_${j}`);if(!s||!i)return;
      s.classList.toggle('off',off);i.disabled=off;
      s.querySelector('.yo').textContent=off&&live?'Not needed':'';
    });
    w.classList.toggle('off',!live);
    $('yo'+y).textContent=live?'':`Not needed: the loan ends in Year ${cl}`;
  }
  yrNote();
}
/* note below the payment boxes (above "Prepayment charge"): shown when the amount typed for the payment that closes the loan is more than the balance needs */
function yrNote(){
  const el=$('yy-note');if(!el)return;
  let h='';
  try{
    const yrs=yrN(),fq=+rv('yf')||v('yn');
    if(yrs&&Number.isInteger(fq)&&fq>=1&&fq<=12){
      const {xs}=yrXs(fq),p=yrSim(xs,fq,0),cy=Math.ceil(p.len/12),row=xs[cy-1]||[],pays=p.A.filter(a=>a.y===cy&&a.ex>0);
      if(row.some(x=>x>0)){
        if(!pays.length)h=`Note: For Year ${cy}, no extra payment is required. The regular EMIs already clear the loan balance.`;
        else{
          const last=pays[pays.length-1],amt=row[last.sl-1]||0;
          if(last.c<=.005&&amt-last.ex>=.5)h=`Note: For Year ${cy} - Payment ${last.sl} (month ${last.m}), only ${inr(last.ex)} is required to fully pay off the loan balance.`;
        }
      }
    }
  }catch(e){h=''}
  el.innerHTML=h?ic('info','w-4 h-4')+`<span>${h}</span>`:'';
}
$('yy-w').addEventListener('input',e=>{
  const m=/^yy(\d+)_(\d+)$/.exec(e.target.id);if(!m)return;
  (YA[m[1]]=YA[m[1]]||[])[m[2]]=e.target.value.replace(/,/g,'');render();
});
$('yy-w').addEventListener('click',e=>{
  const bt=e.target.closest('[data-qf]');if(!bt||!ST)return;
  const yrs=yrN(),q=bt.dataset.qf,first=Array.from({length:12},(_,j)=>yAmt(1,j));
  /* all 12 possible slots are filled, so the amounts are still there if the number of payments a year is changed later */
  for(let y=1;y<=yrs;y++)YA[y]=Array.from({length:12},(_,j)=>q==='c'?'':q==='f'?first[j]:String(+(+q*ST.E).toFixed(2)));
  yrFields(true);render();
});
/* one simulation of the yearly plan. xs[y-1][j] = amount of payment j+1 in loan year y.
   X = optional extra paid with every EMI (0 in the Yearly view; Pre-Close and Special use it).
   dMax = the monthly extra and the yearly part-payments are paid only in months 1..dMax (default: all months) */
function yrSim(xs,fq,ch,X=0,dMax=Infinity){
  const {P,E,r,int:si}=ST,MS=Array.from({length:fq},(_,j)=>Math.floor(j*12/fq)+1),A=[];let b=P;
  for(let m=1;b>.005&&m<=1200;m++){
    const i=b*r,yi=Math.floor((m-1)/12),mi=(m-1)%12+1,Xm=m<=dMax?X:0;let p=E+Xm-i,pay=E,mx=Xm;
    if(p>=b-.005){p=b;const t=b+i;if(Xm>0){pay=Math.min(E,t);mx=t-pay}else{pay=t;mx=0}}
    b-=p;let ex=0,fee=0,sl=0;
    const j=MS.indexOf(mi),x=(j>=0&&m<=dMax)?((xs[yi]||[])[j]||0):0;
    if(x>0&&b>.005){ex=Math.min(x,b);fee=ex*ch/100;b-=ex;sl=j+1}
    b=Math.max(0,b);A.push({m,y:yi+1,pay,mx,ex,fee,sl,i,p,c:b,sp:P-b});
  }
  const ia=sum(A,'i'),fees=sum(A,'fee');
  return{A,len:A.length,ia,fees,exs:sum(A,'ex'),cnt:A.filter(a=>a.ex>0).length,gross:si-ia,net:si-ia-fees,xs,fq,ch,MS,si};
}
/* the Yearly Optimizer settings as numbers (shared by the Yearly, Special and Pre-Close views) */
function yrInputs(){
  const fq=+rv('yf')||v('yn'),ch=v('ypc');
  if(!(Number.isInteger(fq)&&fq>=1&&fq<=12))return{err:'Enter a whole number of part-payments per year, from 1 to 12.'};
  if(!isFinite(ch)||ch<0||ch>100)return{err:'Please enter a valid prepayment charge between 0 and 100%.'};
  return Object.assign({fq,ch},yrXs(fq));
}
function yrPlan(){
  const q=yrInputs();if(q.err)return{err:q.err};
  const {fq,ch,xs,bad}=q,p=yrSim(xs,fq,ch),hit=bad.find(b=>slotMo(b.y,b.j,fq)<=p.len);
  if(hit)return{err:`Please enter a valid amount for Year ${hit.y} - Payment ${hit.j+1}.`};
  if(!xs.some(r=>r.some(x=>x>0)))return{none:'Enter an extra amount for at least one payment above to see the result.'};
  if(!p.cnt)return{none:'The loan ends before any of these extra payments is due. Enter an amount for an earlier payment.'};
  return Object.assign(p,{yrs:yrN()});
}
/* plain-words descriptions of a yearly plan (only the payments that fall while the loan is still running) */
const s_=n=>n>1?'s':'',
  yrSlots=p=>{const o=[];p.xs.forEach((r,yi)=>r.forEach((x,j)=>{if(slotMo(yi+1,j,p.fq)<=p.len)o.push(x)}));return o},
  yrU=p=>[...new Set(yrSlots(p).map(x=>+x.toFixed(2)))];
function yrWhat(p){
  const u=yrSlots(p),{fq}=p;
  if(yrU(p).length===1)return `${inr(u[0])} each time × ${fq} = ${inr(fq*u[0])} a year`;
  const pos=u.filter(x=>x>0),z=u.length-pos.length;
  if(!pos.length)return 'no extra payments';
  const lo=Math.min(...pos),hi=Math.max(...pos);
  return lo===hi?`${inr(lo)} each time, but only for ${pos.length} of ${u.length} payments`:`individual amounts of ${inr(lo)} to ${inr(hi)} each time`+(z?`, with no extra in ${z} payment${s_(z)}`:'');
}
const yrHead=p=>`Pay ${yrU(p).length===1?inr(yrSlots(p)[0]):'individual amounts'} ${p.fq} time${s_(p.fq)} a year`,
  yrLab=p=>`${yrU(p).length===1?inr(yrSlots(p)[0]):'Slot-wise'} × ${p.fq} a year`,
  lst=a=>a.length>1?a.slice(0,-1).join(', ')+' and '+a[a.length-1]:''+a[0],
  yrMo=fq=>fq===12?'every month':`month${s_(fq)} ${lst(Array.from({length:fq},(_,j)=>Math.floor(j*12/fq)+1))} of each loan year`,
  /* the extra payments of one year as text, equal neighbours grouped: "₹5,000 × 2 + ₹8,000" */
  yrAmts=a=>{const o=[];a.forEach(z=>{const t=inr(z.ex),l=o[o.length-1];l&&l[0]===t?l[1]++:o.push([t,1])});return o.map(([t,c])=>c>1?`${t} × ${c}`:t).join(' + ')};
const yrTable=p=>{const {A,exs,fees,ia}=p;return tbl(['Month','Regular EMI','Extra payment','Charge','Interest','Principal','Balance left','Settled amount'],
  A.map(x=>`<tr class="${x.ex?'best':''}">`+td([x.m+(x.ex?` <span class="bdg g">Payment ${x.sl}</span>`:''),inr(x.pay),x.ex?inr(x.ex):'—',x.ex?inr(x.fee):'—',inr(x.i),inr(x.p),inr(x.c),inr(x.sp)],7)+'</tr>').join(''),
  `<tfoot><tr>${td(['Total',inr(sum(A,'pay')),inr(exs),inr(fees),inr(ia),inr(sum(A,'p')),'',''])}</tr></tfoot>`,7)};
/* year-wise summary: one row for each loan year the loan runs; the amounts are the individual payments of that year */
function yrYearTbl(p){
  const {A,len}=p;let tx=0,tf=0,ti=0;
  const rows=Array.from({length:Math.ceil(len/12)},(_,i)=>{
    const y=i+1,a=A.filter(z=>z.y===y),pd=a.filter(z=>z.ex>0),ex=sum(a,'ex'),fee=sum(a,'fee'),it=sum(a,'i'),c=pd.length;tx+=ex;tf+=fee;ti+=it;
    return`<tr class="${ex?'best':''}">`+td([`Year ${y}`,a[0].m===a[a.length-1].m?`${a[0].m}`:`${a[0].m}–${a[a.length-1].m}`,c?yrAmts(pd):'—',c?String(c):'—',ex?inr(ex):'—',ex?inr(fee):'—',inr(it),inr(a[a.length-1].c)],4)+'</tr>';
  }).join('');
  return tbl(['Loan year','Months','Payment amounts','Payments','Extra paid','Charge','Interest','Balance at year end'],rows,
    `<tfoot><tr>${td(['Total','','','',inr(tx),inr(tf),inr(ti),''])}</tr></tfoot>`,4);
}
/* smallest equal amount per payment (yearly, fq times a year) whose net saving matches `target` */
function yrEq(target){
  const fq=+rv('yf')||v('yn'),ch=v('ypc');
  if(!(Number.isInteger(fq)&&fq>=1&&fq<=12)||!isFinite(ch)||ch<0||ch>100)return null;
  const {P}=ST,yrs=yrN(),sim=k=>yrSim(Array.from({length:yrs},()=>Array(fq).fill(k)),fq,ch),tol=target-.005;
  let lo=0,hi=-1,prev=0;
  for(let st=1;st<=120;st++){const k=P*st/120;if(sim(k).net>=tol){hi=k;lo=prev;break}prev=k}
  if(hi<0)return{fq,ch,none:true};
  for(let i=0;i<50;i++){const m=(lo+hi)/2;sim(m).net>=tol?hi=m:lo=m}
  let k=Math.max(1,Math.ceil(hi)),plan=sim(k);
  for(let t=0;t<200&&plan.net<tol;t++){k++;plan=sim(k)}
  return plan.net<tol?{fq,ch,none:true}:{fq,ch,k,plan};
}
