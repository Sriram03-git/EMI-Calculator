$('dy').addEventListener('keydown',e=>{if(['e','E','+','-','.',','].includes(e.key))e.preventDefault()});
function dcRun(){
  const m=$('dm').value.trim(),a=$('da').value.trim(),y=$('dy').value.trim(),yr=new Date().getFullYear();
  $('dm-out').innerHTML=m===''?'':!/^\d+$/.test(m)?msg('Enter a whole number of months, like 36 or 39.'):
    `<div class="text-2xl font-extrabold" style="color:var(--acc);text-transform:capitalize">${dur(+m)}</div><p class="text-sm" style="color:var(--muted)">${(+m).toLocaleString('en-IN')} months in total (${+(m/12).toFixed(2)} years)</p>`;
  $('dy-out').innerHTML=y===''?'':!/^\d+$/.test(y)||+y>1000?msg('Enter a whole number of years, from 0 to 1000, like 3 or 5.'):
    `<div class="text-2xl font-extrabold" style="color:var(--acc)">${(+y*12).toLocaleString('en-IN')} ${+y*12===1?'month':'months'}</div><p class="text-sm" style="color:var(--muted)">${(+y).toLocaleString('en-IN')} ${+y===1?'year':'years'} × 12 = ${(+y*12).toLocaleString('en-IN')} months</p>`;
  $('da-out').innerHTML=a===''?'':!/^\d+$/.test(a)||+a>120?msg('Enter an age between 0 and 120.'):
    `<div class="text-2xl font-extrabold" style="color:var(--acc)">Born in ${yr-a}</div><p class="text-sm" style="color:var(--muted)">Estimate based on ${yr}. If the birthday has not come yet this year, the birth year is ${yr-a-1}.</p>`;
}
