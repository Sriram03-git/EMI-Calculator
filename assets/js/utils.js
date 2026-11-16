const $=id=>document.getElementById(id);
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const inr2=n=>'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const sn=n=>(n<0?'−':'')+inr(Math.abs(n));
const P_={cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18m-12 6 2 2 4-4"/>',
layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
check:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
alert:'<path d="m10.3 3.9-8.5 14.7A2 2 0 0 0 3.5 21.5h17a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
rupee:'<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3c6.7 0 6.7-10 0-10"/>',
trend:'<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
pct:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
spark:'<path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4z"/>',
repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
date:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 15h3"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'};
const ic=(n,c='w-5 h-5')=>`<svg class="${c} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P_[n]}</svg>`;
const DOT='<svg class="w-2 h-2" viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>';
const gIN=d=>d.length>3?d.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+d.slice(-3):d;
const fc_=s=>{s=String(s).replace(/[^\d.]/g,'');const d=s.indexOf('.');if(d>=0)s=s.slice(0,d+1)+s.slice(d+1).replace(/\./g,'').slice(0,2);return gIN((d>=0?s.slice(0,d):s).replace(/^0+(?=\d)/,''))+(d>=0?s.slice(d):'')};
const cfld=(id,l,d)=>`<div><label class="lbl" for="${id}">${l}</label><div class="cw"><span class="rs" aria-hidden="true">₹</span><input id="${id}" class="inp" type="text" inputmode="decimal" autocomplete="off" data-cur value="${fc_(d)}" placeholder="Enter amount"></div></div>`;
const fld=(id,l,d)=>`<div><label class="lbl" for="${id}">${l}</label><input id="${id}" class="inp" type="number" inputmode="decimal" min="0" step="any" value="${d}" placeholder="Enter value"></div>`;



const v=id=>{const s=$(id).value.replace(/,/g,'').trim();return s===''?0:Number(s)};
const dur=m=>[Math.floor(m/12)?Math.floor(m/12)+(m>=24?' years':' year'):'',m%12?m%12+(m%12>1?' months':' month'):''].filter(Boolean).join(' ')||'0 months';
function rng(a){const o=[];let s=a[0],p=a[0];for(let i=1;i<=a.length;i++){const c=a[i];if(c!==p+1){o.push(s===p?''+s:s+'–'+p);s=c}p=c}return 'Month '+o.join(', ')}
