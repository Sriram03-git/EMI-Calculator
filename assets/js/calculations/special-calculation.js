/* ---- view 5: special (renders only when opened) ---- */
function vSpec(){
  const {P,E,n,r,S,paid:stdPaid,int:stdInt}=ST,f=v('fc'),L=Math.round(v('lock'));let X=v('extra'),auto=false;
  if([f,L,X].some(x=>!isFinite(x)||x<0))return msg('Please enter valid numbers in the Pre-Close and Partly Payment views first.');
  if(!(X>0)){X=Math.max(100,Math.round(E/200)*100);auto=true}
  const rows=preRows(S,stdPaid,f,L),mx=rows.length?Math.max(...rows.map(x=>x.net)):0,best=mx>0?rows.find(x=>x.net===mx):null;
  const A=sched(P,r,E+X,0),nt=A.length,ia=sum(A,'i'),ppPaid=sum(A,'paid'),pp=stdInt-ia,pc=best?best.net:0,win=!!best&&pc>pp,diff=Math.abs(pc-pp);
  const D='—',B=!!best,no=rows.length?'No saving after the charge':'Not allowed before the loan ends';
  const bd=` <span class="bdg g">${ic('check','w-3 h-3')}Best</span>`;
  /* yearly plan (year-wise amounts from Yearly Optimizer) and the overall best plan */
  const yOn=on('yr'),Y=yOn?yrPlan():null,YY=Y&&!Y.err&&!Y.none?Y:null,yMsg=Y&&(Y.err||Y.none),
    top=[['part',pp],['pre',B?pc:-Infinity],['yr',YY?YY.net:-Infinity]].sort((a,b)=>b[1]-a[1])[0][0];
  /* combined strategies: part-payments for d months, then pre-close in month m (every d and every m is tried) */
  const Qin=YY?yrInputs():null,CS=comboSearch(f,L,X,Qin),CB=CS.length?CS.reduce((a,c)=>c.best.net>a.best.net+1e-9?c:a).best:null,
    topAll=[['pre',B?pc:-Infinity],['part',pp],['yr',YY?YY.net:-Infinity],['combo',CB?CB.net:-Infinity]].sort((a,b)=>b[1]-a[1])[0][0];
  SPC=null;
  /* smart suggestions: what monthly / yearly part-payments give the same saving as the best other plan? */
  const tgtPre=B&&pc>pp,tgt=tgtPre?pc:pp,tgtNm=tgtPre?'pre-close':'monthly part-payment';
  let be=0,bn=0,ye=null;
  if(top==='pre'){
    let lo=X,hi=Math.max(P*(1+r)-E,X+1);
    for(let i=0;i<60;i++){const k=(lo+hi)/2;stdInt-sum(sched(P,r,E+k,0),'i')>=pc?hi=k:lo=k}
    be=Math.ceil(hi);bn=sched(P,r,E+be,0).length;
  }
  if(yOn&&top!=='yr')ye=yrEq(tgt);
  const yLine=(q,nm)=>{
    const h=`<b>Yearly (${q.fq} time${s_(q.fq)} a year):</b> `;
    if(q.none)return h+`no equal yearly amount reaches the ${nm} saving with a ${q.ch}% charge, because the charge cancels too much of the interest saved.`;
    const pl=q.plan,ex=pl.A.filter(a=>a.ex>0),ms=ex.map(a=>a.m),last=ex[ex.length-1],shown=ms.length>8?ms.slice(0,8).join(', ')+' …':lst(ms);
    return h+`pay about ${inr(q.k)} each time, in ${yrMo(q.fq)}`+(q.fq===12||!ms.some(m=>m>12)?'':`, which means loan month${s_(ms.length)} ${shown}`)+
      `. That is ${inr(pl.exs)} extra in all${last&&last.ex<q.k-.5?` (the last payment is only ${inr(last.ex)}, the balance left)`:''}. The loan ends in ${pl.len} months and you save ${inr(pl.net)}`+(q.ch>0?` after ${inr(pl.fees)} of charges (${q.ch}%)`:'')+`, which matches the ${nm} saving.`;
  };
  const yFoot=ye?` The yearly figure uses the ${ye.fq} payment${s_(ye.fq)} a year and ${ye.ch}% charge from Yearly Optimizer, with the same amount in every payment.`:'';
  const g=win?adv('g','check','Better choice: pre-close',`Close in month ${best.m}`,
      `Pay ${inr(best.lump)} (balance ${inr(best.b)} + ${f}% charge ${inr(best.fee)}) after ${best.m} EMIs. You save ${inr(pc)}, which is ${inr(diff)} more than the ${inr(pp)} saved by paying ${inr(X)} extra every month.`,
      `It also ends the loan ${n-best.m} months early, against ${n-nt} months with part-payment.`)
    :adv('g','check','Better choice: part-payment',`Pay ${inr(X)} extra every month`,
      `The loan ends in ${nt} months (${n-nt} sooner) and you save ${inr(pp)}`+(B?`, which is ${inr(diff)} more than the best pre-close option (month ${best.m}: ${inr(pc)} saved after the charge).`:`. Pre-closing is not worthwhile here: ${rows.length?`the ${f}% charge is more than the interest it avoids.`:'the loan ends before closing is allowed.'}`),
      'No part-payment charge is assumed.');
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
  }else{
    k=adv('a','info','Keep in mind',`${inr(E+X)} every month`,
      `You pay ${inr(X)} more than your EMI for about ${nt} months.`+(B?` Pre-closing would need ${inr(best.lump)} at once.`:'')+(ye?' To get the same saving with fewer payments:':''),
      (auto?`You have not entered an extra amount, so ${inr(X)} (about half your EMI) is used here.`:'Change the extra amount in the Partly Payment view to try another figure.')+yFoot,
      ye?ul([yLine(ye,'monthly part-payment')]):'');
  }
  const R=[
    ['Plan','Pay EMI only',B?`Pay ${best.m} EMIs, then close`:no,`EMI + ${inr(X)} extra`],
    ['Loan ends in',`${n} months`,B?`${best.m} months`:D,`${nt} months`],
    ['Months saved',D,B?`${n-best.m} months`:D,`${n-nt} months`],
    ['Monthly payment',inr(E),B?`${inr(E)} until month ${best.m}`:D,inr(E+X)],
    ['One-time payment',D,B?inr(best.lump):D,'None'],
    ['Closing charge',D,B?`${inr(best.fee)} (${f}%)`:D,'₹0'],
    ['Interest + charges',inr(stdInt),B?inr(best.ci+best.fee):D,inr(ia)],
    ['Total you pay',inr(stdPaid),B?inr(best.cum+best.lump):D,inr(ppPaid)]];
  const hd=['Compare','Pay EMI only','Pre-close'+(topAll==='pre'?bd:''),'Part-payment'+(topAll==='part'?bd:'')],last=['Interest you save',D,B?inr(pc):D,inr(pp)];
  let yt='',kp=kpi('trend','Difference',inr(diff),(win?'Pre-closing':'Part-payment')+' saves more'),gg=g;
  if(YY){
    const y=YY,nm={pre:'pre-close',part:'monthly part-payment',yr:'yearly part-payment'},bv=Math.max(pp,B?pc:-Infinity,y.net),
      hl=top==='pre'?`Close in month ${best.m}`:top==='part'?`Pay ${inr(X)} extra every month`:yrHead(y);
    hd.push('Yearly plan'+(topAll==='yr'?bd:''));last.push(inr(y.net));
    R[0].push(yrLab(y));R[1].push(`${y.len} months`);R[2].push(`${n-y.len} months`);R[3].push(inr(E));R[4].push(`${y.cnt} part-payment${s_(y.cnt)}`);R[5].push(`${inr(y.fees)} (${y.ch}%)`);R[6].push(inr(y.ia+y.fees));R[7].push(inr(sum(y.A,'pay')+y.exs+y.fees));
    gg=adv('g','check','Best of the three: '+nm[top],hl,`Saves ${inr(bv)} after all charges. Pre-close: ${B?inr(pc):'not worthwhile'}. Monthly part-payment: ${inr(pp)}. Yearly plan: ${inr(y.net)}.`,`The yearly plan ends the loan in ${y.len} months (${n-y.len} sooner), with ${inr(y.fees)} of charges included.`);
    kp=kpi('repeat','Yearly plan',inr(y.net),`saved; loan ends in ${y.len} months`);
    yt=head('Yearly plan: year-wise summary',`${yrWhat(y)}, in ${yrMo(y.fq)}. Each payment uses its own amount. Years with extra payments are highlighted.`)+yrYearTbl(y)+
      head('Yearly plan: month-by-month schedule',`Months with an extra part-payment are highlighted. ${SET}`)+yrTable(y);
  }
  /* ---- combined strategy: table column, cards, ranking, breakdown, timeline and "your own timeline" ---- */
  let cmb='',cmbK='';
  if(CB){
    const F=CB.fam,fk=F.k,what=fk==='m'?`${inr(X)} extra every month`:fk==='y'?'the yearly part-payments':`${inr(X)} extra every month plus the yearly part-payments`,
      dtx=`${CB.d} month${s_(CB.d)}`,plan=`Pay ${what} for ${dtx}, then close in month ${CB.m}`,regEmi=CB.cum-CB.cm-CB.ce-CB.cf;
    /* column in the main comparison table */
    hd.push('Combined'+(topAll==='combo'?bd:''));last.push(inr(CB.net));
    R[0].push(`${F.pick}, then close`);R[1].push(`${CB.m} months`);R[2].push(`${n-CB.m} months`);
    R[3].push(fk==='y'?inr(E):`${inr(E+X)} for ${dtx}`+(CB.m>CB.d?`, then ${inr(E)}`:''));
    R[4].push(inr(CB.lump)+(CB.ce>0?` + ${inr(CB.ce)} yearly`:''));
    R[5].push(`${inr(CB.fee)} (${f}%)`+(CB.cf>0?` + ${inr(CB.cf)} (${F.Q.ch}%)`:''));
    R[6].push(inr(CB.ci+CB.cf+CB.fee));R[7].push(inr(CB.cum+CB.lump));
    cmbK=g3(kpi('spark','Best combined strategy',inr(CB.net),'saved after all charges'),
      kpi('clock','Part-payments for',dtx,`then close in month ${CB.m}`),
      kpi('rupee','Pay to close',inr(CB.lump),`after ${inr(CB.ex)} of part-payments`));
    /* recommendation cards when the combined strategy is the overall winner */
    if(topAll==='combo'){
      const oth=[`pre-close only ${B?inr(pc):'not worthwhile'}`,`monthly part-payment ${inr(pp)}`].concat(YY?[`yearly plan ${inr(YY.net)}`]:[]);
      gg=adv('g','check','Best strategy: part-payments, then pre-close',plan,
        `Saves ${inr(CB.net)} after all charges (${inr(CB.fee)} closing charge${CB.cf>0?` and ${inr(CB.cf)} yearly part-payment charges`:''}). The others save less: ${lst(oth)}.`,
        `The loan ends in month ${CB.m}, ${n-CB.m} months early. You pay ${inr(CB.lump)} at once on top of ${inr(CB.ex)} of part-payments.`);
      k=adv('a','info','Keep in mind',`${inr(CB.lump)} at once in month ${CB.m}`,
        `Before that you pay ${inr(CB.ex)} extra over ${dtx}. If you cannot arrange the closing amount, part-payment alone still saves:`,
        `Pre-close includes a ${f}% charge on the balance left.`+(auto?` You have not entered an extra amount, so ${inr(X)} (about half your EMI) is used here.`:''),
        ul([`<b>Monthly:</b> ${inr(X)} extra every month saves ${inr(pp)} and ends the loan in ${nt} months.`].concat(YY?[`<b>Yearly plan:</b> saves ${inr(YY.net)} and ends the loan in ${YY.len} months.`]:[])));
    }
    /* ranking of every strategy by net saving */
    const rk=[];
    if(B)rk.push({nm:'Pre-close only',pp:'None',cl:`Month ${best.m}`,ex:0,lump:best.lump,net:pc});
    rk.push({nm:'Monthly part-payment only',pp:`${nt} months (until the loan ends)`,cl:'No pre-close',ex:A.reduce((a,x)=>a+Math.max(0,x.paid-E),0),lump:null,net:pp});
    if(YY)rk.push({nm:'Yearly part-payment only',pp:`${YY.len} months (until the loan ends)`,cl:'No pre-close',ex:YY.exs,lump:null,net:YY.net});
    CS.forEach(q=>rk.push({nm:q.nm,pp:`${q.best.d} month${s_(q.best.d)}`,cl:`Month ${q.best.m}`,ex:q.best.ex,lump:q.best.lump,net:q.best.net}));
    rk.sort((a,b)=>b.net-a.net);
    const rankT=head('All strategies, ranked by interest saved',`Every part-payment duration and closing month was tried. For each kind of combined strategy, the best one is shown. The top row saves the most after all charges.`)+
      tbl(['Strategy','Part-payments for','Pre-close in','Extra paid','Pay to close','You save'],
        rk.map((x,i)=>`<tr class="${i===0?'best':''}">`+td([x.nm+(i===0?bd:''),x.pp,x.cl,x.ex>0?inr(x.ex):'—',x.lump!=null?inr(x.lump):'—',inr(x.net)],5)+'</tr>').join(''),'',5);
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
      tbl(['Part-payments for','Best month to close','Extra paid','Pay to close','You save','Verdict'],
        tl.map(x=>`<tr class="${x===CB?'best':''}">`+td([x.d?`${x.d} month${s_(x.d)}`:'None (pre-close only)',`Month ${x.m}`,x.ex>0?inr(x.ex):'—',inr(x.lump),sn(x.net),`<span class="bdg ${x.z}">${DOT}${lab[x.z]}</span>`],4)+'</tr>').join(''),'',4);
    SPC={f,L,X,fams:CS,best:CB,pure:rows};
    cmb=head('Combined strategy: part-payments, then pre-close','Link your part-payments to closing: pay extra for some months, then close the loan. Every duration and closing month was compared.')+rankT+breakT+timeT+spwBox();
  }else{
    cmb=note('Combined strategies (part-payments, then pre-close) are not available here: '+(rows.length?'no combination saves more than it costs.':'the loan ends before closing is allowed.'));
  }
  return note(`Based on a ${f}% closing charge after ${Math.max(1,L)} EMIs (set in Pre-Close) and ${inr(X)} extra every month (set in Partly Payment)`+(YY?', plus the year-wise yearly plan (set in Yearly Optimizer)':'')+`. Change them there to update this page. The combined section tries every part-payment duration and closing month.`)+
    (YY?'':yMsg?note('Yearly plan left out: '+yMsg):`<div class="flex flex-wrap gap-3">${GO('yr','Add a yearly plan')}</div>`)+
    g3(kpi('cal',B?`Pre-close (month ${best.m})`:'Pre-close',inr(pc),B?`saved after a ${inr(best.fee)} charge`:no),
      kpi('layers','Part-payment',inr(pp),`saved; loan ends in ${nt} months`),kp)+cmbK+
    `<div class="grid md:grid-cols-2 gap-3">${gg}${k}</div>`+
    tbl(hd,R.map(x=>`<tr>${td(x)}</tr>`).join('')+`<tr class="best">${td(last)}</tr>`)+cmb+yt;
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
