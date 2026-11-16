/* ---- building blocks ---- */
/* ---- duration-wise interest & principal (shown directly below every schedule) ----
   DSCH[view] = that view's active schedule as rows {i: interest, p: principal of the EMI (plus any monthly extra), x: extra lump part-payment}
   DUR[view]  = what the person typed in the Day / Month / Year boxes (kept here because the view is redrawn on every change) */

const dRows=A=>A.map(x=>({i:x.i,p:x.p,x:x.ex||0}));
const dfld=(id,l,k,val)=>`<div><label class="lbl" for="${id}">${l}</label><input id="${id}" class="inp" data-k="${k}" type="number" inputmode="numeric" pattern="[0-9]*" min="0" step="1" value="${String(val).replace(/"/g,'&quot;')}" placeholder="0"></div>`;
const durTxt=(Y,Mo,D)=>[Y&&`${Y} year${Y>1?'s':''}`,Mo&&`${Mo} month${Mo>1?'s':''}`,D&&`${D} day${D>1?'s':''}`].filter(Boolean).join(' ');
/* full months first, then the days of the NEXT month (30-day month): interest/30 × days and principal/30 × days.
   Every 30 days count as one more month. Nothing is added once the loan has ended. */
function durCalc(rows,Y,Mo,D){
  const L=rows.length,M=Y*12+Mo+Math.floor(D/30),d=D%30,full=Math.min(M,L);
  let it=0,pr=0,xs=0;
  for(let k=0;k<full;k++){const r=rows[k];it+=r.i;pr+=r.p+r.x;xs+=r.x}
  let capped=false;
  if(M>=L)capped=M>L||d>0;
  else if(d>0){const nx=rows[M];it+=nx.i/30*d;pr+=nx.p/30*d}
  return{it,pr,xs,L,M,d,capped};
}
function durOut(view){
  const s=DUR[view],rows=DSCH[view];if(!s||!rows||!rows.length)return '';
  const n=[s.d,s.m,s.y].map(x=>{x=String(x==null?'':x).trim();return x===''?0:Number(x)});
  if(n.some(x=>!Number.isInteger(x)||x<0))return msg('Enter whole numbers only: 0 or more in Day, Month and Year.');
  const [D,Mo,Y]=n;
  if(!(D>0||Mo>0||Y>0))return '';
  const c=durCalc(rows,Y,Mo,D),tx=c.capped?`the full ${c.L} month${s_(c.L)} of the loan`:durTxt(Y,Mo,D),
    nt=c.capped?(c.M>c.L?`Your duration is longer than this loan. The loan ends after ${c.L} month${s_(c.L)}, so the totals cover the whole schedule.`:`The loan ends after ${c.L} month${s_(c.L)}, so the extra days add nothing.`):'';
  return `<div class="grid grid-cols-2 gap-3 dur-o">`+
    kpi('trend','Total interest paid',inr2(c.it),`over ${tx}`)+
    kpi('layers','Total principal paid',inr2(c.pr),`repaid over ${tx}`+(c.xs>0?`, including ${inr2(c.xs)} of part-payments`:''))+`</div>`+
    (nt?`<p class="text-xs" style="color:var(--muted)">${nt}</p>`:'');
}
const durBox=(view,rows,sub)=>{
  DSCH[view]=rows;const s=DUR[view]||(DUR[view]={d:'',m:'',y:''});
  return `<div class="space-y-3">`+head('Duration-wise Interest &amp; Principal Paid',sub||'Type a duration to see the interest and principal paid from month 1 of the schedule above. Days use a 30-day month.')+
    `<div class="card grid grid-cols-3 gap-3" data-dur="${view}" role="group" aria-label="Duration">${dfld(`du-${view}-d`,'Day','d',s.d)}${dfld(`du-${view}-m`,'Month','m',s.m)}${dfld(`du-${view}-y`,'Year','y',s.y)}</div>`+
    `<div id="du-${view}-o" class="space-y-3" aria-live="polite">${durOut(view)}</div></div>`;
};
