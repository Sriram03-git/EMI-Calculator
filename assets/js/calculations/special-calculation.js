/* ---- view 5: special (renders only when opened) ---- */
function vSpec(){
  const {P,E,n,r,S,paid:stdPaid,int:stdInt}=ST,preOn=on('pre'),partOn=on('part'),yearOn=on('yr'),
    linkM=preOn&&$('pim').checked,linkY=preOn&&$('piy').checked,f=v('fc'),L=Math.round(v('lock'));
  let X=partOn||linkM?v('extra'):0,auto=false;
  if(preOn&&[f,L].some(x=>!isFinite(x)||x<0))return msg('Please enter valid numbers in the Pre-Close view first.');
  if((partOn||linkM)&&(!isFinite(X)||X<0))return msg('Please enter a valid, positive amount in Partly Payment.');
  if((partOn||linkM)&&!(X>0)){X=Math.max(100,Math.round(E/200)*100);auto=true}
  const rows=preOn?preRows(S,stdPaid,f,L):[],mx=rows.length?Math.max(...rows.map(x=>x.net)):0,
    preBest=rows.length?rows.find(x=>x.net===mx):null,best=preBest&&preBest.net>0?preBest:null;
  const A=sched(P,r,E+X,0),nt=A.length,ia=sum(A,'i'),ppPaid=sum(A,'paid'),pp=stdInt-ia,pc=best?best.net:0;
  const D='—',B=!!best,no=rows.length?'No saving after the charge':'Not allowed before the loan ends';
  const bd=` <span class="bdg g">${ic('check','w-3 h-3')}Best</span>`;
  /* The view toggles select standalone plans; the Pre-Close switches select combinations. */
  const Y=yearOn||linkY?yrPlan():null,YY=Y&&!Y.err&&!Y.none?Y:null,yMsg=Y&&(Y.err||Y.none),
    Qin=linkY&&YY?yrInputs():null,
    CS=preOn&&(linkM||linkY)?comboSearch(f,L,linkM?X:0,Qin):[],
    CB=CS.length?CS.reduce((a,c)=>c.best.net>a.best.net+1e-9?c:a).best:null;
  const ranked=[
    {key:'regular',name:'Regular EMI only',net:0},
    ...(preOn&&preBest?[{key:'pre',name:'Pre-close only',net:preBest.net}]:[]),
    ...(partOn?[{key:'part',name:'Monthly part-payment only',net:pp}]:[]),
    ...(yearOn&&YY?[{key:'yr',name:'Yearly part-payment only',net:YY.net}]:[]),
    ...CS.map(F=>({key:'combo',name:F.nm,net:F.best.net,fam:F,best:F.best}))
  ].sort((a,b)=>b.net-a.net);
  const topAll=ranked[0].key,
    standalone=ranked.find(x=>x.key!=='regular'&&x.key!=='combo'&&x.net>0),
    top=standalone?standalone.key:'regular';
  SPC=null;
  /* smart suggestions: what monthly / yearly part-payments give the same saving as the best other plan? */
  const tgt=B&&pc>pp?pc:pp;
  let be=0,bn=0,ye=null;
  if(top==='pre'){
    let lo=X,hi=Math.max(P*(1+r)-E,X+1);
    for(let i=0;i<60;i++){const k=(lo+hi)/2;stdInt-sum(sched(P,r,E+k,0),'i')>=pc?hi=k:lo=k}
    be=Math.ceil(hi);bn=sched(P,r,E+be,0).length;
  }
  if(yearOn&&YY&&(top==='pre'||top==='part'))ye=yrEq(tgt);
  const yLine=(q,nm)=>{
    const h=`<b>Yearly (${q.fq} time${s_(q.fq)} a year):</b> `;
    if(q.none)return h+`no equal yearly amount reaches the ${nm} saving with a ${q.ch}% charge, because the charge cancels too much of the interest saved.`;
    const pl=q.plan,ex=pl.A.filter(a=>a.ex>0),ms=ex.map(a=>a.m),last=ex[ex.length-1],shown=ms.length>8?ms.slice(0,8).join(', ')+' …':lst(ms);
    return h+`pay about ${inr(q.k)} each time, in ${yrMo(q.fq)}`+(q.fq===12||!ms.some(m=>m>12)?'':`, which means loan month${s_(ms.length)} ${shown}`)+
      `. That is ${inr(pl.exs)} extra in all${last&&last.ex<q.k-.5?` (the last payment is only ${inr(last.ex)}, the balance left)`:''}. The loan ends in ${pl.len} months and you save ${inr(pl.net)}`+(q.ch>0?` after ${inr(pl.fees)} of charges (${q.ch}%)`:'')+`, which matches the ${nm} saving.`;
  };
  const yFoot=ye?` The yearly figure uses the ${ye.fq} payment${s_(ye.fq)} a year and ${ye.ch}% charge from Yearly Optimizer, with the same amount in every payment.`:'';
  const winner=ranked[0],runnerUp=ranked[1],winnerGap=runnerUp?Math.max(0,winner.net-runnerUp.net):0,
    g=adv('g','check',winner.key==='regular'?'Keep paying the regular EMI':winner.key==='combo'?'Best strategy: part-payments, then pre-close':`Best choice: ${winner.name}`,
      winner.key==='combo'?`Pay part-payments for ${winner.best.d} months, then close in month ${winner.best.m}`:winner.name,
      winner.key==='regular'?'None of the selected prepayment strategies saves more than continuing with the regular EMIs.':
        `This option saves ${sn(winner.net)} after all charges.`+(runnerUp?` It is ${inr(winnerGap)} more than Rank #2 (${runnerUp.name}).`:''),
      winner.key==='combo'?`Pay ${inr(winner.best.lump)} to close after ${inr(winner.best.ex)} of part-payments.`:
        winner.key==='pre'?`Close in month ${best.m} after paying the ${f}% charge.`:
        winner.key==='yr'?'Yearly prepayment charges are included in this saving.':
        winner.key==='part'?'No part-payment charge is assumed.':'');
  let k;
  if(top==='pre'){
    k=adv('a','info','Keep in mind',`You need ${inr(best.lump)} at once`,
      `If you cannot arrange the full amount, these give a similar saving of about ${inr(pc)}:`,
      `Pre-close includes a ${f}% charge; monthly part-payment has none.`+yFoot,
      ul([`<b>Monthly:</b> pay about ${inr(be)} extra every month. The loan ends in ${bn} months.`].concat(ye?[yLine(ye,'pre-close')]:[])));
  }else if(top==='yr'){
    const fx=YY.A.find(a=>a.ex>0);
    k=adv('a','info','Keep in mind',`${inr(YY.exs)} in ${YY.cnt} part-payment${s_(YY.cnt)}`,
      `Your first part-payment of ${inr(fx.ex)} falls in month ${fx.m}.`+(B?` Pre-closing would need ${inr(best.lump)} at once.`:''),
      'Check that your lender allows this many part-payments a year, and any minimum amount.');
  }else if(top==='part'){
    k=adv('a','info','Keep in mind',`${inr(E+X)} every month`,
      `You pay ${inr(X)} more than your EMI for about ${nt} months.`+(B?` Pre-closing would need ${inr(best.lump)} at once.`:'')+(ye?' To get the same saving with fewer payments:':''),
      (auto?`You have not entered an extra amount, so ${inr(X)} (about half your EMI) is used here.`:'Change the extra amount in the Partly Payment view to try another figure.')+yFoot,
      ye?ul([yLine(ye,'monthly part-payment')]):'');
  }else{
    k=adv('a','info','No prepayment recommendation',`Keep the ${inr(E)} regular EMI`,
      'The enabled plans are included in the comparison; none saves more than the regular EMI baseline.',
      'Change their amounts or charges in their respective views to compare different settings.');
  }
  const comparison=[
    {key:'regular',label:'Pay EMI only',values:['Pay EMI only',`${n} months`,D,inr(E),D,'₹0',inr(stdInt),inr(stdPaid),inr(0)]}
  ];
  if(preOn)comparison.push({key:'pre',label:'Pre-close',values:[
    preBest?`Pay ${preBest.m} EMIs, then close`:no,preBest?`${preBest.m} months`:D,
    preBest?`${n-preBest.m} months`:D,preBest?`${inr(E)} until month ${preBest.m}`:D,
    preBest?inr(preBest.lump):D,preBest?`${inr(preBest.fee)} (${f}%)`:D,
    preBest?inr(preBest.ci+preBest.fee):D,preBest?inr(preBest.cum+preBest.lump):D,
    preBest?sn(preBest.net):D
  ]});
  if(partOn)comparison.push({key:'part',label:'Part-payment',values:[
    `EMI + ${inr(X)} extra`,`${nt} months`,`${n-nt} months`,inr(E+X),'None','₹0',
    inr(ia),inr(ppPaid),sn(pp)
  ]});
  if(yearOn)comparison.push({key:'yr',label:'Yearly plan',values:YY?[
    yrLab(YY),`${YY.len} months`,`${n-YY.len} months`,inr(E),`${YY.cnt} part-payment${s_(YY.cnt)}`,
    `${inr(YY.fees)} (${YY.ch}%)`,inr(YY.ia+YY.fees),inr(sum(YY.A,'pay')+YY.exs+YY.fees),sn(YY.net)
  ]:['No valid yearly plan',D,D,D,D,D,D,D,D]});
  if(CB)comparison.push({key:'combo',label:'Combined',values:[
    `${CB.fam.pick}, then close`,`${CB.m} months`,`${n-CB.m} months`,
    CB.fam.k==='y'?inr(E):`${inr(E+X)} for ${CB.d} month${s_(CB.d)}`+(CB.m>CB.d?`, then ${inr(E)}`:''),
    inr(CB.lump)+(CB.ce>0?` + ${inr(CB.ce)} yearly`:''),`${inr(CB.fee)} (${f}%)`+
      (CB.cf>0?` + ${inr(CB.cf)} (${CB.fam.Q.ch}%)`:''),inr(CB.ci+CB.cf+CB.fee),
    inr(CB.cum+CB.lump),sn(CB.net)
  ]});
  const comparisonRows=Array.from({length:8},(_,i)=>[[
    'Plan','Loan ends in','Months saved','Monthly payment','One-time payment',
    'Charges','Interest + charges','Total you pay','Interest you save'
  ][i],...comparison.map(p=>p.values[i])]);
  const rankGap=(entry,index)=>index?Math.max(0,ranked[index-1].net-entry.net):null,
    podium=ranked.slice(0,3),
    podiumStyles=['background:var(--gbg);border-color:var(--g)','background:var(--inp);border-color:var(--bd)','background:var(--abg);border-color:var(--a)'],
    rankTable=`
      <section class="card space-y-4">
        ${head('All strategies, ranked by net interest saved','Only enabled standalone plans and selected Pre-Close combinations are ranked. Charges are included; regular EMI is the zero-saving baseline.')}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${podium.map((x,i)=>`<article class="rounded-xl border p-4 shadow-sm min-w-0" style="${podiumStyles[i]}">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wide" style="color:var(--muted)">Rank #${i+1}</span>
              ${x.key==='combo'&&x===ranked[0]?`<span class="bdg g">${ic('spark','w-3 h-3')}Combined winner</span>`:x===ranked[0]?`<span class="bdg g">${ic('check','w-3 h-3')}Winner</span>`:''}
            </div>
            <h4 class="mt-2 font-bold">${x.name}</h4>
            <div class="mt-1 text-2xl font-extrabold">${sn(x.net)}</div>
            <p class="mt-2 text-xs" style="color:var(--muted)">${i?`Difference from Rank #${i}: ${inr(rankGap(x,i))}`:'Highest net saving'}</p>
          </article>`).join('')}
        </div>
        ${tbl(['Rank','Strategy','Net saving','Difference from rank above'],
          ranked.map((x,i)=>`<tr class="${i===0?'best':''}">`+td([
            `#${i+1}`,x.name+(x.key==='combo'&&x===ranked[0]?` <span class="bdg g">Combined winner</span>`:''),
            sn(x.net),i?inr(rankGap(x,i)):'—'
          ],2)+'</tr>').join(''),'')}
      </section>`,
    hd=['Compare',...comparison.map(p=>p.label+(p.key===topAll?(p.key==='combo'?` <span class="bdg g">${ic('spark','w-3 h-3')}Combined winner</span>`:bd):''))],
    last=['Interest you save',...comparison.map(p=>p.values[8])],
    comparisonTable=tbl(hd,comparisonRows.map(x=>`<tr>${td(x)}</tr>`).join('')+`<tr class="best">${td(last)}</tr>`),
    kp=kpi('trend','Lead over next strategy',runnerUp?inr(winnerGap):'—',runnerUp?`${winner.name} ahead of ${runnerUp.name}`:'Only one strategy is available');
  let yt='',gg=g;
  if(YY&&yearOn){
    const y=YY;
    yt=head('Yearly plan: year-wise summary',`${yrWhat(y)}, in ${yrMo(y.fq)}. Each payment uses its own amount. Years with extra payments are highlighted.`)+yrYearTbl(y)+
      head('Yearly plan: month-by-month schedule',`Months with an extra part-payment are highlighted. ${SET}`)+yrTable(y);
  }
  /* ---- combined strategy: table column, cards, ranking, breakdown, timeline and "your own timeline" ---- */
  let cmb='',cmbK='';
  if(CB){
    const F=CB.fam,fk=F.k,what=fk==='m'?`${inr(X)} extra every month`:fk==='y'?'the yearly part-payments':`${inr(X)} extra every month plus the yearly part-payments`,
      dtx=`${CB.d} month${s_(CB.d)}`,plan=`Pay ${what} for ${dtx}, then close in month ${CB.m}`,regEmi=CB.cum-CB.cm-CB.ce-CB.cf;
    cmbK=g3(kpi('spark','Best combined strategy',inr(CB.net),'saved after all charges'),
      kpi('clock','Part-payments for',dtx,`then close in month ${CB.m}`),
      kpi('rupee','Pay to close',inr(CB.lump),`after ${inr(CB.ex)} of part-payments`));
    /* recommendation cards when the combined strategy is the overall winner */
    if(topAll==='combo'){
      const oth=ranked.filter(x=>x!==winner).map(x=>`${x.name} ${sn(x.net)}`);
      gg=adv('g','check','Best strategy: part-payments, then pre-close',plan,
        `Saves ${inr(CB.net)} after all charges (${inr(CB.fee)} closing charge${CB.cf>0?` and ${inr(CB.cf)} yearly part-payment charges`:''}). The others save less: ${lst(oth)}.`,
        `The loan ends in month ${CB.m}, ${n-CB.m} months early. You pay ${inr(CB.lump)} at once on top of ${inr(CB.ex)} of part-payments.`);
      k=adv('a','info','Keep in mind',`${inr(CB.lump)} at once in month ${CB.m}`,
        `Before that you pay ${inr(CB.ex)} extra over ${dtx}. If you cannot arrange the closing amount, the other enabled strategies are:`,
        `Pre-close includes a ${f}% charge on the balance left.`+(auto?` You have not entered an extra amount, so ${inr(X)} (about half your EMI) is used here.`:''),
        ul(oth));
    }
    /* where the saving of the best combined strategy comes from */
    const br=[['Regular EMIs paid until closing',inr(regEmi)],CB.cm>0?['Monthly extra paid',inr(CB.cm)]:null,CB.ce>0?['Yearly part-payments paid',inr(CB.ce)]:null,
      CB.cf>0?[`Yearly part-payment charges (${F.Q.ch}%)`,inr(CB.cf)]:null,[`Balance left in month ${CB.m}`,inr(CB.b)],[`Closing charge (${f}%)`,inr(CB.fee)],
      ['Pay to close',inr(CB.lump)],['Total you pay in all',inr(CB.cum+CB.lump)],['Total on the regular loan',inr(stdPaid)]].filter(Boolean);
    const breakT=head('Best combined strategy: the numbers',`${plan}.`)+
      tbl(['What','Amount'],br.map(x=>`<tr>${td(x)}</tr>`).join('')+`<tr class="best">${td(['Interest you save',inr(CB.net)])}</tr>`);
    /* timeline: for several part-payment durations, the best month to close */
    const dset=new Set([1,3,6,12,24,36,60,120,240,360].filter(d=>F.byD.some(x=>x.d===d)));dset.add(CB.d);dset.add(F.byD[F.byD.length-1].d);
    const tl=[...dset].sort((a,b)=>a-b).map(d=>F.byD.find(x=>x.d===d)).filter(Boolean);
    if(B)tl.unshift({d:0,m:best.m,ex:0,lump:best.lump,net:pc});
    const tmx=Math.max(...tl.map(x=>x.net)),lab={g:'Recommended',a:'Fair',r:'Not worth it'};
    tl.forEach(x=>x.z=(tmx<=0||x.net<=0||x.net<.1*tmx)?'r':x.net>=.5*tmx?'g':'a');
    const timeT=head(`Timeline comparison: ${F.pick}`,`Each row pays the part-payments for that many months, then closes in the best month from then on. The best row is highlighted.`)+
      `<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">${tl.map(x=>`<article class="rounded-xl border p-4 shadow-sm min-w-0 space-y-3" style="background:${x===CB?'var(--gbg)':'var(--card)'};border-color:${x===CB?'var(--g)':'var(--bd)'}">
        <div class="flex items-start justify-between gap-2">
          <div><p class="text-xs" style="color:var(--muted)">Part-payments for</p><h4 class="font-bold">${x.d?`${x.d} month${s_(x.d)}`:'None (pre-close only)'}</h4></div>
          <span class="bdg ${x.z}">${DOT}${lab[x.z]}</span>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><p class="text-xs" style="color:var(--muted)">Best month to close</p><b>Month ${x.m}</b></div>
          <div><p class="text-xs" style="color:var(--muted)">Extra paid</p><b>${x.ex>0?inr(x.ex):'—'}</b></div>
          <div><p class="text-xs" style="color:var(--muted)">Pay to close</p><b>${inr(x.lump)}</b></div>
          <div><p class="text-xs" style="color:var(--muted)">Net saving</p><b>${sn(x.net)}</b></div>
        </div>
        ${x===CB?`<span class="bdg g">${ic('spark','w-3 h-3')}Combined winner</span>`:''}
      </article>`).join('')}</div>`;
    SPC={f,L,X,fams:CS,best:CB,pure:rows};
    cmb=head('Combined strategy: part-payments, then pre-close','Link your part-payments to closing: pay extra for some months, then close the loan. Every duration and closing month was compared.')+breakT+timeT+spwBox();
  }else{
    cmb=note(preOn?'No linked combined strategy is available. Enable Monthly Partly Payment or Yearly Part-Payment in Pre-Close to include that combination.':'Enable Pre-Close and one of its linking switches to compare combined strategies.');
  }
  const enabledKpis=[];
  if(preOn)enabledKpis.push(kpi('cal',B?`Pre-close (month ${best.m})`:'Pre-close',sn(preBest?preBest.net:0),preBest?`net saving after a ${inr(preBest.fee)} charge`:no));
  if(partOn)enabledKpis.push(kpi('layers','Part-payment',sn(pp),`saved; loan ends in ${nt} months`));
  if(yearOn&&YY)enabledKpis.push(kpi('repeat','Yearly plan',sn(YY.net),`saved; loan ends in ${YY.len} months`));
  if(winner.key==='combo')enabledKpis.push(kpi('spark','Combined',sn(winner.net),'highest net saving'));
  enabledKpis.push(kp);
  const settings=[
      preOn?`Pre-Close uses a ${f}% charge after ${Math.max(1,L)} EMIs.`:'',
      partOn?`Partly Payment uses ${inr(X)} extra every month.`:'',
      yearOn&&YY?`The yearly plan uses the Yearly Optimizer settings.`:'',
      linkM||linkY?`Combined strategies use only the Pre-Close linking switches that are on.`:''
    ].filter(Boolean).join(' '),
    extraText=settings||'No prepayment or combined strategies are enabled; regular EMI is shown as the zero-saving baseline.',
    yearlyPrompt=yearOn||linkY?(yMsg?note('Yearly plan left out: '+yMsg):''):
      `<div class="flex flex-wrap gap-3">${GO('yr','Add a yearly plan')}</div>`;
  return note(`${extraText} Change settings in their respective views to update this page.`)+
    (yearOn&&!YY||linkY&&!YY?note('Yearly plan left out: '+(yMsg||'No valid yearly plan is available.')):yearlyPrompt)+
    g3(...enabledKpis)+cmbK+
    `<div class="grid md:grid-cols-2 gap-3">${gg}${k}</div>`+
    rankTable+`<section class="card space-y-4">${head('Strategy comparison','A side-by-side breakdown of loan duration, payments and net interest saved.')}${comparisonTable}</section>`+cmb+yt;
}

/* keep the two Pre-Close switches in step with the Partly Payment and Yearly Optimizer settings */
function preLbl(){
  const t=$('pim-t');if(!t)return;
  const X=v('extra'),okX=isFinite(X)&&X>0,k=+rv('yf')||v('yn'),ch=v('ypc'),okK=Number.isInteger(k)&&k>=1&&k<=12;
  t.textContent=`Include Monthly Partly Payment (${inr(okX?X:0)} extra every month)`;
  const sm=okX?`Adds this extra amount to every EMI from month 1. Change it in ${GO('part','Partly Payment')}.`:`No extra amount is set yet. Enter one in ${GO('part','Partly Payment')}.`,
    sy=okK?`${k} payment${s_(k)} a year${isFinite(ch)?`, ${ch}% charge`:''}. Each payment uses the amount typed for it in ${GO('yr','Yearly Optimizer')}.`:`Uses the amounts typed for each payment in ${GO('yr','Yearly Optimizer')}.`;
  [['pim-s',sm],['piy-s',sy]].forEach(([id,h])=>{const e=$(id);if(e.dataset.h!==h){e.dataset.h=h;e.innerHTML=h}});
}
/* ---- Special tab: "Try your own timeline" (part-payments for d months, then pre-close in month m) ----
   SPW = what was typed / chosen (kept here because the view is redrawn on every change), SPC = the figures of the current Special view */

function spwOut(){
  const c=SPC;if(!c)return '';
  const s=SPW,d=s.d===''?0:Number(s.d),m0=s.m===''?null:Number(s.m);
  if(!(d>0)&&m0==null)return '';
  if(!Number.isInteger(d)||d<0||(m0!=null&&(!Number.isInteger(m0)||m0<1)))return msg('Enter whole numbers only: 1 or more.');
  if(!(d>0))return note('Enter how many months you will pay the part-payments.');
  const F=c.fams.find(x=>x.k===s.src)||c.fams[0],lo=Math.max(1,c.L),mm=m0==null?Math.max(d,lo):m0;
  if(mm<lo)return msg(`You can pre-close only after ${lo} EMI${s_(lo)} (set in Pre-Close). Use month ${lo} or later.`);
  const dd=Math.min(d,mm),{recs,p}=comboRun(F.X,F.Q,dd),rec=recs[mm-1],pure=c.pure.find(x=>x.m===mm);
  const stop=d>mm?note(`The part-payments stop in month ${mm} because you pre-close then.`):'';
  let net,ex,cm,ce,k2,k3;
  if(!rec||rec.b<=.5){            /* the part-payments clear the loan before the closing month */
    const z=recs[recs.length-1];net=p.net;cm=z.cm;ce=z.ce;ex=cm+ce;
    k2=kpi('check','Loan fully paid',`Month ${p.len}`,'before the closing month, so no closing payment is needed');
  }else{
    const r=comboClose(rec,c.f);net=r.net;cm=r.cm;ce=r.ce;ex=r.ex;
    k2=kpi('rupee','Pay to close',inr(r.lump),`${inr(r.b)} balance + ${inr(r.fee)} charge in month ${mm}`);
  }
  k3=kpi('layers','Extra paid before closing',inr(ex),[F.X>0?`${inr(cm)} monthly`:'',F.Q?`${inr(ce)} yearly`:''].filter(Boolean).join(' + ')||'none');
  const gap=c.best.net-net,
    cmp=Math.abs(gap)<.5?'This is the best strategy found above.':gap>0?`This saves ${inr(gap)} less than the best strategy above (${c.best.fam.pick}, ${c.best.d} month${s_(c.best.d)}, close in month ${c.best.m}).`:`This saves ${inr(-gap)} more than the best strategy above, because the part-payments clear the loan on their own.`,
    pr=pure?` Closing in month ${mm} without part-payments saves ${inr(pure.net)}, so the part-payments add ${sn(net-pure.net)}.`:'';
  return stop+g3(kpi('trend','Interest you save',sn(net),'after all charges'),k2,k3)+note(cmp+pr);
}
const spwBox=()=>{
  const s=SPW,F=SPC.fams,sel=F.some(x=>x.k===s.src)?s.src:F[0].k,
    nf=(id,l,k,val,ph)=>`<div><label class="lbl" for="${id}">${l}</label><input id="${id}" class="inp" data-k="${k}" type="number" inputmode="numeric" pattern="[0-9]*" min="1" step="1" value="${String(val).replace(/"/g,'&quot;')}" placeholder="${ph}"></div>`;
  return `<div class="space-y-3">`+head('Try your own timeline','Choose the part-payments, how many months you pay them, and when you pre-close. Leave the closing month empty to close right after the last part-payment, or when closing is first allowed.')+
    `<div class="card grid grid-cols-2 gap-3" data-spw role="group" aria-label="Your own timeline"><div class="col-span-2"><span class="lbl">Part-payments</span><div class="seg" role="radiogroup" aria-label="Part-payments">${F.map(x=>`<label><input type="radio" name="sw-src" data-k="src" value="${x.k}"${x.k===sel?' checked':''}><span>${x.pick}</span></label>`).join('')}</div></div>`+
    nf('sw-d','Pay for (months)','d',s.d,'e.g. 6')+nf('sw-m','Pre-close in month','m',s.m,'Auto')+`</div>`+
    `<div id="sw-o" class="space-y-3" aria-live="polite">${spwOut()}</div></div>`;
};
function spwEv(e){
  const el=e.target,box=el.closest&&el.closest('[data-spw]');if(!box||!el.dataset.k)return;
  if(el.type==='radio'&&!el.checked)return;
  SPW[el.dataset.k]=el.value;const o=$('sw-o');if(o)o.innerHTML=spwOut();
}
document.addEventListener('input',spwEv);document.addEventListener('change',spwEv);
/* typing in Day / Month / Year updates only the two result cards (the boxes are not redrawn, so the cursor stays put) */
document.addEventListener('input',e=>{
  const el=e.target,box=el.closest&&el.closest('[data-dur]');if(!box||!el.dataset.k)return;
  const vw=box.dataset.dur,s=DUR[vw]||(DUR[vw]={d:'',m:'',y:''}),o=$('du-'+vw+'-o');
  s[el.dataset.k]=el.value;if(o)o.innerHTML=durOut(vw);
});
/* whole numbers only, like the Date Calculator boxes */
document.addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('[data-dur],[data-spw]')&&['e','E','+','-','.',','].includes(e.key))e.preventDefault();
});
