/* HPAT Gym app logic. All data lives in localStorage on the device. */
(function(){
"use strict";

// ---------- constants ----------
const TYPES={logic:"Deduction",data:"Data & tables",number:"Number problems",argument:"Arguments"};
const TYPE_DESC={logic:"If-then rules, orderings, must-be-true",data:"Tables, percentages, rates",number:"Word problems, sequences, probability",argument:"Assumptions, flaws, weaken and strengthen"};
const TAGS=[["misread","Misread it"],["maths","Maths slip"],["logic","Didn't get the logic"],["time","Took too long"]];
const TAG_FIX={misread:"Read the question line first and underline what it asks before looking at the options.",maths:"Write every step down, even the easy ones, and estimate first.",logic:"Use hints 1 and 2 before guessing, then read the worked solution and the Learn card for that type.",time:"At 2 minutes, pick your best guess, flag it and move on."};
const PACE=85;                // seconds per question in the real Section 1 (42 in 60 min)
const MOCKS={full:{n:42,mins:60,label:"Full mock"},half:{n:21,mins:30,label:"Half mock"}};
const KEY="hpat-gym";
const L="ABCDE";
const FIXED_LAST=/^(cannot be determined|it cannot be determined|they are all the same)/i;

// ---------- helpers ----------
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const today=()=>new Date().toLocaleDateString("en-CA");
const addDays=(d,n)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x.toLocaleDateString("en-CA")};
const daysBetween=(a,b)=>Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);
const fmt=s=>{s=Math.max(0,Math.round(s));const m=Math.floor(s/60);return m+":"+String(s%60).padStart(2,"0")};
const fmtLong=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+"h "+m+"m":m+"m"};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pct=(a,b)=>b?Math.round(a/b*100):0;
const dShort=d=>new Date(d+"T12:00:00").toLocaleDateString("en-IE",{day:"numeric",month:"short"});
const ICON={
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
  starOn:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  flagOn:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 11v9h14v-9"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
};

// ---------- state ----------
const blank=()=>({v:2,updatedAt:0,onboarded:false,profile:{name:"",exam:""},settings:{setSize:5},
  att:{},log:[],days:{},todaySet:null,stars:{},notes:{},mocks:[],activeMock:null});
let st=blank();
function load(){
  try{const raw=localStorage.getItem(KEY);if(raw){const r=JSON.parse(raw);st=Object.assign(blank(),r);st.profile=Object.assign(blank().profile,r.profile);st.settings=Object.assign(blank().settings,r.settings)}}
  catch(e){console.warn("Could not read saved data",e)}
}
let saveFailed=false;
function save(){
  st.updatedAt=Date.now();
  if(st.log.length>5000) st.log=st.log.slice(-5000);
  try{localStorage.setItem(KEY,JSON.stringify(st));saveFailed=false}
  catch(e){if(!saveFailed){saveFailed=true;toast("Couldn't save progress. Check your phone's storage.")}}
}
load();
if(navigator.storage&&navigator.storage.persist){navigator.storage.persist().catch(()=>{})}

const BANK=window.QBANK;
const byId=id=>BANK.find(q=>q.id===id);

// ---------- derived ----------
function typeStats(filter){
  const s={};for(const t in TYPES) s[t]={n:0,ok:0,secs:0};
  for(const e of st.log){if(filter&&!filter(e))continue;if(!s[e.t])continue;s[e.t].n++;s[e.t].ok+=e.c;s[e.t].secs+=e.s}
  return s;
}
function dueIds(){const d=today();return BANK.filter(q=>{const a=st.att[q.id];return a&&a.due&&a.due<=d}).map(q=>q.id)}
function missedIds(){return BANK.filter(q=>{const a=st.att[q.id];return a&&a.due}).map(q=>q.id)}
function starredIds(){return BANK.filter(q=>st.stars[q.id]).map(q=>q.id)}
function streak(){let d=today(),n=0;if(!st.days[d])d=addDays(d,-1);while(st.days[d]){n++;d=addDays(d,-1)}return n}
function best(){const ds=Object.keys(st.days).sort();let b=0,run=0,prev=null;for(const d of ds){run=prev&&daysBetween(prev,d)===1?run+1:1;b=Math.max(b,run);prev=d}return b}
function daysToExam(){return st.profile.exam?daysBetween(today(),st.profile.exam):null}

function makeOrder(q){
  const idx=q.o.map((_,i)=>i);
  const fixed=idx.filter(i=>FIXED_LAST.test(q.o[i]));
  return shuffle(idx.filter(i=>!fixed.includes(i))).concat(fixed);
}
const letterFor=(order,orig)=>L[order.indexOf(orig)];
const solText=(q,order)=>q.s.replace(/\{(\d)\}/g,(_,n)=>letterFor(order,+n));

// SRS: wrong -> back in 3 days; right while due -> again in 7 days; two rights while due -> cleared.
function record(q,correct,secs,hints,mock){
  const d=today();
  const a=st.att[q.id]||(st.att[q.id]={seen:0,right:0,wrong:0,due:null,rs:0,last:null});
  a.seen++;a.last=d;
  if(correct){a.right++;if(a.due){a.rs++;if(a.rs>=2){a.due=null;a.rs=0}else a.due=addDays(d,7)}}
  else{a.wrong++;a.due=addDays(d,3);a.rs=0}
  st.log.push({id:q.id,t:q.t,c:correct?1:0,s:secs,h:hints,g:null,d,m:mock?1:0});
  return st.log.length-1;
}

function buildSet(n,onlyType){
  const ts=typeStats();
  const acc=t=>ts[t].n?ts[t].ok/ts[t].n:0.5;
  const pool=BANK.filter(q=>!onlyType||q.t===onlyType);
  let picked=onlyType?[]:shuffle(dueIds()).slice(0,Math.max(1,Math.round(n*0.4)));
  const rest=pool.filter(q=>!picked.includes(q.id));
  const unseen=rest.filter(q=>!st.att[q.id]).sort((a,b)=>(acc(a.t)+Math.random()*0.35)-(acc(b.t)+Math.random()*0.35));
  const seen=rest.filter(q=>st.att[q.id]).sort((a,b)=>{const A=st.att[a.id],B=st.att[b.id];return (A.right/A.seen+Math.random()*0.3)-(B.right/B.seen+Math.random()*0.3)});
  const cap=Math.max(2,Math.ceil(n*0.3));
  const count={};for(const id of picked){const t=byId(id).t;count[t]=(count[t]||0)+1}
  for(const q of unseen.concat(seen)){if(picked.length>=n)break;if(!onlyType&&(count[q.t]||0)>=cap)continue;picked.push(q.id);count[q.t]=(count[q.t]||0)+1}
  for(const q of unseen.concat(seen)){if(picked.length>=n)break;if(!picked.includes(q.id))picked.push(q.id)}
  return picked;
}
function buildMock(n){
  const lists={};
  for(const t in TYPES){lists[t]=shuffle(BANK.filter(q=>q.t===t)).sort((a,b)=>((st.att[a.id]||{}).last||"").localeCompare((st.att[b.id]||{}).last||""))}
  const out=[];let k=0;const ts=Object.keys(TYPES);
  while(out.length<n&&ts.some(t=>lists[t].length)){const t=ts[k++%ts.length];if(lists[t].length)out.push(lists[t].shift().id)}
  return shuffle(out);
}
function ensureToday(){
  const d=today(),n=st.settings.setSize||5;
  if(!st.todaySet||st.todaySet.date!==d){st.todaySet={date:d,ids:buildSet(n),i:0,res:[],done:false};save()}
  return st.todaySet;
}

// ---------- UI state ----------
let ui={tab:"today",view:null,lesson:null,reviewSeg:"missed",confirmReset:false,sheet:null};
let session=null,timerI=null;

function toast(msg){const t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}

// ---------- practice sessions ----------
function startSession(kind,ids,resume){
  if(!ids.length){toast("Nothing to practise there yet.");return}
  session={kind,ids,i:resume?resume.i:0,res:resume?resume.res.slice():[]};
  if(session.i>=ids.length){session.i=0;session.res=[]}
  openQuestion();
}
function openQuestion(){
  const q=byId(session.ids[session.i]);
  if(!q){session.i++;if(session.i>=session.ids.length)return finish();return openQuestion()}
  session.cur={q,order:makeOrder(q),sel:null,hints:0,checked:false,revealed:false,correct:null,t0:Date.now(),secs:0,tag:null};
  render();window.scrollTo(0,0);
  clearInterval(timerI);
  timerI=setInterval(()=>{const c=session&&session.cur;if(!c||c.checked)return;const el=$("#timer");if(!el)return;const s=(Date.now()-c.t0)/1000;el.textContent=fmt(s);el.classList.toggle("over",s>PACE)},1000);
}
function check(reveal){
  const c=session.cur;if(c.checked)return;
  c.checked=true;c.revealed=!!reveal;c.secs=Math.round((Date.now()-c.t0)/1000);
  c.correct=!reveal&&c.sel===c.q.a;
  c.logIdx=record(c.q,c.correct,c.secs,c.hints,false);
  session.res.push(c.correct?1:0);
  if(session.kind==="daily"){st.todaySet.res=session.res.slice();st.todaySet.i=session.i+1}
  save();render();
}
function next(){
  session.i++;
  if(session.i>=session.ids.length)return finish();
  openQuestion();
}
function finish(){
  clearInterval(timerI);
  if(session.kind==="daily"&&!st.todaySet.done){st.todaySet.done=true;st.days[today()]=(st.days[today()]||0)+1;save()}
  session.finished=true;session.cur=null;render();window.scrollTo(0,0);
}
function exitSession(){clearInterval(timerI);session=null;render();window.scrollTo(0,0)}

// ---------- mock exams ----------
function startMock(kind){
  const m=MOCKS[kind],ids=buildMock(m.n),orders={};
  for(const id of ids)orders[id]=makeOrder(byId(id));
  st.activeMock={kind,ids,orders,ans:{},flags:{},i:0,start:Date.now(),end:Date.now()+m.mins*60000,spent:{},enter:Date.now()};
  save();ui.sheet=null;openMock();
}
function openMock(){
  const am=st.activeMock;if(!am)return;
  if(Date.now()>=am.end){submitMock();return}
  am.enter=Date.now();
  session={kind:"mock"};render();window.scrollTo(0,0);
  clearInterval(timerI);
  timerI=setInterval(()=>{
    const a=st.activeMock;if(!a){clearInterval(timerI);return}
    const left=(a.end-Date.now())/1000;
    const el=$("#timer");if(el){el.textContent=fmt(left);el.classList.toggle("low",left<300)}
    if(left<=0)submitMock();
  },1000);
}
function mockLeaveQ(){const am=st.activeMock;if(!am)return;const id=am.ids[am.i];am.spent[id]=(am.spent[id]||0)+(Date.now()-am.enter)/1000;am.enter=Date.now()}
function mockGo(i){const am=st.activeMock;mockLeaveQ();am.i=Math.max(0,Math.min(am.ids.length-1,i));ui.sheet=null;save();render();window.scrollTo(0,0)}
function submitMock(){
  const am=st.activeMock;if(!am)return;
  clearInterval(timerI);mockLeaveQ();
  let ok=0;const byType={};
  for(const id of am.ids){
    const q=byId(id);if(!q)continue;
    const correct=am.ans[id]===q.a;ok+=correct?1:0;
    byType[q.t]=byType[q.t]||[0,0];byType[q.t][0]+=correct?1:0;byType[q.t][1]++;
    record(q,correct,Math.round(am.spent[id]||0),0,true);
  }
  const used=Math.min(Date.now(),am.end)-am.start;
  const res={d:today(),kind:am.kind,n:am.ids.length,ok,secs:Math.round(used/1000),answered:Object.keys(am.ans).length,byType,ids:am.ids,ans:am.ans,orders:am.orders};
  st.mocks.push(res);if(st.mocks.length>40)st.mocks=st.mocks.slice(-40);
  st.activeMock=null;save();
  ui.sheet=null;session={kind:"mockresult",res,idx:st.mocks.length-1};render();window.scrollTo(0,0);
}

// ---------- backup ----------
async function exportData(){
  const name="hpat-gym-backup-"+today()+".json";
  const json=JSON.stringify(st);
  try{
    const file=new File([json],name,{type:"application/json"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"HPAT Gym backup"});return}
  }catch(e){if(e&&e.name==="AbortError")return}
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([json],{type:"application/json"}));a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
}
function importData(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!d||typeof d!=="object"||!d.att||!Array.isArray(d.log))throw new Error("bad");
      st=Object.assign(blank(),d);st.onboarded=true;save();session=null;ui.view=null;ui.tab="today";render();
      toast("Backup restored: "+d.log.length+" answers");
    }catch(e){toast("That file isn't an HPAT Gym backup.")}
  };
  r.readAsText(file);
}

// ---------- views: pieces ----------
const chip=t=>`<span class="chip t-${t}">${esc(TYPES[t]||t)}</span>`;
function greeting(){const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)}
function isStandalone(){return navigator.standalone===true||matchMedia("(display-mode: standalone)").matches}

function vOnboard(){
  return `<div class="stack fade" style="padding-top:24px">
    <div class="eyebrow">HPAT Section 1</div>
    <h1>Ten minutes a day.<br>Logic that sticks.</h1>
    <p class="muted">Short daily sets, hints when you're stuck, and every missed question comes back until you've nailed it.</p>
    <div class="card stack">
      <div class="field"><label for="obName">Your first name</label><input id="obName" autocomplete="given-name" placeholder="Emily" value="${esc(st.profile.name)}"></div>
      <div class="field"><label for="obExam">HPAT date</label><input id="obExam" type="date" value="${esc(st.profile.exam)}"><span class="note">HPAT 2027 is expected in late February. You can change this any time in Settings.</span></div>
      <button class="btn block" data-act="onboard">Start</button>
    </div>
    <p class="note">Your progress is saved on this phone only. Use Back up in Settings now and then to keep a copy.</p>
  </div>`;
}

function vToday(){
  const set=ensureToday(),s=streak(),d=today(),dte=daysToExam();
  const days=[];for(let i=6;i>=0;i--)days.push(addDays(d,-i));
  const total=st.log.length,ok=st.log.reduce((a,e)=>a+e.c,0),due=dueIds().length;
  const left=set.ids.length-set.i;
  const label=set.done?"Done for today":set.i>0?`Resume set (${left} left)`:"Start today's set";
  const am=st.activeMock;
  const showInstall=isIOS()&&!isStandalone();
  return `<div class="stack fade">
  <div class="head">
    <div class="stack tight"><div class="eyebrow">${esc(new Date().toLocaleDateString("en-IE",{weekday:"long",day:"numeric",month:"long"}))}</div><h1>${esc(greeting())}${st.profile.name?", "+esc(st.profile.name):""}</h1></div>
    <button class="iconbtn" data-act="settings" aria-label="Settings">${ICON.gear}</button>
  </div>
  ${showInstall?`<div class="banner">${ICON.share}<div><b>Install the app first.</b> In Safari, tap Share, then <b>Add to Home Screen</b>. Open it from your home screen from then on, so your progress stays in one place.</div></div>`:""}
  ${am?`<div class="banner">${ICON.flag}<div style="flex:1"><b>${esc(MOCKS[am.kind].label)} in progress.</b> ${fmt((am.end-Date.now())/1000)} left on the clock.</div><button class="btn small" data-act="resumeMock">Resume</button></div>`:""}
  ${dte!==null?`<div class="card row between"><div class="count"><b class="mono">${Math.max(0,dte)}</b><span class="muted">${dte===1?"day":"days"} to the HPAT</span></div><span class="note mono">${esc(dShort(st.profile.exam))}</span></div>`:""}
  <div class="card stack">
    <div><h2>${set.ids.length} questions · about ${Math.round(set.ids.length*PACE/60)} minutes</h2><div class="note">Target pace ${fmt(PACE)} per question, the same as the real exam. Use the hints when you're stuck.</div></div>
    <div class="setlist">${set.ids.map((id,i)=>{const q=byId(id);if(!q)return"";const r=set.res[i];return `<span class="chip t-${q.t}" style="${r===undefined?"":"opacity:.6"}">${i+1}. ${esc(TYPES[q.t])}${r===1?" ✓":r===0?" ✗":""}</span>`}).join("")}</div>
    ${set.done?`<div class="note">Set complete: <b>${set.res.reduce((a,b)=>a+b,0)}/${set.res.length}</b>. Come back tomorrow to keep the streak, or do a bonus set in Practice.</div>`:""}
    <button class="btn block" data-act="daily" ${set.done?"disabled":""}>${label}</button>
  </div>
  <div class="card stack">
    <div class="streak"><div class="n mono">${s}</div><div><b>day streak</b><div class="note">${set.done?"Today's done. See you tomorrow.":s?"Finish today's set to keep it going.":"Finish today's set to start one."}</div></div></div>
    <div class="week">${days.map(x=>`<div class="day"><div class="dot ${st.days[x]?"on":""} ${x===d?"today":""}"></div>${esc(new Date(x+"T12:00:00").toLocaleDateString("en-IE",{weekday:"narrow"}))}</div>`).join("")}</div>
  </div>
  <div class="kpis">
    <div class="card kpi"><b class="mono">${total}</b><span>answered</span></div>
    <div class="card kpi"><b class="mono">${total?pct(ok,total)+"%":"–"}</b><span>accuracy</span></div>
    <div class="card kpi"><b class="mono">${due}</b><span>due for review</span></div>
  </div>
  ${due?`<button class="btn soft block" data-act="reviewDue">Redo ${due} missed question${due>1?"s":""} now</button>`:""}
  </div>`;
}

function vPractice(){
  const ts=typeStats(),stars=starredIds().length,am=st.activeMock;
  return `<div class="stack fade">
  <div><div class="eyebrow">Bonus sets</div><h1>Practice</h1></div>
  <h2>By question type</h2>
  <div class="typegrid">${Object.keys(TYPES).map(t=>{const x=ts[t];const n=BANK.filter(q=>q.t===t).length;return `<button class="typebtn" data-act="practice" data-v="${t}">${chip(t)}<small>${esc(TYPE_DESC[t])}</small><small class="mono">${n} questions · ${x.n?pct(x.ok,x.n)+"% right":"not tried"}</small></button>`}).join("")}</div>
  <div class="row"><button class="btn ghost" style="flex:1" data-act="practice" data-v="mixed">Mixed set of 5</button><button class="btn ghost" style="flex:1" data-act="starred" ${stars?"":"disabled"}>Starred (${stars})</button></div>
  <h2>Mock exams</h2>
  <p class="muted">Real exam conditions: no hints, a countdown clock, flag and come back. Section 1 is 42 questions in 60 minutes, and there's no negative marking, so answer everything.</p>
  ${am?`<button class="modecard" data-act="resumeMock"><b>Resume ${esc(MOCKS[am.kind].label.toLowerCase())}</b><small>${fmt((am.end-Date.now())/1000)} left · ${Object.keys(am.ans).length}/${am.ids.length} answered</small></button>`:
  `<button class="modecard" data-act="mock" data-v="half"><b>Half mock</b><small>21 questions · 30 minutes</small></button>
   <button class="modecard" data-act="mock" data-v="full"><b>Full mock</b><small>42 questions · 60 minutes</small></button>`}
  </div>`;
}

function vLearn(){
  return `<div class="stack fade">
  <div><div class="eyebrow">Methods</div><h1>Learn</h1></div>
  <p class="muted">One card per question type: the idea in plain English, the method, and the traps the exam sets.</p>
  <div class="stack tight">${window.LESSONS.map(l=>`<button class="modecard" data-act="lesson" data-v="${l.id}"><div class="row between"><b>${esc(l.title)}</b>${l.t?chip(l.t):'<span class="chip plain">Start here</span>'}</div><small>${esc(l.idea)}</small></button>`).join("")}</div>
  </div>`;
}
function vLesson(){
  const l=window.LESSONS.find(x=>x.id===ui.lesson);if(!l){ui.view=null;return vLearn()}
  const ts=typeStats();const x=l.t?ts[l.t]:null;
  return `<div class="stack fade lesson">
    <div class="row"><button class="iconbtn" data-act="back" aria-label="Back">${ICON.back}</button>${l.t?chip(l.t):""}</div>
    <h1>${esc(l.title)}</h1>
    <p style="font-size:17px">${esc(l.idea)}</p>
    <div class="ex"><b>Think of it like this.</b> ${esc(l.example)}</div>
    <div class="card stack tight"><h2>Method</h2><ol>${l.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="card stack tight"><h2>Traps to watch for</h2><ul>${l.traps.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
    ${l.t?`<button class="btn block" data-act="practice" data-v="${l.t}">Practise ${esc(TYPES[l.t].toLowerCase())} now${x&&x.n?` · ${pct(x.ok,x.n)}% so far`:""}</button>`:`<button class="btn block" data-act="mock" data-v="half">Try a half mock</button>`}
  </div>`;
}

function qRow(q,right){
  return `<button class="li" data-act="single" data-v="${q.id}"><div style="min-width:0;display:flex;flex-direction:column;gap:4px"><div class="row">${chip(q.t)}${st.stars[q.id]?'<span class="note">★ starred</span>':""}${st.notes[q.id]?'<span class="note">has note</span>':""}</div><div class="txt">${esc((q.qx||q.q).split("\n")[0])}</div></div>${right}</button>`;
}
function vReview(){
  const d=today(),seg=ui.reviewSeg;
  const lastTag={};for(const e of st.log){if(!e.c)lastTag[e.id]=e.g}
  let body;
  if(seg==="missed"){
    const missed=missedIds().map(byId).sort((a,b)=>st.att[a.id].due.localeCompare(st.att[b.id].due));
    const due=missed.filter(q=>st.att[q.id].due<=d);
    body=`${due.length?`<button class="btn block" data-act="reviewDue">Redo ${due.length} due now</button>`:""}
    ${missed.length?`<div class="card list" style="padding-block:4px">${missed.map(q=>{const a=st.att[q.id];const isDue=a.due<=d;const tg=TAGS.find(x=>x[0]===lastTag[q.id]);return qRow(q,`<div class="mono note" style="white-space:nowrap;text-align:right;${isDue?"color:var(--bad);font-weight:700":""}">${isDue?"due":esc(dShort(a.due))}${tg?`<br><span style="font-family:var(--f-body)">${esc(tg[1])}</span>`:""}</div>`)}).join("")}</div>`
    :`<div class="empty">Nothing here yet. Every question you miss lands here and comes back after 3 days, then 7. Get it right twice and it drops off.</div>`}`;
  }else{
    const s=starredIds().map(byId);
    body=`${s.length?`<button class="btn block" data-act="starred">Practise all ${s.length} starred</button><div class="card list" style="padding-block:4px">${s.map(q=>qRow(q,"")).join("")}</div>`
    :`<div class="empty">Tap the star on any question to save it here: ones you want to redo, or a method worth remembering.</div>`}`;
  }
  return `<div class="stack fade">
  <div><div class="eyebrow">Error log</div><h1>Review</h1></div>
  <div class="seg"><button class="${seg==="missed"?"on":""}" data-act="seg" data-v="missed">Missed (${missedIds().length})</button><button class="${seg==="starred"?"on":""}" data-act="seg" data-v="starred">Starred (${starredIds().length})</button></div>
  ${body}
  </div>`;
}

function vProgress(){
  const ts=typeStats(e=>!e.m),all=typeStats();
  const tagCount={};for(const e of st.log){if(!e.c&&e.g)tagCount[e.g]=(tagCount[e.g]||0)+1}
  const tagged=Object.values(tagCount).reduce((a,b)=>a+b,0);
  const top=TAGS.slice().sort((a,b)=>(tagCount[b[0]]||0)-(tagCount[a[0]]||0))[0];
  const totalSecs=st.log.reduce((a,e)=>a+e.s,0);
  // last 14 days activity
  const d=today(),days=[];for(let i=13;i>=0;i--)days.push(addDays(d,-i));
  const perDay={};for(const e of st.log)perDay[e.d]=(perDay[e.d]||0)+1;
  const maxDay=Math.max(5,...days.map(x=>perDay[x]||0));
  const mocks=st.mocks;
  return `<div class="stack fade">
  <div><div class="eyebrow">How it's going</div><h1>Progress</h1></div>
  <div class="kpis">
    <div class="card kpi"><b class="mono">${streak()}</b><span>day streak (best ${best()})</span></div>
    <div class="card kpi"><b class="mono">${st.log.length}</b><span>questions done</span></div>
    <div class="card kpi"><b class="mono">${fmtLong(totalSecs)}</b><span>time practised</span></div>
  </div>
  <div class="card stack"><div class="row between"><h2>Last 14 days</h2><span class="note">questions per day</span></div>
    <div style="display:grid;grid-template-columns:repeat(14,1fr);gap:4px;align-items:end;height:90px">${days.map(x=>{const n=perDay[x]||0;return `<div title="${esc(dShort(x))}: ${n}" style="height:${Math.max(3,n/maxDay*100)}%;background:${n?"var(--accent)":"var(--line)"};border-radius:4px 4px 2px 2px"></div>`}).join("")}</div>
    <div class="row between note mono"><span>${esc(dShort(days[0]))}</span><span>Today</span></div>
  </div>
  <div class="card stack"><h2>Accuracy by type</h2>
    <div class="bars">${Object.keys(TYPES).map(t=>{const x=all[t];const p=pct(x.ok,x.n);return `<div class="bar"><span>${esc(TYPES[t])}</span><div class="track"><div class="fill" style="width:${p}%"></div></div><span class="v">${x.n?p+"%":"–"}</span></div>`}).join("")}</div>
    <div class="note">Includes mocks.</div>
  </div>
  <div class="card stack"><h2>Average time per question</h2>
    <div class="bars">${Object.keys(TYPES).map(t=>{const x=ts[t];const a=x.n?x.secs/x.n:0;const p=Math.min(100,a/(PACE*2)*100);return `<div class="bar"><span>${esc(TYPES[t])}</span><div class="track"><div class="fill" style="width:${p}%;background:${a>PACE?"var(--amber)":"var(--ok)"}"></div></div><span class="v">${x.n?fmt(a):"–"}</span></div>`}).join("")}</div>
    <div class="note">Exam pace is ${fmt(PACE)}. Amber means slower than that. Practice sets only.</div>
  </div>
  <div class="card stack"><h2>Why questions get missed</h2>
    ${tagged?`<div class="bars">${TAGS.map(([k,l])=>{const n=tagCount[k]||0;return `<div class="bar"><span>${esc(l)}</span><div class="track"><div class="fill" style="width:${pct(n,tagged)}%;background:var(--bad)"></div></div><span class="v">${n}</span></div>`}).join("")}</div>
    <div class="note">Biggest leak: <b>${esc(top[1])}</b>. ${esc(TAG_FIX[top[0]])}</div>`
    :`<div class="empty">Tag the reason each time you miss a question. After a few sets this shows exactly what to fix.</div>`}
  </div>
  <div class="card stack"><h2>Mock exams</h2>
    ${mocks.length?`${mocks.length>1?mockChart(mocks):""}<div class="list">${mocks.slice().reverse().map((m,ri)=>{const i=mocks.length-1-ri;return `<button class="li" data-act="openMockResult" data-v="${i}"><div><b>${esc(MOCKS[m.kind].label)}</b><div class="note">${esc(dShort(m.d))} · ${fmtLong(m.secs)}</div></div><div class="mono"><b>${m.ok}/${m.n}</b> <span class="note">${pct(m.ok,m.n)}%</span></div></button>`}).join("")}</div>`
    :`<div class="empty">No mocks yet. Try a half mock (21 questions, 30 minutes) from the Practice tab.</div>`}
  </div>
  </div>`;
}
function mockChart(mocks){
  const ms=mocks.slice(-10),W=320,H=120,pl=30,pr=10,pt=10,pb=20;
  const x=i=>pl+(ms.length===1?0:i*(W-pl-pr)/(ms.length-1)),y=v=>pt+(1-v/100)*(H-pt-pb);
  const pts=ms.map((m,i)=>[x(i),y(pct(m.ok,m.n))]);
  const grid=[0,50,100].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl-6}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)" font-family="var(--f-mono)">${v}%</text>`).join("");
  const last=pts[pts.length-1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mock scores over time">${grid}
    <path d="M${pts.map(p=>p.join(",")).join(" L")} L${last[0]},${y(0)} L${pts[0][0]},${y(0)} Z" fill="var(--accent-soft)"/>
    <polyline points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i===pts.length-1?4.5:3}" fill="${i===pts.length-1?"var(--accent)":"var(--card)"}" stroke="var(--accent)" stroke-width="2"/>`).join("")}
  </svg>`;
}

function vSettings(){
  const s=st.settings;
  return `<div class="stack fade">
    <div class="row"><button class="iconbtn" data-act="back" aria-label="Back">${ICON.back}</button><h1>Settings</h1></div>
    <div class="card stack">
      <div class="field"><label for="setName">First name</label><input id="setName" value="${esc(st.profile.name)}" autocomplete="given-name"></div>
      <div class="field"><label for="setExam">HPAT date</label><input id="setExam" type="date" value="${esc(st.profile.exam)}"></div>
      <div class="field"><label>Daily set size</label><div class="seg">${[5,10].map(n=>`<button class="${s.setSize===n?"on":""}" data-act="setSize" data-v="${n}">${n} questions</button>`).join("")}</div><span class="note">Takes effect from tomorrow's set.</span></div>
    </div>
    <div class="card stack">
      <div><h2>Back up your progress</h2><p class="note" style="margin-top:4px">Everything is stored on this phone only. Save a backup file to Files, iCloud Drive or a message to yourself every week or two. If you change phones, restore it there.</p></div>
      <button class="btn block" data-act="export">Save a backup</button>
      <button class="btn ghost block" data-act="import">Restore from a backup</button>
    </div>
    <div class="card stack">
      <div><h2>Start again</h2><p class="note" style="margin-top:4px">Deletes every answer, streak, star, note and mock result on this phone.</p></div>
      ${ui.confirmReset?`<div class="row"><button class="btn ghost" style="flex:1" data-act="resetCancel">Keep my data</button><button class="btn danger" style="flex:1" data-act="resetYes">Delete everything</button></div>`:`<button class="btn ghost block" data-act="reset">Reset all progress</button>`}
    </div>
    <p class="note">HPAT Gym · ${BANK.length} original practice questions in the style of HPAT-Ireland Section 1. Not affiliated with ACER.</p>
  </div>`;
}

function vQuestion(){
  const c=session.cur,q=c.q,n=session.ids.length;
  const pips=session.ids.map((_,i)=>{let k="";if(i<session.res.length)k=session.res[i]?"ok":"bad";else if(i===session.i)k="cur";return `<span class="pip ${k}"></span>`}).join("");
  const opts=c.order.map((oi,pos)=>{let k="";if(c.checked){if(oi===q.a)k="right";else if(oi===c.sel)k="wrong"}else if(oi===c.sel)k="sel";return `<button class="opt ${k}" data-act="pick" data-v="${oi}" ${c.checked?"disabled":""}><span class="bub">${L[pos]}</span><span>${esc(q.o[oi])}</span></button>`}).join("");
  const hints=q.h.slice(0,c.hints).map((h,i)=>`<div class="hint"><b>HINT ${i+1}</b>${esc(h)}</div>`).join("");
  let foot="";
  if(!c.checked){
    const hb=c.hints<3?`<button class="btn ghost" data-act="hint">Hint ${c.hints+1} of 3</button>`:`<button class="btn ghost" data-act="reveal">Show solution</button>`;
    foot=`<div class="actions">${hb}<button class="btn" data-act="check" ${c.sel===null?"disabled":""}>Check answer</button></div>`;
  }else{
    const good=c.correct;
    const title=good?(c.hints?"Got it, with "+c.hints+" hint"+(c.hints>1?"s":""):"Spot on"):(c.revealed?"Here's how it works":"Not this time");
    foot=`<div class="verdict ${good?"ok":"bad"}"><h3>${esc(title)}</h3>
      <div class="note mono">${fmt(c.secs)} · answer ${letterFor(c.order,q.a)}</div>
      <div class="sol">${esc(solText(q,c.order))}</div></div>
      ${good?"":`<div class="stack tight"><b>Why did this one get away?</b><div class="tags">${TAGS.map(([k,l])=>`<button class="tag ${c.tag===k?"on":""}" data-act="tag" data-v="${k}">${esc(l)}</button>`).join("")}</div><div class="note">It comes back in 3 days.</div></div>`}
      ${noteBox(q)}
      <button class="btn block" data-act="next">${session.i+1<n?"Next question":"See results"}</button>`;
  }
  return `<div class="stack fade">
    <div class="topbar"><button class="btn ghost small" data-act="exit">Exit</button><div class="pips">${n>1?pips:""}</div><span class="timer" id="timer">${c.checked?fmt(c.secs):"0:00"}</span></div>
    <div class="row between"><div class="row">${chip(q.t)}<span class="note mono">${n>1?`Q${session.i+1} of ${n}`:""}</span></div>${starBtn(q)}</div>
    <div class="stem">${esc(q.q)}</div>
    ${tableHtml(q)}
    ${q.qx?`<div class="stem"><b>${esc(q.qx)}</b></div>`:""}
    <div class="opts">${opts}</div>
    ${hints?`<div class="hints">${hints}</div>`:""}
    ${foot}
  </div>`;
}
const starBtn=q=>`<button class="iconbtn ${st.stars[q.id]?"on":""}" data-act="star" data-v="${q.id}" aria-label="${st.stars[q.id]?"Remove star":"Star this question"}" aria-pressed="${!!st.stars[q.id]}">${st.stars[q.id]?ICON.starOn:ICON.star}</button>`;
const tableHtml=q=>q.table?`<div class="tbl"><table><thead><tr>${q.table.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${q.table.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`:"";
const noteBox=q=>`<div class="field"><label for="note-${q.id}">My note</label><textarea id="note-${q.id}" data-note="${q.id}" placeholder="What to remember next time">${esc(st.notes[q.id]||"")}</textarea></div>`;

function vResults(){
  const r=session.res,ok=r.reduce((a,b)=>a+b,0);
  const logs=st.log.slice(-r.length);
  const secs=logs.reduce((a,e)=>a+e.s,0),hints=logs.reduce((a,e)=>a+e.h,0);
  const msg=ok===r.length?"Clean sweep.":ok>=r.length-1?"Strong set.":ok>=Math.ceil(r.length/2)?"Solid work. The misses are now in your review list.":"Tough set, and that's where the learning happens. Every miss comes back in 3 days.";
  return `<div class="stack fade">
    <div class="eyebrow">${session.kind==="daily"?"Today's set":"Set"} complete</div>
    <div class="row" style="align-items:flex-end;gap:14px"><div class="score mono">${ok}/${r.length}</div><div class="muted" style="padding-bottom:8px;flex:1;min-width:160px">${esc(msg)}</div></div>
    <div class="kpis">
      <div class="card kpi"><b class="mono">${fmt(secs)}</b><span>total time</span></div>
      <div class="card kpi"><b class="mono">${fmt(r.length?secs/r.length:0)}</b><span>per question</span></div>
      <div class="card kpi"><b class="mono">${hints}</b><span>hints used</span></div>
    </div>
    ${session.kind==="daily"?`<div class="card"><div class="streak"><div class="n mono">${streak()}</div><div><b>day streak</b><div class="note">See you tomorrow.</div></div></div></div>`:""}
    <button class="btn block" data-act="done">Done</button>
    ${session.kind==="practice"?`<button class="btn ghost block" data-act="again">Another set</button>`:""}
  </div>`;
}

function vMock(){
  const am=st.activeMock,id=am.ids[am.i],q=byId(id),order=am.orders[id],sel=am.ans[id],n=am.ids.length;
  const left=(am.end-Date.now())/1000,answered=Object.keys(am.ans).length;
  const opts=order.map((oi,pos)=>`<button class="opt ${sel===oi?"sel":""}" data-act="mpick" data-v="${oi}"><span class="bub">${L[pos]}</span><span>${esc(q.o[oi])}</span></button>`).join("");
  return `<div class="stack fade">
    <div class="topbar"><button class="btn ghost small" data-act="mexit">Pause</button><button class="btn ghost small" data-act="mgrid">${answered}/${n} answered</button><span class="timer ${left<300?"low":""}" id="timer">${fmt(left)}</span></div>
    <div class="row between"><span class="note mono">Question ${am.i+1} of ${n}</span><button class="iconbtn ${am.flags[id]?"on":""}" data-act="mflag" aria-label="Flag for later" aria-pressed="${!!am.flags[id]}">${am.flags[id]?ICON.flagOn:ICON.flag}</button></div>
    <div class="stem">${esc(q.q)}</div>
    ${tableHtml(q)}
    ${q.qx?`<div class="stem"><b>${esc(q.qx)}</b></div>`:""}
    <div class="opts">${opts}</div>
    <div class="actions"><button class="btn ghost" data-act="mprev" ${am.i===0?"disabled":""}>Previous</button>${am.i+1<n?`<button class="btn" data-act="mnext">Next</button>`:`<button class="btn" data-act="mgrid">Review &amp; submit</button>`}</div>
  </div>`;
}
function vMockSheet(){
  const am=st.activeMock;if(!am)return"";
  const n=am.ids.length,answered=Object.keys(am.ans).length,flagged=Object.keys(am.flags).filter(k=>am.flags[k]).length;
  const cells=am.ids.map((id,i)=>`<button class="qcell ${am.ans[id]!==undefined?"ans":""} ${am.flags[id]?"flag":""} ${i===am.i?"cur":""}" data-act="mjump" data-v="${i}" aria-label="Question ${i+1}">${i+1}</button>`).join("");
  return `<div class="sheet" data-act="closeSheet"><div class="panel stack" data-stop="1">
    <div class="row between"><h2>Answer sheet</h2><button class="btn ghost small" data-act="closeSheet">Close</button></div>
    <div class="note">${answered} answered · ${n-answered} blank · ${flagged} flagged (amber dot)</div>
    <div class="qgrid">${cells}</div>
    ${ui.sheet==="confirm"?`<div class="card stack tight"><b>${n-answered?`${n-answered} question${n-answered>1?"s are":" is"} still blank.`:"All questions answered."}</b><span class="note">There's no negative marking, so a guess is always better than a blank.</span><div class="row"><button class="btn ghost" style="flex:1" data-act="mgrid">Keep going</button><button class="btn" style="flex:1" data-act="msubmitYes">Submit</button></div></div>`
    :`<button class="btn block" data-act="msubmit">Submit mock</button>`}
  </div></div>`;
}
function vMockResult(){
  const r=session.res,p=pct(r.ok,r.n);
  const cells=r.ids.map((id,i)=>{const q=byId(id);const ok=q&&r.ans[id]===q.a;return `<button class="qcell ${ok?"ok":"bad"}" data-act="mreview" data-v="${i}">${i+1}</button>`}).join("");
  return `<div class="stack fade">
    <div class="row"><button class="iconbtn" data-act="done" aria-label="Back">${ICON.back}</button><div class="eyebrow">${esc(MOCKS[r.kind].label)} · ${esc(dShort(r.d))}</div></div>
    <div class="row" style="align-items:flex-end;gap:14px"><div class="score mono">${r.ok}/${r.n}</div><div class="muted" style="padding-bottom:8px">${p}% correct</div></div>
    <div class="kpis">
      <div class="card kpi"><b class="mono">${fmt(r.secs)}</b><span>time used</span></div>
      <div class="card kpi"><b class="mono">${fmt(r.secs/r.n)}</b><span>per question</span></div>
      <div class="card kpi"><b class="mono">${r.n-r.answered}</b><span>left blank</span></div>
    </div>
    <div class="card stack"><h2>By type</h2><div class="bars">${Object.keys(TYPES).filter(t=>r.byType[t]).map(t=>{const [o,n]=r.byType[t];return `<div class="bar"><span>${esc(TYPES[t])}</span><div class="track"><div class="fill" style="width:${pct(o,n)}%"></div></div><span class="v">${o}/${n}</span></div>`}).join("")}</div></div>
    <div class="card stack"><h2>Go through the answers</h2><div class="note">Tap a number to see the worked solution. Wrong answers are now in your review list.</div><div class="qgrid">${cells}</div></div>
    <button class="btn block" data-act="done">Done</button>
  </div>`;
}
function vMockReview(){
  const r=session.res,i=session.ri,id=r.ids[i],q=byId(id),order=r.orders[id],sel=r.ans[id];
  const opts=order.map((oi,pos)=>{let k="";if(oi===q.a)k="right";else if(oi===sel)k="wrong";return `<button class="opt ${k}" disabled><span class="bub">${L[pos]}</span><span>${esc(q.o[oi])}</span></button>`}).join("");
  const ok=sel===q.a;
  return `<div class="stack fade">
    <div class="topbar"><button class="btn ghost small" data-act="mresults">Results</button><span class="note mono">Question ${i+1} of ${r.ids.length}</span>${starBtn(q)}</div>
    <div class="row">${chip(q.t)}</div>
    <div class="stem">${esc(q.q)}</div>
    ${tableHtml(q)}
    ${q.qx?`<div class="stem"><b>${esc(q.qx)}</b></div>`:""}
    <div class="opts">${opts}</div>
    <div class="verdict ${ok?"ok":"bad"}"><h3>${ok?"Correct":sel===undefined?"Left blank":"Not this time"}</h3><div class="note mono">answer ${letterFor(order,q.a)}</div><div class="sol">${esc(solText(q,order))}</div></div>
    ${noteBox(q)}
    <div class="actions"><button class="btn ghost" data-act="mrprev" ${i===0?"disabled":""}>Previous</button><button class="btn" data-act="mrnext" ${i+1>=r.ids.length?"disabled":""}>Next</button></div>
  </div>`;
}

// ---------- render ----------
function render(){
  const app=$("#app");
  const inSession=!!session;
  $("#tabs").hidden=inSession||!st.onboarded||!!ui.view;
  app.classList.toggle("full",$("#tabs").hidden);
  let html;
  if(!st.onboarded)html=vOnboard();
  else if(session){
    if(session.kind==="mock")html=st.activeMock?vMock():"";
    else if(session.kind==="mockresult")html=session.ri!==undefined?vMockReview():vMockResult();
    else html=session.finished?vResults():vQuestion();
  }
  else if(ui.view==="settings")html=vSettings();
  else if(ui.view==="lesson")html=vLesson();
  else html=({today:vToday,practice:vPractice,learn:vLearn,review:vReview,progress:vProgress})[ui.tab]();
  app.innerHTML=html;
  $("#sheet").innerHTML=session&&session.kind==="mock"&&ui.sheet?vMockSheet():"";
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("on",b.dataset.v===ui.tab));
}

// ---------- actions ----------
const A={
  tab:v=>{ui.tab=v;ui.view=null;render();window.scrollTo(0,0)},
  settings:()=>{ui.view="settings";ui.confirmReset=false;render();window.scrollTo(0,0)},
  back:()=>{ui.view=null;render();window.scrollTo(0,0)},
  lesson:v=>{ui.view="lesson";ui.lesson=v;render();window.scrollTo(0,0)},
  onboard:()=>{st.profile.name=($("#obName").value||"").trim().slice(0,40);st.profile.exam=$("#obExam").value||"";st.onboarded=true;save();render()},
  daily:()=>{const s=ensureToday();startSession("daily",s.ids,{i:s.i,res:s.res})},
  reviewDue:()=>startSession("review",shuffle(dueIds()).slice(0,10)),
  practice:v=>{ui.lastPractice=v;ui.view=null;startSession("practice",buildSet(5,v==="mixed"?null:v))},
  again:()=>startSession("practice",buildSet(5,ui.lastPractice==="mixed"?null:ui.lastPractice)),
  starred:()=>startSession("starred",shuffle(starredIds())),
  single:v=>startSession("single",[v]),
  seg:v=>{ui.reviewSeg=v;render()},
  pick:v=>{const c=session.cur;if(c.checked)return;c.sel=+v;render()},
  hint:()=>{session.cur.hints++;render()},
  reveal:()=>check(true),
  check:()=>check(false),
  tag:v=>{const c=session.cur;c.tag=c.tag===v?null:v;const e=st.log[c.logIdx];if(e)e.g=c.tag;save();render()},
  next:()=>next(),
  exit:()=>exitSession(),
  done:()=>{session=null;render();window.scrollTo(0,0)},
  star:v=>{if(st.stars[v])delete st.stars[v];else st.stars[v]=1;save();render();toast(st.stars[v]?"Starred. Find it in Review.":"Star removed")},
  mock:v=>{ui.view=null;startMock(v)},
  resumeMock:()=>openMock(),
  mpick:v=>{const am=st.activeMock,id=am.ids[am.i];v=+v;if(am.ans[id]===v)delete am.ans[id];else am.ans[id]=v;save();render()},
  mflag:()=>{const am=st.activeMock,id=am.ids[am.i];if(am.flags[id])delete am.flags[id];else am.flags[id]=1;save();render()},
  mnext:()=>mockGo(st.activeMock.i+1),
  mprev:()=>mockGo(st.activeMock.i-1),
  mjump:v=>mockGo(+v),
  mgrid:()=>{mockLeaveQ();save();ui.sheet="grid";render()},
  closeSheet:()=>{ui.sheet=null;render()},
  msubmit:()=>{ui.sheet="confirm";render()},
  msubmitYes:()=>submitMock(),
  mexit:()=>{mockLeaveQ();save();clearInterval(timerI);session=null;ui.sheet=null;render();toast("Mock paused. The clock keeps running, like the real exam.")},
  mreview:v=>{session.ri=+v;render();window.scrollTo(0,0)},
  mresults:()=>{delete session.ri;render();window.scrollTo(0,0)},
  mrprev:()=>{session.ri--;render();window.scrollTo(0,0)},
  mrnext:()=>{session.ri++;render();window.scrollTo(0,0)},
  openMockResult:v=>{const res=st.mocks[+v];if(res&&res.ids)session={kind:"mockresult",res,idx:+v};render();window.scrollTo(0,0)},
  setSize:v=>{st.settings.setSize=+v;save();render()},
  export:()=>exportData(),
  import:()=>{const f=$("#importFile");f.value="";f.click()},
  reset:()=>{ui.confirmReset=true;render()},
  resetCancel:()=>{ui.confirmReset=false;render()},
  resetYes:()=>{const keep=st.profile;st=blank();st.profile=keep;st.onboarded=true;save();ui={tab:"today",view:null,lesson:null,reviewSeg:"missed",confirmReset:false,sheet:null};session=null;render();toast("All progress deleted")}
};
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]");if(!el)return;
  if(el.dataset.act==="closeSheet"&&e.target.closest("[data-stop]")&&el.classList.contains("sheet"))return;
  const fn=A[el.dataset.act];if(fn){e.preventDefault();fn(el.dataset.v)}
});
let noteT=null;
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.note){const id=t.dataset.note,v=t.value;clearTimeout(noteT);noteT=setTimeout(()=>{if(v.trim())st.notes[id]=v.slice(0,2000);else delete st.notes[id];save()},400)}
  if(t.id==="setName"){st.profile.name=t.value.trim().slice(0,40);save()}
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.id==="setExam"){st.profile.exam=t.value||"";save()}
  if(t.id==="importFile"&&t.files&&t.files[0])importData(t.files[0]);
});
// Re-check the mock clock and the date when the app comes back from the background.
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState!=="visible")return;
  if(st.activeMock&&Date.now()>=st.activeMock.end){if(session&&session.kind==="mock")submitMock();else{submitMock();}return}
  if(!session)render();
});

render();
if(st.activeMock&&Date.now()>=st.activeMock.end&&st.onboarded){submitMock()}

if("serviceWorker" in navigator&&location.protocol!=="file:"){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
})();
