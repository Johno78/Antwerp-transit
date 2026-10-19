const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const IR='https://api.irail.be';
const DL='https://api.delijn.be/DLKernOpenData/api/v1';
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hm=t=>new Date(t*1000).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});

setInterval(()=>{$('#clock').textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})},1000);
$$('.tb').forEach(b=>b.onclick=()=>{$$('.tb').forEach(x=>x.classList.toggle('active',x===b));$$('.tab').forEach(t=>t.classList.toggle('active',t.id==='tab-'+b.dataset.t));window.scrollTo(0,0)});
function go(t){$(`.tb[data-t=${t}]`).click()}

// stations
let ST=[];
async function loadStations(){
  try{const c=store.get('st');if(c)ST=JSON.parse(c);else{
    const r=await fetch(`${IR}/stations/?format=json&lang=en`);const j=await r.json();ST=j.station.map(s=>s.standardname);store.set('st',JSON.stringify(ST))}
  }catch(e){ST=['Antwerpen-Centraal','Antwerpen-Berchem','Antwerpen-Luchtbal','Brussels-Central','Brussels-South','Brussels-Airport-Zaventem','Mechelen','Gent-Sint-Pieters','Leuven','Brugge','Liège-Guillemins']}
  $('#stations').innerHTML=ST.map(s=>`<option value="${esc(s)}">`).join('');
}
const isStation=n=>ST.find(s=>s.toLowerCase()===n.trim().toLowerCase());

// Plan
const now=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);$('#when').value=now;
$('#swap').onclick=()=>{const a=$('#from').value;$('#from').value=$('#to').value;$('#to').value=a};
$('#gps').onclick=()=>navigator.geolocation?.getCurrentPosition(p=>{$('#from').value=p.coords.latitude.toFixed(5)+','+p.coords.longitude.toFixed(5)},()=>alert('Location not available'));
$('#go-gm').onclick=()=>{
  const f=$('#from').value||'Antwerpen-Centraal',t=$('#to').value;if(!t)return $('#to').focus();
  const q=x=>/^-?\d+\.\d+,-?\d+\.\d+$/.test(x)?x:(x+(isStation(x)?' station':'')+', Antwerp, Belgium');
  window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(q(f))}&destination=${encodeURIComponent(q(t))}&travelmode=transit`,'_blank');
};
$('#go-rail').onclick=async()=>{
  const f=isStation($('#from').value||'Antwerpen-Centraal'),t=isStation($('#to').value);
  const out=$('#plan-out');
  if(!f||!t){out.innerHTML='<div class="card err">Pick two Belgian rail stations from the suggestions (e.g. Antwerpen-Centraal → Brussels-Central). For addresses use Google Maps.</div>';return}
  out.innerHTML='<div class="card muted">Loading…</div>';
  const d=new Date($('#when').value||Date.now());
  const date=String(d.getDate()).padStart(2,'0')+String(d.getMonth()+1).padStart(2,'0')+String(d.getFullYear()).slice(2);
  const time=String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0');
  try{
    const j=await (await fetch(`${IR}/connections/?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}&date=${date}&time=${time}&format=json&lang=en&results=6`)).json();
    out.innerHTML='<h2>'+esc(f)+' → '+esc(t)+'</h2><div class="card">'+j.connection.map(c=>{
      const dl=+c.departure.delay/60,vias=c.vias?+c.vias.number:0,dur=Math.round(c.duration/60);
      return `<div class="dep"><div class="t">${hm(c.departure.time)}</div><div class="d"><b>→ ${hm(c.arrival.time)} · ${dur} min</b><span>${vias?vias+' change'+(vias>1?'s':''):'Direct'} · ${esc(c.departure.vehicleinfo?.shortname||'')}</span></div><div>${dl?`<div class="late">+${dl}m</div>`:'<div class="ok">on time</div>'}<span class="pf">${esc(c.departure.platform)}</span></div></div>`}).join('')+'</div>';
  }catch(e){out.innerHTML='<div class="card err">Couldn\'t reach the Belgian rail data. Try again.</div>'}
};

// Trains
const QUICK=['Antwerpen-Centraal','Antwerpen-Berchem','Mechelen','Brussels-Central','Brussels-Airport-Zaventem'];
$('#quick').innerHTML=QUICK.map(s=>`<button class="chip">${s}</button>`).join('');
$$('#quick .chip').forEach(b=>b.onclick=()=>{$('#lb-station').value=b.textContent;board()});
$('#lb-station').value=CONFIG.defaultStation;
async function board(){
  const s=isStation($('#lb-station').value)||$('#lb-station').value;const o=$('#lb-out');o.innerHTML='<div class="card muted">Loading…</div>';
  try{const j=await (await fetch(`${IR}/liveboard/?station=${encodeURIComponent(s)}&format=json&lang=en`)).json();
    o.innerHTML='<div class="card">'+(j.departures.departure.slice(0,15).map(d=>{const dl=+d.delay/60;return `<div class="dep"><div class="t">${hm(d.time)}</div><div class="d"><b>${esc(d.station)}</b><span>${esc(d.vehicleinfo.shortname)}${d.canceled=='1'?' · CANCELLED':''}</span></div><div>${dl?`<div class="late">+${dl}m</div>`:''}<span class="pf">${esc(d.platform)}</span></div></div>`}).join('')||'<span class="muted">No departures.</span>')+'</div>';
  }catch(e){o.innerHTML='<div class="card err">Station not found or service unavailable.</div>'}
}
$('#lb-go').onclick=board;
async function disruptions(){
  try{const j=await (await fetch(`${IR}/disturbances/?format=json&lang=en`)).json();const l=j.disturbance||[];
    $('#dist-out').innerHTML=l.length?l.slice(0,6).map(x=>`<div class="card"><b>${esc(x.title)}</b><p class="muted sm">${esc((x.description||'').slice(0,220))}</p></div>`).join(''):'<div class="card ok">No reported disruptions 🎉</div>';
  }catch(e){$('#dist-out').textContent='Disruption info unavailable.'}
}

// De Lijn
let KEY=CONFIG.delijnKey||store.get('dlkey')||'';
if(KEY)$('#key-box').style.display='none';
$('#dl-save').onclick=()=>{KEY=$('#dl-key').value.trim();store.set('dlkey',KEY);if(KEY)$('#key-box').style.display='none'};
const dlf=async p=>{
  try{const r=await fetch('/api/delijn'+p);if(r.ok)return r.json()}catch(e){}
  if(!KEY){$('#key-box').style.display='block';throw new Error('no key')}
  const r=await fetch(DL+p,{headers:{'Ocp-Apim-Subscription-Key':KEY}});if(!r.ok)throw new Error(r.status);return r.json()};
$('#dl-go').onclick=async()=>{
  const o=$('#dl-out');
  o.innerHTML='<div class="card muted">Searching…</div>';
  try{const j=await dlf('/zoeken/haltes/'+encodeURIComponent($('#dl-q').value)+'?maxAantalHits=8');
    const h=j.haltes||[];o.innerHTML=h.length?h.map(x=>`<div class="card"><b>${esc(x.omschrijving)}</b><div class="muted sm">${esc(x.gemeente||'')} · stop ${x.haltenummer}</div><button class="chip" data-e="${x.entiteitnummer}" data-h="${x.haltenummer}" data-n="${esc(x.omschrijving)}">Live departures</button><div id="r${x.haltenummer}"></div></div>`).join(''):'<div class="card muted">No stops found.</div>';
    $$('#dl-out .chip').forEach(b=>b.onclick=()=>rt(b));
  }catch(e){o.innerHTML='<div class="card err">De Lijn error ('+esc(e.message)+'). Check your key.</div>'}
};
async function rt(b){
  const box=$('#r'+b.dataset.h);box.innerHTML='<p class="muted">Loading…</p>';
  try{const j=await dlf(`/haltes/${b.dataset.e}/${b.dataset.h}/real-time?maxAantalDoorkomsten=10`);
    const d=(j.halteDoorkomsten||[]).flatMap(x=>x.doorkomsten||[]).sort((a,b)=>(a.realTimeTijdstip||a.dienstregelingTijdstip).localeCompare(b.realTimeTijdstip||b.dienstregelingTijdstip));
    box.innerHTML=d.length?d.slice(0,10).map(x=>{const t=(x.realTimeTijdstip||x.dienstregelingTijdstip).slice(11,16);return `<div class="dep"><span class="line">${esc(x.lijnnummer)}</span><div class="d"><b>${esc(x.richting||'')}</b><span>${x.realTimeTijdstip?'live':'scheduled'}</span></div><div class="t">${t}</div></div>`}).join(''):'<p class="muted">Nothing due.</p>';
  }catch(e){box.innerHTML='<p class="err">Couldn\'t load departures.</p>'}
}

// Explore
let cat='all';const CATS=[['all','All'],['free','Free'],['family','Family'],['sights','Sights'],['museums','Museums'],['food','Food']];
function renderEx(){
  $('#cats').innerHTML=CATS.map(([k,l])=>`<button class="chip ${k===cat?'on':''}" data-k="${k}">${l}</button>`).join('');
  $$('#cats .chip').forEach(b=>b.onclick=()=>{cat=b.dataset.k;renderEx()});
  $('#ex-out').innerHTML=EXPLORE.filter(x=>cat==='all'||x.c.includes(cat)).map((x,i)=>{
    const q=encodeURIComponent(x.n+' Antwerp');
    return `<div class="card ex"><span class="em">${x.e}</span><h3>${esc(x.n)}</h3><p>${esc(x.d)}</p><div class="tip">💡 ${esc(x.tip)}</div><div class="muted sm">🚋 ${esc(x.near)}</div>
    <a class="lnk" target="_blank" rel="noopener" href="https://www.tripadvisor.com/Search?q=${q}">Tripadvisor</a>
    <a class="lnk" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=transit">Get there</a></div>`}).join('');
}
renderEx();loadStations();board();disruptions();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
