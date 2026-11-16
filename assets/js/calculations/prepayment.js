function preRows(S,stdPaid,f,L){const o=[];let cum=0,ci=0;S.forEach(x=>{cum+=x.paid;ci+=x.i;if(x.m>=Math.max(1,L)&&x.c>.5){const fee=x.c*f/100,lump=x.c+fee,rem=stdPaid-cum;o.push({m:x.m,b:x.c,sp:x.sp,fee,lump,gross:rem-x.c,net:rem-lump,cum,ci})}});return o}
function comboRun(X,Q,dMax){
  const fq=Q?Q.fq:1,ch=Q?Q.ch:0,xs=Q?Q.xs:Array.from({length:yrN()},()=>[0]),p=yrSim(xs,fq,ch,X,dMax),o=[];
  let cp=0,cm=0,ce=0,cf=0,ci=0;
  p.A.forEach(x=>{cp+=x.pay;cm+=x.mx;ce+=x.ex;cf+=x.fee;ci+=x.i;o.push({m:x.m,b:x.c,sp:x.sp,cp,cm,ce,cf,ci})});
  return{recs:o,p};
}
/* what closing in the month of record x costs: balance + closing charge, and the net saving against the standard loan */
function comboClose(x,f){
  const fee=x.b*f/100,gross=ST.int-x.ci;
  return{m:x.m,b:x.b,sp:x.sp,fee,lump:x.b+fee,gross,net:gross-x.cf-fee,cum:x.cp+x.cm+x.ce+x.cf,ci:x.ci,cm:x.cm,ce:x.ce,cf:x.cf,ex:x.cm+x.ce};
}
/* pre-close rows when the monthly extra (X) and / or the yearly part-payments (Q) are paid from month 1 up to the closing month
   (or only up to month dMax when given) */
function preRowsL(f,L,X,Q,dMax=Infinity){
  const {recs,p}=comboRun(X,Q,dMax),o=[];
  recs.forEach(x=>{if(x.m>=Math.max(1,L)&&x.b>.5)o.push(comboClose(x,f))});
  return{rows:o,p};
}
/* Combined search: for every kind of part-payment that is available (monthly, yearly, both) try every duration d (extras in months 1..d)
   and every closing month m >= d. byD keeps the best closing month for each d; best is the best of all. */
function comboSearch(f,L,X,Q){
  const fams=[];
  if(X>0)fams.push({k:'m',X,Q:null,nm:'Monthly part-payment, then pre-close',pick:'Monthly extra'});
  if(Q)fams.push({k:'y',X:0,Q,nm:'Yearly part-payment, then pre-close',pick:'Yearly plan'});
  if(X>0&&Q)fams.push({k:'my',X,Q,nm:'Monthly + yearly part-payment, then pre-close',pick:'Monthly + yearly'});
  fams.forEach(F=>{
    F.byD=[];F.best=null;
    for(let d=1;d<=ST.n;d++){
      const {rows,p}=preRowsL(f,L,F.X,F.Q,d);let bd=null;
      rows.forEach(x=>{if(x.m>=d&&(!bd||x.net>bd.net+1e-9))bd=x});
      if(bd){bd.d=d;bd.fam=F;F.byD.push(bd);if(!F.best||bd.net>F.best.net+1e-9)F.best=bd}
      if(d>=p.len)break;      /* a longer duration pays exactly the same payments */
    }
  });
  return fams.filter(F=>F.best);
}
