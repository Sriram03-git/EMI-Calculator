function solve(P,E,n){if(E*n<=P)return NaN;let lo=1e-9,hi=1;for(let i=0;i<200;i++){const m=(lo+hi)/2;E*(1-Math.pow(1+m,-n))/m>P?lo=m:hi=m}return(lo+hi)/2}
function sched(P,r,pay,n){const R=[];let b=P;for(let m=1;b>.005&&m<=1200;m++){const i=b*r;let p=pay-i,paid=pay;if(p>=b-.005||(n&&m===n)){p=b;paid=b+i}const c=Math.max(0,b-p);R.push({m,paid,i,p,c,sp:P-c});b=c}return R}
const sum=(a,k)=>a.reduce((s,x)=>s+x[k],0);
