/* 개발자 모드 — 서버의 admins/{내 uid} 문서가 있는 계정으로 로그인했을 때만 켜져요.
 * 화면 표시는 편의일 뿐이고, 리그 삭제·신고 확인·공지 수정은 firestore.rules가 서버에서 막아요.
 * 켜는 법: Firebase 콘솔 > Firestore > admins 컬렉션에 문서 ID = 내 uid(Authentication 탭에서 확인)로 문서 하나 만들기 */
(function(){
const A=()=>window.APP, $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let isDev=false, notice="", me=null;
const cl=()=>A()&&A().cloud, db=()=>cl().db;
const weekKey=d=>{ const x=new Date(d||Date.now()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x.toLocaleDateString("sv-SE"); };

/* 공지: 누구나 읽고(게스트 포함), 개발자만 써요 */
async function loadNotice(){ try{ if(!cl()||!cl().ok) return; const s=await db().collection("config").doc("announce").get(); notice=(s.exists&&s.data().text)||""; if(A().view&&A().view()==="home") A().renderHome(); }catch(e){} }
function bannerHtml(){ return notice?`<div class="devnote">📢 ${E(notice)}</div>`:""; }

function btn(){ let b=$("devBtn"); if(!isDev){ if(b) b.remove(); return; } if(b) return;
  b=document.createElement("button"); b.id="devBtn"; b.textContent="🛠"; b.setAttribute("aria-label","개발자 모드"); b.onclick=open; document.body.appendChild(b); }

async function check(u){ isDev=false; me=u||null;
  try{ if(u){ const s=await db().collection("admins").doc(u.uid).get(); isDev=s.exists; } }catch(e){}
  btn(); }

const dlg=()=>{ let d=$("devDlg"); if(!d){ d=document.createElement("dialog"); d.id="devDlg"; document.body.appendChild(d);
  d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-dx]")){ d.close(); return; } const b=ev.target.closest("[data-d]"); if(b) act(b); }); } return d; };

function ps(){ const P=window.PATH&&PATH.dev; return P; }
async function open(){ if(!isDev) return; const d=dlg(); let mem=[], rep=[], err="";
  try{ const w=weekKey(); const ms=await db().collection("leagues").doc(w).collection("members").orderBy("xp","desc").limit(30).get(); mem=ms.docs.map(x=>({id:x.id,...x.data()}));
    const rs=await db().collection("reports").orderBy("at","desc").limit(30).get(); rep=rs.docs.map(x=>({id:x.id,...x.data()})); }catch(e){ err="서버 규칙에 개발자 권한이 아직 없어요(firestore.rules 배포 필요)"; }
  const st=ps()?PATH.dev.state():{seeds:0,owned:[]}, nameOf=u=>(mem.find(m=>m.id===u)||{}).name||u.slice(0,6)+"…";
  const ver=[...document.scripts].map(s=>s.getAttribute("src")||"").filter(s=>/\.js\?v=/.test(s)).map(s=>s.replace("?v=","@")).join(" · ");
  d.innerHTML=`<div class="dh"><h2 style="margin:0">🛠 개발자 모드</h2><button class="x" data-dx aria-label="닫기">×</button></div><div class="db devdb">
   <p class="sub">${E(me&&me.email||"")} · 이번 주 ${weekKey()}</p>${err?`<p class="sub" style="color:#c0392b">${err}</p>`:""}
   <h3>씨앗 · XP (이 기기)</h3><p class="sub">씨앗 <b>${st.seeds||0}</b>개 · 보유 아이템 ${st.owned.length}개</p>
   <div class="devrow"><button class="pill" data-d="seed" data-n="100">씨앗 +100</button><button class="pill" data-d="seed" data-n="1000">씨앗 +1000</button><button class="pill" data-d="seed" data-n="-9999">씨앗 0으로</button><button class="pill" data-d="xp" data-n="100">XP +100</button><button class="pill" data-d="xp" data-n="1000">XP +1000</button></div>
   <h3>아이템</h3><div class="devrow"><button class="pill" data-d="unlock">전부 잠금 해제</button><button class="pill" data-d="reset">아이템 초기화</button></div>
   <h3>공지 (홈 화면 맨 위)</h3><textarea id="devNote" rows="2" maxlength="120" placeholder="비우고 저장하면 공지가 사라져요">${E(notice)}</textarea><div class="devrow"><button class="pill on" data-d="note">공지 저장</button></div>
   <h3>신고 ${rep.length}건</h3>${rep.length?rep.map(r=>`<div class="devli"><span><b>${E(nameOf(r.target||""))}</b> <small>${E((r.target||"").slice(0,8))} · ${new Date(r.at||0).toLocaleDateString("ko-KR")}</small></span><span><button class="pill sm" data-d="kick" data-u="${E(r.target||"")}" data-r="${r.id}">리그에서 삭제</button><button class="pill sm" data-d="dismiss" data-r="${r.id}">무시</button></span></div>`).join(""):`<p class="sub">없어요</p>`}
   <h3>이번 주 리그 ${mem.length}명</h3>${mem.map(m=>`<div class="devli"><span><b>${E(m.name||"")}</b> <small>${m.xp||0}XP · ${E(m.id.slice(0,8))}</small></span><button class="pill sm" data-d="kick" data-u="${m.id}">삭제</button></div>`).join("")||`<p class="sub">없어요</p>`}
   <h3>도구</h3><p class="sub" style="word-break:break-all">${E(ver)}</p><div class="devrow"><button class="pill" data-d="cache">캐시 비우고 새로고침</button></div></div>`;
  if(!d.open) d.showModal(); }

async function act(b){ const a=b.dataset.d, P=ps();
  try{
   if(a==="seed"){ P.addSeeds(+b.dataset.n>=0?+b.dataset.n:-P.state().seeds); A().toast("씨앗을 바꿨어요"); }
   else if(a==="xp"){ P.addXp(+b.dataset.n); A().toast("XP를 줬어요"); }
   else if(a==="unlock"){ const s=P.state(); P.items().forEach(i=>{ if(!s.owned.includes(i.id)) s.owned.push(i.id); }); P.save(s); A().toast("모든 아이템을 열었어요"); }
   else if(a==="reset"){ if(!confirm("이 기기의 아이템·씨앗을 처음 상태(씨앗 30)로 되돌릴까요?")) return; P.save({seeds:30,owned:[],equip:{}}); A().toast("초기화했어요"); }
   else if(a==="note"){ const t=($("devNote").value||"").trim(); await db().collection("config").doc("announce").set({text:t,at:Date.now()}); notice=t; A().toast(t?"공지를 올렸어요":"공지를 지웠어요"); }
   else if(a==="kick"){ if(!confirm("이 사용자를 이번 주 리그에서 삭제할까요?")) return; await db().collection("leagues").doc(weekKey()).collection("members").doc(b.dataset.u).delete(); if(b.dataset.r) await db().collection("reports").doc(b.dataset.r).delete(); A().toast("삭제했어요"); }
   else if(a==="dismiss"){ await db().collection("reports").doc(b.dataset.r).delete(); }
   else if(a==="cache"){ try{ (await navigator.serviceWorker.getRegistrations()).forEach(r=>r.unregister()); (await caches.keys()).forEach(k=>caches.delete(k)); }catch(e){} location.reload(); return; }
  }catch(e){ A().toast("실패했어요(권한·네트워크 확인)"); return; }
  open(); if(A().view&&A().view()==="home") A().renderHome(); }

const ST=document.createElement("style"); ST.textContent=`#devBtn{position:fixed;left:10px;bottom:76px;z-index:60;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:var(--card);opacity:.55;font-size:16px;cursor:pointer}
#devDlg{border:0;border-radius:18px;padding:0;max-width:420px;width:calc(100% - 28px);max-height:88vh;background:var(--card);color:var(--text)}#devDlg::backdrop{background:rgba(0,0,0,.45)}
.devdb h3{font-size:14px;margin:14px 0 6px}.devrow{display:flex;flex-wrap:wrap;gap:6px}.devdb textarea{width:100%;box-sizing:border-box;font:inherit;border:1px solid var(--line);border-radius:10px;padding:8px;background:var(--bg);color:var(--text);margin-bottom:6px}
.devli{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--line);font-size:13px}.devli small{color:var(--sub)}.devli .pill.sm{padding:4px 9px;font-size:12px}
.devnote{margin:10px 0;padding:10px 12px;border-radius:12px;background:var(--card);border:1px solid var(--line);font-size:13px}`;
document.head.appendChild(ST);

window.DEV={bannerHtml,open};
try{ const au=cl()&&cl().ok&&cl().auth; if(au) au.onAuthStateChanged(check); loadNotice(); }catch(e){}
})();
