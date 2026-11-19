/* 학습 경로 · 경험치(XP) · 자동 복습(간격 반복)
 * - 홈 화면에 유닛 → 레슨 순서의 학습 경로를 보여 줘요. 글자 입문 레슨과 단어 레슨(20개씩)이 한 길로 이어져요.
 * - 단어 레슨은 퀴즈에서 70% 이상 맞히면 완료돼요. 이미 아는 유닛은 건너뛸 수 있어요.
 * - 단어를 풀 때마다(record) 복습 일정이 갱신돼요: 틀리면 10분 뒤, 맞히면 1일 → 3일 → 7일 → 14일 → 30일 → 60일 뒤에 다시 나와요.
 * - 경험치·경로 진행·복습 일정은 계정에 동기화돼요(index.html 의 PER 목록).
 * 기록 키: jp-path(레슨 완료), jp-xp(경험치), jp-srs(복습 일정)
 */
(function(){
const A=()=>window.APP;
const get=(k,d)=>A().LS.get(k,d), set=(k,v)=>A().LS.set(k,v);
const LESSON_N=20, UNIT_N=5, PASS=.7;
const IV=[10/1440,1,3,7,14,30,60];            // 복습 간격(일)
const TITLES=["견습생","수련생","열혈 학습자","중급 도전자","숙련자","달인","명인"];

/* ---------- 경험치 ---------- */
const xpState=()=>get("jp-xp",{t:0,d:{}});
function addXp(n){ if(!n) return; const s=xpState(); s.t=(s.t||0)+n; s.d=s.d||{}; const d=A().today(); s.d[d]=(s.d[d]||0)+n; set("jp-xp",s); }
const lvOf=t=>Math.floor(Math.sqrt((t||0)/50))+1;
const lvFloor=l=>50*(l-1)*(l-1);
const titleOf=l=>TITLES[Math.min(l-1,TITLES.length-1)];

/* ---------- 자동 복습(간격 반복) ---------- */
function srsUpdate(key,ok){
  const s=get("jp-srs",{}), e=s[key]||{b:0};
  e.b=ok?Math.min((e.b||0)+1,6):0; e.d=Date.now()+IV[e.b]*864e5; s[key]=e; set("jp-srs",s);
}
const dueKeys=()=>{ const s=get("jp-srs",{}), n=Date.now(); return Object.keys(s).filter(k=>s[k].d<=n); };
function duePool(){ const set1=new Set(dueKeys()); return A().ALL.filter(w=>set1.has(w.key)); }

/* ---------- 내 참새 · 씨앗 · 상점 ---------- */
const SLOTS=[["head","머리"],["face","얼굴"],["neck","목"]];
const ITEMS=[
 {id:"sprout",slot:"head",name:"새싹 잎",price:20,svg:'<path d="M240 26q-2-26-24-34q-4 22 24 34z" fill="#7ccf8e"/><path d="M240 26q4-24 26-28q2 24-26 28z" fill="#5dbb78"/><path d="M240 27v-12" stroke="#4aa064" stroke-width="3" fill="none" stroke-linecap="round"/>'},
 {id:"flower",slot:"head",name:"벚꽃 핀",price:30,svg:'<g transform="translate(206 40)"><g fill="#ffb7cb">'+[0,72,144,216,288].map(a=>`<circle cx="0" cy="-11" r="9" transform="rotate(${a})"/>`).join("")+'</g><circle r="6" fill="#ffd95c"/></g>'},
 {id:"bow",slot:"head",name:"분홍 리본",price:30,svg:'<g transform="translate(210 36)"><path d="M0 0l-32-16v32zM0 0l32-16v32z" fill="#ff8fab"/><circle r="7" fill="#f2678b"/></g>'},
 {id:"straw",slot:"head",name:"밀짚모자",price:50,svg:'<ellipse cx="238" cy="40" rx="80" ry="14" fill="#f2d49b" stroke="#d9b270" stroke-width="3"/><path d="M192 40q0-42 46-42t46 42z" fill="#f7e2ad" stroke="#d9b270" stroke-width="3"/><path d="M194 32q44 12 88 0l2 9q-46 12-92 0z" fill="#e5534b"/>'},
 {id:"crown",slot:"head",name:"작은 왕관",price:120,svg:'<path d="M203 38l8-30 18 18 10-26 10 26 18-18 8 30z" fill="#ffd24d" stroke="#e0a526" stroke-width="3" stroke-linejoin="round"/><circle cx="239" cy="30" r="4" fill="#e5534b"/>'},
 {id:"glasses",slot:"face",name:"동그란 안경",price:40,svg:'<circle cx="252" cy="77" r="17" fill="rgba(255,255,255,.3)" stroke="#4a3f3a" stroke-width="4"/><path d="M236 72L200 64" stroke="#4a3f3a" stroke-width="4" stroke-linecap="round"/>'},
 {id:"shades",slot:"face",name:"선글라스",price:60,svg:'<ellipse cx="252" cy="77" rx="20" ry="14" fill="#2f2a28"/><path d="M233 72L200 64" stroke="#2f2a28" stroke-width="4" stroke-linecap="round"/><path d="M243 72q5-3 11-2" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>'},
 {id:"scarf",slot:"neck",name:"빨간 목도리",price:40,svg:'<path d="M210 120q50 30 98-8l-4 26q-48 30-96 2z" fill="#e5534b"/><path d="M226 144l-12 44 24-8 6-36z" fill="#cf4139"/>'},
 {id:"tie",slot:"neck",name:"나비넥타이",price:40,svg:'<g transform="translate(258 138)"><path d="M0 0l-26-15v30zM0 0l26-15v30z" fill="#5aa7de"/><circle r="6" fill="#3f86bd"/></g>'},
 {id:"bell",slot:"neck",name:"방울 목걸이",price:30,svg:'<path d="M222 124q34 26 70-4" stroke="#c98a4a" stroke-width="3" fill="none"/><circle cx="258" cy="150" r="9" fill="#ffd24d" stroke="#e0a526" stroke-width="3"/><path d="M252 152h12" stroke="#e0a526" stroke-width="2"/>'}
];
const charState=()=>{ const s=get("jp-char",null); return s||{seeds:30,owned:[],equip:{}}; };
const saveChar=s=>set("jp-char",s);
function addSeeds(n){ const s=charState(); s.seeds=(s.seeds||0)+n; saveChar(s); }
function birdSvg(equip,cls){
  const eq=equip||charState().equip||{}, order=["neck","face","head"];
  return `<svg class="${cls||""}" viewBox="0 -44 375 376" aria-hidden="true"><image href="mascot.png" x="0" y="0" width="375" height="332"/>${order.map(sl=>{ const it=ITEMS.find(x=>x.id===eq[sl]); return it?`<g>${it.svg}</g>`:""; }).join("")}</svg>`;
}
function birdHtml(){ return `<button class="hbird" data-shop="1" aria-label="내 참새 꾸미기">${birdSvg(null)}</button>`; }
let shopSlot="head";
function shopRender(){
  const d=document.getElementById("shopDlg"), s=charState();
  d.innerHTML=`<div class="dh"><h2 style="margin:0">내 참새</h2><button class="x" data-sclose aria-label="닫기">×</button></div>
  <div class="db"><div class="shopbird">${birdSvg(s.equip,"big")}</div><p class="sub" style="text-align:center;margin:4px 0 10px">씨앗 <b style="color:var(--accent-text)">${s.seeds||0}</b>개 · 7일 선물과 레슨을 끝내면 씨앗을 받아요</p>
  <div class="shtabs">${SLOTS.map(([k,n])=>`<button class="pill ${shopSlot===k?"on":""}" data-sslot="${k}">${n}</button>`).join("")}</div>
  <div class="shl">${ITEMS.filter(x=>x.slot===shopSlot).map(it=>{ const own=s.owned.includes(it.id), on=s.equip[it.slot]===it.id;
    return `<div class="shi"><div class="shp">${birdSvg({[it.slot]:it.id},"mini")}</div><div class="shn"><b>${E(it.name)}</b><small>${own?(on?"착용 중":"보유 중"):it.price+" 씨앗"}</small></div>
     ${own?`<button class="pill ${on?"":"on"}" data-sequip="${it.id}">${on?"벗기":"입히기"}</button>`:`<button class="pill ${(s.seeds||0)>=it.price?"on":""}" data-sbuy="${it.id}" ${(s.seeds||0)>=it.price?"":"disabled"}>사기</button>`}</div>`; }).join("")}</div></div>`;
}
function openShop(){ let d=document.getElementById("shopDlg");
  if(!d){ d=document.createElement("dialog"); d.id="shopDlg"; document.body.appendChild(d);
    d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-sclose]")){ d.close(); A().renderHome(); return; }
      const sl=ev.target.closest("[data-sslot]"), by=ev.target.closest("[data-sbuy]"), eq=ev.target.closest("[data-sequip]");
      if(sl){ shopSlot=sl.dataset.sslot; shopRender(); }
      else if(by){ const it=ITEMS.find(x=>x.id===by.dataset.sbuy), s=charState(); if(it&&(s.seeds||0)>=it.price&&!s.owned.includes(it.id)){ s.seeds-=it.price; s.owned.push(it.id); s.equip[it.slot]=it.id; saveChar(s); A().toast("「"+it.name+"」을(를) 샀어요!"); shopRender(); } }
      else if(eq){ const it=ITEMS.find(x=>x.id===eq.dataset.sequip), s=charState(); if(it&&s.owned.includes(it.id)){ if(s.equip[it.slot]===it.id) delete s.equip[it.slot]; else s.equip[it.slot]=it.id; saveChar(s); shopRender(); } } }); }
  shopRender(); if(!d.open) d.showModal();
}

/* ---------- 경로 구성 ---------- */
const KANA_UNITS=[["h","히라가나 기본",0,9],["h","히라가나 탁음 · 요음 · 촉음",10,18],["k","가타카나 기본",0,9],["k","가타카나 탁음 · 요음 · 촉음",10,18]];
const KANA_LABEL={h:["あ행","か행","さ행","た행","な행","は행","ま행","や행","ら행","わ행·ん","が행","ざ행","だ행","ば행","ぱ행","きゃ행","ひゃ행","ぎゃ행","っ · ー"],
                  k:["ア행","カ행","サ행","タ행","ナ행","ハ행","マ행","ヤ행","ラ행","ワ행·ン","ガ행","ザ행","ダ행","バ행","パ행","キャ행","ヒャ행","ギャ행","ッ · ー"]};
const KANA_GLYPH={h:["あ","か","さ","た","な","は","ま","や","ら","わ","が","ざ","だ","ば","ぱ","きゃ","ひゃ","ぎゃ","っ"],k:["ア","カ","サ","タ","ナ","ハ","マ","ヤ","ラ","ワ","ガ","ザ","ダ","バ","パ","キャ","ヒャ","ギャ","ッ"]};
let UN=null, UN_SIG="";
function levels(){ const my=A().myLv(); return my.length?["N5","N4","N3","N2","N1"].filter(l=>my.includes(l)):["N5","N4","N3","N2","N1"]; }
function lessonWords(L,idx){ const ws=A().ALL.filter(w=>w.lv===L||w.lv2===L).map((w,i)=>({w,i})); ws.sort((a,b)=>((a.w.tier||2)-(b.w.tier||2))||(a.i-b.i)); return ws.slice(idx*LESSON_N,(idx+1)*LESSON_N).map(x=>x.w); }
function build(){
  const sig=levels().join(",")+"|"+A().ALL.length; if(UN&&sig===UN_SIG) return UN; UN_SIG=sig; UN=[];
  KANA_UNITS.forEach(([k,title,a,b],ui)=>{ const nodes=[]; for(let i=a;i<=b;i++) nodes.push({id:k+i,kind:"kana",k,i,label:KANA_LABEL[k][i],glyph:KANA_GLYPH[k][i]}); UN.push({id:"ku"+ui,title,tag:"글자 입문",nodes}); });
  levels().forEach(L=>{ const n=A().ALL.filter(w=>w.lv===L||w.lv2===L).length, cnt=Math.ceil(n/LESSON_N);
    for(let u=0;u*UNIT_N<cnt;u++){ const nodes=[]; for(let j=u*UNIT_N;j<Math.min(cnt,(u+1)*UNIT_N);j++) nodes.push({id:"w:"+L+":"+j,kind:"word",L,j,label:"단어 "+(j*LESSON_N+1)+"~"+Math.min(n,(j+1)*LESSON_N),glyph:String(j+1)});
      UN.push({id:"wu"+L+u,title:L+" 단어 "+(u*UNIT_N*LESSON_N+1)+"~"+Math.min(n,(u+1)*UNIT_N*LESSON_N),tag:L,nodes}); } });
  return UN;
}
const state=()=>get("jp-path",{done:{},open:null});
function isDone(n,st){ if(n.kind==="kana"){ const d=get("jp-kana",{done:{}}).done||{}; return !!d[n.id]||!!(st.done&&st.done[n.id]); } return !!(st.done&&st.done[n.id]); }
const showKana=()=>{ const p=A().prefs(); if(p.showKana!==undefined) return !!p.showKana; const d=get("jp-kana",{done:{}}).done||{}; return Object.keys(d).length>0; };
const vis=()=>build().filter(u=>showKana()||!u.id.startsWith("ku"));
function current(){ const st=state(); for(const u of vis()) for(const n of u.nodes) if(!isDone(n,st)) return {u,n}; return null; }
let showAllUnits=false;

/* ---------- 홈 화면 조각 ---------- */
let openUnits=new Set();
function statusHtml(){
  const x=xpState(), l=lvOf(x.t), lo=lvFloor(l), hi=lvFloor(l+1), pc=Math.round((x.t-lo)/(hi-lo)*100), st=A().streakDays();
  return `<div class="pstat"><div class="prow1"><b>Lv.${l} ${titleOf(l)}</b><span>${st?st+"일 연속 · ":""}${x.t} XP · 씨앗 ${charState().seeds||0}</span></div><div class="prog"><div style="width:${pc}%"></div></div></div>`;
}
function reviewHtml(){ const n=dueKeys().length; return `<button class="lrow" data-pr="1" style="border-top:1px solid var(--line);margin-top:12px"><span>${n?`복습할 단어 <b style="color:var(--accent-text)">${n}개</b>`:"복습할 단어가 아직 없어요"}</span><i>›</i></button>`; }
function pathHtml(){
  const st=state(), cur=current(), all=vis(); if(cur) openUnits.add(cur.u.id);
  const ci=cur?all.findIndex(u=>u.id===cur.u.id):all.length, shown=showAllUnits?all:all.slice(Math.max(0,ci),ci+3), hidden=all.length-shown.length;
  const offs=[0,26,44,26,0,-26,-44,-26];
  return `<div class="path"><h3>학습 경로</h3>${shown.map(u=>{
    const done=u.nodes.filter(n=>isDone(n,st)).length, open=openUnits.has(u.id), alld=done===u.nodes.length;
    return `<div class="pu ${open?"open":""} ${alld?"all":""}"><button class="puh" data-pu="${u.id}"><span class="pun">${E(u.tag)}</span><b>${E(u.title)}</b><small>${done} / ${u.nodes.length}</small></button>
     ${open?`<div class="pnodes">${u.nodes.map((n,i)=>{ const dn=isDone(n,st), isCur=cur&&cur.n.id===n.id;
        return `<div class="pn" style="margin-left:calc(50% - 32px + ${offs[i%offs.length]}px)"><button class="pnb ${dn?"done":""} ${isCur?"cur":""}" data-pn="${n.id}" aria-label="${E(n.label)}">${dn?"✓":E(n.glyph)}</button><small>${E(n.label)}</small>${isCur?`<span class="pnow">지금 할 레슨</span>`:""}</div>`; }).join("")}
       ${alld?"":`<button class="pskip" data-pskip="${u.id}">이 유닛은 이미 알아요</button>`}</div>`:""}</div>`; }).join("")}
   <div class="ptools">${hidden>0||showAllUnits?`<button data-ptog="units">${showAllUnits?"지금 유닛만 보기":`다른 유닛 ${hidden}개 보기`}</button>`:""}<button data-ptog="kana">${showKana()?"글자 입문 숨기기":"히라가나·가타카나부터 배우기"}</button></div></div>`;
}
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- 레슨 시트 ---------- */
let active=null;
function sheet(n){
  const ws=lessonWords(n.L,n.j); let d=document.getElementById("pathDlg");
  if(!d){ d=document.createElement("dialog"); d.id="pathDlg"; document.body.appendChild(d); d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-pclose]")) d.close(); }); }
  d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(n.L)} · ${E(n.label)}</h2><button class="x" data-pclose aria-label="닫기">×</button></div>
   <div class="db"><p class="sub">${ws.length}개 단어를 보고, 퀴즈에서 ${Math.round(PASS*100)}% 이상 맞히면 레슨이 완료돼요.</p>
   <div class="pwl">${ws.map(w=>`<div class="pwi"><b>${A().R(w.f)}</b><span>${E(w.ko)}</span></div>`).join("")}</div>
   <div class="qbtns" style="flex-direction:column;align-items:stretch;margin-top:12px"><button class="cta sec" data-pgo="card">카드로 먼저 보기</button><button class="cta" data-pgo="quiz">퀴즈 시작</button></div></div>`;
  d.dataset.n=n.id; if(!d.open) d.showModal();
}
function startNode(id){
  if(id[0]==="h"||id[0]==="k"){ const k=id[0]==="k"; window.KANA&&window.KANA.openLesson(+id.slice(1),k); return; }
  const [,L,j]=id.split(":"), n=build().flatMap(u=>u.nodes).find(x=>x.id===id); if(n) sheet(n);
}
function go(mode){
  const d=document.getElementById("pathDlg"); if(!d) return; const id=d.dataset.n, [,L,j]=id.split(":"), ws=lessonWords(L,+j); d.close();
  if(!ws.length){ A().toast("이 레슨에는 단어가 없어요"); return; }
  active=mode==="quiz"?{id,keys:new Set(ws.map(w=>w.key))}:null;
  A().setView("quiz"); A().startQuiz(mode==="quiz"?"meaning":"card",ws,ws.length);
}
function markDone(id,skip){ const st=state(); st.done=st.done||{}; if(!st.done[id]) st.done[id]=skip?2:1; set("jp-path",st); }

/* ---------- 7일 연속 여정 · 선물 ---------- */
const GIFT_TITLES=["새싹 참새","날갯짓 참새","하늘 참새","한 달 참새"];
const NUM=["零","一","二","三","四","五","六","七","八","九","十"];
const kan=n=>n<=10?NUM[n]:n<20?"十"+(n%10?NUM[n%10]:""):NUM[Math.floor(n/10)]+"十"+(n%10?NUM[n%10]:"");
const giftTitle=j=>j<=GIFT_TITLES.length?GIFT_TITLES[j-1]:"전설의 참새";
const ds=i=>new Date(Date.now()-i*864e5).toLocaleDateString("sv-SE");
const giftState=()=>get("jp-gift",{claimed:{},items:[]});
function journey(){
  const s=A().streakDays(), pos=s>0?((s-1)%7)+1:0, last=A().studiedToday()?0:1, run=s>0?ds(last+s-1):"";
  const gs=giftState(); let pending=0;
  for(let j=1;j<=Math.floor(s/7);j++){ if(!gs.claimed[run+":"+j]){ pending=j; break; } }
  return {s,pos,run,pending,items:gs.items||[]};
}
const JX=i=>24+i*45.3, JY=i=>[64,42,64,42,64,42,52][i], JH=100;
const tree=(x,y,s,k)=>k?`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-2" width="4" height="12" fill="var(--fo-trunk)"/><path d="M0-34l12 16h-6l10 14h-32l10-14h-6z" fill="var(--fo2)"/></g>`:`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-2" width="4" height="14" fill="var(--fo-trunk)"/><circle cx="0" cy="-14" r="14" fill="var(--fo1)"/><circle cx="-9" cy="-6" r="9" fill="var(--fo2)"/><circle cx="9" cy="-7" r="9" fill="var(--fo2)"/></g>`;
const forestBg=()=>`<g class="jf"><ellipse cx="80" cy="100" rx="110" ry="26" fill="var(--fo1)" opacity=".55"/><ellipse cx="250" cy="102" rx="120" ry="28" fill="var(--fo1)" opacity=".55"/>
 ${tree(14,34,.9,1)}${tree(72,30,1,0)}${tree(128,32,.8,1)}${tree(196,30,.95,0)}${tree(256,34,.85,1)}${tree(306,30,1,0)}
 <ellipse cx="34" cy="92" rx="17" ry="9" fill="var(--fo3)"/><ellipse cx="112" cy="94" rx="15" ry="8" fill="var(--fo2)"/><ellipse cx="190" cy="92" rx="18" ry="9" fill="var(--fo3)"/><ellipse cx="274" cy="94" rx="16" ry="8" fill="var(--fo2)"/>
 <g fill="#ffb3c7"><circle cx="58" cy="90" r="2.4"/><circle cx="150" cy="93" r="2.4"/><circle cx="232" cy="90" r="2.4"/></g><g fill="#ffd95c"><circle cx="90" cy="92" r="2.2"/><circle cx="214" cy="94" r="2.2"/><circle cx="300" cy="90" r="2.2"/></g></g>`;
function journeyHtml(){
  const J=journey(), prev=+(localStorage.getItem("jp-jpos")||0);
  const stops=[0,1,2,3,4,5,6].map(i=>{ const x=JX(i), y=JY(i), done=i<J.pos, cur=i===J.pos-1;
    if(i===6) return `<g class="jg ${J.pos>=7?"on":""}"><rect x="${x-13}" y="${y-8}" width="26" height="20" rx="3"/><rect x="${x-13}" y="${y-13}" width="26" height="7" rx="2"/><path d="M${x} ${y-13}v25M${x-4} ${y-17}q4 -2 4 4q0 -6 4 -4"/></g>`;
    return `<g class="js ${done?"done":""} ${cur?"cur":""}"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y+4}" text-anchor="middle">${i+1}</text></g>`; }).join("");
  const line=[0,1,2,3,4,5,6].map(i=>`${i?"L":"M"}${JX(i)} ${JY(i)}`).join(" ");
  const pxy=p=>p<=0?[6,JY(0)]:[JX(p-1),JY(p-1)];
  const [fx,fy]=pxy(prev), [tx,ty]=pxy(J.pos);
  const msg=J.pending?"일곱 걸음을 다 걸었어요! 선물 상자가 기다려요":J.pos===0?"오늘 공부하면 참새가 숲길을 나서요":J.pos<7?`${7-J.pos}일 더 걸으면 선물 상자가 열려요`:"도착했어요! 내일부터 새 여정이 시작돼요";
  setTimeout(()=>{ const b=document.querySelector(".jrb"); if(b){ b.style.left=(tx/3.2)+"%"; b.style.top=((ty-40)/JH*100)+"%"; } try{ localStorage.setItem("jp-jpos",String(J.pos)); }catch(e){} },80);
  return `<div class="jr"><div class="jrh"><b>7일 숲길 여정</b><span>${J.pos} / 7일</span></div>
   <div class="jrroad"><svg viewBox="0 0 320 ${JH}" aria-hidden="true">${forestBg()}<path class="jl2" d="${line}"/><path class="jl" d="${line}"/>${stops}</svg><div class="jrb" style="left:${fx/3.2}%;top:${(fy-40)/JH*100}%">${birdSvg(null)}</div></div>
   <div class="jrf"><span>${msg}</span>${J.pending?`<button class="cta" data-gift="open" style="width:auto;padding:10px 18px;font-size:15px">선물 받기</button>`:""}</div>
   ${J.items.length?`<button class="jrc" data-gift="box">내 선물함 · ${J.items.length}개 ›</button>`:""}</div>`;
}
function giftDlg(){ let d=document.getElementById("giftDlg"); if(!d){ d=document.createElement("dialog"); d.id="giftDlg"; document.body.appendChild(d); d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-gclose]")){ d.close(); A().renderHome(); } else { const g=ev.target.closest("[data-gift]"); if(g) giftAct(g.dataset.gift); } }); } return d; }
const stamp=n=>{ const t=kan(n)+"日"; return `<div class="stamp"><b style="font-size:${t.length>3?22:28}px">${t}</b><small>連続</small></div>`; };
function giftAct(a){
  const d=giftDlg();
  if(a==="open"){ const J=journey(); if(!J.pending) return;
    d.innerHTML=`<div class="db" style="text-align:center;padding:28px 20px"><p class="sub">${J.pending*7}일 연속 달성!</p><svg class="gbox" viewBox="0 0 120 110" aria-hidden="true"><rect x="20" y="46" width="80" height="54" rx="6"/><rect x="14" y="32" width="92" height="20" rx="5"/><path d="M60 32v68M60 32q-16 -22 -26 -10q-6 12 26 10zM60 32q16 -22 26 -10q6 12 -26 10z"/></svg><div><button class="cta" data-gift="reveal" data-j="${J.pending}" style="max-width:220px;margin:14px auto 0">상자 열기</button></div></div>`;
    if(!d.open) d.showModal(); return; }
  if(a==="reveal"){ const J=journey(), j=J.pending; if(!j) return; const gs=giftState(); gs.claimed[J.run+":"+j]=1; gs.items.push({j,n:j*7,title:giftTitle(j),at:Date.now()}); set("jp-gift",gs); addXp(100); addSeeds(70);
    d.innerHTML=`<div class="db" style="text-align:center;padding:26px 20px"><p class="sub">선물이 도착했어요</p>${stamp(j*7)}<h3 style="margin:12px 0 2px">「${giftTitle(j)}」 칭호</h3><p class="sub" style="margin:0">+100 XP · 씨앗 70개 · 선물함에 보관돼요</p><button class="cta" data-gclose style="max-width:220px;margin:18px auto 0">좋아요</button></div>`; return; }
  if(a==="box"){ const its=giftState().items;
    d.innerHTML=`<div class="dh"><h2 style="margin:0">내 선물함</h2><button class="x" data-gclose aria-label="닫기">×</button></div><div class="db"><div class="gl">${its.slice().reverse().map(x=>`<div class="gi">${stamp(x.n)}<b>${E(x.title)}</b><small>${new Date(x.at).toLocaleDateString("ko-KR")}</small></div>`).join("")}</div></div>`;
    if(!d.open) d.showModal(); }
}

/* ---------- 바깥(index.html·kana.js)에서 부르는 훅 ---------- */
window.PATH={
  statusHtml,reviewHtml,pathHtml,journeyHtml,birdHtml,openShop,
  rec(w,ok){ try{ if(w&&w.key){ srsUpdate(w.key,ok); if(ok) addXp(10); } }catch(e){} },
  quizEnd(score,keys){ try{
    if(!active) return; const a=active; active=null;
    if(!keys.every(k=>a.keys.has(k))) return;
    const ok=keys.length&&score/keys.length>=PASS;
    if(ok){ const st=state(); const first=!(st.done&&st.done[a.id]); markDone(a.id); if(first){ addXp(30); addSeeds(5); A().toast("레슨 완료! +30 XP · 씨앗 5개"); } else A().toast("레슨 완료!"); }
    else A().toast("70% 이상 맞히면 레슨이 완료돼요. 한 번 더 도전해 보세요");
  }catch(e){} },
  kanaDone(id){ try{ const st=state(); st.kx=st.kx||{}; if(!st.kx[id]){ st.kx[id]=1; set("jp-path",st); addXp(30); addSeeds(5); A().toast("레슨 완료! +30 XP · 씨앗 5개"); } }catch(e){} },
  review(){ const pool=duePool(); if(!pool.length){ A().toast("지금 복습할 단어가 없어요. 단어를 풀면 복습 일정이 생겨요"); return; } A().setView("quiz"); A().startQuiz("meaning",pool,Math.min(20,pool.length)); }
};

/* ---------- 이벤트 ---------- */
document.addEventListener("click",e=>{
  const hv=document.getElementById("homeView"); if(!hv||!hv.contains(e.target)) return;
  const pu=e.target.closest("[data-pu]"), pn=e.target.closest("[data-pn]"), sk=e.target.closest("[data-pskip]"), pr=e.target.closest("[data-pr]");
  if(pu){ const id=pu.dataset.pu; openUnits.has(id)?openUnits.delete(id):openUnits.add(id); A().renderHome(); }
  else if(pn) startNode(pn.dataset.pn);
  else if(sk){ const u=build().find(x=>x.id===sk.dataset.pskip); if(u&&confirm("「"+u.title+"」 유닛을 이미 알고 있는 것으로 표시할까요? 경험치는 오르지 않아요.")){ u.nodes.forEach(n=>markDone(n.id,true)); A().renderHome(); } }
  else if(pr) window.PATH.review();
  else if(e.target.closest("[data-shop]")) openShop();
  else if(e.target.closest("[data-ptog]")){ const k=e.target.closest("[data-ptog]").dataset.ptog; if(k==="units"){ showAllUnits=!showAllUnits; } else { A().setPref("showKana",!showKana()); } A().renderHome(); }
});
document.addEventListener("click",e=>{ const g=e.target.closest("[data-pgo]"); if(g) go(g.dataset.pgo); const gf=e.target.closest("#homeView [data-gift]"); if(gf) giftAct(gf.dataset.gift); });

/* ---------- 스타일 ---------- */
const ST=document.createElement("style");
ST.textContent=`.pstat{border:0!important;background:none!important;padding:0!important;margin:14px 0 14px}
.pstat .prow1{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}.pstat .prow1 b{font-size:15px}.pstat .prow1 span{font-size:13px;color:var(--sub)}
.pstat .sub{display:flex;justify-content:space-between;margin-top:6px;font-size:12px}
.path{margin:18px 0 8px}.path h3{margin:22px 0 6px;font-size:15px;color:var(--sub);font-weight:600}
.pu{border:0!important;box-shadow:none!important;background:none!important;border-radius:0!important;margin-bottom:0;border-top:1px solid var(--line)!important}
.pu.all{opacity:.75}
.puh{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:14px 2px;background:none;border:0;font:inherit;color:var(--text);cursor:pointer}
.puh .pun{font-size:11px;font-weight:800;color:var(--accent-text);background:var(--accent-soft);border-radius:999px;padding:2px 9px;flex:none}
.puh b{flex:1;font-size:15px}.puh small{color:var(--sub);flex:none}
.pnodes{position:relative;padding:2px 0 18px}
.pnodes::before{content:"";position:absolute;left:50%;top:14px;bottom:56px;width:0;border-left:3px dotted var(--line);transform:translateX(-1px)}
.pn{position:relative;width:64px;text-align:center;margin-top:14px}
.pn small{display:block;font-size:11px;color:var(--sub);margin-top:4px;line-height:1.3;white-space:nowrap;position:relative;left:50%;transform:translateX(-50%)}
.pnb{width:64px;height:64px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);color:var(--sub);font:inherit;font-size:19px;font-weight:700;cursor:pointer;position:relative;z-index:1;box-shadow:none;transition:transform .12s}
.pnb:active{transform:scale(.94)}
.pnb.done{background:var(--ok);border-color:var(--ok);color:#fff;box-shadow:none}
.pnb.cur{background:var(--accent);border-color:var(--accent);color:var(--onacc);box-shadow:0 0 0 6px var(--accent-soft)}
.pnow{display:block;font-size:11px;font-weight:800;color:var(--accent-text);background:var(--accent-soft);border-radius:999px;padding:3px 11px;margin-top:9px;position:relative;left:50%;transform:translateX(-50%);white-space:nowrap}
.pskip{display:block;margin:18px auto 0;background:none;border:0;color:var(--sub);text-decoration:underline;font:inherit;font-size:13px;cursor:pointer}
.pwl{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:42vh;overflow:auto}
.pwi{border:1px solid var(--line);border-radius:10px;padding:6px 9px;display:flex;flex-direction:column;font-size:13px}.pwi b{font-size:15px}.pwi span{color:var(--sub)}
.jr{margin:22px 0 6px}.jrh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px}.jrh b{font-size:15px}.jrh span{font-size:13px;color:var(--sub)}
.jrroad{position:relative}.jrroad svg{display:block;width:100%;height:auto;overflow:hidden;border-radius:14px}
.jl{fill:none;stroke:var(--line);stroke-width:3;stroke-dasharray:2 7;stroke-linecap:round}
.js circle{fill:var(--card);stroke:var(--line);stroke-width:2}.js text{font-size:11px;font-weight:700;fill:var(--sub)}
.js.done circle{fill:var(--ok);stroke:var(--ok)}.js.done text{fill:#fff}
.js.cur circle{fill:var(--accent);stroke:var(--accent)}.js.cur text{fill:var(--onacc)}
.jg rect,.jg path{fill:var(--card);stroke:var(--sub);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.jg.on rect,.jg.on path{stroke:var(--accent);fill:var(--accent-soft)}
.jrb{position:absolute;transform:translate(-50%,0);transition:left 1.1s cubic-bezier(.4,.1,.2,1),top 1.1s cubic-bezier(.4,.1,.2,1);pointer-events:none;animation:jhop 1.6s ease-in-out infinite}
@keyframes jhop{0%,100%{margin-top:0}50%{margin-top:-4px}}
.jrf{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;color:var(--sub);margin-top:8px}
.jrc{background:none;border:0;padding:8px 0 0;font:inherit;font-size:13px;color:var(--accent-text);font-weight:600;cursor:pointer}
#giftDlg{border:0;border-radius:18px;padding:0;max-width:380px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#giftDlg::backdrop{background:rgba(0,0,0,.45)}
.gbox{width:130px;height:auto;animation:gshake 1.2s ease-in-out infinite}.gbox rect,.gbox path{fill:var(--accent-soft);stroke:var(--accent);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
@keyframes gshake{0%,100%{transform:rotate(0)}20%{transform:rotate(-4deg)}40%{transform:rotate(4deg)}60%{transform:rotate(-3deg)}80%{transform:rotate(2deg)}}
.stamp{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;min-width:76px;height:76px;padding:0 8px;border:3px solid var(--seal);border-radius:10px;color:var(--seal);transform:rotate(-4deg);animation:gstamp .5s cubic-bezier(.2,1.5,.4,1)}
.stamp b{font-weight:900;line-height:1}.stamp small{font-size:10px;font-weight:700;letter-spacing:.2em;margin-top:3px}
@keyframes gstamp{from{transform:rotate(-4deg) scale(2);opacity:0}to{transform:rotate(-4deg) scale(1);opacity:1}}
.gl{display:grid;grid-template-columns:1fr 1fr;gap:14px}.gi{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}.gi small{color:var(--sub);font-size:11px}
.jl2{fill:none;stroke:var(--fo-path);stroke-width:16;stroke-linecap:round;stroke-linejoin:round;opacity:.95}
.jrb{width:40px;height:40px}.jrb svg{width:100%;height:100%;display:block}
.hbird{width:100%;height:100%;border:0;background:none;padding:0;cursor:pointer;display:block}.hbird svg{width:100%;height:100%;display:block}
.shopbird{display:flex;justify-content:center}.shopbird svg.big{width:210px;height:auto}
.shtabs{display:flex;gap:8px;justify-content:center;margin-bottom:6px}
.shl{display:flex;flex-direction:column;border-top:1px solid var(--line)}.shi{display:flex;align-items:center;gap:12px;padding:10px 2px;border-bottom:1px solid var(--line)}
.shp{width:52px;height:52px;flex:none;background:var(--chip);border-radius:12px;display:flex;align-items:center;justify-content:center}.shp svg{width:48px;height:auto}
.shn{flex:1;display:flex;flex-direction:column}.shn small{color:var(--sub);font-size:12px}
.ptools{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:10px}.ptools button{background:none;border:0;font:inherit;font-size:13px;color:var(--sub);text-decoration:underline;cursor:pointer}
#shopDlg{border:0;border-radius:18px;padding:0;max-width:420px;width:calc(100% - 28px);max-height:88vh;overflow:auto;background:var(--card);color:var(--text)}#shopDlg::backdrop{background:rgba(0,0,0,.45)}
#pathDlg{border:0;border-radius:18px;padding:0;max-width:440px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#pathDlg::backdrop{background:rgba(0,0,0,.45)}`;
document.head.appendChild(ST);
if(A()&&A().renderHome) A().renderHome();
})();
