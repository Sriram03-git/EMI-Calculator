const td=(a,s)=>a.map((x,i)=>`<td${i===s?' class="set"':''}>${x}</td>`).join('');
const tbl=(h,body,foot='',s=-1)=>`<div class="tw"><table><thead><tr>${h.map((x,i)=>`<th${i===s?' class="set"':''}>${x}</th>`).join('')}</tr></thead><tbody>${body}</tbody>${foot}</table></div>`;
const stable=(A,pl)=>tbl(['Month',pl,'Interest','Principal','Balance left','Settled amount'],
  A.map(x=>`<tr>`+td([x.m,inr(x.paid),inr(x.i),inr(x.p),inr(x.c),inr(x.sp)],5)+`</tr>`).join(''),
  `<tfoot><tr>${td(['Total',inr(sum(A,'paid')),inr(sum(A,'i')),inr(sum(A,'p')),'',''])}</tr></tfoot>`,5);
const SET='“Settled amount” is the part of the loan you have repaid so far.';
