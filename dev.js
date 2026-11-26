/* 개발자 모드 — 서버의 admins/{내 uid} 문서가 있는 계정으로 로그인했을 때만 켜져요.
 * 화면 표시는 편의일 뿐이고, 리그 삭제·신고 확인·공지 수정은 firestore.rules가 서버에서 막아요.
 * 켜는 법: Firebase 콘솔 > Firestore > admins 컬렉션에 문서 ID = 내 uid(Authentication 탭에서 확인)로 문서 하나 만들기 */
(function(){
const A=()=>window.APP, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let isDev=false, notice="", noticeAt=0, me=null;
const cl=()=>A()&&A().cloud, db=()=>cl().db;
const weekKey=d=>{ const x=new Date(d||Date.now()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x.toLocaleDateString("sv-SE"); };

/* 공지: 누구나 읽고(게스트 포함), 개발자만 써요 */
async function loadNotice(){ try{ if(!cl()||!cl().ok) return; const s=await db().collection("config").doc("announce").get(); notice=(s.exists&&s.data().text)||""; noticeAt=(s.exists&&s.data().at)||0; if(A().view&&A().view()==="home") A().renderHome(); }catch(e){} }
function bannerHtml(){ if(!notice) return ""; const d=noticeAt?new Date(noticeAt):null, ds=d?`${d.getMonth()+1}월 ${d.getDate()}일`:"";
  return `<div class="devnote" role="note"><div class="nh"><span class="nbadge">공지</span>${ds?`<small>${ds}</small>`:""}</div><div class="nt">${E(notice)}</div></div>`; }

function btn(){ let b=$("devBtn"); if(!isDev){ if(b) b.remove(); return; } if(b) return;
  b=document.createElement("button"); b.id="devBtn"; b.textContent="🛠"; b.setAttribute("aria-label","개발자 모드"); b.onclick=open; document.body.appendChild(b); }

async function check(u){ isDev=false; me=u||null;
  try{ if(u){ const s=await db().collection("admins").doc(u.uid).get(); isDev=s.exists; } }catch(e){}
  document.body.classList.toggle("dev-on",isDev); btn(); }

const dlg=()=>{ let d=$("devDlg"); if(!d){ d=document.createElement("dialog"); d.id="devDlg"; document.body.appendChild(d);
  d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-dx]")){ d.close(); return; } const b=ev.target.closest("[data-d]"); if(b) act(b); }); } return d; };

function ps(){ const P=window.PATH&&PATH.dev; return P; }
async function open(){ if(!isDev) return; const d=dlg(); let mem=[], rep=[], inq=[], err="";
  try{ const w=weekKey(); const ms=await db().collection("leagues").doc(w).collection("members").orderBy("xp","desc").limit(50).get(); mem=ms.docs.map(x=>({id:x.id,...x.data()}));
    const rs=await db().collection("reports").orderBy("at","desc").limit(30).get(); rep=rs.docs.map(x=>({id:x.id,...x.data()}));
    try{ const qs=await db().collection("inquiries").orderBy("at","desc").limit(30).get(); inq=qs.docs.map(x=>({id:x.id,...x.data()})); }catch(e){} }catch(e){ err="서버 규칙에 개발자 권한이 아직 없어요(firestore.rules 배포 필요)"; }
  let vis="";
  try{ localStorage.setItem("jp-vskip","1"); const from=new Date(Date.now()-new Date().getTimezoneOffset()*6e4-29*864e5).toISOString().slice(0,10);
    const vs=await db().collection("visits").where("d",">=",from).limit(5000).get(), by={}, all=new Set(), first={};
    vs.docs.forEach(x=>{ const q=x.data(); (by[q.d]=by[q.d]||new Set()).add(q.v); all.add(q.v); if(q.nw) first[q.d]=(first[q.d]||0)+1; });
    const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4), ds=[]; for(let i=0;i<14;i++){ const t=new Date(today-i*864e5).toISOString().slice(0,10); ds.push([t,(by[t]||new Set()).size,first[t]||0]); }
    const sum=n=>{ const s=new Set(); for(let i=0;i<n;i++){ const t=new Date(today-i*864e5).toISOString().slice(0,10); (by[t]||[]).forEach(v=>s.add(v)); } return s.size; };
    const pwa=vs.docs.filter(x=>x.data().pwa).map(x=>x.data().v), pwaN=new Set(pwa).size;
    vis=`<h3>방문자 (익명, 이 기기는 세지 않아요)</h3><p class="sub">오늘 <b>${ds[0][1]}</b>명 · 최근 7일 <b>${sum(7)}</b>명 · 30일 <b>${all.size}</b>명 · 앱으로 설치해 쓰는 기기 ${pwaN}대</p>
     <div class="sub">${ds.map(([t,n,nw])=>`${t.slice(5)} · ${n}명${nw?` (처음 온 ${nw})`:""}`).join("<br>")}</div>`;
  }catch(e){ vis=`<h3>방문자</h3><p class="sub" style="color:#c0392b">불러오지 못했어요(firestore.rules 배포가 필요할 수 있어요)</p>`; }
  const st=ps()?PATH.dev.state():{seeds:0,owned:[]}, nameOf=u=>(mem.find(m=>m.id===u)||{}).name||u.slice(0,6)+"…";
  const ver=[...document.scripts].map(s=>s.getAttribute("src")||"").filter(s=>/\.js\?v=/.test(s)).map(s=>s.replace("?v=","@")).join(" · ");
  d.innerHTML=`<div class="dh"><h2 style="margin:0">🛠 개발자 모드</h2><button class="x" data-dx aria-label="닫기">×</button></div><div class="db devdb">
   <p class="sub">${E(me&&me.email||"")} · 이번 주 ${weekKey()}</p>${err?`<p class="sub" style="color:#c0392b">${err}</p>`:""}
   ${vis}
   <h3>씨앗 · XP (이 기기)</h3><p class="sub">씨앗 <b>${st.seeds||0}</b>개 · 보유 아이템 ${st.owned.length}개</p>
   <div class="devrow"><button class="pill" data-d="seed" data-n="100">씨앗 +100</button><button class="pill" data-d="seed" data-n="1000">씨앗 +1000</button><button class="pill" data-d="seed" data-n="-9999">씨앗 0으로</button><button class="pill" data-d="xp" data-n="100">XP +100</button><button class="pill" data-d="xp" data-n="1000">XP +1000</button></div>
   <h3>아이템</h3><div class="devrow"><button class="pill" data-d="unlock">전부 잠금 해제</button><button class="pill" data-d="reset">아이템 초기화</button></div>
   <h3>레벨 · 출석 (이 기기)</h3><div class="devrow"><input id="devLv" type="number" min="1" max="50" placeholder="레벨(1~50)"><button class="pill" data-d="lv">레벨 맞추기</button></div>
   <div class="devrow" style="margin-top:6px"><input id="devStreak" type="number" min="0" max="365" placeholder="연속 출석 일수"><button class="pill" data-d="streak">출석 일수 맞추기</button><button class="pill" data-d="todayreset">오늘 푼 문제 0으로</button><button class="pill" data-d="questreset">오늘 퀘스트 다시 시작</button></div>
   <h3>학습 경로 · 칭호</h3><div class="devrow"><select id="devLvl"><option>N5</option><option>N4</option><option>N3</option><option>N2</option><option>N1</option><option value="ALL">N5~N1 전체</option></select><button class="pill" data-d="clear">클리어 처리</button><button class="pill" data-d="unclear">클리어 해제</button></div>
   <div class="devrow" style="margin-top:6px"><button class="pill" data-d="master">JLPT 정복자 받기</button><button class="pill" data-d="unmaster">정복자 회수</button><button class="pill" data-d="giftreset">선물·칭호 기록 초기화</button></div>
   <h3>아이템 개별 지급</h3><div class="devrow"><select id="devItem">${(ps()?PATH.dev.items():[]).map(i=>`<option value="${E(i.id)}">${E(i.name)}${i.special?" ★":""}</option>`).join("")}</select><button class="pill" data-d="give">지급</button><button class="pill" data-d="take">회수</button></div>
   <h3>이벤트 선물 (이번 주 리그 ${mem.length}명 전원)</h3><div class="devrow"><input id="devGSeed" type="number" min="1" max="100000" placeholder="씨앗 개수"><button class="pill" data-d="giftall" data-k="seed">씨앗 보내기</button></div>
   <div class="devrow" style="margin-top:6px"><select id="devGItem">${(ps()?PATH.gift.allItems():[]).map(i=>`<option value="${E(i.id)}">${E(i.name)}</option>`).join("")}</select><button class="pill" data-d="giftall" data-k="item">아이템 보내기</button></div>
   <p class="sub">받는 사람은 커뮤니티 「받은 선물」에서 받아요. 개별 선물은 리그·친구 목록의 「선물」 버튼이에요.</p>
   <h3>학습 기록</h3><div class="devrow"><button class="pill" data-d="wipe" data-k="jp-wrong,jp-miss">오답 기록 비우기</button><button class="pill" data-d="wipe" data-k="jp-star">별표 비우기</button><button class="pill" data-d="wipe" data-k="jp-srs">복습 일정 비우기</button><button class="pill" data-d="wipe" data-k="jp-best">최고기록 비우기</button></div>
   <h3>술술 플러스 (이 기기 시험용)</h3><p class="sub">지금: <b>${localStorage.getItem("jp-plusdev")==="on"?"플러스 켠 화면":"무료 사용자 화면"}</b> · 오늘 무료 1회 ${localStorage.getItem("jp-plus-free")===A().today()?"사용함":"안 씀"}</p>
   <div class="devrow"><button class="pill" data-d="plusdev" data-v="on">플러스 화면 켜기</button><button class="pill" data-d="plusdev" data-v="off">무료 사용자 화면으로</button><button class="pill" data-d="plusfree">무료 1회 다시 쓰기</button></div>
   <div class="devrow" style="margin-top:6px"><button class="pill" data-d="coachreset">합격 코치 기록 비우기</button><button class="pill" data-d="weakfake">약점 데이터 20개 채우기</button></div>
   <p class="sub">화면 확인용이에요. 실제 결제·이용 기간은 서버 기록으로만 정해져요.</p>
   <h3>공지 (홈 화면 맨 위)</h3><textarea id="devNote" rows="2" maxlength="120" placeholder="비우고 저장하면 공지가 사라져요">${E(notice)}</textarea><div class="devrow"><button class="pill on" data-d="note">공지 저장</button></div>
   <h3>문의 ${inq.length}건</h3>${inq.length?inq.map(q=>`<div class="devli" style="align-items:flex-start"><span style="min-width:0"><b>${E(({bug:"오류",idea:"제안",etc:"기타"})[q.kind]||"기타")}</b> <small>${E(q.name||"")} · ${new Date(q.at||0).toLocaleDateString("ko-KR")}</small><br><span style="white-space:pre-wrap;word-break:break-word;font-size:13px">${E(q.text||"")}</span></span><button class="pill sm" data-d="delinq" data-r="${E(q.id)}">삭제</button></div>`).join(""):`<p class="sub">아직 없어요</p>`}
   <h3>신고 ${rep.length}건</h3>${rep.length?rep.map(r=>`<div class="devli"><span><b>${E(nameOf(r.target||""))}</b> <small>${E((r.target||"").slice(0,8))} · ${new Date(r.at||0).toLocaleDateString("ko-KR")}</small></span><span><button class="pill sm" data-d="kick" data-u="${E(r.target||"")}" data-r="${r.id}">리그에서 삭제</button><button class="pill sm" data-d="dismiss" data-r="${r.id}">무시</button></span></div>`).join(""):`<p class="sub">없어요</p>`}
   <h3>이번 주 리그 ${mem.length}명</h3>${mem.map(m=>`<div class="devli"><span><b>${E(m.name||"")}</b> <small>${m.xp||0}XP · ${E(m.id.slice(0,8))}</small></span><button class="pill sm" data-d="kick" data-u="${m.id}">삭제</button></div>`).join("")||`<p class="sub">없어요</p>`}
   <h3>도구</h3><p class="sub" style="word-break:break-all">${E(ver)}</p><div class="devrow"><button class="pill" data-d="cache">캐시 비우고 새로고침</button><button class="pill" data-d="export">내 데이터 복사(JSON)</button><button class="pill" data-d="noticeoff">공지 지우기</button><button class="pill" data-d="wipeall">이 기기 학습 전부 초기화</button></div></div>`;
  if(!d.open) d.showModal(); }

async function act(b){ const a=b.dataset.d, P=ps();
  try{
   if(a==="seed"){ P.addSeeds(+b.dataset.n>=0?+b.dataset.n:-P.state().seeds); A().toast("씨앗을 바꿨어요"); }
   else if(a==="xp"){ P.addXp(+b.dataset.n); A().toast("XP를 줬어요"); }
   else if(a==="unlock"){ const s=P.state(); P.items().forEach(i=>{ if(!s.owned.includes(i.id)) s.owned.push(i.id); }); P.save(s); A().toast("모든 아이템을 열었어요"); }
   else if(a==="reset"){ if(!confirm("이 기기의 아이템·씨앗을 처음 상태(씨앗 30)로 되돌릴까요?")) return; P.save({seeds:30,owned:[],equip:{}}); A().toast("초기화했어요"); }
   else if(a==="note"){ const t=($("devNote").value||"").trim(); await db().collection("config").doc("announce").set({text:t,at:Date.now()}); notice=t; A().toast(t?"공지를 올렸어요":"공지를 지웠어요"); }
   else if(a==="kick"){ if(!confirm("이 사용자를 이번 주 리그에서 삭제할까요?")) return; await db().collection("leagues").doc(weekKey()).collection("members").doc(b.dataset.u).delete(); if(b.dataset.r) await db().collection("reports").doc(b.dataset.r).delete(); A().toast("삭제했어요"); }
   else if(a==="delinq"){ if(!confirm("이 문의를 지울까요?")) return; await db().collection("inquiries").doc(b.dataset.r).delete(); }
   else if(a==="dismiss"){ await db().collection("reports").doc(b.dataset.r).delete(); }
   else if(a==="giftall"){ const seed=b.dataset.k==="seed", amount=seed?Math.floor(+$("devGSeed").value):0, item=seed?"":$("devGItem").value;
     if(seed&&!(amount>=1&&amount<=100000)){ A().toast("1~100000 사이로 넣어주세요"); return; }
     const w=weekKey(), ms=await db().collection("leagues").doc(w).collection("members").limit(50).get(), ids=ms.docs.map(x=>x.id).filter(u=>!me||u!==me.uid);
     if(!ids.length){ A().toast("보낼 사람이 없어요"); return; }
     const label=seed?"씨앗 "+amount+"개":"「"+PATH.gift.itemName(item)+"」";
     if(!confirm("이번 주 리그 "+ids.length+"명 전원에게 "+label+"를 보낼까요?\n보내면 되돌릴 수 없어요.")) return;
     const batch=db().batch(), day=A().today(), now=Date.now();
     ids.forEach(u=>{ const g={from:me.uid,fromName:"운영자",to:u,kind:seed?"seed":"item",day,claimed:false,at:now}; if(seed) g.amount=amount; else { g.item=item; g.itemName=PATH.gift.itemName(item); } batch.set(db().collection("gifts").doc(),g); });
     await batch.commit(); A().toast(ids.length+"명에게 보냈어요"); }
   else if(a==="lv"){ const L=+($("devLv").value); if(!(L>=1&&L<=P.maxLv)){ A().toast("1~"+P.maxLv+" 사이로 넣어주세요"); return; } P.setLevel(L); A().toast("레벨 "+L+"로 맞췄어요"); }
   else if(a==="streak"){ const n=+($("devStreak").value); if(!(n>=0&&n<=365)){ A().toast("0~365 사이로 넣어주세요"); return; } const L=A().LS.get("jp-log",{}), ds=i=>new Date(Date.now()-i*864e5).toLocaleDateString("sv-SE"); for(let i=0;i<n;i++){ const k=ds(i); L[k]=L[k]||{n:0,c:0}; if(!L[k].n){ L[k].n=1; L[k].c=1; } } delete L[ds(n)]; A().LS.set("jp-log",L); A().toast("출석 일수를 맞췄어요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="questreset"){ A().LS.set("jp-quest",{}); const L=A().LS.get("jp-log",{}); delete L[new Date().toLocaleDateString("sv-SE")]; A().LS.set("jp-log",L); A().toast("오늘 퀘스트를 다시 시작해요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="todayreset"){ const L=A().LS.get("jp-log",{}); delete L[new Date().toLocaleDateString("sv-SE")]; A().LS.set("jp-log",L); A().toast("오늘 기록을 비웠어요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="clear"||a==="unclear"){ const L=$("devLvl").value; if(a==="unclear"&&!confirm(L+" 클리어 기록을 해제할까요?")) return; P.pathSet(L,a==="clear"); A().toast(L+(a==="clear"?" 클리어 처리했어요":" 클리어를 해제했어요")); setTimeout(()=>location.reload(),700); return; }
   else if(a==="master"){ P.giveMaster(true); A().toast("정복자 칭호를 줬어요"); }
   else if(a==="unmaster"){ P.giveMaster(false); A().toast("정복자 칭호를 회수했어요"); }
   else if(a==="giftreset"){ if(!confirm("선물·칭호 기록을 비울까요?")) return; P.giftReset(); A().toast("비웠어요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="give"||a==="take"){ const id=$("devItem").value, s=P.state(); if(a==="give"){ if(!s.owned.includes(id)) s.owned.push(id); } else { s.owned=s.owned.filter(x=>x!==id); Object.keys(s.equip||{}).forEach(k=>{ if(s.equip[k]===id) delete s.equip[k]; }); } P.save(s); A().toast(a==="give"?"지급했어요":"회수했어요"); }
   else if(a==="wipe"){ if(!confirm("정말 비울까요?")) return; { const id=A().curProfile().id; b.dataset.k.split(",").forEach(k=>localStorage.removeItem(k+"@"+id)); } A().toast("비웠어요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="export"){ const o={}; ["jp-kana","jp-custom","jp-star","jp-prefs","jp-wrong","jp-miss","jp-log","jp-read","jp-best","jp-path","jp-xp","jp-srs","jp-gift","jp-char"].forEach(k=>o[k]=A().LS.get(k,null)); const t=JSON.stringify(o); try{ await navigator.clipboard.writeText(t); A().toast("복사했어요("+Math.round(t.length/1024)+"KB)"); }catch(e){ prompt("복사해서 보관하세요",t); } }
   else if(a==="noticeoff"){ await db().collection("config").doc("announce").set({text:"",at:Date.now()}); notice=""; A().toast("공지를 지웠어요"); }
   else if(a==="wipeall"){ if(!confirm("이 기기의 학습 기록(레벨·출석·오답·아이템 등)을 전부 지울까요? 되돌릴 수 없어요.")) return; if(!confirm("정말 전부 지울까요?")) return; { const id=A().curProfile().id; ["jp-kana","jp-star","jp-wrong","jp-miss","jp-log","jp-read","jp-best","jp-path","jp-xp","jp-srs","jp-gift","jp-char"].forEach(k=>localStorage.removeItem(k+"@"+id)); } A().toast("초기화했어요"); setTimeout(()=>location.reload(),700); return; }
   else if(a==="plusdev"){ localStorage.setItem("jp-plusdev",b.dataset.v); A().toast(b.dataset.v==="on"?"플러스 화면을 켰어요":"무료 사용자 화면으로 바꿨어요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="plusfree"){ localStorage.removeItem("jp-plus-free"); A().toast("오늘 무료 1회를 다시 쓸 수 있어요"); }
   else if(a==="coachreset"){ if(!confirm("합격 코치(시험 날짜·모의시험 기록)를 비울까요?")) return; { const id=A().curProfile().id; ["jp-jhist","jp-jplan"].forEach(k=>localStorage.removeItem(k+"@"+id)); } A().toast("비웠어요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="weakfake"){ const m=A().LS.get("jp-miss",{}); for(let i=0;i<20;i++){ if(A().byKey("b"+i)) m["b"+i]=(m["b"+i]||0)+3; } A().LS.set("jp-miss",m); A().toast("약점 단어 20개를 채웠어요"); setTimeout(()=>location.reload(),600); return; }
   else if(a==="cache"){ try{ (await navigator.serviceWorker.getRegistrations()).forEach(r=>r.unregister()); (await caches.keys()).forEach(k=>caches.delete(k)); }catch(e){} location.reload(); return; }
  }catch(e){ A().toast("실패했어요(권한·네트워크 확인)"); return; }
  open(); if(A().view&&A().view()==="home") A().renderHome(); }

const ST=document.createElement("style"); ST.textContent=`#devBtn{position:fixed;left:10px;bottom:76px;z-index:60;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:var(--card);opacity:.55;font-size:16px;cursor:pointer}
#devDlg{border:0;border-radius:18px;padding:0;max-width:420px;width:calc(100% - 28px);max-height:88vh;background:var(--card);color:var(--text)}#devDlg::backdrop{background:rgba(0,0,0,.45)}
.devdb h3{font-size:14px;margin:14px 0 6px}.devrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.devdb input,.devdb select{font:inherit;border:1px solid var(--line);border-radius:10px;padding:7px 9px;background:var(--bg);color:var(--text);min-width:0;max-width:100%}.devdb input[type=number]{width:130px}.devdb textarea{width:100%;box-sizing:border-box;font:inherit;border:1px solid var(--line);border-radius:10px;padding:8px;background:var(--bg);color:var(--text);margin-bottom:6px}
.devli{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--line);font-size:13px}.devli small{color:var(--sub)}.devli .pill.sm{padding:4px 9px;font-size:12px}
.devnote{margin:10px 0 12px;padding:2px 0 2px 12px;border-radius:0;background:none;border:0;border-left:3px solid var(--accent);font-size:14px;line-height:1.5}.devnote .nh{display:flex;align-items:center;gap:8px;margin-bottom:4px}.devnote .nbadge{background:var(--accent);color:var(--onacc);font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px;letter-spacing:.04em}.devnote small{color:var(--sub);font-size:12px}.devnote .nt{color:var(--text);font-weight:600;word-break:keep-all}`;
document.head.appendChild(ST);

window.DEV={bannerHtml,open};
try{ const au=cl()&&cl().ok&&cl().auth; if(au) au.onAuthStateChanged(check); loadNotice(); }catch(e){}
})();
