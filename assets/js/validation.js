const dim=()=>document.querySelectorAll('.res').forEach(e=>e.classList.add('opacity-40','pointer-events-none')),undim=()=>document.querySelectorAll('.res').forEach(e=>e.classList.remove('opacity-40','pointer-events-none'));
function bad(m){$('err').textContent=m+(ST?' Showing your last valid result.':'');ST&&dim()}
function run(){
  $('err').textContent='';
  if(['base','prin','emi','ten'].some(id=>$(id).value.trim()===''))return ST=null,undim(),render(),false;
  const P=v('prin'),E=v('emi'),n=Math.round(v('ten'));
  if([v('base'),P,E,v('ten')].some(x=>!isFinite(x)||x<0)||!(P>0)||!(E>0)||!(n>0))return bad('Please enter valid positive numbers.');
  if(E*n<=P)return bad('EMI × tenure must be greater than the loan amount in the agreement.');
  const r=solve(P,E,n),S=sched(P,r,E,n);
  ST={base:v('base'),P,E,n,r,S,paid:sum(S,'paid'),int:sum(S,'i')};
  undim();render();return true;
}
$('f').addEventListener('submit',e=>{e.preventDefault();if(run())$('o-normal').scrollIntoView()});
$('main').addEventListener('input',()=>run());
