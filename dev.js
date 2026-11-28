/* 개발자 모드 — 서버의 admins/{내 uid} 문서가 있는 계정으로 로그인했을 때만 켜집니다.
 * 화면 표시는 편의일 뿐이고, 리그 삭제·신고 확인·공지 수정은 firestore.rules가 서버에서 막습니다.
 * 켜는 법: Firebase 콘솔 > Firestore > admins 컬렉션에 문서 ID = 내 uid(Authentication 탭에서 확인)로 문서 하나 만들기 */
(function(){
const A=()=>window.APP, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let isDev=false, notice="", noticeAt=0, me=null;
const cl=()=>A()&&A().cloud, db=()=>cl().db;
const weekKey=d=>{ const x=new Date(d||Date.now()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x.toLocaleDateString("sv-SE"); };

/* 공지: 누구나 읽고(게스트 포함), 개발자만 씁니다 */
async function loadNotice(){ try{ if(!cl()||!cl().ok) return; const s=await db().collection("config").doc("announce").get(); notice=(s.exists&&s.data().text)||""; noticeAt=(s.exists&&s.data().at)||0; if(A().view&&A().view()==="home") A().renderHome(); }catch(e){} }
function bannerHtml(){ if(!notice) return ""; const d=noticeAt?new Date(noticeAt):null, ds=d?`${d.getMonth()+1}월 ${d.getDate()}일`:"";
  return `<div class="devnote" role="note"><div class="nh"><span class="nbadge">공지</span>${ds?`<small>${ds}</small>`:""}</div><div class="nt">${E(notice)}</div></div>`; }

function btn(){ let b=$("devBtn"); if(!isDev){ if(b) b.remove(); return; } if(b) return;
  b=document.createElement("button"); b.id="devBtn"; b.textContent="🛠"; b.setAttribute("aria-label","개발자 모드"); b.onclick=open; document.body.appendChild(b); }

async function check(u){ isDev=false; me=u||null;
  try{ if(u){ const s=await db().collection("admins").doc(u.uid).get(); isDev=s.exists; } }catch(e){}
  document.body.classList.toggle("dev-on",isDev); btn(); }

const dlg=()=>{ let d=$("devDlg"); if(!d){ d=document.createElement("dialog"); d.id="devDlg"; document.body.appendChild(d);
  d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-dx]")){ d.close(); return; } const t=ev.target.closest("[data-dt]"); if(t){ dtab=t.dataset.dt; paint(); const db_=d.querySelector(".devdb"); if(db_) db_.scrollTop=0; return; } const b=ev.target.closest("[data-d]"); if(b) act(b); }); } return d; };

function ps(){ const P=window.PATH&&PATH.dev; return P; }
let dtab="vis", C=null;
const TABS=[["vis","방문자"],["me","이 기기 테스트"],["ops","운영"],["sys","시스템"]];
async function load(){ const o={mem:[],rep:[],inq:[],err:"",vs:null};
  try{ const w=weekKey(); const ms=await db().collection("leagues").doc(w).collection("members").orderBy("xp","desc").limit(50).get(); o.mem=ms.docs.map(x=>({id:x.id,...x.data()}));
    const rs=await db().collection("reports").orderBy("at","desc").limit(30).get(); o.rep=rs.docs.map(x=>({id:x.id,...x.data()}));
    try{ const qs=await db().collection("inquiries").orderBy("at","desc").limit(30).get(); o.inq=qs.docs.map(x=>({id:x.id,...x.data()})); }catch(e){} }catch(e){ o.err="서버 규칙에 개발자 권한이 아직 없어요(firestore.rules 배포 필요)"; }
  try{ localStorage.setItem("jp-vskip","1"); const from=new Date(Date.now()-new Date().getTimezoneOffset()*6e4-29*864e5).toISOString().slice(0,10);
    const q=await db().collection("visits").where("d",">=",from).limit(5000).get(); o.vs=q.docs.map(x=>x.data()); }catch(e){ o.vs=null; }
  return o; }
const ymd=d=>d.toISOString().slice(0,10);
function visHtml(vs){
  if(!vs) return `<p class="devwarn">방문자 기록을 불러오지 못했어요. firestore.rules 배포가 필요할 수 있어요.</p>`;
  const now=new Date(Date.now()-new Date().getTimezoneOffset()*6e4), by={}, nw={}, all=new Set(), pwa=new Set();
  vs.forEach(q=>{ (by[q.d]=by[q.d]||new Set()).add(q.v); all.add(q.v); if(q.nw) nw[q.d]=(nw[q.d]||0)+1; if(q.pwa) pwa.add(q.v); });
  const days=[]; for(let i=13;i>=0;i--){ const t=ymd(new Date(now-i*864e5)); days.push({t,n:(by[t]||new Set()).size,nw:nw[t]||0}); }
  const sum=n=>{ const s=new Set(); for(let i=0;i<n;i++){ const t=ymd(new Date(now-i*864e5)); (by[t]||[]).forEach(v=>s.add(v)); } return s.size; };
  const max=Math.max(1,...days.map(d=>d.n)), today=days[13], yest=days[12], diff=today.n-yest.n;
  const tile=(l,v,sub)=>`<div class="dvt"><small>${l}</small><b>${v}</b>${sub?`<span>${sub}</span>`:""}</div>`;
  const wk=["일","월","화","수","목","금","토"];
  return `<div class="dvg">${tile("오늘",today.n+"명",diff?((diff>0?"▲ ":"▼ ")+Math.abs(diff)+" (어제 "+yest.n+")"):"어제와 같음")}${tile("최근 7일",sum(7)+"명","")}${tile("30일",all.size+"명","")}${tile("앱으로 설치",pwa.size+"대","30일 방문 기기 중")}</div>
   <div class="dvc"><div class="dvch"><b>최근 14일</b><span><i class="a"></i>방문 <i class="b"></i>처음 온 사람</span></div>
    <div class="dvbars">${days.map(d=>{ const h=Math.round(d.n/max*100), hn=d.n?Math.round(d.nw/max*100):0; const dt=new Date(d.t+"T00:00:00"); return `<div class="dvb${d.t===today.t?" t":""}" title="${d.t} · ${d.n}명 (처음 ${d.nw})"><em>${d.n||""}</em><div class="bar" style="height:${Math.max(d.n?4:0,h)}%"><span style="height:${d.n?Math.round(hn/Math.max(h,1)*100):0}%"></span></div><small>${dt.getDate()}<br>${wk[dt.getDay()]}</small></div>`; }).join("")}</div></div>
   <p class="sub dvnote">익명 방문 기록이에요. 같은 기기는 하루에 한 번만 세고, 이 기기(개발자)는 세지 않아요.</p>`; }
function meHtml(st){
  const lvx=ps()?PATH.level():1, p=ps()?PATH:null;
  const sec=(t,h)=>`<section class="dvs"><h3>${t}</h3>${h}</section>`;
  return `<p class="sub">이 기기에서만 적용돼요. 서버나 다른 사람 화면은 안 바뀝니다.</p>`
  +sec("지금 상태",`<div class="dvg two">${`<div class="dvt"><small>레벨</small><b>Lv.${lvx}</b></div><div class="dvt"><small>씨앗</small><b>${st.seeds||0}개</b></div>`}</div>`)
  +sec("씨앗 · 레벨",`<div class="devrow"><button class="pill" data-d="seed" data-n="100">씨앗 +100</button><button class="pill" data-d="seed" data-n="1000">씨앗 +1000</button><button class="pill" data-d="seed" data-n="-9999">씨앗 0</button><button class="pill" data-d="xp" data-n="100">XP +100</button><button class="pill" data-d="xp" data-n="1000">XP +1000</button></div><div class="devrow" style="margin-top:6px"><input id="devLv" type="number" min="1" max="50" placeholder="레벨(1~50)"><button class="pill" data-d="lv">레벨 맞추기</button></div><p class="sub">레벨을 올리면 레벨 보상(씨앗·황금 노트·합격 기원 팩)이 같이 열려요.</p>`)
  +sec("출석 · 오늘 기록",`<div class="devrow"><input id="devStreak" type="number" min="0" max="365" placeholder="연속 출석 일수"><button class="pill" data-d="streak">출석 일수 맞추기</button></div><div class="devrow" style="margin-top:6px"><button class="pill" data-d="todayreset">오늘 푼 문제 0으로</button><button class="pill" data-d="questreset">오늘 퀘스트 다시</button></div>`)
  +sec("급수 클리어 (보상 표지·정복자 팩)",`<div class="devrow"><select id="devLvl"><option>N5</option><option>N4</option><option>N3</option><option>N2</option><option>N1</option><option value="ALL">N5~N1 전체</option></select><button class="pill" data-d="clear">클리어 처리</button><button class="pill" data-d="unclear">클리어 해제</button></div><div class="devrow" style="margin-top:6px"><button class="pill" data-d="master">JLPT 정복자 칭호 받기</button><button class="pill" data-d="unmaster">칭호 회수</button><button class="pill" data-d="giftreset">선물·칭호 기록 초기화</button></div>`)
  +sec("다이어리 꾸미기",`<div class="devrow"><button class="pill" data-d="diaunlock">표지·스티커팩 전부 열기</button><button class="pill" data-d="diareset">꾸미기 처음으로</button></div><p class="sub">전부 열기는 씨앗으로 사는 것만 열어요. 레벨·클리어 보상은 위 도구로 열어 주세요.</p>`)
  +sec("학습 기록",`<div class="devrow"><button class="pill" data-d="wipe" data-k="jp-wrong,jp-miss">오답 비우기</button><button class="pill" data-d="wipe" data-k="jp-star">별표 비우기</button><button class="pill" data-d="wipe" data-k="jp-srs">복습 일정 비우기</button><button class="pill" data-d="weakfake">약점 단어 20개 채우기</button></div>`)
  +sec("술술 플러스 화면 시험",`<p class="sub">지금: <b>${localStorage.getItem("jp-plusdev")==="on"?"플러스 켠 화면":"무료 사용자 화면"}</b> · 오늘 무료 1회 ${localStorage.getItem("jp-plus-free")===A().today()?"사용함":"안 씀"}</p><div class="devrow"><button class="pill" data-d="plusdev" data-v="on">플러스 화면 켜기</button><button class="pill" data-d="plusdev" data-v="off">무료 사용자 화면</button><button class="pill" data-d="plusfree">무료 1회 다시</button><button class="pill" data-d="coachreset">합격 코치 비우기</button></div><p class="sub">화면 확인용이에요. 실제 결제·기간은 서버 기록으로만 정해져요.</p>`); }
function opsHtml(o){
  const nameOf=u=>(o.mem.find(m=>m.id===u)||{}).name||u.slice(0,6)+"…";
  const sec=(t,h)=>`<section class="dvs"><h3>${t}</h3>${h}</section>`;
  return (o.err?`<p class="devwarn">${o.err}</p>`:"")
  +sec("공지 (홈 맨 위)",`<textarea id="devNote" rows="2" maxlength="120" placeholder="비우고 저장하면 공지가 사라져요">${E(notice)}</textarea><div class="devrow"><button class="pill on" data-d="note">공지 저장</button><button class="pill" data-d="noticeoff">공지 지우기</button></div>`)
  +sec("이벤트 선물 (이번 주 리그 "+o.mem.length+"명 전원)",`<div class="devrow"><input id="devGSeed" type="number" min="1" max="100000" placeholder="씨앗 개수"><button class="pill" data-d="giftall" data-k="seed">씨앗 보내기</button></div><p class="sub">받는 사람은 커뮤니티 「받은 선물」에서 받아요. 보내면 되돌릴 수 없어요.</p>`)
  +sec("문의 "+o.inq.length+"건",o.inq.length?o.inq.map(q=>`<div class="devli" style="align-items:flex-start"><span style="min-width:0"><b>${E(({bug:"오류",idea:"제안",etc:"기타"})[q.kind]||"기타")}</b> <small>${E(q.name||"")} · ${new Date(q.at||0).toLocaleDateString("ko-KR")}</small><br><span style="white-space:pre-wrap;word-break:break-word;font-size:13px">${E(q.text||"")}</span></span><button class="pill sm" data-d="delinq" data-r="${q.id}">삭제</button></div>`).join(""):`<p class="sub">없어요</p>`)
  +sec("신고 "+o.rep.length+"건",o.rep.length?o.rep.map(r=>`<div class="devli"><span><b>${E(nameOf(r.target||""))}</b> <small>${E((r.target||"").slice(0,8))} · ${new Date(r.at||0).toLocaleDateString("ko-KR")}</small></span><span><button class="pill sm" data-d="kick" data-u="${E(r.target||"")}" data-r="${r.id}">리그에서 삭제</button><button class="pill sm" data-d="dismiss" data-r="${r.id}">무시</button></span></div>`).join(""):`<p class="sub">없어요</p>`)
  +sec("이번 주 리그 "+o.mem.length+"명",o.mem.map(m=>`<div class="devli"><span><b>${E(m.name||"")}</b> <small>${m.xp||0}XP · ${E(m.id.slice(0,8))}</small></span><button class="pill sm" data-d="kick" data-u="${m.id}">삭제</button></div>`).join("")||`<p class="sub">없어요</p>`); }
function sysHtml(){
  const ver=[...document.scripts].map(s=>s.getAttribute("src")||"").filter(s=>/\.(js|css)\?v=/.test(s)).map(s=>s.replace("?v=","@"));
  return `<section class="dvs"><h3>도구</h3><div class="devrow"><button class="pill" data-d="cache">캐시 비우고 새로고침</button><button class="pill" data-d="export">내 데이터 복사(JSON)</button><button class="pill" data-d="wipeall">이 기기 학습 전부 초기화</button></div></section>
   <section class="dvs"><h3>불러온 파일 버전</h3><p class="sub" style="word-break:break-all;line-height:1.7">${E(ver.join(" · "))}</p></section>`; }
function paint(){ const d=dlg(); if(!C) return; const st=ps()?PATH.dev.state():{seeds:0,owned:[]};
  const body=dtab==="vis"?visHtml(C.vs):dtab==="me"?meHtml(st):dtab==="ops"?opsHtml(C):sysHtml();
  d.innerHTML=`<div class="dh"><h2 style="margin:0">개발자 모드</h2><button class="x" data-dx aria-label="닫기">×</button></div>
   <div class="dvtabs" role="tablist">${TABS.map(([k,n])=>`<button type="button" role="tab" aria-selected="${k===dtab}" class="${k===dtab?"on":""}" data-dt="${k}">${n}${k==="ops"&&(C.inq.length+C.rep.length)?` <i>${C.inq.length+C.rep.length}</i>`:""}</button>`).join("")}</div>
   <div class="db devdb"><p class="sub dvwho">${E(me&&me.email||"")} · 이번 주 ${weekKey()}</p>${body}</div>`;
  if(!d.open) d.showModal(); }
async function open(){ if(!isDev) return; const d=dlg(); if(!C){ C=await load(); } paint(); }
async function refresh(){ C=await load(); paint(); }

async function act(b){ const a=b.dataset.d, P=ps();
  try{
   if(a==="seed"){ P.addSeeds(+b.dataset.n>=0?+b.dataset.n:-P.state().seeds); A().toast("씨앗을 바꿨습니다"); }
   else if(a==="xp"){ P.addXp(+b.dataset.n); A().toast("XP를 줬습니다"); }
   else if(a==="diaunlock"){ const cat=window.DIARY&&DIARY.catalog?DIARY.catalog():null; if(!cat){ A().toast("다이어리를 불러오지 못했어요"); return; } const D=A().LS.get("jp-dia-deco",null)||{}; D.own=[...new Set([...(D.own||[]),...cat.buyable])]; A().LS.set("jp-dia-deco",D); A().toast("씨앗으로 사는 꾸미기를 전부 열었습니다"); }
   else if(a==="diareset"){ if(!confirm("다이어리 꾸미기(표지·스티커 팩·산 것)를 처음으로 되돌리시겠습니까?")) return; A().LS.set("jp-dia-deco",{}); A().toast("꾸미기를 초기화했습니다"); }
   else if(a==="note"){ const t=($("devNote").value||"").trim(); await db().collection("config").doc("announce").set({text:t,at:Date.now()}); notice=t; A().toast(t?"공지를 올렸습니다":"공지를 지웠습니다"); }
   else if(a==="kick"){ if(!confirm("이 사용자를 이번 주 리그에서 삭제하시겠습니까?")) return; await db().collection("leagues").doc(weekKey()).collection("members").doc(b.dataset.u).delete(); if(b.dataset.r) await db().collection("reports").doc(b.dataset.r).delete(); A().toast("삭제했습니다"); }
   else if(a==="delinq"){ if(!confirm("이 문의를 지우시겠습니까?")) return; await db().collection("inquiries").doc(b.dataset.r).delete(); }
   else if(a==="dismiss"){ await db().collection("reports").doc(b.dataset.r).delete(); }
   else if(a==="giftall"){ const seed=true, amount=Math.floor(+$("devGSeed").value), item="";
     if(seed&&!(amount>=1&&amount<=100000)){ A().toast("1~100000 사이로 넣어주세요"); return; }
     const w=weekKey(), ms=await db().collection("leagues").doc(w).collection("members").limit(50).get(), ids=ms.docs.map(x=>x.id).filter(u=>!me||u!==me.uid);
     if(!ids.length){ A().toast("보낼 사람이 없습니다"); return; }
     const label=seed?"씨앗 "+amount+"개":"「"+PATH.gift.itemName(item)+"」";
     if(!confirm("이번 주 리그 "+ids.length+"명 전원에게 "+label+"를 보내시겠습니까?\n보내면 되돌릴 수 없습니다.")) return;
     const batch=db().batch(), day=A().today(), now=Date.now();
     ids.forEach(u=>{ const g={from:me.uid,fromName:"운영자",to:u,kind:seed?"seed":"item",day,claimed:false,at:now}; if(seed) g.amount=amount; else { g.item=item; g.itemName=PATH.gift.itemName(item); } batch.set(db().collection("gifts").doc(),g); });
     await batch.commit(); A().toast(ids.length+"명에게 보냈습니다"); }
   else if(a==="lv"){ const L=+($("devLv").value); if(!(L>=1&&L<=P.maxLv)){ A().toast("1~"+P.maxLv+" 사이로 넣어주세요"); return; } P.setLevel(L); A().toast("레벨 "+L+"로 맞췄습니다"); }
   else if(a==="streak"){ const n=+($("devStreak").value); if(!(n>=0&&n<=365)){ A().toast("0~365 사이로 넣어주세요"); return; } const L=A().LS.get("jp-log",{}), ds=i=>new Date(Date.now()-i*864e5).toLocaleDateString("sv-SE"); for(let i=0;i<n;i++){ const k=ds(i); L[k]=L[k]||{n:0,c:0}; if(!L[k].n){ L[k].n=1; L[k].c=1; } } delete L[ds(n)]; A().LS.set("jp-log",L); A().toast("출석 일수를 맞췄습니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="questreset"){ A().LS.set("jp-quest",{}); const L=A().LS.get("jp-log",{}); delete L[new Date().toLocaleDateString("sv-SE")]; A().LS.set("jp-log",L); A().toast("오늘 퀘스트를 다시 시작합니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="todayreset"){ const L=A().LS.get("jp-log",{}); delete L[new Date().toLocaleDateString("sv-SE")]; A().LS.set("jp-log",L); A().toast("오늘 기록을 비웠습니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="clear"||a==="unclear"){ const L=$("devLvl").value; if(a==="unclear"&&!confirm(L+" 클리어 기록을 해제하시겠습니까?")) return; P.pathSet(L,a==="clear"); A().toast(L+(a==="clear"?" 클리어 처리했습니다":" 클리어를 해제했습니다")); setTimeout(()=>location.reload(),700); return; }
   else if(a==="master"){ P.giveMaster(true); A().toast("정복자 칭호를 줬습니다"); }
   else if(a==="unmaster"){ P.giveMaster(false); A().toast("정복자 칭호를 회수했습니다"); }
   else if(a==="giftreset"){ if(!confirm("선물·칭호 기록을 비우시겠습니까?")) return; P.giftReset(); A().toast("비웠습니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="wipe"){ if(!confirm("정말 비우시겠습니까?")) return; { const id=A().curProfile().id; b.dataset.k.split(",").forEach(k=>localStorage.removeItem(k+"@"+id)); } A().toast("비웠습니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="export"){ const o={}; ["jp-kana","jp-custom","jp-star","jp-prefs","jp-wrong","jp-miss","jp-log","jp-read","jp-best","jp-path","jp-xp","jp-srs","jp-gift","jp-char","jp-dia-deco","jp-lvrw","jp-jplan","jp-jhist"].forEach(k=>o[k]=A().LS.get(k,null)); const t=JSON.stringify(o); try{ await navigator.clipboard.writeText(t); A().toast("복사했어요("+Math.round(t.length/1024)+"KB)"); }catch(e){ prompt("복사해서 보관하세요",t); } }
   else if(a==="noticeoff"){ await db().collection("config").doc("announce").set({text:"",at:Date.now()}); notice=""; A().toast("공지를 지웠습니다"); }
   else if(a==="wipeall"){ if(!confirm("이 기기의 학습 기록(레벨·출석·오답·아이템 등)을 전부 지우시겠습니까? 되돌릴 수 없습니다.")) return; if(!confirm("정말 전부 지우시겠습니까?")) return; { const id=A().curProfile().id; ["jp-kana","jp-star","jp-wrong","jp-miss","jp-log","jp-read","jp-best","jp-path","jp-xp","jp-srs","jp-gift","jp-char","jp-dia-deco","jp-lvrw"].forEach(k=>localStorage.removeItem(k+"@"+id)); } A().toast("초기화했습니다"); setTimeout(()=>location.reload(),700); return; }
   else if(a==="plusdev"){ localStorage.setItem("jp-plusdev",b.dataset.v); A().toast(b.dataset.v==="on"?"플러스 화면을 켰습니다":"무료 사용자 화면으로 바꿨습니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="plusfree"){ localStorage.removeItem("jp-plus-free"); A().toast("오늘 무료 1회를 다시 쓸 수 있습니다"); }
   else if(a==="coachreset"){ if(!confirm("합격 코치(시험 날짜·모의시험 기록)를 비우시겠습니까?")) return; { const id=A().curProfile().id; ["jp-jhist","jp-jplan"].forEach(k=>localStorage.removeItem(k+"@"+id)); } A().toast("비웠습니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="weakfake"){ const m=A().LS.get("jp-miss",{}); for(let i=0;i<20;i++){ if(A().byKey("b"+i)) m["b"+i]=(m["b"+i]||0)+3; } A().LS.set("jp-miss",m); A().toast("약점 단어 20개를 채웠습니다"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="cache"){ try{ (await navigator.serviceWorker.getRegistrations()).forEach(r=>r.unregister()); (await caches.keys()).forEach(k=>caches.delete(k)); }catch(e){} location.reload(); return; }
  }catch(e){ A().toast("실패했어요(권한·네트워크 확인)"); return; }
  refresh(); if(A().view&&A().view()==="home") A().renderHome(); }

const ST=document.createElement("style"); ST.textContent=`#devBtn{position:fixed;left:10px;bottom:76px;z-index:60;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:var(--card);opacity:.55;font-size:16px;cursor:pointer}
#devDlg{border:0;border-radius:18px;padding:0;max-width:440px;width:calc(100% - 20px);max-height:90vh;background:var(--card);color:var(--text);overflow:hidden}#devDlg[open]{display:flex;flex-direction:column}#devDlg::backdrop{background:rgba(0,0,0,.45)}
#devDlg .dh{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:14px 16px 8px}
.dvtabs{flex:0 0 auto;display:flex;gap:4px;padding:0 12px 10px;border-bottom:1px solid var(--line);overflow-x:auto}.dvtabs button{flex:1 0 auto;flex-shrink:0;border:0;background:var(--chip);color:var(--sub);font:inherit;font-size:13.5px;font-weight:800;border-radius:10px;padding:8px 10px;cursor:pointer;white-space:nowrap}.dvtabs button.on{background:var(--accent);color:var(--onacc)}.dvtabs i{font-style:normal;background:#d83a3a;color:#fff;border-radius:999px;font-size:11px;padding:1px 6px;margin-left:3px}
.devdb{overflow-y:auto;padding:4px 16px 18px;flex:1}.dvwho{margin:10px 0 4px;font-size:12px}
.dvs{margin:14px 0 0;padding:12px;border-radius:14px;background:var(--ivory,var(--chip))}.dvs h3,.devdb h3{font-size:14px;margin:0 0 8px}
.devrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.devdb input,.devdb select{font:inherit;border:1px solid var(--line);border-radius:10px;padding:7px 9px;background:var(--card);color:var(--text);min-width:0;max-width:100%}.devdb input[type=number]{width:130px}.devdb textarea{width:100%;box-sizing:border-box;font:inherit;border:1px solid var(--line);border-radius:10px;padding:8px;background:var(--card);color:var(--text);margin-bottom:6px}
.devdb .pill{padding:7px 11px;font-size:13px}.devdb .sub{margin:8px 0 0;font-size:12px;line-height:1.5}
.devli{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.devli:last-child{border-bottom:0}.devli small{color:var(--sub)}.devli .pill.sm{padding:4px 9px;font-size:12px}
.devwarn{margin:12px 0 0;padding:10px 12px;border-radius:12px;background:#fdecec;color:#a02020;font-size:13px}
.dvg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.dvt{padding:12px;border-radius:14px;background:var(--ivory,var(--chip))}.dvt small{display:block;font-size:12px;color:var(--sub);font-weight:700}.dvt b{display:block;font-size:24px;font-weight:900;margin-top:2px}.dvt span{display:block;font-size:11.5px;color:var(--sub);margin-top:2px}
.dvc{margin-top:10px;padding:12px;border-radius:14px;background:var(--ivory,var(--chip))}.dvch{display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:8px}.dvch span{font-size:11.5px;color:var(--sub);display:flex;align-items:center;gap:4px}.dvch i{width:10px;height:10px;border-radius:3px;display:inline-block}.dvch i.a{background:var(--accent)}.dvch i.b{background:#f2b705;margin-left:6px}
.dvbars{display:grid;grid-template-columns:repeat(14,1fr);gap:3px;align-items:end;height:140px}.dvb{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0}.dvb em{font-style:normal;font-size:10px;font-weight:800;color:var(--sub);height:14px}.dvb .bar{width:100%;border-radius:4px 4px 0 0;background:var(--accent);opacity:.55;position:relative;display:flex;align-items:flex-end;min-height:0;flex:0 0 auto;margin-top:auto}.dvb .bar span{display:block;width:100%;background:#f2b705;border-radius:0}.dvb.t .bar{opacity:1}.dvb small{font-size:9.5px;line-height:1.2;color:var(--sub);text-align:center;margin-top:4px}
.dvbars{height:auto}.dvb{height:130px}.dvb .bar{max-height:100px}
.dvnote{margin-top:10px!important}
.devnote{margin:10px 0 12px;padding:2px 0 2px 12px;border-radius:0;background:none;border:0;border-left:3px solid var(--accent);font-size:14px;line-height:1.5}.devnote .nh{display:flex;align-items:center;gap:8px;margin-bottom:4px}.devnote .nbadge{background:var(--accent);color:var(--onacc);font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px;letter-spacing:.04em}.devnote small{color:var(--sub);font-size:12px}`;
document.head.appendChild(ST);

window.DEV={bannerHtml,open};
try{ const au=cl()&&cl().ok&&cl().auth; if(au) au.onAuthStateChanged(check); loadNotice(); }catch(e){}
})();
